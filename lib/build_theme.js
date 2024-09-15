import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import postcssrc from "postcss-load-config";
import { readScript } from "../src/api.js";
import { CLASS_MAP_FILE } from "../src/constants.js";
import { readFile, selectorReplacerPlugin } from "../src/shared.js";

const cwd = process.cwd();
const DIST_DIR = path.join(cwd, "dist");
const EXTENSION = ".css";
const SRC_DIR = path.join(cwd, "src");

export async function execute() {
	if (!fs.existsSync(path.join(cwd, CLASS_MAP_FILE))) {
		const script = await readScript("build_class_modules");
		await script.execute();
	}

	const classes = JSON.parse(fs.readFileSync(CLASS_MAP_FILE));
	// TODO:
	// Can't use SASS here - screams at me with "Please check the validity
	// of the block starting from line #1" with a completely valid SCSS syntax.
	const { plugins, options } = await postcssrc();
	const parsedCss = fs
		.readdirSync(SRC_DIR, { recursive: true })
		.filter((e) => e.endsWith(EXTENSION))
		.map((e) => [e, path.basename(e, EXTENSION)])
		.map(([e, name]) => [
			e,
			postcss([
				selectorReplacerPlugin({
					match: /#(\w+)/g,
					replace: (_, s) => {
						const mod = classes[name];
						if (!mod) {
							console.log("[%s] no such module", name);
							return;
						}

						const id = mod[s];
						if (!id) {
							console.log("[%s] %o is undefined", name, `#${s}`);
							return;
						}

						return `.${id}`;
					},
				}),
				...plugins,
			]).process(readFile(path.join(SRC_DIR, e)), {
				...options,
				from: path.join(SRC_DIR, e),
				to: path.join(DIST_DIR, e),
			}),
		]);

	fs.rmSync(DIST_DIR, { force: true, recursive: true });
	for (const [file, result] of parsedCss) {
		const { css, map } = await result;
		const distFile = path.join(DIST_DIR, file);

		fs.mkdirSync(path.dirname(distFile), { recursive: true });
		fs.writeFileSync(distFile, css);
		if (map) {
			fs.writeFileSync(`${distFile}.map`, map.toString());
		}
	}
}
