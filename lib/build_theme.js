import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import postcssrc from "postcss-load-config";
import { readScript } from "../src/api.js";
import { getConfig, readFile, selectorReplacerPlugin } from "../src/shared.js";

const config = await getConfig();
const cwd = process.cwd();

const EXTENSION = ".css";

export async function execute(page = "client") {
	const classMapFile = path.join(config.paths.classMaps, `${page}.json`);
	if (!fs.existsSync(path.join(cwd, classMapFile))) {
		const script = await readScript("build_class_modules");
		await script.execute(page);
	}

	const classes = JSON.parse(fs.readFileSync(classMapFile));
	// TODO:
	// Can't use SASS here - screams at me with "Please check the validity
	// of the block starting from line #1" with a completely valid SCSS syntax.
	const { plugins, options } = await postcssrc();
	const parsedCss = fs
		.readdirSync(config.paths.src, { recursive: true })
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
			]).process(readFile(path.join(config.paths.src, e)), {
				...options,
				from: path.join(config.paths.src, e),
				to: path.join(config.paths.dist, e),
			}),
		]);

	fs.rmSync(config.paths.dist, { force: true, recursive: true });
	for (const [file, result] of parsedCss) {
		const { css, map } = await result;
		const distFile = path.join(config.paths.dist, file);

		fs.mkdirSync(path.dirname(distFile), { recursive: true });
		fs.writeFileSync(distFile, css);
		if (map) {
			fs.writeFileSync(`${distFile}.map`, map.toString());
		}
	}
}
