app.factory("AppGitSrv", function ($http, $q, AppVersionSrv, AppFileSrv) {
	var URL_GITHUB_BASE = "https://api.github.com/repos/[REPO]/git/trees/master";
	var CLIENT_ID = "2b50552c9de85d95b3a3";
	var CLIENT_SECRET = "15e52b63208e06d4e1ccd12098d72f81bccd12c6";
	//client_id=2b50552c9de85d95b3a3&client_secret=15e52b63208e06d4e1ccd12098d72f81bccd12c6

	var FS = require("fs");
	var PATH = require("path");
	var AppGitSrv = function() {};

	AppGitSrv.loadListByPath = function(path, url, _deferred) {
		if(typeof path === "string") path = path.replace(/^[\\\/]]/, "").replace(/[\\\/]]$/, "").split("/");
		if(!_deferred) _deferred = $q.defer();

		var _current = path.shift();
		$http.get(url, {params: {client_id: CLIENT_ID, client_secret: CLIENT_SECRET}}).then(function (data) {
			var _list = data.data.tree || [];

			if(_current) {
				var _obj = common.array.find(_current, _list, "path");
				if (_obj) AppGitSrv.loadListByPath(path, _obj.url, _deferred);
			} else {
				_deferred.resolve(_list);
			}
		}, function(err) {
			_deferred.reject(err);
		});

		return _deferred.promise;
	};

	AppGitSrv.downloadGitList = function(folder, list, _deferred) {
		AppFileSrv.assumeFolder(folder);
		if(!_deferred) {
			_deferred = $q.defer();
			_deferred._COUNT = 0;
			_deferred._SUCCESS = 0;
			_deferred._FAILED = 0;

			var _id = setInterval(function() {
				console.log(">>>", _deferred._COUNT);
				if(_deferred._COUNT === 0) {
					_deferred.resolve({
						total: _deferred._COUNT,
						success: _deferred._SUCCESS,
						failed: _deferred._FAILED
					});
					clearInterval(_id);
				}
			}, 1000);
		}

		$.each(list, function(i, obj) {
			var _path = PATH.normalize(folder + "/" + obj.path);
			_deferred._COUNT += 1;
			switch (obj.type) {
				case "blob":
					FS.exists(_path, function (exists) {
						_deferred._COUNT -= 1;
						if (exists) return;

						_deferred._COUNT += 1;
						$http.get(obj.url, {params: {client_id: CLIENT_ID, client_secret: CLIENT_SECRET}}).then(function (data) {
							var _content = data.data.content;
							var _buff = new Buffer(_content, "base64");
							FS.writeFile(_path, _buff, function (err) {
								if (err) {
									_deferred._FAILED += 1;
								} else {
									_deferred._SUCCESS += 1;
								}
							});
						}, function() {
							_deferred._FAILED += 1;
						}).finally(function() {
							_deferred._COUNT -= 1;
						});
					});
					break;
				case "tree":
					$http.get(obj.url, {params: {client_id: CLIENT_ID, client_secret: CLIENT_SECRET}}).then(function(data) {
						AppGitSrv.downloadGitList(_path, data.data.tree, _deferred);
					}).finally(function() {
						_deferred._COUNT -= 1;
					});
					break;
			}
		});

		return _deferred.promise;
	};

	AppGitSrv.downloadGitFolder = function(gitRepo, exportPath, folderPath) {
		var _url = URL_GITHUB_BASE.replace("[REPO]", gitRepo);
		var _promise = AppGitSrv.loadListByPath(folderPath, _url);
		_promise.then(function(list) {
			exportPath = AppVersionSrv.resPath + exportPath;
			AppGitSrv.downloadGitList(exportPath, list).then(function(data) {
				console.log("Finished!", data);
			});
		}, function(err) {
			console.warn("[Git] Load failed:", err);
		});
	};

	return AppGitSrv;
});