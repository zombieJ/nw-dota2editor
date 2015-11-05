'use strict';

components.directive('typeahead', function($compile, Operation) {
	var $alternativeCntr = $(
		'<ul class="app-menu" ng-show="currentList.length">'+
			'<li ng-repeat="item in currentList track by $index" ng-click="selectItem(item)" ng-class="{selected: $index === selected}"><a>{{item[0]}}</a></li>'+
		'</ul>'
	);
	$alternativeCntr.css({
		position: "absolute",
	});

	return {
		restrict: 'AE',
		scope: {
			alternative: "=",
		},
		controller: function($scope, $element, $attrs) {
			$scope.currentList = [];
			$scope.selected = -1;

			$scope.selectItem = function(item) {
				$element.val(item[0]);
				$scope.currentList = [];
			};

			// Input update
			var _timerID = null;
			function _updateList() {
				if(_timerID !== null) return;

				_timerID = setTimeout(function() {
					$scope.selected = -1;
					var _val = ($element.val() || "").toUpperCase();
					console.log("do!", _val);
					if(!_val) {
						$scope.currentList = [];
					} else {
						$scope.currentList = $.map($scope.alternative, function (item) {
							if (item[0].toUpperCase().indexOf(_val) !== -1) {
								return [item];
							}
						});
					}

					$scope.$apply();
					_timerID = null;
				}, 100);
			}
			$element.on("keyup", function(e) {
				if((65 <= e.which && e.which <= 90) || e.which === 8 || e.which === 46) {
					_updateList();
				} else if(e.which === 38) {
					$scope.selected -= 1;
					if($scope.selected < 0) $scope.selected = $scope.currentList.length - 1;
					$scope.$apply();
				} else if(e.which === 40) {
					$scope.selected += 1;
					if($scope.selected >= $scope.currentList.length) $scope.selected =  0;
					$scope.$apply();
				} else if(e.which === 13) {
					$scope.selectItem($scope.currentList[$scope.selected]);
					$scope.$apply();
				}
				//console.log(e.which);
			});

			$scope.$on("$destroy",function() {
				$alternativeCntr.remove();
			});
		},
		compile: function ($element, $attrs) {
			return {
				pre: function ($scope, $element, $attrs) {
					// Add list
					$element.after($alternativeCntr);
					$compile($alternativeCntr)($scope);
				}
			};
		},
		replace: false
	};
});