'use strict';

// ======================================================
// =                        语言                        =
// ======================================================
app.factory("Language", function($q, KV, NODE, Locale) {
	var Language = function(fileName) {
		var _deferred = $q.defer();
		var _my = this;
		_my.fileName = fileName;
		_my.name = _my.fileName.replace(/^addon_(\w+)\.txt$/i, "$1");
		//_my.map = null;
		_my.ready = false;
		_my._promise = _deferred.promise;

		NODE.loadFile(Language.folderPath + "/" + fileName, "ucs2").then(function(data) {
			try {
				var _kv = KV.parse(data.substr(1));

				_my.name = _kv.get("Language", false);
				_my.kv = _kv.getKV("Tokens", false);
				_my._oriKV = _kv;
			} catch (err) {
				$.dialog({
					title: Locale('Warning'),
					content: common.template(Locale('languageParseError'), {file: fileName})
				});

				if(!_my._oriKV) {
					_my._oriKV = new KV("lang", []);
					_my._oriKV.assumeKey("Language");
					_my._oriKV.set("Language", _my.name);
					_my.kv = _my._oriKV.assumeKey("Tokens", []);
				}
			}

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

	Language.unitAttr = function(unit, attr) {
		if(!unit) return null;

		var _overrideHero = unit.kv.get("override_hero", false);
		var abilityName = _overrideHero ? _overrideHero : unit._name;
		return Language.UnitPrefix + abilityName + (attr ? '_' + attr : '');
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
		{attr: "Description", desc: "描述", type: "blob", rows: 8, frequent: true},
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

	// ================================================
	// =                     Unit                     =
	// ================================================
	Language.UnitPrefix = "";
	Language.UnitLang = [
		{attr: "", desc: "名称", title: "name", type: "text", frequent: true},
		{attr: "bio", desc: "描述", type: "blob", frequent: true},
	];

	return Language;
});