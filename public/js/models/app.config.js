'use strict';

// =====================================================
// =                   Configuration                   =
// =====================================================
app.factory("Config", function($q) {
	var FS = require("fs");
	var PATH = require('path');

	var _configCache = {};
	var Config = function () {
		this._data = {};
		this._pass = false;
		this._cacheList = [];
		this.exportFunction = null;

		return this;
	};

	Config.SPLIT_PROJECT = "___PROJECT_SPLIT___";

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
	Config.global = {
		mainLang: localStorage.getItem("mainLang") || "SChinese",
		saveKeepKV: localStorage.getItem("saveKeepKV") === "true",
		streamAPIKey: localStorage.getItem("streamAPIKey") || "",
		eventUseText: localStorage.getItem("eventUseText") === "true",
		operationUseText: localStorage.getItem("operationUseText") === "true",
		loopCheckFolder: localStorage.getItem("loopCheckFolder") !== "false",
		saveBackUp: localStorage.getItem("saveBackUp") !== "false",
	};

	Config.save = function() {
		localStorage.setItem("mainLang", Config.global.mainLang);
		localStorage.setItem("saveKeepKV", Config.global.saveKeepKV);
		localStorage.setItem("streamAPIKey", Config.global.streamAPIKey);
		localStorage.setItem("eventUseText", Config.global.eventUseText);
		localStorage.setItem("operationUseText", Config.global.operationUseText);
		localStorage.setItem("loopCheckFolder", Config.global.loopCheckFolder);
		localStorage.setItem("saveBackUp", Config.global.saveBackUp);
	};

	// Project list
	var _projectList = localStorage.getItem("project") || "";
	Config.projectList = _projectList ? _projectList.split(Config.SPLIT_PROJECT) : [];

	Config.addProjectPath = function(prjPath) {
		Config.projectPath = prjPath;
		Config.projectList.unshift(prjPath);
		$.unique(Config.projectList);
		localStorage.setItem("project", Config.projectList.join(Config.SPLIT_PROJECT));
	};
	Config.deleteProjectPath = function(prjPath) {
		common.array.remove(prjPath, Config.projectList);
		localStorage.setItem("project", Config.projectList.join(Config.SPLIT_PROJECT));
	};

	// Common configuration: ability, item, unit, hero
	Config.fetch = function(type, initFunc) {
		var _config = _configCache[type];
		var _deferred;
		if(!_config) {
			_deferred = $q.defer();
			_config = _configCache[type] = new Config();
			_config.promise = _deferred.promise;

			FS.readFile(
				PATH.normalize(Config.projectPath + "/.dota2editor/" + type + ".conf")
				, "utf8", function (err, data) {
					_config._pass = true;

					try {
						_config._data = JSON.parse(data);
						if(initFunc) {
							_config._data = initFunc(_config._data);
						}
					} catch(err) {
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

	// Assume folder
	Config.assumeFolder = function(path) {
		path = PATH.normalize(Config.projectPath + "/" + path);
		FS.exists(path, function(exist) {
			if(!exist) {
				FS.mkdir(path);
			}
		});
	};

	// Copy file
	Config.copyFile = function(src, tgt) {
		src = PATH.normalize(Config.projectPath + "/" + src);
		tgt = PATH.normalize(Config.projectPath + "/" + tgt);
		FS.exists(src, function(exist) {
			if(exist) {
				var readable = FS.createReadStream(src);
				var writable = FS.createWriteStream(tgt);
				readable.pipe(writable);
			}
		});
	};

	// List path
	Config.listFiles = function(path) {
		return FS.readdirSync(PATH.normalize(Config.projectPath + "/" + path));
	};

	// Delete
	function _loopDelete(path) {
		path = PATH.normalize(path);
		if(FS.existsSync(path)) {
			if(FS.statSync(path).isDirectory()) {
				$.each(FS.readdirSync(path), function (i, file) {
					_loopDelete(path + "/" + file);
				});
				FS.rmdirSync(path);
			} else {
				FS.unlinkSync(path);
			}
		}
	}

	Config.deleteFile = function(path) {
		_loopDelete(Config.projectPath + "/" + path);
	};

	return Config;
});