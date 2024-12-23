import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import postcssrc from "postcss-load-config";
import postcssSass from "@csstools/postcss-sass";
import { getConfig, readScript } from "../src/api.js";
import { readFile, selectorReplacerPlugin } from "../src/shared.js";

const SELECTOR = /#(\w+)/g;

export async function execute(page = "client") {
	const config = await getConfig();
	const classMapFile = path.join(config.paths.classMaps, `${page}.json`);
	if (!fs.existsSync(classMapFile)) {
		const script = await readScript("build_class_modules");
		await script.execute(page);
	}

	const classes = JSON.parse(fs.readFileSync(classMapFile));
	const { plugins, options } = await postcssrc();
	if (config.sass.use) {
		plugins.push(postcssSass(config.sass.options));
		// TODO:
		// Make sass stfu because @csstools/postcss-sass
		// has not yet been updated to use the new sass API.
		Object.assign(config.sass.options, {
			silenceDeprecations: ["legacy-js-api"],
		});
	}

	const ext = `.${config.sass.use ? "scss" : "css"}`;
	const distDir = path.join(config.paths.dist, page);
	const srcDir = config.paths.src[page];
	const ignorePaths = config.paths.ignore?.[page] || [];
	const files = fs
		.readdirSync(srcDir, { recursive: true })
		.filter((e) => e.endsWith(ext));

	fs.rmSync(distDir, { force: true, recursive: true });
	for (const file of files) {
		const name = path.basename(file, ext);
		const fileDir = path.join(distDir, path.dirname(file));
		const distFile = path.format({
			dir: fileDir,
			name,
			ext: ".css",
		});
		const srcFile = path.join(srcDir, file);

		const mod = classes[name];
		const skipFile = ignorePaths.some((e) => file.startsWith(e));
		if (!mod && !skipFile) {
			console.error("[%s] no such module", name);
			continue;
		}

		postcss([
			selectorReplacerPlugin({
				match: SELECTOR,
				replace: (_, s) => {
					const id = mod[s];
					if (!id) {
						console.error("[%s] %o is undefined", name, `#${s}`);
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
				fs.mkdirSync(fileDir, { recursive: true });
				fs.writeFileSync(distFile, css);
				if (map) {
					fs.writeFileSync(`${distFile}.map`, map.toString());
				}
			});
	}
}
