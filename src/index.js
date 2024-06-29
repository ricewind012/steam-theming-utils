import fs from "node:fs";
import cdp from "chrome-remote-interface";
import cp from "node:child_process";
import path from "node:path";

const CLASS_MAP_FILE = "class_map.json";

const readFile = (file) => fs.readFileSync(file).toString();
const run = async (expression) =>
	await connection.Runtime.evaluate({
		expression,
		awaitPromise: true,
		returnByValue: true,
	});

const connection = await cdp({
	host: "127.0.0.1",
	port: 8080,
	target: (e) => e.find((e) => e.title === "SharedJSContext"),
});

await connection.Runtime.enable();
connection.Runtime.on("consoleAPICalled", (ev) => {
	if (ev.type !== "error") {
		return;
	}

	console.error(...ev.args.map((e) => e.description || e.value));
});

// No need to directly use DFL
await run(
	readFile(
		path.join("node_modules", "decky-frontend-lib", "dist", "webpack.js"),
	).replace(/export /g, ""),
).catch((e) => {
	// Errors on first launch for some reason
});
await run(readFile(path.join("src", "class_modules_db.js")));

const filePath = path.join(process.cwd(), CLASS_MAP_FILE);
const output = await run(readFile(path.join("src", "class_modules.js")));

fs.writeFileSync(filePath, JSON.stringify(output.result.value));
cp.spawnSync("npx", ["@biomejs/biome", "format", "--write", filePath]);
connection.close();
console.log("Wrote %o", filePath);
