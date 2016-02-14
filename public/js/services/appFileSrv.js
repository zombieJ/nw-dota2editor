app.factory("AppFileSrv", function ($interval, $q, $once, globalContent, Config) {
	var PREFIX = "scripts/vscripts";

	var _interval;
	var FS = require("fs");
	var PATH = require("path");
	var AppFileSrv = function () {
	};
	AppFileSrv.fileMatchList = [];

	// ==========================================================
	// =                        V Script                        =
	// ==========================================================
	// List files
	function listFiles(path) {
		FS.readdir(path, function(err, files) {
			if(err) return;

			$.each(files, function(i, file) {
				var tmpPath = PATH.normalize(path + '/' + file);
				var stats = FS.statSync(tmpPath);

				if (stats.isDirectory()) {
					listFiles(tmpPath);
				} else {
					var _purePath = tmpPath.replace(globalContent.project, "").slice(1);
					_purePath = _purePath.replace(/\\/g, "/");

					if(!Config.global.typeaheadFuncPrefix) {
						_purePath = _purePath.replace(PREFIX + "/", "");
					}

					AppFileSrv.fileMatchList.push({
						value: _purePath
					});
				}
			});
		});
	}

	AppFileSrv.check = function() {
		var _path = PATH.normalize(globalContent.project + "/" + PREFIX);
		AppFileSrv.fileMatchList = [];
		listFiles(_path);
	};

	// Watching
	AppFileSrv.stopWatch = function() {
		$interval.cancel(_interval);
	};
	AppFileSrv.watchFolder = function() {
		AppFileSrv.stopWatch();

		AppFileSrv.check();
		_interval = $interval(function() {
			if(!Config.global.loopCheckFolder) return;
			AppFileSrv.check();
		}, 5000);
	};

	// Prepare function list
	AppFileSrv.prepareFuncMatchCache = {};
	AppFileSrv.prepareFuncMatchList = function(path) {
		var _path = globalContent.project + "/";
		if(!Config.global.typeaheadFuncPrefix) {
			_path = _path + PREFIX + "/";
		}
		_path = PATH.normalize(_path + path);

		$once("fileFuncQuery_" + path, function() {
			FS.readFile(_path, "utf8", function (err, data) {
				if(!err) {
					var matchList = data.match(/function\s+[^\s^\(]+/g);
					AppFileSrv.prepareFuncMatchCache[path] = $.map(matchList, function(line) {
						return {
							value: line.match(/function\s+(.*)/)[1]
						};
					});
				}
			});
		}, 5000);

		return AppFileSrv.prepareFuncMatchCache[path] || [];
	};

	// ==========================================================
	// =                       File System                      =
	// ==========================================================
	// Assume folder
	AppFileSrv.assumeFolder = function(path) {
		path = PATH.normalize(path);
		if(!FS.existsSync(path)) {
			AppFileSrv.assumeFolder(PATH.dirname(path));
			FS.mkdirSync(path);
		}
	};

	// List path
	AppFileSrv.listFiles = function(path, filter) {
		var _deferred = $q.defer();
		var _list = [];

		path = PATH.normalize(path);
		if(!FS.existsSync(path)) {
			return {
				success: false,
				msg: "Folder not exist!",
				list: _list
			};
		}
		if(!FS.statSync(path).isDirectory()) {
			return {
				success: false,
				msg: "Not a folder!",
				list: _list
			};
		}

		_list = FS.readdirSync(path);

		switch (filter) {
			case "folder":
			case "directory":
				_list = $.grep(_list, function(file) {
					return FS.statSync(PATH.normalize(path + "/" + file)).isDirectory();
				});
				break;
			case "file":
				_list = $.grep(_list, function(file) {
					return FS.statSync(PATH.normalize(path + "/" + file)).isFile();
				});
				break;
			default:
				if(filter instanceof RegExp) {
					_list = $.grep(_list, function(file) {
						return filter.test(file);
					});
				}
		}

		return {
			success: true,
			list: _list
		};

		return _deferred.promise;
	};

	// Write file
	AppFileSrv.writeFile = function(path, data, encoding) {
		var _deferred = $q.defer();

		path = PATH.normalize(path);
		encoding = encoding || "utf8";
		if(encoding === "ucs2") {
			data = "\ufeff" + data;
		}
		FS.writeFile(path, data, encoding, function (err) {
			if(err) {
				_deferred.reject(err);
			} else {
				_deferred.resolve();
			}
		});

		return _deferred.promise;
	};

	return AppFileSrv;
});