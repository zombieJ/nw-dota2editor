app.factory("AppFileSrv", function ($interval, $once, globalContent) {
	var _interval;
	var FS = require("fs");
	var PATH = require("path");
	var AppFileSrv = function () {
	};
	AppFileSrv.fileList = [];
	AppFileSrv.fileMatchList = [];

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
					AppFileSrv.fileList.push(_purePath);
					AppFileSrv.fileMatchList.push({
						value: _purePath
					});
				}
			});
		});
	}

	AppFileSrv.check = function() {
		var _path = PATH.normalize(globalContent.project + "/scripts/vscripts");
		AppFileSrv.fileList = [];
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
		var _path = PATH.normalize(globalContent.project + "/" + path);

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

	return AppFileSrv;
});