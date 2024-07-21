import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import { CLASS_MAP_FILE, readFile, readScript } from "../shared.js";

const cwd = process.cwd();
const DIST_DIR = path.join(cwd, "dist");
const ERROR_POINTER_STRING = "\n^^^ HERE";
const EXTENSION = ".css";
const SRC_DIR = path.join(cwd, "src");

const selectorReplacerPlugin = (opts) => (css) => {
	css.walkRules((rule) => {
		rule.selector = rule.selector.replace(opts.match, opts.replace);
	});
};
selectorReplacerPlugin.postcss = true;

export async function execute() {
	if (!fs.existsSync(path.join(cwd, CLASS_MAP_FILE))) {
		const script = await readScript("build_class_modules");
		await script.execute();
	}

	const classes = JSON.parse(fs.readFileSync(CLASS_MAP_FILE));
	const parsedCss = fs
		.readdirSync(SRC_DIR, { recursive: true })
		.filter((e) => e.endsWith(EXTENSION))
		.map((e) => [
			e,
			postcss(
				selectorReplacerPlugin({
					match: /#(\w+)/g,
					replace: (_, s) => {
						const name = path.basename(e, EXTENSION);
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

						return `.${id} /* ${s} */`;
					},
				}),
			).process(readFile(path.join(SRC_DIR, e)), {
				from: path.join(SRC_DIR, e),
			}),
		]);

	fs.rmSync(DIST_DIR, { force: true, recursive: true });
	for (const [file, result] of parsedCss) {
		fs.mkdirSync(path.join(DIST_DIR, path.dirname(file)), { recursive: true });
		fs.writeFileSync(path.join(DIST_DIR, file), (await result).css);
	}
}
