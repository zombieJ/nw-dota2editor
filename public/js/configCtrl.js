'use strict';

hammerControllers.controller('configCtrl', function ($scope, Config) {
	$scope.saveConfig = function() {
		Config.save();

		$.dialog({
			title: "OK",
			content: "Save Successfully!",
		});
	};
});