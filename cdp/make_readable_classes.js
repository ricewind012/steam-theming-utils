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

focusedPopup = [...g_PopupManager.GetPopups()].find((e) => e.focused);
if (focusedPopup) {
	const elements = [
		...focusedPopup.m_popup.document.querySelectorAll("[class]"),
	];
	for (const el of elements) {
		normalizeElement(el);
	}
}
