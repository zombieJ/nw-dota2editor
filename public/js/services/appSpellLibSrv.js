app.factory("AppSpellLibSrv", function ($q, AppGitSrv, AppVersionSrv, AppFileSrv, Sequence) {
	var REPO = "Pizzalol/SpellLibrary";
	var PATH_ABILITY = "game/scripts/npc/abilities";
	var PATH_HEROES = "game/scripts/vscripts/heroes";

	var AppSpellLibSrv = function() {};

	AppSpellLibSrv.load = function() {
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
			_reg(AppGitSrv.downloadGitFolder({repo: REPO}, AppVersionSrv.resPath + "res/spellLib/kv/abilities", PATH_ABILITY, "Ability"), defer);
		}).next(function(defer) {
			_reg(AppGitSrv.downloadGitFolder({repo: REPO}, AppVersionSrv.resPath + "res/spellLib/lua/heroes", PATH_HEROES, "Hero"), defer);
		}).start().then(function() {
			_deferred.resolve();
		});
		return _deferred.promise;
	};

	AppSpellLibSrv.getAbilityList = function () {
		return AppFileSrv.listFiles(AppVersionSrv.resPath + "res/spellLib/kv/abilities", "file", true).list;
	};

	return AppSpellLibSrv;
});