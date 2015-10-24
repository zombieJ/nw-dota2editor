'use strict';

var components = angular.module('app.components', []);

components.directive('groupselect', function($compile) {
	return {
		restrict : 'AE',
		scope : {
			ability: "=",
			attr: "@",
			single: "=?single"
		},
		controller: function($scope, $element, $attrs, Ability) {
			$scope.Ability = Ability;
		},
		template : 
			'<div>'+
				'<div ng-class="{checkbox: !single, radio: single}" ng-repeat="(i, item) in Ability[attr]">'+
					'<label ng-show="!single" ng-class="{\'text-primary\': item[2]}">'+
						'<input type="checkbox" ng-checked="ability[attr][item[0]]" ng-click="ability[attr][item[0]] = !ability[attr][item[0]]">'+
						'{{item[0]}} 【{{item[1]}}】'+
						
					'</label>'+

					'<label ng-show="single" ng-class="{\'text-primary\': item[2]}">'+
						'<input ng-show="single" type="radio" name="{{attr}}" ng-checked="ability[attr] === item[0]" ng-click="ability[attr] = item[0]">'+
						'{{item[0]}} 【{{item[1]}}】'+
						
					'</label>'+
				'</div>'+
			'</div>',
		replace : true
	};
});