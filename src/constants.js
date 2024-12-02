import path from "node:path";
import { packagePath } from "./shared.js";

export const CDP_FILES_PATH = path.join(packagePath, "cdp");
export const SCRIPT_PATH = path.join(packagePath, "lib");

const SRC_DIR = "src";
const WEB_DIR = path.join(SRC_DIR, "web");
export const DEFAULT_CONFIG = {
	paths: {
		classMaps: "class_maps",
		dist: "dist",
		src: {
			client: path.join(SRC_DIR, "client"),
			profileedit: path.join(WEB_DIR, "profileedit"),
		},
	},
	sass: {
		use: true,
		options: undefined,
	},
};

export const PAGES = {
	profileedit: "SteamIDEditPage",
};
