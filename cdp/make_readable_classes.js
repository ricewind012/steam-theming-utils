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
}

function normalizeElement(el) {
	const readableClasses = [...el.classList]
		.map(getNormalClass)
		.filter(Boolean)
		.map((e) => `\t${e}`)
		.join("\n");
	if (readableClasses === "") {
		return;
	}

	el.setAttribute("data-readableclass", `\n${readableClasses}\n`);
}

function onFocus({ target }) {
	const elements = target.document.querySelectorAll("[class]");
	for (const el of elements) {
		normalizeElement(el);
	}

	for (const popup of popups) {
		popup.removeEventListener("focus", onFocus);
	}
}

popups = [...g_PopupManager.GetPopups()].map((e) => e.m_popup);
for (const popup of popups) {
	popup.addEventListener("focus", onFocus);
}
