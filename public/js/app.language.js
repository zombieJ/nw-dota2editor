'use strict';

// ======================================================
// =                        语言                        =
// ======================================================
app.factory("Language", function(KV, NODE) {
	var Language = function(fileName) {
		var _my = this;
		_my.fileName = fileName;
		_my.name = _my.fileName.replace(/^addon_(\w+)\.txt$/i, "$1");
		_my.map = null;
		_my.ready = false;


		NODE.loadFile(Language.folderPath + "/" + fileName, "ucs2").then(function(data) {
			var _kv = new KV(data);
			var _map = _kv.kvToMap();

			 _my.name = _map["Language"];
			 _my.map = _map["Tokens"].kvToMap();

			_my.ready = true;
		});

		return _my;
	};

	Language.prototype.getAbilityLang = function(ability) {
		if(!this.ready) return null;

		var _my = this;
		var _map = {
			AbilitySpecial: {},
		};

		var _abilityPrefix = Language.AbilityPrefix+ability._name;
		$.each(Language.AbilityLang, function(i, langUnit) {
			var _key = _abilityPrefix+(langUnit.attr ? "_"+langUnit.attr : "");
			_map[langUnit.attr || langUnit.title] = _my.map[_key];
		});

		var _abilityPrefix_ = _abilityPrefix + "_";
		$.each(_my.map, function(key, value) {
			if(key.indexOf(_abilityPrefix_) === 0) {
				_map.AbilitySpecial[key.replace(_abilityPrefix_, "")] = value;
			}
		});
		console.log(">>>", _map);
		return _map;
	};

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

	return Language;
});