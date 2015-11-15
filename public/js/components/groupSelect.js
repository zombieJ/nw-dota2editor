'use strict';

var components = angular.module('app.components', []);

components.directive('groupselect', function($compile) {
	return {
		restrict : 'AE',
		scope : {
			ability: "=",
			base: "=",
			attr: "@",
			tgtattr: "@?tgtattr",
			single: "=?single"
		},
		controller: function($scope, $element, $attrs) {
			$scope.common = common;

			$scope.getItemList = function() {
				var _list = $scope.base[$scope.attr];
				if(!$.isArray(_list)) {
					_list = _list.value;
				}
				return _list;
			};

			$scope.editGroup = function() {
				var attr = $scope.attr;
				var tgtattr = $scope.tgtattr || attr;

				$scope.ability[tgtattr] = $scope.ability[tgtattr] || {};

				var cntr = $("<div>");
				$.each($scope.getItemList(), function(i, item) {
					cntr.append($(
							'<label class="'+ (item[2] ? "text-primary": "") +  ' checkbox" style="width: 360px;">'+
								'<input type="checkbox" ' + ($scope.ability[tgtattr][item[0]] ? 'checked' : '') + ' data-name="' + item[0] + '">'+
								item[0].replace("DOTA_UNIT_TARGET_", "").replace("DECLARE_PURCHASES_", "").replace("FLAG_", "").replace("DOTA_ABILITY_BEHAVIOR_", "") +
								' 【' + item[1] + '】'+
							'</label>'
					));
				});

				$.dialog({
					title: "Select Group",
					content: cntr,
					confirm: true,
					size: 'large',
				}, function(ret) {
					if(!ret) return;

					cntr.find("input").each(function() {
						var _my = $(this);
						var _name = _my.attr("data-name");
						$scope.ability[tgtattr][_name] = _my.prop("checked");
						$scope.$apply();
					});
				});
			};
		},
		template :
		'<div ng-switch="single">' +
			// Single
			'<select ng-model="ability[tgtattr || attr]" class="form-control" ng-switch-when="true">'+
				'<option ng-repeat="(i, item) in getItemList() track by $index" value="{{item[0]}}">{{item[0]}} 【{{item[1]}}】</option>'+
			'</select>'+

			// Group
			'<a href="javascript: void(0);" ng-click="editGroup()" ng-switch-default>' +
				'<span class="label label-default" ng-repeat="(unitName, unitValue) in ability[tgtattr || attr]" ng-if="unitValue">' +
				'{{unitName.replace("DOTA_UNIT_TARGET_", "").replace("DECLARE_PURCHASES_", "").replace("FLAG_", "").replace("DOTA_ABILITY_BEHAVIOR_", "")}} ' +
				'【{{common.array.find(unitName, getItemList(), "0")[1]}}】' +
				'</span>'+
				' <span class="glyphicon glyphicon-pencil"></span>'+
			'</a>'+
		'</div>',
		replace : true
	};
});