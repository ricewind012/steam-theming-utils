import fs from "node:fs";
import path from "node:path";
// Not a dependency because postcss already depends on it.
import yargs from "yargs";
import { config } from "../api.js";

const PAGES = [
	"accountpreferences",
	"apppage",
	"client",
	"gameslist",
	"notificationspage",
	"profileedit",
	"shoppingcart",
];
const SELECTOR = /#(\w+)/g;

const { argv } = yargs(process.argv);
const cwd = process.cwd();
const classMap = {};

/**
 * Gets a class map on demand rather than reading all files at once.
 *
 * @param {string} page
 */
function getClassMap(page) {
	if (classMap[page]) {
		return classMap[page];
	}

	const pagePath = path.join(config.classMaps, `${page}.json`);
	if (!fs.existsSync(pagePath)) {
		return;
	}

	classMap[page] = JSON.parse(fs.readFileSync(pagePath));
	return classMap[page];
}

export const selectorReplacerPlugin = () => (css) => {
	const { file } = css.source.input;
	const fileName = path.basename(file);

	const splitPath = file.split(path.sep);
	const page = PAGES.find((e) => splitPath.includes(e));
	if (!page) {
		return;
	}

	const map = getClassMap(page);
	if (!map) {
		console.error("[%s] no such map", page);
		return;
	}

	const modName = path.basename(fileName, ".scss");
	const mod = map?.[modName];
	const ignoredPaths = config.ignore || [];
	const src = path.join(cwd, argv.base);
	const skipFile = ignoredPaths.some((e) => file.startsWith(path.join(src, e)));
	if (!mod && !skipFile) {
		console.error("[%s] no such module", fileName);
		return;
	}

	css.walkRules((rule) => {
		rule.selector = rule.selector.replace(SELECTOR, (_, s) => {
			const id = mod[s];
			if (!id) {
				const { column, line } = rule.source.start;
				console.error(
					"[%s:%d:%d] %o is undefined",
					fileName,
					line,
					column,
					`#${s}`,
				);
				return;
			}

			return `.${id}`;
		});
	});
};
selectorReplacerPlugin.postcss = true;
