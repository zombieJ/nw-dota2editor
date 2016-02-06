app.factory("AppImageSrv", function (AppGitSrv) {
	var REPO = "dotabuff/d2vpkr";
	var PATH_SPELLICONS = "dota/resource/flash3/images/spellicons";

	var AppImageSrv = function() {};

	AppImageSrv.load = function() {
		return AppGitSrv.downloadGitFolder(REPO, "res/spellicons", PATH_SPELLICONS);
	};

	return AppImageSrv;
});