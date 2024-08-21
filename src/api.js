import cdp from "chrome-remote-interface";
import path from "node:path";
import { CDP_FILES_PATH, SCRIPT_PATH } from "./constants.js";
import { readFile } from "./shared.js";

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
