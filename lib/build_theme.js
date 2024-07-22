import fs from "node:fs";
import path from "node:path";
import { CLASS_MAP_FILE, readFile, readScript, usePostcss } from "../shared.js";

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
	const parsedCss = fs
		.readdirSync(SRC_DIR, { recursive: true })
		.filter((e) => e.endsWith(EXTENSION))
		.map((e) => [e, path.basename(e, EXTENSION), path.join(SRC_DIR, e)])
		.map(([e, name, filePath]) => [
			e,
			usePostcss({
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

					return `.${id} /* ${s} */`;
				},
			}).process(readFile(filePath), {
				from: filePath,
			}),
		]);

	fs.rmSync(DIST_DIR, { force: true, recursive: true });
	for (const [file, result] of parsedCss) {
		fs.mkdirSync(path.join(DIST_DIR, path.dirname(file)), { recursive: true });
		fs.writeFileSync(path.join(DIST_DIR, file), (await result).css);
	}
}
