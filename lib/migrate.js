import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import { config, readScript } from "../src/api.js";
import { readFile } from "../src/shared.js";

const CLASS_MAP_FILE = path.join(config.classMaps, "client.json");
const NEW_SRC = "new";
const SELECTOR = /\.([\w-]+)/g;

if (!fs.existsSync(CLASS_MAP_FILE)) {
	const script = await readScript("build_class_modules");
	// Most themes are for the client anyway
	await script.execute("client");
}

const newFiles = {};
const notFound = [];
const unsorted = [];

const classes = JSON.parse(fs.readFileSync(CLASS_MAP_FILE));
const modules = Object.keys(classes);
const keys = modules
	.map((e) => ({ [e]: Object.keys(classes[e]) }))
	.reduce((a, b) => Object.assign(a, b));

/**
 * @param {string} name Obfuscated class name.
 * @returns [module, readableName]
 */
function findReadableClass(name) {
	for (const mod of modules) {
		const newName = keys[mod].find((e) => classes[mod][e] === name);
		if (newName) {
			return [mod, newName];
		}
	}

	return ["", name];
}

const processFile = () => (css) => {
	css.walkRules((rule) => {
		rule.selector = rule.selector.replace(SELECTOR, (s, match) => {
			const [mod, className] = findReadableClass(match);
			return mod === "" ? `.${match}` : `#${mod}_${className}`;
		});

		const modsInSelector = new Set(
			[...rule.selector.matchAll(/#([a-z]+)_/g)].map((e) => e[1]),
		);
		if (modsInSelector.size === 1) {
			const mod = [...modsInSelector][0];
			if (!newFiles[mod]) {
				newFiles[mod] = [];
			}

			rule.selector = rule.selector.replaceAll(`${mod}_`, "");
			newFiles[mod].push(rule.toString());
		} else if (modsInSelector.size === 0) {
			notFound.push(rule.toString());
		} else {
			unsorted.push(rule.toString());
		}
	});
};
processFile.postcss = true;

export async function execute() {
	const files = fs
		.readdirSync(process.cwd(), { recursive: true })
		.filter((e) => e.endsWith(".css"));
	for (const file of files) {
		await postcss([processFile()]).process(readFile(file), {
			from: file,
		});
	}

	fs.mkdirSync(NEW_SRC, { recursive: true });
	for (const mod of Object.keys(newFiles)) {
		fs.writeFileSync(
			path.join(NEW_SRC, `${mod}.css`),
			newFiles[mod].join("\n\n"),
		);
	}
	fs.writeFileSync(path.join(NEW_SRC, "_NOTFOUND.css"), notFound.join("\n\n"));
	fs.writeFileSync(path.join(NEW_SRC, "_UNSORTED.css"), unsorted.join("\n\n"));
}
