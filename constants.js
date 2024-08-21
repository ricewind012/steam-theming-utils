import path from "node:path";
import { fileURLToPath } from "node:url";

export const packagePath = path.dirname(fileURLToPath(import.meta.url));

export const CDP_FILES_PATH = path.join(packagePath, "cdp");
export const CLASS_MAP_FILE = "class_map.json";
export const SCRIPT_PATH = path.join(packagePath, "lib");
