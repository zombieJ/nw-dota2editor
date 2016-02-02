app.factory("AppVersionSrv", function ($q, $http, $timeout, FS, PATH, Sequence, Sound, KV, Locale) {
	var AppVersionSrv = function () {
	};

	// ====================================================
	// =              Init Environment Check              =
	// ====================================================
	// Get current path
	AppVersionSrv.resPath = "";
	var FS = require("fs");
	if(!AppVersionSrv._readyDeferred) {
		AppVersionSrv._readyDeferred = $q.defer();
		FS.exists("res", function(exist) {
			if(!exist) {
				AppVersionSrv.resPath = process.execPath.replace(/\w+\.exe$/, '');
			}
			AppVersionSrv._readyDeferred.resolve(AppVersionSrv.resPath);
		});
	}
	AppVersionSrv.pathPromise = function() {
		return AppVersionSrv._readyDeferred.promise;
	};

	// Check for latest version
	(function() {
		AppVersionSrv.version = "DEV";
		FS.readFile("_VERSION", "utf8", function (err, data) {
			AppVersionSrv.version = data || "";

			$http.get("https://raw.githubusercontent.com/zombieJ/nw-dota2editor/master/_VERSION").then(function (data) {
				console.log(AppVersionSrv.version.trim() , data.data.trim(), AppVersionSrv.version.trim()<data.data.trim());
				if(AppVersionSrv.version.trim() < data.data.trim()) {
					$.notify({
						title: "<b>Update Require</b>",
						content: "KV Editor Version is OUT OF DATE. Please download the latest version.",
						type: "warning",
						timeout: 10000,
						overtimeout: 5000
					});
				}
			});
		});
	})();

	// Application check
	// ====================================================
	// =                 Application Check                =
	// ====================================================
	AppVersionSrv.ready = false;
	AppVersionSrv.stateMSG = "Loading...";

	AppVersionSrv.check = function () {
		console.log("Start Application Version Service.");
		var _sound_src_file_path = PATH.normalize(AppVersionSrv.resPath + Sound.srcFilePath);
		var _sound_tgt_file_path = PATH.normalize(AppVersionSrv.resPath + Sound.filePath);
		try {
			new Sequence(function (defer) {
				// ===========================================================
				// =                          Sound                          =
				// ===========================================================
				// TODO: Auto download latest sound file
				AppVersionSrv.stateMSG = "Checking Sound Mapping...";

				FS.exists(_sound_tgt_file_path, function (exist) {
					if (exist) {
						AppVersionSrv.stateMSG = "Sound Mapping exists. Continue...";
						defer.resolve();
					} else {
						AppVersionSrv.stateMSG = "Sound Mapping not exists. Converting...";
						$timeout(function () {
							FS.readFile(_sound_src_file_path, "utf8", function (err, data) {
								if (err) {
									defer.reject(err);
								} else {
									// Parse
									var _kv = KV.parse(data);
									var _json = Sound.convertKVtoJson(_kv);

									// Save
									FS.writeFile(_sound_tgt_file_path, JSON.stringify(_json), "utf8", function (err) {
										if (err) {
											defer.reject(err);
										} else {
											AppVersionSrv.stateMSG = "Sound Mapping converting finished...";
											defer.resolve();
										}
									});
								}
							});
						}, 10);
					}
				});
			}).next(function (defer) {
					AppVersionSrv.stateMSG = "Loading Sound Mapping file...";
					FS.readFile(_sound_tgt_file_path, "utf8", function (err, data) {
						if (err) {
							defer.reject(err);
						} else {
							Sound.setup(data);
							defer.resolve();
						}
					});
				}).then(function () {
					AppVersionSrv.ready = true;
				}, function (err) {
					$.dialog({
						title: Locale('Error'),
						content: $("<div>")
							.append(Locale('versionCheckError'))
							.append($("<pre>").text(err))
					});
					console.log("Failed!", err);
				}).start();
		} catch (err) {
			console.error(err);
		}
	};

	return AppVersionSrv;
});