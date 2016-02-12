app.factory("AppImageSrv", function ($q, AppGitSrv, AppVersionSrv, Sequence) {
	var REPO = "dotabuff/d2vpkr";
	var PATH_SPELLICONS = AppVersionSrv.resPath + "dota/resource/flash3/images/spellicons";
	var PATH_ITEMS = AppVersionSrv.resPath + "dota/resource/flash3/images/items";

	var AppImageSrv = function() {};

	AppImageSrv.load = function() {
		var _deferred = $q.defer();

		function _reg(promise, defer) {
			promise.then(function() {
				defer.resolve();
			}, function() {
				_deferred.reject();
			}, function(notify) {
				_deferred.notify(notify);
			});
		}

		new Sequence(function (defer) {
			_reg(AppGitSrv.downloadGitFolder({repo: REPO}, "res/spellicons", PATH_SPELLICONS, "Ability"), defer);
		}).next(function(defer) {
			_reg(AppGitSrv.downloadGitFolder({repo: REPO}, "res/items", PATH_ITEMS, "Item"), defer);
		}).start().then(function() {
			_deferred.resolve();
		});
		return _deferred.promise;
	};

	return AppImageSrv;
});