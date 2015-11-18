'use strict';

hammerControllers.controller('configCtrl', function ($scope, globalContent) {
	$scope.config = {
		saveKeepKV: localStorage.getItem("saveKeepKV") === "true",
		streamAPIKey: localStorage.getItem("streamAPIKey") || "",
	};

	$scope.saveConfig = function() {
		localStorage.setItem("saveKeepKV", $scope.config.saveKeepKV);
		localStorage.setItem("streamAPIKey", $scope.config.streamAPIKey);
		$.dialog({
			title: "OK",
			content: "Save Successfully!",
		});
	};
});