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

export const selectorReplacerPlugin = (opts) => (css) => {
	css.walkRules((rule) => {
		rule.selector = rule.selector.replace(opts.match, opts.replace);
	});
};
selectorReplacerPlugin.postcss = true;

export async function getPageUrl(page) {
	const resolve = (name) => runWithResult(`urlStore.ResolveURL("${name}")`);
	const ass = (url) => ({
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
		case "gameslist":
			return ass(`${profileUrl}games`);
		// resolve("AllNotifications"), but the steam id is "%p1"
		case "notificationspage":
			return ass(`${profileUrl}notifications`);
		case "profileedit":
			return ass(await resolve("SteamIDEditPage"));
		case "shoppingcart":
			return ass(await resolve("StoreCart"));
		case "storeitemscarousel":
			return {
				url: `${STORE_BASE_URL}/app/666220`,
				match: new RegExp(`^${STORE_BASE_URL}/app/\\d+`),
			};
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
