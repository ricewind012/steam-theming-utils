import fs from "node:fs";
import path from "node:path";
import prettier from "prettier";
import {
	connection,
	getConfig,
	run,
	runCdpFile,
	runWithResult,
	sleep,
} from "../src/api.js";
import { createWebConnection, getPageUrl } from "../src/shared.js";

const BROWSER_EVENT = "finished-request";

async function doTheThing(page, conn) {
	const webpackRan = await runWithResult("!!webpackCache", conn);
	const forceWebpackRerun = await runWithResult("forceWebpackRerun", conn);
	const preloadFile = path.join("preload", `${page}.js`);
	if (page === "shoppingcart") {
		while (
			!(await runWithResult(
				`document.querySelector('[data-featuretarget="react-root"]:not(:empty)')`,
				conn,
			))
		);
	}
	if (!webpackRan || forceWebpackRerun) {
		await runCdpFile("class_modules_webpack.js", conn);
	}
	if (fs.existsSync(preloadFile)) {
		await runCdpFile(preloadFile, conn);
	}
	await runCdpFile(path.join("db", `${page}.js`), conn);
	// Sleep for a bit to not error on first launch.
	await sleep(10);

	const config = await getConfig();
	const dirPath = path.join(process.cwd(), config.paths.classMaps);
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
	let webConn = isClient
		? null
		: await createWebConnection(page).catch(() => {});
	if (!isClient && !webConn) {
		const url = await getPageUrl(page);
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
		while (!(await runWithResult("window._finished")));
		webConn = await createWebConnection(page).catch((e) => {
			console.log(
				"%s\nNo page whose URL is %o has been found.",
				e.message,
				url,
			);
			process.exit(1);
		});
	}

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
