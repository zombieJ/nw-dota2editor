app.factory("AppGitSrv", function ($http, $q, AppFileSrv) {
	var URL_GITHUB_TREE = "https://api.github.com/repos/[REPO]/git/trees/[BRANCH]";
	var URL_GITHUB_ROW = "https://raw.githubusercontent.com/[REPO]/[BRANCH]/[FILE_PATH]";
	var CLIENT_ID = "2b50552c9de85d95b3a3";
	var CLIENT_SECRET = "15e52b63208e06d4e1ccd12098d72f81bccd12c6";

	var FS = require("fs");
	var PATH = require("path");
	var HTTPS = require('https');

	var AppGitSrv = function() {};

	AppGitSrv.downloadGitFolder = function(gitConfig, exportPath, folderPath, config) {
		var _url = URL_GITHUB_TREE.replace("[REPO]", gitConfig.repo).replace("[BRANCH]", gitConfig.branch || "master");
		var _rowUrl = URL_GITHUB_ROW.replace("[REPO]", gitConfig.repo).replace("[BRANCH]", gitConfig.branch || "master");
		var _deferred = $q.defer();

		config = config || {};
		if(typeof config === "string") config = {name: config};
		var name = config.name ? "[" + config.name + "]" : "";

		setTimeout(function() {
			_deferred.notify({msg: name + "Connecting Github..."});
		});

		$.get(_url, {client_id: CLIENT_ID, client_secret: CLIENT_SECRET, recursive: 1}).then(function (data) {
			var list = $.map(data.tree, function(item) {
				if(item.path.indexOf(folderPath) !== 0 || item.type !== "blob") return;

				var _path = item.path.replace(folderPath + "/", "");
				var _targetPath = PATH.normalize(exportPath + "/" + _path);
				var _exist = FS.existsSync(_targetPath);
				var _state = _exist ? FS.statSync(_targetPath) : null;

				if(_exist && _state.size === item.size) return;

				return {
					path: _path,
					targetPath: _targetPath,
					url: _rowUrl.replace("[FILE_PATH]", item.path)
				};
			});
			_deferred.notify({msg: name + "Start download..."});

			AppGitSrv.DownloadPool(list, config).then(null, null, function(notify) {
				_deferred.notify({msg: name + notify.msg});
			}).finally(function() {
				_deferred.notify({msg: name + "Download finished!"});
				_deferred.resolve(list);
			});
		}, function(err) {
			_deferred.reject(err);
		});

		return _deferred.promise;
	};

	// ===========================================================
	// =                      Download Pool                      =
	// ===========================================================
	AppGitSrv.DownloadPool = function(list, config) {
		config = config || {};

		var thread = config.thread || 10;
		var remain = thread, prepare = 0, done = 0;
		var dList = list.slice();
		var _deferred = $q.defer();

		if(list.length === 0) _deferred.resolve();

		function startThread() {
			if(dList.length && remain > 0) {
				remain -= 1;
				prepare += 1;
				AppGitSrv.DownloadPool.download(dList.shift(), config).finally(function() {
					done += 1;
					remain += 1;
					_deferred.notify({msg: "Downloading..." + done + "/" + prepare + "/" + list.length});

					startThread();
				});
			} else if(!dList.length && done === list.length) {
				_deferred.resolve();
			}
		}

		while(dList.length && remain) {
			startThread();
		}

		return _deferred.promise;
	};

	function _download(url, targetPath, config) {
		config = config || {};

		var file = FS.createWriteStream(targetPath);
		var _deferred = $q.defer();
		var _timeoutId, _cancel = false;

		function _timeoutCheck(key) {
			_timeoutId = setTimeout(function() {
				console.warn("[_DOWN CANCEL]|", targetPath, "|", url, "|", key);
				_cancel = true;
				file.close(function () {
					_deferred.reject("[_DOWN] Timout!|", targetPath, "|", url);
				});
			}, config.timeout || 20000);
		}
		_timeoutCheck("Outer");

		console.log("[_DOWN 0]|", targetPath, "|", url);
		try {
			console.log("[_DOWN 1]|", targetPath, "|", url, "|", +new Date());
			var request = HTTPS.get(url, function (response) {
				if(_cancel) return;
				clearTimeout(_timeoutId);
				_timeoutCheck("Inner");

				console.log("[_DOWN]|", targetPath, "|", url, "|", +new Date());
				response.pipe(file);
				file.on('finish', function () {
					clearTimeout(_timeoutId);
					file.close(function () {
						_deferred.resolve();
					});
				});
			});
			request.on('error', function(err) {
				clearTimeout(_timeoutId);
				console.warn("[_DOWN HTTPS FAIL]|", targetPath, "|", url, "|", err);
				file.close(function() {
					_deferred.reject(err);
				});
			});
		} catch (err) {
			console.warn("[_DOWN FAIL]|", targetPath, "|", url, "|", err);
			file.close(function() {
				_deferred.reject(err);
			});
		}

		return _deferred.promise;
	}

	window.git = {};
	window.gitTime = {};
	window.gitList = function() {
		var _time = +new Date();
		$.each(gitTime, function(key, timestamp) {
			if(_time - timestamp > 1000 * 30) {
				console.log(">>>" + key + ":" + git[key]);
			}
		});
	};

	AppGitSrv.DownloadPool.download = function(unit, config) {
		config = config || {};
		console.log("[START]|", unit.path);
		var retry = config.retry || 5;
		var _deferred = $q.defer();
		git[unit.path] = true;
		gitTime[unit.path] = +new Date();

		var _folderPath = unit.targetPath.match(/^(.*)[\\\/]([^\\\/]*)$/)[1];
		AppFileSrv.assumeFolder(_folderPath);

		function _doLoad() {
			if(retry > 0) {
				window.git[unit.path] = "do load:" + retry;
				_download(unit.url + "?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET, unit.targetPath, config).then(function() {
					delete git[unit.path];
					delete gitTime[unit.path];
					console.log("[DONE]|", unit.path);
					_deferred.resolve();
				}, function(err) {
					window.git[unit.path] = retry;
					console.log("[FAIL]|", unit.path, err, "|RETRY:", retry);
					_doLoad();
				});
				retry -= 1;
			} else {
				window.git[unit.path] = false;
				console.log("[FAIL]|", unit.path, "|Retry max time exceed! Abort:", unit.url + "?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET);
				_deferred.reject("Retry max time exceed!");
			}
		}
		_doLoad();

		return _deferred.promise;
	};

	return AppGitSrv;
});