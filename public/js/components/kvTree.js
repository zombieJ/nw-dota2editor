'use strict';

components.directive('kvtree', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			kvtree: "=",					// KV Entity
			parentkv: "=?parentkv",			// Parent KV Entity
			open: "=?open",					// Tree opened
			convertable: "=?convertable",	// False if disable convert format
			keyeditable: "=?keyeditable"	// Key editable
		},
		controller: function($scope, $element, KV, UI) {
			$scope.open = $scope.open || false;

			$scope.toggleTree = function() {
				$scope.open = !$scope.open;
			};

			$scope.editKV = function() {
				if($scope.keyeditable === false) return;

				UI.modal.input("EditKV",
					$scope.kvtree.isList() ? "Key" : ["Key", "Value"],
					$scope.kvtree.isList() ? $scope.kvtree.key : [$scope.kvtree.key, $scope.kvtree.value], function(key, value) {
						$scope.kvtree.key = key;
						if(!$scope.kvtree.isList()) {
							$scope.kvtree.value = value;
						}
				});
			};

			// Menu
			var _menu = [];
			var _menu_edit = {label: "Edit Key-Value", click: function() {
				$scope.editKV();
			}};
			var _menu_CTS = {label: "Convert To String Value", click: function () {
				$scope.kvtree._kvPreValArray = $scope.kvtree.value;
				$scope.kvtree.value = $scope.kvtree._kvPreValStr || "";
				$scope.$apply();
			}};
			var _menu_CTA = {label: "Convert To List Value", click: function () {
				$scope.kvtree._kvPreValStr = $scope.kvtree.value;
				$scope.kvtree.value = $scope.kvtree._kvPreValArray || [];
				$scope.$apply();
			}};
			var _menu_new = {label: "New Sub Value", click: function() {
				UI.modal.input("NewKV", ["Key", "Value"], function(key, value) {
					$scope.kvtree.value.push(new KV(key, value));
				});
			}};
			var _menu_up = {label: "Move Up", click: function() {
				var _index = $.inArray($scope.kvtree, $scope.parentkv.value);
				common.array.remove($scope.kvtree, $scope.parentkv.value);
				common.array.insert($scope.kvtree, $scope.parentkv.value, _index - 1);
				$scope.$apply();
			}};
			var _menu_down = {label: "Move Down", click: function() {
				var _index = $.inArray($scope.kvtree, $scope.parentkv.value);
				common.array.remove($scope.kvtree, $scope.parentkv.value);
				common.array.insert($scope.kvtree, $scope.parentkv.value, _index + 1);
				$scope.$apply();
			}};
			var _menu_del = {label: "Delete", click: function() {
				UI.arrayDelete($scope.kvtree, $scope.parentkv.value);
			}};
			$scope.menu = function() {
				_menu.splice(0);

				if($scope.convertable !== false) {
					_menu.push($scope.kvtree.isList() ? _menu_CTS : _menu_CTA);
					_menu.push({type: 'separator'});
				}

				if($scope.keyeditable !== false) {
					_menu.push(_menu_edit);
				}

				if($scope.kvtree.isList()) {
					_menu.push(_menu_new);
				}

				// Sub KV Menu
				if($scope.parentkv) {
					_menu.push({type: 'separator'});
					_menu.push(_menu_up);
					_menu.push(_menu_down);
					_menu_up.enabled = $.inArray($scope.kvtree, $scope.parentkv.value) !== 0;
					_menu_down.enabled = $.inArray($scope.kvtree, $scope.parentkv.value) !== $scope.parentkv.value.length - 1;

					_menu.push({type: 'separator'});
					_menu.push(_menu_del);
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
		'<div class="kv-tree">'+
			'<div menu="menu()" class="kv-tree-menu" ng-dblclick="editKV()">'+
				// String Value
				'<div ng-if="!kvtree.isList()" class="kv-tree-kv">' +
					'<span class="kv-tree-link">' +
						'<span class="fa fa-circle"></span> ' +
						'<b class="kv-tree-key" ng-class="{\'text-muted\': !kvtree.key}">{{kvtree.key || "EMPTY KEY"}}</b>:' +
					'</span>' +
					'<span ng-class="{\'text-muted\': !kvtree.value}">{{kvtree.value || "[EMPTY VALUE]"}}</span>'+
				'</div> '+

				// Tree Value
				'<span ng-if="kvtree.isList()" class="kv-tree-link">' +
					'<a class="fa" ng-class="{\'fa-chevron-circle-right\': !open, \'fa-chevron-circle-down\': open}" ng-click="toggleTree()"></a> ' +
					'<b class="kv-tree-key" ng-class="{\'text-muted\': !kvtree.key}">{{kvtree.key || "EMPTY KEY"}}</b>' +
				'</span> '+
			'</div>'+

			// List
			'<div ng-if="open" class="kv-tree-list">' +
				'<div kvtree="_kv" data-parentkv="kvtree" data-convertable="convertable" ng-repeat="_kv in kvtree.value"></div>' +
				'<span ng-if="kvtree.value.length === 0" class="text-muted">(empty list)</span>'+
			'</div>' +
		'</div>',
		replace : true
	};
});