'use strict';

components.directive('image', function() {
	return {
		restrict: 'AE',
		scope: {
			src: "=?src",
			srcList: "=?srcList"
		},
		controller: function($scope, $element) {
			$scope.currentIndex = 0;

			$scope.getList = function() {
				return ($scope.src && [$scope.src]) || $scope.srcList || [];
			};

			$scope.doLoad = function() {
				var src = $scope.getList()[$scope.currentIndex];
				if(!src) return;

				$element.attr("src", src);
			};

			$element.on("error", function() {
				$scope.currentIndex += 1;
				$scope.doLoad();
			});

			$scope.$watch("getList()", function(newValue, oldValue) {
				if(!$scope.getList().length) return;

				$scope.currentIndex = 0;
				$scope.doLoad();
			}, true);
		},
		template:
		'<img />',
		replace: true
	};
});