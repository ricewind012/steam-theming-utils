import cdp from "chrome-remote-interface";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const connection = await cdp({
	host: "127.0.0.1",
	port: 8080,
	target: (e) => e.find((e) => e.title === "SharedJSContext"),
}).catch((e) => {
	console.log(
		"%s\n%s %o",
		e.message,
		"Try running Steam with",
		"-cef-enable-debugging",
	);
	process.exit(1);
});
export const packagePath = path.dirname(fileURLToPath(import.meta.url));

export const CDP_FILES_PATH = path.join(packagePath, "cdp");
export const CLASS_MAP_FILE = "class_map.json";
export const SCRIPT_PATH = path.join(packagePath, "lib");

export const readFile = (file) => fs.readFileSync(file).toString();
export const readScript = async (name) =>
	await import(`file://${path.join(SCRIPT_PATH, `${name}.js`)}`);
export const run = async (expression) =>
	await connection.Runtime.evaluate({
		expression,
		awaitPromise: true,
		returnByValue: true,
	});
export const runCdpFile = async (file) =>
	await runWithResult(readFile(path.join(CDP_FILES_PATH, file)));
export const runWithResult = async (expression) =>
	(await run(expression)).result.value;
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
