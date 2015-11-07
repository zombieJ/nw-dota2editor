'use strict';

components.directive('modifier', function($compile) {
	return {
		restrict: 'AE',
		scope: {
			ability: "=",
			modifier: "="
		},
		controller: function ($scope, $element, $attrs, Operation, Modifier, Event) {
			$scope.Modifier = Modifier;
			$scope.Event = Event;
			$scope.Operation = Operation;
			$scope.common = common;

			$scope.addEvent = function() {
				$scope.modifier._eventList.push(new Event());
			};

			// ================================================================
			// =                         Optimization                         =
			// ================================================================
			$scope.optEventNum = common.array.num(3);

			$scope.$watch("modifier._eventList.length", function() {
				if(!$scope.modifier || !$scope.modifier._eventList) return;

				if($scope.modifier._eventList.length > $scope.optEventNum.length) {
					$scope.optEventNum = common.array.num($scope.modifier._eventList.length);
				}
			});
		},
		template:
		'<div>'+
			'<table class="table table-condensed table-bordered">'+
				'<tbody>'+
					// 常规
					'<tr ng-repeat="unit in modifier._requireList track by $index">'+
						'<th>{{unit.title || unit.attr}} 【{{unit.desc}}】</th>'+
						'<td>'+
							'<div attrfield data-attrunit="unit" data-srcunit="modifier" data-srctmpl="Modifier"></div>'+
						'</td>'+
					'</tr>'+

					// 属性
					'<tr class="abilityModifier_{{modifier._name}}__PROP">'+
						'<th colspan="2" class="warning">'+
								'Properties 【属性】'+
						'</th>'+
					'</tr>'+
					'<tr>'+
						'<td colspan="2">'+
							'<table class="table table-bordered table-condensed">'+
								'<tbody>'+
									'<tr ng-repeat="_prop in modifier._propertyList track by $index">'+
										'<th>'+
											'<a href="javascript:void(0)" ng-click="common.array.remove(_prop, modifier._propertyList)">[X]</a>'+
											'{{_prop[0].replace("MODIFIER_PROPERTY_", "")}} '+
											'【{{common.array.find(_prop[0], Modifier.Properties, "0")[1]}}】'+
										'</th>'+
										'<td>'+
											'<input type="text" class="form-control" ng-model="_prop[1]" />'+
										'</td>'+
									'</tr>'+
								'</tbody>'+
							'</table>'+
						'</td>'+
					'</tr>'+
					'<tr>'+
						'<td colspan="2">'+
							'<select class="form-control" ng-init="modifierProp = Modifier.Properties[0][0]" ng-model="modifierProp">'+
								'<option ng-repeat="item in Modifier.Properties track by $index" value="{{::item[0]}}">'+
									'{{item[0].replace("MODIFIER_PROPERTY_", "")}} '+
									'【{{item[1]}}】'+
								'</option>'+
							'</select>'+
							'<button class="btn btn-warning btn-xs" ng-click="modifier._propertyList.push([modifierProp, \'\'])">+ new Property 【添加属性】</button>'+
						'</td>'+
					'</tr>'+

					// 状态
					'<tr class="abilityModifier_{{modifier._name}}__STATE">'+
						'<th colspan="2" class="warning">'+
							'States 【状态】'+
						'</th>'+
					'</tr>'+

					'<tr>'+
						'<td colspan="2">'+
							'<table class="table table-bordered table-condensed">'+
								'<tbody>'+
									'<tr ng-repeat="_state in modifier._stateList track by $index">'+
										'<th>'+
											'<a href="javascript:void(0)" ng-click="common.array.remove(_state, modifier._stateList)">[X]</a>'+
											'{{_state[0].replace("MODIFIER_STATE_", "")}} '+
											'【{{common.array.find(_state[0], Modifier.States, "0")[1]}}】'+
										'</th>'+
										'<td>'+
											'<select class="form-control" ng-model="_state[1]">'+
												'<option ng-repeat="st in Modifier.StateValues track by $index" value="{{::st[0]}}">'+
													'{{::st[0].replace("MODIFIER_STATE_VALUE_", "")}}'+
													'【{{::st[1]}}】'+
												'</option>'+
											'</select>'+
										'</td>'+
									'</tr>'+
								'</tbody>'+
							'</table>'+
						'</td>'+
					'</tr>'+

					'<tr>'+
						'<td colspan="2">'+
							'<select class="form-control" ng-init="modifierState = Modifier.States[0][0]" ng-model="modifierState">'+
								'<option ng-repeat="item in Modifier.States track by $index" value="{{::item[0]}}">'+
									'{{::item[0].replace("MODIFIER_STATE_", "")}}'+
									'【{{::item[1]}}】'+
								'</option>'+
							'</select>'+
							'<button class="btn btn-warning btn-xs" ng-click="modifier._stateList.push([modifierState, Modifier.StateValues[0][0]])">+ new State 【添加状态】</button>'+
						'</td>'+
					'</tr>'+

					// 事件
					'<tr class="abilityModifier_{{modifier._name}}__EVENT">'+
						'<th colspan="2" class="warning">'+
							'Events 【事件】'+
						'</th>'+
					'</tr>'+

					'<tr>'+
						'<td colspan="2">'+
						'<!-- 事件 -->'+
							'<div ng-repeat="_index in optEventNum track by $index" ng-show="modifier._eventList[_index]" class="group-event">'+
							//'<div ng-repeat="(event_index,event) in modifier._eventList track by $index" class="group-event">'+
								'<label>'+
									'<a href="javascript:void(0)" ng-click="common.array.remove(modifier._eventList[_index], modifier._eventList)">[X]</a>'+
									'Event {{_index + 1}}'+
								'</label>'+
								'<select class="form-control" ng-model="modifier._eventList[_index]._name">'+
									'<option ng-repeat="_event in Event.ModifierEventList track by $index" value="{{::_event[0]}}">{{::_event[0]}} 【{{::_event[1]}}】</option>'+
								'</select>'+
								'<table ng-if="modifier._eventList[_index]._name === \'OnIntervalThink\'" class="table">'+
									'<tbody>'+
										'<tr>'+
											'<td width="200">ThinkInterval 【间隔】</td>'+
											'<td><input type="text" class="form-control" ng-model="modifier._eventList[_index].ThinkInterval" /></td>'+
										'</tr>'+
									'</tbody>'+
								'</table>'+

								'<!-- 操作 -->'+
								'<div eventoperation data-container="modifier._eventList[_index]" data-path="_operationList" data-isitem="isItem"></div>'+
							'</div>'+
							'<button class="btn btn-warning btn-xs" ng-click="addEvent()">+ new event 【新建事件】</button>'+
						'</td>'+
					'</tr>'+






				'</tbody>'+
			'</table>'+
		'</div>',
		replace : true
	};
});