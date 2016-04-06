'use strict';

components.directive('kvunitgroup', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			target: "=",		// KV Entity
			targetPath: "@"
		},
		controller: function($scope, $element, $attrs, Locale, Ability, Operation, UI) {
			$scope.Locale = Locale;
			$scope.Ability = Ability;
			$scope.Operation = Operation;
			$scope.UI = UI;

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
					if(_kv.getKV("Line")) {
						return "line";
					} else if(_kv.getKV("ScriptSelectPoints")) {
						return "script";
					}
					return "radius";
				}, set: function(value) {
					var _kv = $scope.target.getKV($scope.targetPath);
					if(value === "radius") {
						_kv.delete("Line");
						_kv.delete("ScriptSelectPoints");
					} else if(value === "script") {
						_kv.delete("Line");
						_kv.delete("Radius");
						_kv.assumeKey("ScriptSelectPoints", []);
					} else {
						_kv.set("Line", []);
						_kv.delete("Radius");
						_kv.delete("ScriptSelectPoints");
					}
				}
			});

			// ======================================================
			// =                    Customize KV                    =
			// ======================================================
			var _customizeKV = [];
			$scope.scriptKeyList = ["ScriptFile", "Function", "Target"];
			$scope.getScriptCustomizeKV = function() {
				_customizeKV.splice(0);

				var _kv = $scope.target.getKVByPath($scope.targetPath + ".ScriptSelectPoints");

				if(_kv && _kv.value) {
					$.each(_kv.value, function (i, _subKV) {
						if($.inArray(_subKV.key, $scope.scriptKeyList) === -1) {
							_customizeKV.push(_subKV);
						}
					});
				}

				return _customizeKV;
			};

			$scope.addCustomizeKV = function(scriptKV) {
				UI.modal.input("Add Customize KV", "Key Name", function(key) {
					if(!key || $.inArray(key, $scope.scriptKeyList) !== -1) {
						$.dialog({
							title: Locale('Error'),
							content: Locale('conflictName')
						});
						return false;
					} else {
						scriptKV.value.push(new KV(key, ""));
					}
				});
			};
		},
		template :
		'<div>' +
			'<select ng-model="key">' +
				'<option value="">None</option>'+
				'<option ng-repeat="opVal in Operation.OperationAttrMap.Target.value track by $index">{{::opVal}}</option>' +
			'</select>' +

			'<ul class="ability-form-unitGroup" ng-if="target.getKV(targetPath).isList()">'+
				'<li ng-show="action !== \'script\'">'+
					'<span class="text-muted">Types:</span>'+
					'<div kvgroup data-source="Ability" data-source-path="AbilityUnitTargetType" data-target="target.getKV(targetPath)" data-target-path="Types"></div>' +
				'</li>'+
				'<li ng-show="action !== \'script\'">'+
					'<span class="text-muted">Teams:</span>'+
					'<select ng-model="target.getKV(targetPath).bind(\'Teams\')" ng-model-options="{getterSetter: true}">' +
						'<option value="">【{{Locale(\'Default\')}}】 Default</option>'+
						'<option ng-repeat="(i, item) in Ability.AbilityUnitTargetTeam track by $index" value="{{item[0]}}">【{{Locale(item[0])}}】 {{item[0]}}</option>'+
					'</select>'+
				'</li>'+
				'<li ng-show="action !== \'script\'">'+
					'<span class="text-muted">Flags:</span>'+
					'<div kvgroup data-source="Ability" data-source-path="AbilityUnitTargetFlags" data-target="target.getKV(targetPath)" data-target-path="Flags"></div>' +
				'</li>'+
				'<li>'+
					'<span class="text-muted">Center:</span>'+
					'<select ng-model="target.getKV(targetPath).bind(\'Center\')" ng-model-options="{getterSetter: true}">' +
						'<option ng-repeat="opVal in Operation.OperationAttrMap.Center.value track by $index">{{::opVal[0]}}</option>' +
					'</select>' +
				'</li>'+

				// Action
				'<li>'+
					'<span class="text-muted">Action:</span>'+
					'<select ng-model="action">' +
						'<option value="radius">Radius</option>' +
						'<option value="line">Line</option>' +
						'<option value="script">Script</option>' +
					'</select>' +
				'</li>'+

				// Action - radius
				'<li ng-if="action === \'radius\'">'+
					'<span class="text-muted">Radius:</span>'+
					'<input type="text" ng-model="target.getKV(targetPath).bind(\'Radius\')" ng-model-options="{getterSetter: true}" />' +
				'</li>'+

				// Action - line
				'<li ng-if="action === \'line\'">'+
					'<span class="text-muted">Length:</span>'+
					'<input type="text" ng-model="target.getKV(targetPath).bind(\'Line.Length\')" ng-model-options="{getterSetter: true}" />' +
				'</li>'+
				'<li ng-if="action === \'line\'">'+
					'<span class="text-muted">Thickness:</span>'+
					'<input type="text" ng-model="target.getKV(targetPath).bind(\'Line.Thickness\')" ng-model-options="{getterSetter: true}" />' +
				'</li>'+

				// Action - script
				'<ul class="ability-form-unitGroup" ng-if="action === \'script\'">' +
					'<li ng-repeat="scriptKey in scriptKeyList track by $index">'+
						'<span class="text-muted">{{scriptKey}}:</span>'+
						'<input type="text" ng-model="target.getKVByPath(targetPath + \'.ScriptSelectPoints\').bind(scriptKey)" ng-model-options="{getterSetter: true}" />' +
					'</li>'+

					// Customize KV
					'<li ng-repeat="customizeKV in getScriptCustomizeKV() track by $index">' +
						'<a ng-click="UI.arrayDelete(customizeKV, target.getKVByPath(targetPath + \'.ScriptSelectPoints\').value)">[X]</a>'+
						'<span class="text-muted">{{customizeKV.key}}:</span>'+
						'<div class="ability-form"><input type="text" ng-model="customizeKV.value" /></div>' +
					'</li>' +
					'<a ng-click="addCustomizeKV(target.getKVByPath(targetPath + \'.ScriptSelectPoints\'))">+ Customize KV</a>' +
				'</ul>' +
			'</ul>'+
		'</div>'
	};
});