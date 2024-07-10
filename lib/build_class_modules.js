import fs from "node:fs";
import cp from "node:child_process";
import path from "node:path";
import {
	CLASS_MAP_FILE,
	readFile,
	run,
	runCdpFile,
	runWithResult,
} from "../shared.js";

export async function execute() {
	const dflRan = await runWithResult("!!webpackCache");
	if (!dflRan) {
		// No need to directly use DFL
		await run(
			readFile(
				path.join("node_modules", "decky-frontend-lib", "dist", "webpack.js"),
			).replace(/export /g, ""),
		).catch((e) => {
			// Fails on first launch sometimes
		});

		// Leave only the relevant modules
		await run(
			"allModules = findAllModules((e) => typeof e === 'object' && !e.__esModule);",
		);
	}
	await runCdpFile("class_modules_db.js");

	const filePath = path.join(process.cwd(), CLASS_MAP_FILE);
	const output = await runCdpFile("class_modules.js");

	fs.writeFileSync(filePath, JSON.stringify(output));
	cp.spawnSync("npx", ["@biomejs/biome", "format", "--write", filePath]);
	console.log("Wrote %o", filePath);
}
