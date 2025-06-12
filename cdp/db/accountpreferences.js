// Note that every module is only available on the "family management" page.
exportedModules = [
	["authorizeddevices", (e) => e.AuthorizedDeviceGroup],
	["cookies", (e) => e.CookieSection],
	["familymanagement", (e) => e.FamilySettingsContainer],
	["familymanagementinvites", (e) => e.IncomingInviteRow],
	["familymanagementtabs", (e) => e.GraphicalAssetsTabs],
	// TODO: shared with steam settings notif page
	["notifications", (e) => e.NotificationSection],
	// TODO: gamepaddialog
	["toggle", (e) => e.Field],
];
