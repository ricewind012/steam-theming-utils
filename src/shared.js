import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cdp from "chrome-remote-interface";
import { runWithResult } from "./api.js";
import { STORE_BASE_URL } from "./constants.js";

export const packagePath = path
	.dirname(fileURLToPath(import.meta.url))
	.split(path.sep)
	.slice(0, -1)
	.join(path.sep);

export const readFile = (file) => fs.readFileSync(file).toString();

export async function getPageUrl(page) {
	const resolve = (name) => runWithResult(`urlStore.ResolveURL("${name}")`);
	const pageObj = (url) => ({
		url,
		match: new RegExp(`^${url.replace(/\/+$/, "")}`),
	});

	const profileUrl = await resolve("SteamIDMyProfile");
	switch (page) {
		case "accountpreferences":
			return {
				url: await resolve("FamilyManagement"),
				match: new RegExp(`^${STORE_BASE_URL}/account`),
			};
		case "apppage":
			return {
				url: `${STORE_BASE_URL}/app/666220`,
				match: new RegExp(`^${STORE_BASE_URL}/app/\\d+`),
			};
		case "gameslist":
			return pageObj(`${profileUrl}games`);
		case "notificationspage":
			return pageObj(`${profileUrl}notifications`);
		case "profileedit":
			return pageObj(await resolve("SteamIDEditPage"));
		case "shoppingcart":
			return pageObj(await resolve("StoreCart"));
	}
}

export async function createConnection(target) {
	const connection = await cdp({
		host: "127.0.0.1",
		port: 8080,
		target,
	});

	await connection.Runtime.enable();
	connection.Runtime.on("consoleAPICalled", (ev) => {
		if (ev.type !== "error") {
			return;
		}

		console.error(...ev.args.map((e) => e.description || e.value));
	});

	return connection;
}

export async function createWebConnection(page) {
	const { match } = await getPageUrl(page);
	const connection = await createConnection((e) =>
		e.find((e) => e.url.match(match)),
	);

	return connection;
}
