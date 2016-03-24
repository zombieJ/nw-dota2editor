'use strict';

hammerControllers.controller('configCtrl', function ($scope, Config, Locale, AppImageSrv, AppSpellLibSrv) {
	$scope.syncLock = false;
	$scope.syncAllMSG = Locale('repeatSync');

	$scope.syncInfo = [];

	$scope.saveConfig = function() {
		Config.save();

		$.dialog({
			title: "OK",
			content: "Save Successfully!",
		});
	};

	$scope.syncIcon = function() {
		$scope.syncInfo = [];
		$scope.syncLock = true;
		AppImageSrv.load().then(function() {
			$scope.syncAllMSG = "Finished!";
		}, function() {
			$scope.syncAllMSG = "Load failed. Please check your network!";
		}, function(notify) {
			$scope.syncAllMSG = notify.msg;
			$scope.syncInfo.push(notify.msg);
		}).finally(function() {
			$scope.syncLock = false;
		});
	};

	$scope.syncSpellLibrary = function() {
		$scope.syncInfo = [];
		$scope.syncLock = true;
		AppSpellLibSrv.load().then(function() {
			$scope.syncAllMSG = "Finished!";
		}, function() {
			$scope.syncAllMSG = "Load failed. Please check your network!";
		}, function(notify) {
			$scope.syncAllMSG = notify.msg;
			$scope.syncInfo.push(notify.msg);
		}).finally(function() {
			$scope.syncLock = false;
		});
	};
});