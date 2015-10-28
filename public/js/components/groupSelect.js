'use strict';

var components = angular.module('app.components', []);

components.directive('groupselect', function($compile) {
	return {
		restrict : 'AE',
		scope : {
			ability: "=",
			base: "=",
			attr: "@",
			single: "=?single"
		},
		controller: function($scope, $element, $attrs) {
		},
		template : 
			'<div>'+
				'<div ng-show="!single" ng-class="{checkbox: !single, radio: single}" ng-repeat="(i, item) in base[attr]">'+
					'<label ng-show="!single" ng-class="{\'text-primary\': item[2]}">'+
						'<input type="checkbox" ng-checked="ability[attr][item[0]]" ng-click="ability[attr][item[0]] = !ability[attr][item[0]]">'+
						'{{item[0].replace("DOTA_UNIT_TARGET_", "")}} 【{{item[1]}}】'+
					'</label>'+

					/*'<label ng-show="single" ng-class="{\'text-primary\': item[2]}">'+
						'<input ng-show="single" type="radio" name="{{attr}}" ng-checked="ability[attr] === item[0]" ng-click="ability[attr] = item[0]">'+
						'{{item[0] || "-"}} 【{{item[1]}}】'+
					'</label>'+*/
				'</div>'+

				'<select ng-show="single" ng-model="ability[attr]" class="form-control">'+
					'<option ng-repeat="(i, item) in base[attr]" value="{{item[0]}}">{{item[0]}} 【{{item[1]}}】</option>'+
				'</select>'+
			'</div>',
		replace : true
	};
});