'use strict';

components.directive('menu', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			menu: "="		// Menu Object
		},
		controller: function ($scope, $element) {
			$element.on("contextmenu.menuDirective", function (e) {
				var gui = require('nw.gui');
				var menu = new gui.Menu();

				$.each($scope.menu, function(i, entity) {
					var _menuItem = new gui.MenuItem(entity);
					if($scope.menu.get) _menuItem._item = $scope.menu.get();
					menu.append(_menuItem);
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