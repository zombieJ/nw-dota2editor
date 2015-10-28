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
		compile: function (element, attrs) {
			return {
				pre: function (scope, element, attrs) {
					var _field;
					if(!scope.single) {
						_field = $(
							'<div class="checkbox" ng-repeat="(i, item) in base[attr]">'+
								'<label ng-class="{\'text-primary\': item[2]}">'+
									'<input type="checkbox" ng-checked="ability[attr][item[0]]" ng-click="ability[attr][item[0]] = !ability[attr][item[0]]">'+
									'{{item[0].replace("DOTA_UNIT_TARGET_", "").replace("DOTA_ABILITY_BEHAVIOR_", "")}} ' +
									'【{{item[1]}}】'+
								'</label>'+
							'</div>'
						);
						/*_field = $(
							'<div>' +
								'<ul class="list-inline">'+
									'<li ng-repeat="(unitName, unitValue) in ability[attr]" ng-if="unitValue">{{unitName}}</li>'+
								'</ul>'+
							'</div>'
						);*/
					} else {
						_field = $(
							'<select ng-model="ability[attr]" class="form-control">'+
								'<option ng-repeat="(i, item) in base[attr]" value="{{item[0]}}">{{item[0]}} 【{{item[1]}}】</option>'+
							'</select>'
						);
					}
					if(_field) {
						var compiledContents = $compile(_field);
						compiledContents(scope, function(clone, scope) {
							element.append(clone);
						});
					}
				}
			};
		},
		template : '<div></div>',
		replace : true
	};
});