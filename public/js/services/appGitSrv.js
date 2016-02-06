app.factory("AppGitSrv", function ($http, $q, AppVersionSrv, AppFileSrv) {
	var URL_GITHUB_BASE = "https://api.github.com/repos/[REPO]/git/trees/master";
	var CLIENT_ID = "2b50552c9de85d95b3a3";
	var CLIENT_SECRET = "15e52b63208e06d4e1ccd12098d72f81bccd12c6";

	var FS = require("fs");
	var PATH = require("path");
	var AppGitSrv = function() {};

	AppGitSrv.loadListByPath = function(path, url, _deferred) {
		if(typeof path === "string") path = path.replace(/^[\\\/]]/, "").replace(/[\\\/]]$/, "").split("/");
		if(!_deferred) {
			_deferred = $q.defer();
			setTimeout(function() {
				_deferred.notify({
					msg: "Start path tracking..."
				});
			}, 1);
		}

		var _current = path.shift();
		$http.get(url, {params: {client_id: CLIENT_ID, client_secret: CLIENT_SECRET}}).then(function (data) {
			var _list = data.data.tree || [];

			if(_current) {
				var _obj = common.array.find(_current, _list, "path");
				if (_obj) AppGitSrv.loadListByPath(path, _obj.url, _deferred);
			} else {
				_deferred.notify({
					msg: "Tracking finished!"
				});
				_deferred.resolve(_list);
			}
		}, function(err) {
			_deferred.reject(err);
		});

		return _deferred.promise;
	};

	AppGitSrv.downloadGitList = function(folder, list, _deferred) {
		var isRoot = !_deferred;
		AppFileSrv.assumeFolder(folder);
		if(!_deferred) {
			_deferred = $q.defer();
			_deferred._BINDER = {
				deferred: $q.defer(),

				count: 0,
				success: 0,
				failed: 0,
				list: [],
				listen: function() {_deferred._BINDER.count += 1;},
				done: function() {_deferred._BINDER.count -= 1; _deferred._BINDER.check();},

				success: function() {_deferred._BINDER.done();_deferred._BINDER.success += 1;},
				fail: function() {_deferred._BINDER.done();_deferred._BINDER.fail += 1;},

				checkID: null,
				check: function() {
					clearTimeout(_deferred._BINDER.checkID);
					if(_deferred._BINDER.count !== 0) return;

					_deferred._BINDER.checkID = setTimeout(function() {
						if(_deferred._BINDER.count !== 0) return;
						_deferred._BINDER.deferred.resolve(_deferred._BINDER.list);
					}, 100);
				}
			};
		}
		var _binder = _deferred._BINDER;

		// Loop list
		$.each(list, function(i, obj) {
			_binder.listen();

			var _path = PATH.normalize(folder + "/" + obj.path);
			switch (obj.type) {
				case "blob":
					FS.exists(_path, function (exists) {
						_binder.done();

						if (exists) return;
						_binder.list.push({
							path: _path,
							url: obj.url
						});
					});
					break;
				case "tree":
					$http.get(obj.url, {params: {client_id: CLIENT_ID, client_secret: CLIENT_SECRET}}).then(function(data) {
						AppGitSrv.downloadGitList(_path, data.data.tree, _deferred);
					}).finally(function() {
						_binder.done();
					});
					break;
			}
		});

		// Start download
		if(isRoot) {
			setTimeout(function() {
				_deferred.notify({
					msg: "Start loop files..."
				});
			}, 1);

			_binder.deferred.promise.then(function(list) {
				_deferred.notify({
					msg: "Start download. File count: " + list.length
				});
				AppGitSrv.DownloadPool(list).then(function() {
					_deferred.notify({
						msg: "Load file finished!"
					});
					_deferred.resolve(_deferred);
				}, null, function(notify) {
					_deferred.notify(notify);
				});
			});
		}
		return _deferred.promise;
	};

	AppGitSrv.downloadGitFolder = function(gitRepo, exportPath, folderPath) {
		var _url = URL_GITHUB_BASE.replace("[REPO]", gitRepo);
		var _deferred = $q.defer();
		var _promise = AppGitSrv.loadListByPath(folderPath, _url);
		_promise.then(function(list) {
			exportPath = AppVersionSrv.resPath + exportPath;
			AppGitSrv.downloadGitList(exportPath, list).then(function(data) {
				_deferred.resolve(data);
			}, function(err) {
				_deferred.reject("Download failed!" + err);
			}, function(notify) {
				_deferred.notify(notify);
			});
		}, function(err) {
			console.warn("[Git] Load failed:", err);
			_deferred.reject("Load failed!" + err);
		}, function(notify) {
			_deferred.notify(notify);
		});
		return _deferred.promise;
	};

	// ===========================================================
	// =                      Download Pool                      =
	// ===========================================================
	AppGitSrv.DownloadPool = function(list, thread) {
		thread = thread || 5;
		var remain = thread, done = 0;
		var id;
		var dList = list.slice();
		var _deferred = $q.defer();

		id = setInterval(function() {
			if(remain === 0) return;

			if(dList.length) {
				var _obj = dList.shift();
				remain -= 1;
				AppGitSrv.DownloadPool.download(_obj).always(function() {
					remain += 1;
					done += 1;
					_deferred.notify({
						msg: "Pool download..." + done + "/" + list.length
					});
				});
			} else if(list.length === done) {
				_deferred.resolve();
				clearInterval(id);
			}
		}, 100);
		return _deferred.promise;
	};

	AppGitSrv.DownloadPool.download = function(unit) {
		var _dfd = $.Deferred();
		$.get(unit.url, {client_id: CLIENT_ID, client_secret: CLIENT_SECRET}).then(function(data) {
			var _content = data.content;
			var _buff = new Buffer(_content, "base64");
			FS.writeFile(unit.path, _buff, function (err) {
				if (err) {
					_dfd.reject();
				} else {
					_dfd.resolve();
				}
			});
		}, function() {
			_dfd.reject();
		});
		return _dfd;
	};

	return AppGitSrv;
});