/*process.mainModule.exports.init()
/*exports.init = function() {
	var rf = require("fs");
	try {
		console.log("Read");
		var data = rf.readFileSync("C:/softwares/Steam/steamapps/common/dota 2 beta/game/dota_addons/gameofsurvivor/resource/addon_schinese.txt", "ucs2");
		console.log(data);
	} catch (e) {
		console.log("Err");
		console.log(e);
	}
	console.log("End");
}*/

var $q, content;
var FS = require("fs");
var PATH = require('path');

exports.init = function(globalContent, _q) {
	content = globalContent;
	$q = _q;
};


exports.loadProject = function(projectPath) {
	var _deferred = $q.defer();

	projectPath = (projectPath || "").replace(/[\\\/]$/, "") + "/";
	if(projectPath.length <= 1) {
		_deferred.reject();
	} else {
		FS.exists(projectPath, function (exist) {
			if (exist) {
				_deferred.resolve();
			} else {
				_deferred.reject();
			}
		});
	}

	return _deferred.promise;
};

exports.loadFile = function(path, encoding) {
	var _deferred = $q.defer();

	path = PATH.normalize(content.project + "/" + path);
	FS.readFile(path, encoding || "ucs2", function (err, data) {
		if(err) {
			_deferred.reject(err);
		} else {
			_deferred.resolve(data);
		}
	});

	return _deferred.promise;
};

exports.saveFile = function(path, encoding, data) {
	var _deferred = $q.defer();

	path = PATH.normalize(content.project + "/" + path);
	encoding = encoding || "ucs2";
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

exports.listFiles = function(path, regex) {
	regex = regex || /.*/;

	var _deferred = $q.defer();
	path = PATH.normalize(content.project + "/" + path);
	FS.readdir(path, function (err, data) {
		if(err) {
			_deferred.reject(err);
		} else {
			_deferred.resolve(data.filter(function(fileName) {
				return regex.test(fileName);
			}));
		}
	});
	return _deferred.promise;
}
