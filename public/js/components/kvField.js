'use strict';

var components = angular.module('app.components', []);

components.directive('kvfield', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			srctmpl: "=",		// Entity Class
			srcunit: "=",		// Entity
			attrunit: "=",		// Attribute Unit
			ability: "=",		// Skill / Item Ability - Used for link
			path: "@",			// Prepath. e.g. "lvl1" + attrunit.attr = "lvl1.attr"
		},
		controller: function($scope, $element, $attrs, Locale) {
			$scope.Locale = Locale;

			$scope.getKV = function() {
				if($scope.srcunit) {
					return $scope.srcunit.kv ? $scope.srcunit.kv : $scope.srcunit;
				}
				return null;
			};

			$scope.getAttrPath = function() {
				if($scope.attrunit.path &&  $scope.attrunit.attr) {
					return $scope.attrunit.path + "." +  $scope.attrunit.attr;
				} else {
					return $scope.attrunit.path ||  $scope.attrunit.attr;
				}
			};

			$scope.getItemList = function () {
				var _list = $scope.srctmpl[$scope.attrunit.attr];
				if (!$.isArray(_list)) {
					console.error("Not Array: ", $scope.attrunit.attr);
					console.error($scope.srctmpl, _list);
				}
				return _list;
			};
		},
		template:
		'<div ng-switch="attrunit.type" class="ability-form">' +
			// Blob
			'<textarea class="form-control" rows="5" ng-model="getKV().bind(getAttrPath())" ng-model-options="{getterSetter: true}" placeholder="[None]" ng-switch-when="blob"></textarea>'+

			// Group
			'<div kvgroup data-source="srctmpl" data-source-path="{{getAttrPath()}}" data-target="getKV()" ng-switch-when="group"></div>' +

			// Single
			'<select class="form-control" ng-model="getKV().bind(getAttrPath())" ng-model-options="{getterSetter: true}" ng-switch-when="single" >' +
				'<option value="">【{{Locale(\'Default\')}}】 Default</option>'+
				'<option ng-repeat="(i, item) in getItemList() track by $index" value="{{item[0]}}">【{{Locale(item[0])}}】 {{item[0]}}</option>'+
			'</select>'+

			// Boolean
			//'<input type="checkbox" ng-checked="getKV().getBoolValue(getAttrPath())" ng-model-options="{getterSetter: true}" ng-switch-when="boolean" ' +
			//'ng-click="getKV().reverseBoolValue(getAttrPath())" />' +
			'<div checkbox data-target="getKV()" data-target-path="{{getAttrPath()}}" ng-switch-when="boolean"></div>' +

			// Text
			'<input tipfield class="form-control" ng-model="getKV().bind(getAttrPath())" ng-model-options="{getterSetter: true}" ng-switch-when="text" ' +
			'data-alternative="srctmpl[getAttrPath()]" data-matchfuc="attrunit.match(srcunit[getAttrPath()], ability)" />' +

			// Default
			'<p ng-switch-default class="text-danger">【Type Not Match: {{attrunit.type}}】</p>' +
		'</div>',
		replace: true
	};
});