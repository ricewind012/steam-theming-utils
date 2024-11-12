import cdp from "chrome-remote-interface";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lilconfig } from "lilconfig";
import { runWithResult } from "./api.js";
import { DEFAULT_CONFIG, PAGES } from "./constants.js";

export const packagePath = path
	.dirname(fileURLToPath(import.meta.url))
	.split(path.sep)
	.slice(0, -1)
	.join(path.sep);

export const getConfig = async () =>
	(await lilconfig("steam-theming-utils").search())?.config || DEFAULT_CONFIG;
export const readFile = (file) => fs.readFileSync(file).toString();

export const selectorReplacerPlugin = (opts) => (css) => {
	css.walkRules((rule) => {
		rule.selector = rule.selector.replace(opts.match, opts.replace);
	});
};
selectorReplacerPlugin.postcss = true;

export const getPageUrl = async (page) =>
	await runWithResult(`urlStore.ResolveURL("${PAGES[page]}")`);
export async function createWebConnection(page) {
	const url = await getPageUrl(page);
	const connection = await cdp({
		host: "127.0.0.1",
		port: 8080,
		target: (e) => e.find((e) => e.url.startsWith(url)),
	});

	return connection;
}
