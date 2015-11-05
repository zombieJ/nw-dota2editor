'use strict';

components.directive('typeahead', function($compile, Operation) {
	var $alternativeCntr = $("<div>");
	$alternativeCntr.css({
		position: "absolute",
	});

	return {
		restrict: 'AE',
		scope: {
			alternative: "=",
		},
		controller: function($scope, $element, $attrs) {
			console.log($scope.alternative);

			$scope.$on("$destroy",function() {
				$alternativeCntr.remove();
			});
		},
		compile: function ($element, $attrs) {
			return {
				pre: function ($scope, $element, $attrs) {
					// Input update
					$element.attr("ng-change", "updateText()");
					$compile($element)($scope);

					// Add list
					$element.after($alternativeCntr);
					$compile($alternativeCntr)($scope);
				}
			};
		},
		replace: false
	};
});