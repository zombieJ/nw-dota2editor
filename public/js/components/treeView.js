'use strict';

components.directive('treeView', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			treeView: "=",
		},
		controller: function($scope, $element, UI, Locale) {
			$scope.getIconClass = function() {
				if(!$scope.treeView || !$scope.treeView.list) {
					return "fa-file-o";
				} else {
					return $scope.treeView.open ? "fa-folder-open" : "fa-folder";
				}
			};

			// Menu
			var _menu = [];
			var _menu_newFolder = {label: "New Folder", click: function() {
				UI.modal.input(Locale('New'), Locale('FolderName'), "New Folder", function(name) {
					$scope.treeView.list.push({
						name: name,
						list: []
					});
				});
			}};
			var _menu_renameFolder = {label: "Rename Folder", click: function() {
				UI.modal.input(Locale('Rename'), Locale('NewName'), $scope.treeView.name, function(newName) {
					$scope.treeView.name = newName;
				});
			}};
			var _menu_delFolder = {label: "Delete Folder", click: function() {
			}};
			$scope.menu = function() {
				_menu.splice(0);
				if($scope.treeView && $scope.treeView.list) {
					_menu.push(_menu_newFolder);
					_menu.push(_menu_renameFolder);
					_menu.push({type: 'separator'});
					_menu.push(_menu_delFolder);
				}
				return _menu;
			};
		},
		compile: function (element, attrs) {
			var contents = element.contents().remove();
			var compiledContents;

			return {
				post: function(scope, element){
					// Compile the contents
					if(!compiledContents){
						compiledContents = $compile(contents);
					}
					// Re-add the compiled contents to the element
					compiledContents(scope, function(clone){
						element.append(clone);
					});
				},
			};
		},
		template:
		'<div class="tree-view">'+
			'<a menu="menu()" class="tree-head noSelect" ng-class="{\'tree-folder\': treeView.list}" ng-click="treeView.open = !treeView.open">'+
				'<span class="fa" ng-class="getIconClass()"></span> '+
				'<span>{{treeView.name}}</span>'+
			'</a>'+
			'<div class="tree-list" ng-if="treeView.list && treeView.open">'+
				'<div ng-repeat="item in treeView.list track by $index" tree-view="item"></div>'+
			'</div>'+
		'</div>',
		replace : true
	};
});