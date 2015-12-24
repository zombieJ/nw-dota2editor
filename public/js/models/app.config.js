'use strict';

// =====================================================
// =                   Configuration                   =
// =====================================================
app.factory("Config", function($q) {
	var _configCache = {};
	var Config = function () {
		this._data = {};
		this._pass = false;
		this._cacheList = [];

		return this;
	};

	Config.prototype.data = function(path, value) {
		if(arguments.length === 2) {
			if(!this._pass) {
				this._cacheList.push({
					path: path,
					value: value
				});
			} else {
				common.setValueByPath(this._data, path, value);
			}
		}
		return common.getValueByPath(this._data, path);
	};

	Config.prototype.get = function() {
		return this.data(Array.prototype.join.call(arguments, "."));
	};

	Config.prototype.set = function() {
		var _args = $.makeArray(arguments);
		var _value = _args.pop();
		this.data(_args.join("."), _value);
	};

	Config.prototype.assumeObject = function() {
		var _args = $.makeArray(arguments);
		var _obj = this.get.apply(this, _args);
		if(!_obj) {
			_obj = {};
			_args.push(_obj);
			this.set.apply(this, _args)
		}
		return _obj;
	};

	// Global Configuration
	Config.projectPath = null;

	Config.global = {
		mainLang: localStorage.getItem("mainLang") || "SChinese",
		saveKeepKV: localStorage.getItem("saveKeepKV") === "true",
		streamAPIKey: localStorage.getItem("streamAPIKey") || "",
		eventUseText: localStorage.getItem("eventUseText") === "true",
		operationUseText: localStorage.getItem("operationUseText") === "true",
	};

	Config.save = function() {
		localStorage.setItem("mainLang", Config.global.mainLang);
		localStorage.setItem("saveKeepKV", Config.global.saveKeepKV);
		localStorage.setItem("streamAPIKey", Config.global.streamAPIKey);
		localStorage.setItem("eventUseText", Config.global.eventUseText);
		localStorage.setItem("operationUseText", Config.global.operationUseText);
	};

	// Common configuration: ability, item, unit, hero
	Config.fetch = function(type) {
		var _config = _configCache[type];
		if(!_config) {
			_config = _configCache[type] = new Config();

			require("fs").readFile(
				require('path').normalize(Config.projectPath + "/.dota2editor/" + type + ".conf")
				, "utf8", function (err, data) {
					_config._pass = true;

					try {
						_config._data = JSON.parse(data);
					} catch(err) {
						_config._data = {};
					}

					// Fill cache list
					$.each(_config._cacheList, function(i, cacheUnit) {
						common.setValueByPath(_config._data, cacheUnit.path, cacheUnit.value);
					});
					_config._cacheList = null;
				});
		}
		return _config;
	};

	return Config;
});