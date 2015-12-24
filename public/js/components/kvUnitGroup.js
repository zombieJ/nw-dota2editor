'use strict';

components.directive('kvunitgroup', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			target: "=",		// KV Entity
			targetPath: "@",
		},
		controller: function($scope, $element, $attrs, Locale, Ability, Operation) {
			$scope.Locale = Locale;
			$scope.Ability = Ability;
			$scope.Operation = Operation;

			Object.defineProperty($scope, "key", {
				get: function() {
					var _kv = $scope.target.assumeKey($scope.targetPath);
					_kv.value = _kv.value || "";
					return typeof _kv.value === "string" ? _kv.value : "[Group Units]";
				}, set: function(value) {
					if(value === "[Group Units]") {
						$scope.target.set($scope.targetPath, []);
					} else {
						$scope.target.set($scope.targetPath, value);
					}
				}
			});

			Object.defineProperty($scope, "action", {
				get: function() {
					var _kv = $scope.target.getKV($scope.targetPath);
					return _kv.getKV("Line") ? "line" : "radius";
				}, set: function(value) {
					var _kv = $scope.target.getKV($scope.targetPath);
					if(value === "radius") {
						_kv.delete("Line");
					} else {
						_kv.set("Line", []);
						_kv.delete("Radius");
					}
				}
			});
		},
		template :
		'<div>' +
			'<select ng-model="key">' +
				'<option value="">None</option>'+
				'<option ng-repeat="opVal in Operation.OperationAttrMap.Target.value track by $index">{{::opVal}}</option>' +
			'</select>' +

			'<ul class="ability-form-unitGroup" ng-if="target.getKV(targetPath).isList()">'+
				'<li>'+
					'<span class="text-muted">Types:</span>'+
					'<div kvgroup data-source="Ability" data-source-path="AbilityUnitTargetType" data-target="target.getKV(targetPath)" data-target-path="Types"></div>' +
				'</li>'+
				'<li>'+
					'<span class="text-muted">Teams:</span>'+
					'<select ng-model="target.getKV(targetPath).bind(\'Teams\')" ng-model-options="{getterSetter: true}">' +
						'<option value="">【{{Locale(\'Default\')}}】 Default</option>'+
						'<option ng-repeat="(i, item) in Ability.AbilityUnitTargetTeam track by $index" value="{{item[0]}}">【{{Locale(item[0])}}】 {{item[0]}}</option>'+
					'</select>'+
				'</li>'+
				'<li>'+
					'<span class="text-muted">Flags:</span>'+
					'<div kvgroup data-source="Ability" data-source-path="AbilityUnitTargetFlags" data-target="target.getKV(targetPath)" data-target-path="Flags"></div>' +
				'</li>'+
				'<li>'+
					'<span class="text-muted">Center:</span>'+
					'<select ng-model="target.getKV(targetPath).bind(\'Center\')" ng-model-options="{getterSetter: true}">' +
						'<option ng-repeat="opVal in Operation.OperationAttrMap.Center.value track by $index">{{::opVal}}</option>' +
					'</select>' +
				'</li>'+

				// Action
				'<li>'+
					'<span class="text-muted">Action:</span>'+
					'<select ng-model="action">' +
						'<option value="radius">Radius</option>' +
						'<option value="line">Line</option>' +
					'</select>' +
				'</li>'+

				'<li ng-if="action === \'radius\'">'+
					'<span class="text-muted">Radius:</span>'+
					'<input type="text" ng-model="target.getKV(targetPath).bind(\'Radius\')" ng-model-options="{getterSetter: true}" />' +
				'</li>'+

				'<li ng-if="action === \'line\'">'+
					'<span class="text-muted">Length:</span>'+
					'<input type="text" ng-model="target.getKV(targetPath).bind(\'Line.Length\')" ng-model-options="{getterSetter: true}" />' +
				'</li>'+
				'<li ng-if="action === \'line\'">'+
					'<span class="text-muted">Thickness:</span>'+
					'<input type="text" ng-model="target.getKV(targetPath).bind(\'Line.Thickness\')" ng-model-options="{getterSetter: true}" />' +
				'</li>'+
			'</ul>'+
		'</div>'
	};
});