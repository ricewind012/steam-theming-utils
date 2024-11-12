import path from "node:path";
import { packagePath } from "./shared.js";

export const CDP_FILES_PATH = path.join(packagePath, "cdp");
export const SCRIPT_PATH = path.join(packagePath, "lib");

export const DEFAULT_CONFIG = {
	paths: {
		classMaps: "class_maps",
		dist: "dist",
		src: "src",
	},
};

export const PAGES = {
	profileedit: "SteamIDEditPage",
};
