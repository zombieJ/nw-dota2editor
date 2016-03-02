'use strict';

components.directive('abilityTreeView', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			treeView: "=abilityTreeView",
			parentNode: "=",
			click: "=?click",
			imageFunc: "=?imageFunc",
			activeFunc: "=?activeFunc",
			fileMenu: "=?fileMenu"
		},
		controller: function($scope, $element, UI, Locale) {
			$scope.sortableOptions = {
				connectWith: ".tree-list"
			};

			// ==================================================================
			// =                            Function                            =
			// ==================================================================
			$scope.getIconList = function() {
				if(!$scope.imageFunc || !$scope.treeView || !$scope.treeView.ability) return null;

				return $scope.imageFunc($scope.treeView.ability);
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
				_menu.get = function() {
					return $scope.treeView;
				};
				_menu.splice(0);
				if($scope.treeView && $scope.treeView.list) {
					if(!$scope.treeView.lock) {
						_menu.push(_menu_newFolder);
						_menu.push(_menu_renameFolder);
						_menu.push({type: 'separator'});
						_menu.push(_menu_delFolder);
					} else if($scope.treeView.list.length === 0) {
						_menu.push(_menu_newFolder);
						_menu.push(_menu_markAsItem);
					}
				} else if($scope.treeView && !$scope.treeView.list) {
					if($scope.fileMenu) {
						_menu.push.apply(_menu, $scope.fileMenu);
						_menu.push({type: 'separator'});
					}
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
		'<div class="image-tree-view">'+
			'<a menu="menu()" class="tree-head noSelect" ng-class="{active: activeFunc(treeView.ability)}" ng-hide="treeView.noHead">'+
				'<div class="img-cntr" ng-style="{\'border-color\': treeView.color}">'+
					'<img image data-src-list="getIconList()" ng-if="getIconList().length" />'+
					'<span class="fa fa-folder" ng-if="!getIconList().length"></span>'+
					'<span class="quality" ng-style="{background: treeView.qualityColor}"></span>'+
					'<span class="number" ng-if="treeView.list">{{treeView.list.length}}</span>'+
				'</div>' +
				'<span class="fa fa-{{treeView.icon}} icon-mark" ng-show="treeView.icon"></span>'+
				'<span class="title">{{treeView.name}}</span>'+
				'<span class="folder-mark fa fa-{{treeView.open ? \'caret-down\' : \'caret-left\'}}" ng-if="treeView.list"></span>'+
			'</a>'+
			'<div ui-sortable="sortableOptions" class="tree-list" ng-class="{open: treeView.open}" ng-model="treeView.list" ng-if="treeView.list">'+
				'<div ng-repeat="item in treeView.list track by item._id">' +
					'<div ability-tree-view="item" ng-if="treeView.open" data-parent-node="treeView" ' +
					'data-file-menu="fileMenu" ' +
					'data-click="click" data-image-func="imageFunc" data-active-func="activeFunc"></div>'+
				'</div>'+
			'</div>'+
		'</div>',
		replace : true
	};
});