'use strict';

components.directive('treeView', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			treeView: "=",
			parentNode: "=",
			click: "=?click"
		},
		controller: function($scope, $element, UI, Locale) {
			$scope.sortableOptions = {
				connectWith: ".tree-list"
			};

			// ==================================================================
			// =                            Function                            =
			// ==================================================================
			$scope.getIconClass = function() {
				if(!$scope.treeView || !$scope.treeView.list) {
					return "fa-file-o";
				} else {
					if($scope.treeView.lock) {
						return $scope.treeView.open ? "fa-folder-open-o" : "fa-folder-o";
					} else {
						return $scope.treeView.open ? "fa-folder-open" : "fa-folder";
					}
				}
			};

			$scope.folderTrigger = function() {
				if(!$scope.treeView.list) return;
				$scope.treeView.open = !$scope.treeView.open;
			};

			// ==================================================================
			// =                              Click                             =
			// ==================================================================
			var _mouseDownTime = 0;
			$element.on("mousedown.treeView", "> .tree-head", function(e) {
				if(e.button === 0) {
					_mouseDownTime = +new Date();
				}
			});
			$element.on("mouseup.treeView", "> .tree-head", function(e) {
				if(+new Date() - _mouseDownTime <= 500) {
					var _ret;
					if($scope.click) _ret = $scope.click(e, $scope.treeView, $scope.parentNode);
					if(_ret !== false) $scope.folderTrigger();
					$scope.$apply();
				}
				_mouseDownTime = 0;
			});

			// ==================================================================
			// =                              Menu                              =
			// ==================================================================
			var _menu = [];
			var _menu_newFolder = {label: "New Folder", click: function() {
				UI.modal.input(Locale('New'), Locale('FolderName'), "New Folder", function(name) {
					$scope.treeView.list.unshift({
						_id : +new Date(),
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
				if($scope.treeView.list.length !== 0) {
					$.dialog({
						title: Locale('Error'),
						content: Locale('folderNotEmpty')
					});
				} else {
					common.array.remove($scope.treeView, $scope.parentNode.list);
					$scope.$apply();
				}
			}};
			var _menu_markAsFolder = {label: "Convert to Folder", click: function() {
				$scope.treeView.list = $scope.treeView.list || [];
				$scope.treeView.lock = true;
				$scope.$apply();
			}};
			var _menu_markAsItem = {label: "Convert to Item", click: function() {
				delete $scope.treeView.list;
				delete $scope.treeView.lock;
				$scope.$apply();
			}};
			$scope.menu = function() {
				_menu.splice(0);
				if($scope.treeView && $scope.treeView.list) {
					if(!$scope.treeView.lock) {
						_menu.push(_menu_newFolder);
						_menu.push(_menu_renameFolder);
						_menu.push({type: 'separator'});
						_menu.push(_menu_delFolder);
					} else if($scope.treeView.list.length === 0) {
						_menu.push(_menu_markAsItem);
					}
				} else if($scope.treeView && !$scope.treeView.list) {
					_menu.push(_menu_markAsFolder);
				}
				return _menu;
			};

			// ==================================================================
			// =                            Clean Up                            =
			// ==================================================================
			$scope.$on("$destroy",function() {
				$element.off("mousedown.treeView");
				$element.off("mouseup.treeView");
			});
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
				}
			};
		},
		template:
		'<div class="tree-view">'+
			'<a menu="menu()" class="tree-head noSelect" ng-class="{\'tree-folder\': treeView.list}">'+
				'<span class="fa" ng-class="getIconClass()"></span> '+
				'<span ng-if="treeView.list">({{treeView.list.length}})</span> '+
				'<span>{{treeView.name}}</span>'+
			'</a>'+
			'<div ui-sortable="sortableOptions" class="tree-list" ng-class="{open: treeView.open}" ng-model="treeView.list" ng-if="treeView.list">'+
				'<div ng-repeat="item in treeView.list track by item._id">' +
					'<div tree-view="item" ng-if="treeView.open" data-parent-node="treeView" data-click="click"></div>'+
				'</div>'+
			'</div>'+
		'</div>',
		replace : true
	};
});