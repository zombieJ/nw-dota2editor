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
		'<tbody>'+
			// =========================== 名称 ===========================
			'<tr>'+
				'<th width="130">'+
					'<span class="ability-tip">Name</span>'+
					'名称'+
				'</th>'+
				'<td class="ability-form">'+
					'<input type="text" ng-model="modifier._name" />'+
				'</td>'+
			'</tr>'+

			// =========================== 常规 ===========================
			'<tr ng-repeat="unit in modifier._requireList track by $index">'+
				'<th>' +
					'<span class="ability-tip">{{unit.title || unit.attr}}</span>'+
					'{{unit.desc}}' +
				'</th>'+
				'<td class="ability-form">'+
					'<div attrfield data-attrunit="unit" data-srcunit="modifier" data-srctmpl="Modifier"></div>'+
				'</td>'+
			'</tr>'+

			// =========================== 属性 ===========================
			'<tr>'+
				'<th>'+
					'<span class="ability-tip">Properties</span>'+
					'属性' +
				'</th>'+
				'<td>'+
					'<div class="ability-modifer-prop-list">'+
						'<ul>'+
							'<li ng-repeat="_prop in modifier._propertyList track by $index">'+
								'<a ng-click="common.array.remove(_prop, modifier._propertyList)">[X]</a>'+
								'<div class="ability-modifer-item-select">'+
									'<select ng-model="_prop[0]">'+
										'<option ng-repeat="item in Modifier.Properties track by $index" value="{{::item[0]}}">'+
											'{{item[0].replace("MODIFIER_PROPERTY_", "")}} 【{{item[1]}}】'+
										'</option>'+
									'</select>'+
								'</div>'+
								'<input type="text" class="form-control" ng-model="_prop[1]" />'+
							'</li>'+
						'</ul>'+
						'<a class="add-link" ng-click="modifier._propertyList.push([\'MODIFIER_PROPERTY_ABSOLUTE_NO_DAMAGE_MAGICAL\', \'\'])">+ new Property 【添加属性】</a>'+
					'</div>'+
				'</td>'+
			'</tr>'+

			// =========================== 状态 ===========================
			'<tr>'+
				'<th>'+
					'<span class="ability-tip">States</span>'+
					'状态' +
				'</th>'+
				'<td>'+
					'<div class="ability-modifer-prop-list">'+
						'<ul>'+
							'<li ng-repeat="_state in modifier._stateList track by $index">'+
								'<a ng-click="common.array.remove(_state, modifier._stateList)">[X]</a>'+
								'<div class="ability-modifer-item-select">'+
									'<select ng-model="_state[0]">'+
										'<option ng-repeat="item in Modifier.States track by $index" value="{{::item[0]}}">'+
											'{{item[0].replace("MODIFIER_STATE_", "")}} 【{{item[1]}}】'+
										'</option>'+
									'</select>'+
								'</div>'+
								'<select ng-model="_state[1]">'+
									'<option ng-repeat="item in Modifier.StateValues track by $index" value="{{::item[0]}}">'+
										'{{item[0].replace("MODIFIER_STATE_VALUE_", "")}} 【{{item[1]}}】'+
									'</option>'+
								'</select>'+
							'</li>'+
						'</ul>'+
						'<a class="add-link" ng-click="modifier._stateList.push([\'MODIFIER_STATE_ATTACK_IMMUNE\', \'\'])">+ new State 【添加状态】</a>'+
					'</div>'+
				'</td>'+
			'</tr>'+

			// =========================== 事件 ===========================
			'<tr>'+
				'<th>'+
					'<span class="ability-tip">Events</span>'+
					'事件' +
				'</th>'+
				'<td style="padding: 5px">'+
					'<table class="ability-table">'+
						'<tbody ng-repeat="_index in optEventNum track by $index" ng-show="modifier._eventList[_index]">'+
							// 事件类型
							'<tr>'+
								'<th width="120">'+
									'<span class="ability-tip">Event Type</span>'+
									'事件类型'+
								'</th>'+
								'<td class="ability-form">'+
									'<select ng-model="modifier._eventList[_index]._name">'+
										'<option ng-repeat="_event in Event.ModifierEventList track by $index" value="{{::_event[0]}}">{{::_event[0]}} 【{{::_event[1]}}】</option>'+
									'</select>'+
								'</td>'+
								'<td width="60" class="text-center">'+
									'<a href="javascript:void(0)" ng-click="common.array.remove(modifier._eventList[_index], modifier._eventList)">'+
										'Delete'+
									'</a>'+
								'</td>'+
							'</tr>'+

							// 事件备注
							'<tr>'+
								'<th>'+
									'<span class="ability-tip">Comment</span>'+
									'备注'+
								'</th>'+
								'<td class="ability-form" colspan="2">'+
									'<textarea class="form-control" ng-model="modifier._eventList[_index]._comment" rows="3" placeholder="备注"></textarea>'+
								'</td>'+
							'</tr>'+

							// 操作
							'<tr>'+
								'<th>'+
									'<span class="ability-tip">Operation</span>'+
									'操作'+
								'</th>'+
								'<td class="ability-form" colspan="2" style="background: #FFF">'+
									'<div eventoperation data-container="modifier._eventList[_index]" data-path="_operationList" data-ability="ability" data-isitem="isItem"></div>'+
								'</td>'+
							'</tr>'+
						'</tbody>'+
					'</table>'+

					'<a ng-click="addEvent()">+ new event 【新建事件】</a>'+
				'</td>'+
			'</tr>'+
		'</tbody>',
		replace : true
	};
});