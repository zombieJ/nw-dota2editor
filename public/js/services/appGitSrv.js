app.factory("AppGitSrv", function ($http, $q, AppVersionSrv, AppFileSrv) {
	var URL_GITHUB_TREE = "https://api.github.com/repos/[REPO]/git/trees/master";
	var URL_GITHUB_ROW = "https://raw.githubusercontent.com/[REPO]/master/[FILE_PATH]";
	var CLIENT_ID = "2b50552c9de85d95b3a3";
	var CLIENT_SECRET = "15e52b63208e06d4e1ccd12098d72f81bccd12c6";

	var FS = require("fs");
	var PATH = require("path");
	var HTTPS = require('https');

	var AppGitSrv = function() {};

	AppGitSrv.downloadGitFolder = function(gitRepo, exportPath, folderPath) {
		var _url = URL_GITHUB_TREE.replace("[REPO]", gitRepo);
		var _rowUrl = URL_GITHUB_ROW.replace("[REPO]", gitRepo);
		var _deferred = $q.defer();

		exportPath = AppVersionSrv.resPath + exportPath;

		$.get(_url, {client_id: CLIENT_ID, client_secret: CLIENT_SECRET, recursive: 1}).then(function (data) {
			_deferred.notify({msg: "Loaded list, parsing..."});
			var list = $.map(data.tree, function(item) {
				if(item.path.indexOf(folderPath) !== 0 || item.type !== "blob") return;

				var _path = item.path.replace(folderPath + "/", "");
				var _targetPath = PATH.normalize(exportPath + "/" + _path);
				if(FS.existsSync(_targetPath)) return;

				return {
					path: _path,
					targetPath: _targetPath,
					url: _rowUrl.replace("[FILE_PATH]", item.path)
				};
			});

			AppGitSrv.DownloadPool(list).then(null, null, function(notify) {
				_deferred.notify(notify);
			}).finally(function() {
				_deferred.notify({msg: "Download finished!"});
				_deferred.resolve(list);
			});
		});

		return _deferred.promise;
	};

	// ===========================================================
	// =                      Download Pool                      =
	// ===========================================================
	AppGitSrv.DownloadPool = function(list, thread) {
		thread = thread || 10;
		var i;
		var remain = thread, prepare = 0, done = 0;
		var dList = list.slice();
		var _deferred = $q.defer();

		function startThread() {
			if(dList.length && remain > 0) {
				remain -= 1;
				prepare += 1;
				AppGitSrv.DownloadPool.download(dList.shift()).finally(function() {
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

	AppGitSrv.DownloadPool.download = function(unit) {
		console.log("[START]", unit.path);
		var _deferred = $q.defer();

		var _folderPath = unit.targetPath.match(/^(.*)[\\\/]([^\\\/]*)$/)[1];
		AppFileSrv.assumeFolder(_folderPath);
		var file = FS.createWriteStream(unit.targetPath);

		try {
			var request = HTTPS.get(unit.url + "?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET, function (response) {
				response.pipe(file);
				file.on('finish', function () {
					file.close(function () {
						console.log("[DONE]", unit.path);
						_deferred.resolve();
					});
				});
			});
			request.on('error', function(err) {
				_deferred.reject(err);
			});
		} catch (err) {
			console.log("[FAIL]", unit.path, err);
			_deferred.reject(err);
		}

		return _deferred.promise;
	};

	return AppGitSrv;
});