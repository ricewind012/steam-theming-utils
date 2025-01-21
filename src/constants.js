import path from "node:path";
import { packagePath } from "./shared.js";

export const CDP_FILES_PATH = path.join(packagePath, "cdp");
export const SCRIPT_PATH = path.join(packagePath, "lib");

/** @type {import("./api").Config} */
export const DEFAULT_CONFIG = {
	classMaps: "class_maps",
	ignore: [],
};

export const STORE_BASE_URL = "https://store.steampowered.com";
