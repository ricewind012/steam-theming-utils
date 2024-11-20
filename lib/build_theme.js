import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import postcssrc from "postcss-load-config";
import { getConfig, readScript } from "../src/api.js";
import { readFile, selectorReplacerPlugin } from "../src/shared.js";

const config = await getConfig();

const EXTENSION = ".css";
const SELECTOR = /#(\w+)/g;

export async function execute(page = "client") {
	const classMapFile = path.join(config.paths.classMaps, `${page}.json`);
	if (!fs.existsSync(classMapFile)) {
		const script = await readScript("build_class_modules");
		await script.execute(page);
	}

	const classes = JSON.parse(fs.readFileSync(classMapFile));
	// TODO:
	// Can't use SASS here - screams at me with "Please check the validity
	// of the block starting from line #1" with a completely valid SCSS syntax.
	const { plugins, options } = await postcssrc();
	const files = fs
		.readdirSync(config.paths.src, { recursive: true })
		.filter((e) => e.endsWith(EXTENSION));

	fs.rmSync(config.paths.dist, { force: true, recursive: true });
	for (const file of files) {
		const name = path.basename(file, EXTENSION);
		const distFile = path.join(config.paths.dist, file);

		postcss([
			selectorReplacerPlugin({
				match: SELECTOR,
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
		])
			.process(readFile(path.join(config.paths.src, file)), {
				...options,
				from: path.join(config.paths.src, file),
				to: path.join(config.paths.dist, file),
			})
			.then(({ css, map }) => {
				fs.mkdirSync(path.dirname(distFile), { recursive: true });
				fs.writeFileSync(distFile, css);
				if (map) {
					fs.writeFileSync(`${distFile}.map`, map.toString());
				}
			});
	}
}
