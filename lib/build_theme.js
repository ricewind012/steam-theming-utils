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

	const distDir = path.join(config.paths.dist, page);
	const srcDir = config.paths.src[page];
	const files = fs
		.readdirSync(srcDir, { recursive: true })
		.filter((e) => e.endsWith(EXTENSION));

	fs.rmSync(distDir, { force: true, recursive: true });
	for (const file of files) {
		const name = path.basename(file, EXTENSION);
		const distFile = path.join(distDir, file);
		const srcFile = path.join(srcDir, file);

		const mod = classes[name];
		if (!mod) {
			console.log("[%s] no such module", name);
			continue;
		}

		postcss([
			selectorReplacerPlugin({
				match: SELECTOR,
				replace: (_, s) => {
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
			.process(readFile(srcFile), {
				...options,
				from: srcFile,
				to: distFile,
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
