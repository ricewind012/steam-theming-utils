/**
 * @param {string} className
 * @returns the readable class name.
 */
function getNormalClass(className) {
	for (const key of Object.keys(classModules)) {
		const mod = classModules[key];
		const keys = Object.keys(mod);
		const name = keys.find((e) => mod[e] === className);
		if (!name) {
			continue;
		}

		return [key, name].join("_");
	}

	notInDb.push(className);
}

/**
 * Sets readable classes to a `data-readable-class` attribute.
 *
 * @param {HTMLElement} el
 */
function normalizeElement(el) {
	const readableClasses = [...el.classList]
		.map(getNormalClass)
		.filter(Boolean)
		.map((e) => `\t${e}`)
		.join("\n");
	if (readableClasses === "") {
		return;
	}

	el.dataset.readableClass = `\n${readableClasses}\n`;
}

/**
 * @param {FocusEvent}
 */
function main({ target }) {
	const elements = target.document.querySelectorAll("[class]");
	for (const el of elements) {
		normalizeElement(el);
	}

	if (inClient) {
		for (const popup of popups) {
			popup.removeEventListener("focus", main);
		}
	}

	if (notInDb.length > 0) {
		const classes = [...new Set(notInDb)];
		console.error(
			"%s classes are not in the classes db: %o",
			classes.length,
			classes.sort(),
		);
	}
}

inClient = !!SteamClient.User;
notInDb = [];
if (inClient) {
	window.popups = [...g_PopupManager.GetPopups()].map((e) => e.m_popup);
	for (const popup of popups) {
		popup.addEventListener("focus", main);
	}
} else {
	main({ target: window });
}
