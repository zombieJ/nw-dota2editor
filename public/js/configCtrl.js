'use strict';

hammerControllers.controller('configCtrl', function ($scope, Config, AppImageSrv) {
	$scope.syncLock = false;
	$scope.syncAllMSG = "";

	$scope.saveConfig = function() {
		Config.save();

		$.dialog({
			title: "OK",
			content: "Save Successfully!",
		});
	};

	$scope.syncAll = function() {
		$scope.syncLock = true;
		AppImageSrv.load().then(null, function() {
			$scope.syncAllMSG = "Load failed. Please check your network!";
		}, function(notify) {
			$scope.syncAllMSG = notify.msg;
		}).finally(function() {
			$scope.syncLock = false;
		});
	};
});