'use strict';

components.directive('kvgroup', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			// Current path not support deep loop
			source: "=",
			sourcePath: "@",
			target: "=",
			targetPath: "@?targetPath",
		},
		controller: function($scope, $element, $attrs, Locale) {
			var _selectedList = [];
			$scope.Locale = Locale;

			var _tgtPath = function() {
				return $scope.targetPath || $scope.sourcePath;
			};

			// Get Selectable List
			$scope.getSelectableList = function() {
				var _list = $scope.source[$scope.sourcePath];
				if(!$.isArray(_list)) {
					_list = _list.value;
				}
				return _list;
			};

			// Get KV contained lines
			$scope.getSelectList = function() {
				_selectedList.splice(0);

				if ($scope.target) {
					var _content = ($scope.target.get(_tgtPath(), false) || "").trim();
					$.each(_content.split("|"), function (i, line) {
						if(line) _selectedList.push(line.trim());
					});
				}

				return _selectedList;
			};

			// Alert edit group dialog
			$scope.editGroup = function() {
				var _selectList = $scope.getSelectList();
				var $cntr = $("<div>");
				$.each($scope.getSelectableList(), function(i, item) {
					var $label = $('<label class="'+ (item[1] ? "text-primary": "") + ' checkbox" style="width: 360px;">').text(Locale(item[0]) + " ").appendTo($cntr);
					var $input = $('<input type="checkbox">').attr("data-name", item[0]).prependTo($label);
					$('<small class="text-muted">').text($scope.simpleStr(item[0])).appendTo($label);

					if(common.array.find(item[0], _selectList)) {
						$input.prop("checked", true);
					}
				});

				$.dialog({
					title: "Select Group",
					content: $cntr,
					confirm: true,
					size: 'large',
				}, function(ret) {
					if(!ret) return;

					var _items = [];
					$cntr.find("input:checked").each(function() {
						_items.push($(this).attr("data-name"));
					});
					$scope.target.set(_tgtPath(), _items.join(" | "));
					$scope.$apply();
				});
			};

			// Remove prefix of Key
			$scope.simpleStr = function(str) {
				return str
					.replace("DOTA_UNIT_TARGET_", "")
					.replace("DECLARE_PURCHASES_", "")
					.replace("FLAG_", "")
					.replace("MODIFIER_ATTRIBUTE_", "")
					.replace("DOTA_ABILITY_BEHAVIOR_", "");
			};
		},
		template :
		'<a ng-click="editGroup()">' +
			'<span class="label label-default" ng-repeat="line in getSelectList()">' +
				'{{Locale(line)}}' +
			'</span>'+
			' <span class="glyphicon glyphicon-pencil"></span>'+
		'</a>'
	};
});