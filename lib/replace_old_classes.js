import fs from "node:fs";
import postcss from "postcss";
import { getConfig } from "../src/api.js";
import { readFile, selectorReplacerPlugin } from "../src/shared.js";

const config = await getConfig();
const CLASS_MAP_FILE = path.join(config.paths.classMaps, "client.json");
const OLD_CLASS_MAP_FILE = path.join(config.paths.classMaps, "client_old.json");
const SELECTOR = /\.([\w-]+)/g;

if ([CLASS_MAP_FILE, OLD_CLASS_MAP_FILE].some((e) => !fs.existsSync(e))) {
	console.log("Usage:");
	console.log(
		"1. Run %o on stable Steam.",
		"npx steam-theming-utils build_class_modules",
	);
	console.log("2. Move %o to %o.", CLASS_MAP_FILE, OLD_CLASS_MAP_FILE);
	console.log("3. Run the same command on beta Steam.");
	process.exit(1);
}

const cwd = process.cwd();
const oldClasses = JSON.parse(fs.readFileSync(OLD_CLASS_MAP_FILE));
const newClasses = JSON.parse(fs.readFileSync(CLASS_MAP_FILE));
const modules = Object.keys(oldClasses);
const keys = modules
	.map((e) => ({ [e]: Object.keys(oldClasses[e]) }))
	.reduce((a, b) => Object.assign(a, b));

function findNewClassFromOld(oldName) {
	for (const mod of modules) {
		const className = keys[mod].find((e) => oldClasses[mod][e] === oldName);
		const newName = newClasses[mod]?.[className];
		if (!newName) {
			continue;
		}

		if (oldName !== newName) {
			console.log("Changed %o to %o", oldName, newName);
		}

		return `.${newName}`;
	}

	return `.${oldName}`;
}

export async function execute() {
	const files = fs
		.readdirSync(cwd, { recursive: true })
		.filter((e) => e.endsWith(".css"));
	for (const file of files) {
		postcss([
			selectorReplacerPlugin({
				match: SELECTOR,
				replace: (_, s) => findNewClassFromOld(s),
			}),
		])
			.process(readFile(file), {
				from: file,
			})
			.then(({ css }) => {
				fs.writeFileSync(file, css);
				console.log("[%s] done", file);
			});
	}
}
