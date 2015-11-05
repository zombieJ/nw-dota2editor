'use strict';

components.directive('operationfield', function($compile, Operation) {
	return {
		restrict: 'AE',
		scope: {
			opcol: "=",
			operation: "=",
		},
		controller: function($scope, $element, $attrs, Ability, Event, Operation, Sound) {
			$scope.Ability = Ability;
			$scope.Event = Event;
			$scope.Operation = Operation;
			$scope.Sound = Sound;
			$scope.common = common;

			$scope.validateColOperation = function(operation, opcol) {
				if(Operation.EventOperationMap[opcol].type === "operation" && operation.attrs[opcol] === undefined) {
					operation.attrs[opcol] = [];
				}
			};
		},
		compile: function (element, attrs) {
			return {
				pre: function (scope, element, attrs) {
					var _field;
					var _type = Operation.EventOperationMap[scope.opcol].type;
					switch (_type) {
						case "single":
							_field = $(
								'<select class="form-control" ng-model="operation.attrs[opcol]">' +
								'	<option ng-repeat="opVal in Operation.EventOperationMap[opcol].value track by $index">{{::opVal}}</option>' +
								'</select>'
							);
							break;
						case "text":
							if(scope.operation.name === "FireSound") {
								// Sound need additional effort 【声音文件需要额外的匹配】
								_field = $(
									'<input typeahead type="text" class="form-control" ng-model="operation.attrs[opcol]" data-matchfuc="Sound.match" />'
								);
							} else {
								_field = $(
									'<input type="text" class="form-control" ng-model="operation.attrs[opcol]" />'
								);
							}
							break;
						case "blob":
							_field = $(
								'<textarea class="form-control" ng-model="operation.attrs[opcol]" rows="5"></textarea>'
							);
							break;
						case "bool":
							_field = $(
								'<input ng-init="operation.attrs[opcol] = Operation.EventOperationMap[opcol].type === \'bool\' && operation.attrs[opcol] === undefined ? false : operation.attrs[opcol]"' +
								'   type="checkbox" ng-checked="operation.attrs[opcol]"' +
								'   ng-click="operation.attrs[opcol] = !operation.attrs[opcol]" />'
							);
							break;
						case "group":
							_field = $(
								'<div groupselect data-ability="operation.attrs" data-attr="{{opcol}}" data-base="Operation.EventOperationMap"></div>'
							);
							break;
						case "unitGroup":
							scope.operation.attrs[scope.opcol] = scope.operation.attrs[scope.opcol] || {};
							$.each(Operation.UnitGroupColumns, function(i, colUnit) {
								if(colUnit[3] === "group") {
									scope.operation.attrs[scope.opcol][colUnit[0]] = scope.operation.attrs[scope.opcol][colUnit[0]] || {};
								}
							});

							if(scope.operation.attrs[scope.opcol].Line) {
								scope.operation.attrs[scope.opcol]._action = "line";
							} else {
								scope.operation.attrs[scope.opcol]._action = "radius";
							}

							_field = $(
								'<div>' +
									'<select class="form-control" ng-model="operation.attrs[opcol].target">' +
									'	<option ng-repeat="opVal in Operation.EventOperationMap[opcol].value track by $index">{{::opVal}}</option>' +
									'</select>' +
									'<table class="table" ng-show="operation.attrs[opcol].target === \'[Group Units]\'">' +
										'<tbody>' +
											'<tr>' +
												'<td>Types 【类型】</td>' +
												'<td><div groupselect data-ability="operation.attrs[opcol]" data-attr="AbilityUnitTargetType" data-tgtattr="Types" data-base="Ability"></div></td>' +
											'</tr>' +
											'<tr>' +
												'<td>Teams 【队伍】</td>' +
												'<td><div groupselect data-ability="operation.attrs[opcol]" data-attr="AbilityUnitTargetTeam" data-tgtattr="Teams" data-base="Ability" data-single="true"></div></td>' +
											'</tr>' +
											'<tr>' +
												'<td>Flags 【标记】</td>' +
												'<td><div groupselect data-ability="operation.attrs[opcol]" data-attr="AbilityUnitTargetFlags" data-tgtattr="Flags" data-base="Ability"></div></td>' +
											'</tr>' +
											'<tr>' +
												'<td>Center 【中点】</td>' +
												'<td>' +
												'<select class="form-control" ng-model="operation.attrs[opcol].Center">' +
												'	<option ng-repeat="opVal in Operation.EventOperationMap.Center.value track by $index">{{::opVal}}</option>' +
												'</select>' +
												'</td>' +
											'</tr>' +
											'<tr>' +
												'<td>Action 【行为】</td>' +
												'<td>' +
													'<select class="form-control" ng-model="operation.attrs[opcol]._action">' +
													'	<option value="radius">Radius 【范围】</option>' +
													'	<option value="line">Line 【连线】</option>' +
													'</select>' +
												'</td>' +
											'</tr>' +
											'<tr ng-if="operation.attrs[opcol]._action === \'radius\'">' +
												'<td>Radius 【半径】</td>' +
												'<td>' +
												'<input type="text" class="form-control" ng-model="operation.attrs[opcol].Radius" />' +
												'</td>' +
											'</tr>' +
											'<tr ng-if="operation.attrs[opcol]._action === \'line\'">' +
												'<td>Length 【长度】</td>' +
												'<td>' +
												'<input type="text" class="form-control" ng-model="operation.attrs[opcol].Line.Length" />' +
												'</td>' +
											'</tr>' +
											'<tr ng-if="operation.attrs[opcol]._action === \'line\'">' +
												'<td>Thickness 【厚度】</td>' +
												'<td>' +
												'<input type="text" class="form-control" ng-model="operation.attrs[opcol].Line.Thickness" />' +
												'</td>' +
											'</tr>' +
										'</tbody>' +
									'</table>' +
								'</div>'
							);
							break;
						case "operation":
							_field = $(
								'<div ng-init="validateColOperation(operation, opcol)">' +
								'<div eventoperation data-container="operation.attrs" data-path="{{::opcol}}"></div>' +
								'</div>'
							);
							break;
						default :
							console.warn("[Component] Operation No match!", _type, scope);
					}

					if (_field) {
						var compiledContents = $compile(_field);
						compiledContents(scope, function (clone, scope) {
							element.append(clone);
						});
					}
				}
			};
		},
		template: '<div></div>',
		replace: true
	};
});