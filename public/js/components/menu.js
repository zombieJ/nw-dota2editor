'use strict';

components.directive('menu', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			menu: "=",		// Menu Object
		},
		controller: function ($scope, $element) {
			$element.on("contextmenu.menuDirective", function (e) {
				var gui = require('nw.gui');
				var menu = new gui.Menu();

				$.each($scope.menu, function(i, entity) {
					menu.append(new gui.MenuItem(entity));
				});

				menu.popup(e.originalEvent.x, e.originalEvent.y);
			});

			$scope.$on("$destroy",function() {
				$element.off("contextmenu.menuDirective");
			});
		},
		replace: false
	};
});