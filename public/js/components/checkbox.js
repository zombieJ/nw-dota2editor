'use strict';

components.directive('checkbox', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			target: "=",
			targetPath: "@",
		},
		controller: function($scope) {
			$scope.getVal = function() {
				return $scope.target ? $scope.target.getValueByPath($scope.targetPath) : "";
			};

			$scope.getBoolVal = function() {
				switch ($scope.getVal()) {
					case "1":
					case "true":
					case "MODIFIER_STATE_VALUE_ENABLED":
						return true;
					case "0":
					case "false":
					case "MODIFIER_STATE_VALUE_DISABLED":
						return false;
					default :
						return undefined;
				}
			};

			$scope.getClass = function() {
				switch ($scope.getBoolVal()) {
					case true:
						return "fa-check";
					case false:
						return "";
					default :
						return "fa-square";
				}
			};

			$scope.check = function() {
				if($scope.target) {
					$scope.target.assumeKey($scope.targetPath, false).value = $scope.getBoolVal() ? "0" : "1";
				}
			};
		},
		template:
		'<div class="d-checkbox" ng-click="check()">' +
			'<div>' +
				'<span class="fa {{getClass()}}"></span>'+
			'</div>' +
		'</div>',
		replace: true,
	};
});