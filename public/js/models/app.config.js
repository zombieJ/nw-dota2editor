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
	};

	Config.save = function() {
		localStorage.setItem("mainLang", Config.global.mainLang);
		localStorage.setItem("saveKeepKV", Config.global.saveKeepKV);
		localStorage.setItem("streamAPIKey", Config.global.streamAPIKey);
	};

	return Config;
});