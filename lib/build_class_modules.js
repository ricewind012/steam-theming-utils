import fs from "node:fs";
import path from "node:path";
import prettier from "prettier";
import {
	connection,
	config,
	run,
	runCdpFile,
	runWithResult,
	sleep,
} from "../src/api.js";
import { createWebConnection, getPageUrl } from "../src/shared.js";

/**
 * BrowserView event to listen for on page load.
 */
const BROWSER_EVENT = "finished-request";

/**
 * @type {Record<import("../src/api").Page, string>}
 */
const SELECTORS = {
	accountpreferences: "[data-featuretarget]",
	gameslist: "[data-featuretarget='gameslist-root']",
	notificationspage: "#react_root",
	profileedit: "#react_root",
	shoppingcart: "[data-featuretarget='react-root']",
	storeitemscarousel: "[data-featuretarget$='-carousel']",
};

async function sleepUntilResult(...args) {
	while (!(await runWithResult(...args))) {
		await sleep(10);
	}
}

/**
 * Gets a CDP web connection, accounting for the needed React part to load.
 * @param {import("../src/api").Page | "client"} page
 */
async function getWebConn(page) {
	if (page === "client") {
		return null;
	}

	const openedConn = await createWebConnection(page).catch(() => {});
	if (openedConn) {
		return openedConn;
	}

	const { url } = await getPageUrl(page);
	await run(`
		function onFinishedRequest() {
			window._finished = true;
			browser.off("${BROWSER_EVENT}", onFinishedRequest);
		}

		browser = SteamClient.BrowserView.Create();
		browser.LoadURL("${url}");
		browser.on("${BROWSER_EVENT}", onFinishedRequest);
	`);

	console.log("Waiting for page load...");
	await sleepUntilResult("window._finished");
	const conn = await createWebConnection(page).catch((e) => {
		console.log("%s\nNo page whose URL is %o has been found.", e.message, url);
		process.exit(1);
	});

	const selector = `${SELECTORS[page]}:not(:empty)`;
	const expression = `!!document.querySelector("${selector}")`;
	console.log("Waiting for %o selector...", selector);
	await sleepUntilResult(expression, conn);

	return conn;
}

/**
 * @param {import("../src/api").Page} page
 * @param {import("chrome-remote-interface").Client} conn
 */
async function doTheThing(page, conn) {
	const webpackRan = await runWithResult("!!webpackCache", conn);
	const forceWebpackRerun = await runWithResult("forceWebpackRerun", conn);
	const preloadFile = path.join("preload", `${page}.js`);
	if (!webpackRan || forceWebpackRerun) {
		await runCdpFile("class_modules_webpack.js", conn);
	}
	if (fs.existsSync(preloadFile)) {
		await runCdpFile(preloadFile, conn);
	}
	await runCdpFile(path.join("db", `${page}.js`), conn);

	const dirPath = path.join(process.cwd(), config.classMaps);
	const filePath = path.join(dirPath, `${page}.json`);

	const output = await runCdpFile("class_modules.js", conn);
	const [classModules, allModules] = await runWithResult(
		"[Object.keys(classModules).length, allModules.length]",
		conn,
	);

	const content = await prettier.format(JSON.stringify(output), {
		parser: "json-stringify",
	});
	fs.mkdirSync(dirPath, { recursive: true });
	fs.writeFileSync(filePath, content);
	console.log("Wrote %s/%s modules to %o", classModules, allModules, filePath);
}

export async function execute(page = "client") {
	const isClient = page === "client";
	const webConn = await getWebConn(page);

	const conn = isClient ? connection : webConn;
	await doTheThing(page, conn);

	webConn?.close();
	if (!isClient) {
		await run(`
			window._finished = false;
			SteamClient.BrowserView.Destroy(browser);
		`);
	}
}
