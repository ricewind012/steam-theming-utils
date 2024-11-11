import path from "node:path";
import { fileURLToPath } from "node:url";

const packagePath = path
	.dirname(fileURLToPath(import.meta.url))
	.split(path.sep)
	.slice(0, -1)
	.join(path.sep);

export const CDP_FILES_PATH = path.join(packagePath, "cdp");
export const SCRIPT_PATH = path.join(packagePath, "lib");

export const PAGES = {
	profileedit: "SteamIDEditPage",
};
