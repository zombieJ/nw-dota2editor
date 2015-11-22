'use strict';

// =====================================================
// =                   Configuration                   =
// =====================================================
app.factory("Config", function() {
	var Config = function () {
	};

	Config.global = {
		mainLang: localStorage.getItem("mainLang") || "SChinese",
		saveKeepKV: localStorage.getItem("saveKeepKV") === "true",
		streamAPIKey: localStorage.getItem("streamAPIKey") || "",
		eventUseText: localStorage.getItem("eventUseText") === "true",
	};

	Config.save = function() {
		localStorage.setItem("mainLang", Config.global.mainLang);
		localStorage.setItem("saveKeepKV", Config.global.saveKeepKV);
		localStorage.setItem("streamAPIKey", Config.global.streamAPIKey);
		localStorage.setItem("eventUseText", Config.global.eventUseText);
	};

	return Config;
});