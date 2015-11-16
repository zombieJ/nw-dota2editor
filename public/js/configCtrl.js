'use strict';

hammerControllers.controller('configCtrl', function ($scope, globalContent) {
	$scope.config = {
		streamAPIKey: localStorage.getItem("streamAPIKey") || "",
	};

	$scope.saveConfig = function() {
		localStorage.setItem("streamAPIKey", $scope.config.streamAPIKey);
		$.dialog({
			title: "OK",
			content: "Save Successfully!",
		});
	};
});