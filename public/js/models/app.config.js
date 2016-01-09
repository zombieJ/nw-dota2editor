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
		this.exportFunction = null;

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

	// Get function. Arguments combine the path
	Config.prototype.get = function() {
		return this.data(Array.prototype.join.call(arguments, "."));
	};

	// Set function. Arguments combine the path. Last argument is the setting object
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

	Config.prototype.exportData = function() {
		if(!this.exportFunction) {
			return this._data;
		} else {
			return this.exportFunction(this._data);
		}
	};

	// Global Configuration
	Config.projectPath = null;

	Config.global = {
		mainLang: localStorage.getItem("mainLang") || "SChinese",
		saveKeepKV: localStorage.getItem("saveKeepKV") === "true",
		streamAPIKey: localStorage.getItem("streamAPIKey") || "",
		eventUseText: localStorage.getItem("eventUseText") === "true",
		operationUseText: localStorage.getItem("operationUseText") === "true",
		loopCheckFolder: localStorage.getItem("loopCheckFolder") !== "false",
	};

	Config.save = function() {
		localStorage.setItem("mainLang", Config.global.mainLang);
		localStorage.setItem("saveKeepKV", Config.global.saveKeepKV);
		localStorage.setItem("streamAPIKey", Config.global.streamAPIKey);
		localStorage.setItem("eventUseText", Config.global.eventUseText);
		localStorage.setItem("operationUseText", Config.global.operationUseText);
		localStorage.setItem("loopCheckFolder", Config.global.loopCheckFolder);
	};

	// Common configuration: ability, item, unit, hero
	Config.fetch = function(type, initFunc) {
		var _config = _configCache[type];
		var _deferred;
		if(!_config) {
			_deferred = $q.defer();
			_config = _configCache[type] = new Config();
			_config.promise = _deferred.promise;

			require("fs").readFile(
				require('path').normalize(Config.projectPath + "/.dota2editor/" + type + ".conf")
				, "utf8", function (err, data) {
					_config._pass = true;

					try {
						_config._data = JSON.parse(data);
						if(initFunc) {
							_config._data = initFunc(_config._data);
						}
					} catch(err) {
						console.warn("[" + type + "] Config fetch error:", err);
						_config._data = {};
					}

					// Fill cache list
					$.each(_config._cacheList, function(i, cacheUnit) {
						common.setValueByPath(_config._data, cacheUnit.path, cacheUnit.value);
					});
					_config._cacheList = null;

					// Promise finished
					_deferred.resolve();
				});
		}
		return _config;
	};

	return Config;
});