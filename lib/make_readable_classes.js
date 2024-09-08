import { readScript, runCdpFile } from "../src/api.js";

export async function execute() {
	const script = await readScript("build_class_modules");
	await script.execute();

	console.log("Waiting for focus...");
	await runCdpFile("make_readable_classes.js");
}
