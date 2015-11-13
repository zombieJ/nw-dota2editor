'use strict';

// ======================================================
// =                        语言                        =
// ======================================================
app.factory("Language", function($q, KV, NODE) {
	var Language = function(fileName) {
		var _deferred = $q.defer();
		var _my = this;
		_my.fileName = fileName;
		_my.name = _my.fileName.replace(/^addon_(\w+)\.txt$/i, "$1");
		_my.map = null;
		_my.ready = false;
		_my._promise = _deferred.promise;

		NODE.loadFile(Language.folderPath + "/" + fileName, "ucs2").then(function(data) {
			var _kv = KV.parse(data.substr(1));

			_my.name = _kv.get("Language", false);
			_my.map = _kv.getKV("Tokens", false).kvToMap();

			_my.ready = true;
			_deferred.resolve();
		});

		return _my;
	};

	// ================================================
	// =                     键名                     =
	// ================================================
	Language.abilityAttr = function(abilityName, attr) {
		return Language.AbilityPrefix + abilityName + (attr ? '_' + attr : '');
	};

	Language.modifierAttr = function(modifierName, attr) {
		return Language.ModifierPrefix +modifierName + (attr ? '_' + attr : '')
	};

	// ================================================
	// =                     常量                     =
	// ================================================
	Language.fileNameRegex = /^addon_\w+\.txt$/i;
	//Language.fileNameRegex = /^_addon_\w+\.txt\.bac$/i;
	Language.folderPath = "resource";

	// ================================================
	// =                     技能                     =
	// ================================================
	Language.AbilityPrefix = "DOTA_Tooltip_ability_";
	Language.AbilityLang = [
		{attr: "", desc: "名称", title: "Name", type: "text", frequent: true},
		{attr: "Description", desc: "描述", type: "blob", frequent: true},
		{attr: "Lore", desc: "传说", type: "blob"},
		{attr: "Note0", desc: "备注0", type: "blob"},
		{attr: "Note1", desc: "备注1", type: "blob"},
		{attr: "Note2", desc: "备注2", type: "blob"},
	];

	Language.ModifierPrefix = "DOTA_Tooltip_";
	Language.ModifierLang = [
		{attr: "", desc: "名称", title: "Name", type: "text", frequent: true},
		{attr: "Description", desc: "描述", type: "blob", frequent: true},
	];

	return Language;
});