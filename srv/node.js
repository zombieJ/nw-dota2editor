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

var fileSystem = require("fs");

exports.loadProject = function($q, projectPath) {
	//C:\softwares\Steam\steamapps\common\dota 2 beta\game\dota_addons\gameofsurvivor
	var _deferred = $q.defer();

	projectPath = (projectPath || "").replace(/[\\\/]$/, "") + "/";
	if(projectPath.length <= 1) {
		_deferred.reject();
	} else {
		fileSystem.exists(projectPath, function (exist) {
			if (exist) {
				_deferred.resolve();
			} else {
				_deferred.reject();
			}
		});
	}

	return _deferred.promise;
};