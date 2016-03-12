app.factory("AppVersionSrv", function ($q, $http, $timeout, $compile, $rootScope, FS, PATH, Sequence, Sound, KV, Locale, AppGitSrv, AppFileSrv) {
	var REPO = "zombieJ/nw-dota2editor-dist";
	var BRANCH = "master";

	var AppVersionSrv = function () {
	};

	AppVersionSrv.UPDATE_STATUS_NONE = 0;
	AppVersionSrv.UPDATE_STATUS_UPDATING = 1;
	AppVersionSrv.UPDATE_STATUS_FINISHED = 2;
	AppVersionSrv.UPDATE_STATUS_FAILED = 3;

	// ====================================================
	// =              Init Environment Check              =
	// ====================================================
	// Get current path
	AppVersionSrv.resPath = "";
	var FS = require("fs");
	if(!FS.existsSync("res")) {
		AppVersionSrv.resPath = process.execPath.replace(/bin[\\\/]\w+\.exe$/, '');
	}

	// Check for latest version
	(function() {
		AppVersionSrv.version = "DEV";
		FS.readFile(AppVersionSrv.resPath + "_VERSION", "utf8", function (err, data) {
			AppVersionSrv.version = data || "";

			$http.get("https://raw.githubusercontent.com/zombieJ/nw-dota2editor-dist/master/dist/_VERSION").then(function (data) {
				if(AppVersionSrv.version.trim() < data.data.trim()) {
					// Require update
					var $updateNotify = $.notify({
						title: "<b>New Version Detected</b>",
						content: "Detected new version of KV Editor." +
								 " Click <a ng-click='update()'>HERE</a> for update.",
						type: "warning",
						timeout: 10000,
						overtimeout: 5000,
						region: "system"
					});

					// Update Logic
					var $scope = $rootScope.$new();
					$compile($updateNotify)($scope);
					$scope.update = function() {
						$updateNotify.remove();
						AppVersionSrv.updateState = AppVersionSrv.UPDATE_STATUS_UPDATING;

						// Download latest version
						AppVersionSrv.updatePromise = AppGitSrv.downloadGitFolder({repo: REPO, branch: BRANCH}, AppVersionSrv.resPath + "tmp", [
							"dist/_VERSION",
							"dist/dota2editor.nw"
						], {name: "Update"});
						AppVersionSrv.updatePromise.then(function() {
							AppVersionSrv.updateState = AppVersionSrv.UPDATE_STATUS_FINISHED;

							AppFileSrv.writeFile(AppVersionSrv.resPath + "tmp/_DONE", "done");
						}, function() {
							AppVersionSrv.updateState = AppVersionSrv.UPDATE_STATUS_FAILED;
						}, function(notify) {
							AppVersionSrv.undateMSG = notify.msg;
						});
					};
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