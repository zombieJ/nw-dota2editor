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
			var contents = element.contents().remove();
			var compiledContents;

			return {
				post: function(scope, element){
					// Compile the contents
					if(!compiledContents){
						compiledContents = $compile(contents);
					}
					// Re-add the compiled contents to the element
					compiledContents(scope, function(clone){
						element.append(clone);
					});
				},
			};
		},
		template:
		'<div ng-switch="Operation.EventOperationMap[opcol].type" class="ability-form">' +
			// Single
			'<select ng-model="operation.attrs[opcol]" ng-switch-when="single" placeholder="[None]">' +
				'<option ng-repeat="opVal in Operation.EventOperationMap[opcol].value track by $index">{{::opVal}}</option>' +
			'</select>'+

			// Text
			'<div ng-switch-when="text">'+
				// Sound need additional effort
				'<input tipfield type="text" ng-model="operation.attrs[opcol]" placeholder="[None]" data-matchfuc="Sound.match" ng-if="operation.name === \'FireSound\'" />'+
				//Other text field
				'<input type="text" ng-model="operation.attrs[opcol]" placeholder="[None]" ng-if="operation.name !== \'FireSound\'" />' +
			'</div>'+

			// Blob
			'<div class="ability-form-blob" ng-switch-when="blob">'+
				'<textarea class="form-control" ng-model="operation.attrs[opcol]" placeholder="[None]" rows="5"></textarea>'+
			'</div>'+

			// Bool
			'<input ng-switch-when="bool"' +
				'type="checkbox" ng-checked="operation.attrs[opcol] === true"' +
				'ng-click="operation.attrs[opcol] = !operation.attrs[opcol]" />'+

			// Group
			'<div groupselect data-ability="operation.attrs" data-attr="{{opcol}}" data-base="Operation.EventOperationMap" ng-switch-when="group"></div>'+

			// Operation
			'<div class="ability-form-operationList" ng-switch-when="operation">' +
				'<div eventoperation data-container="operation.attrs" data-path="{{opcol}}"></div>' +
			'</div>' +

			// Unit Group
			'<div ng-switch-when="unitGroup">' +
				'<select ng-model="operation.attrs[opcol].target">' +
					'<option ng-repeat="opVal in Operation.EventOperationMap[opcol].value track by $index">{{::opVal}}</option>' +
				'</select>' +

				'<ul class="ability-form-unitGroup" ng-if="operation.attrs[opcol].target === \'[Group Units]\'">'+
					'<li>'+
						'<span class="text-muted">Types【类型】:</span>'+
						'<div groupselect data-ability="operation.attrs[opcol]" data-attr="AbilityUnitTargetType" data-tgtattr="Types" data-base="Ability"></div>' +
					'</li>'+
					'<li>'+
						'<span class="text-muted">Teams【队伍】:</span>'+
						'<div groupselect data-ability="operation.attrs[opcol]" data-attr="AbilityUnitTargetTeam" data-tgtattr="Teams" data-base="Ability" data-single="true"></div>' +
					'</li>'+
					'<li>'+
						'<span class="text-muted">Flags【标记】:</span>'+
						'<div groupselect data-ability="operation.attrs[opcol]" data-attr="AbilityUnitTargetFlags" data-tgtattr="Flags" data-base="Ability"></div>' +
					'</li>'+
					'<li>'+
						'<span class="text-muted">Center【中点】:</span>'+
						'<select ng-model="operation.attrs[opcol].Center">' +
							'<option ng-repeat="opVal in Operation.EventOperationMap.Center.value track by $index">{{::opVal}}</option>' +
						'</select>' +
					'</li>'+

					'<li>'+
						'<span class="text-muted">Action【行为】:</span>'+
						'<select ng-model="operation.attrs[opcol]._action">' +
							'<option value="radius">Radius 【范围】</option>' +
							'<option value="line">Line 【连线】</option>' +
						'</select>' +
					'</li>'+
					'<li ng-if="operation.attrs[opcol]._action === \'radius\'">'+
						'<span class="text-muted">Radius【半径】:</span>'+
						'<input type="text" ng-model="operation.attrs[opcol].Radius" />' +
					'</li>'+
					'<li ng-if="operation.attrs[opcol]._action === \'line\'">'+
						'<span class="text-muted">Length【长度】:</span>'+
						'<input type="text" ng-model="operation.attrs[opcol].Line.Length" />' +
					'</li>'+
					'<li ng-if="operation.attrs[opcol]._action === \'line\'">'+
						'<span class="text-muted">Thickness【厚度】:</span>'+
						'<input type="text" ng-model="operation.attrs[opcol].Line.Thickness" />' +
					'</li>'+
				'</ul>'+
			'</div>' +
		'</div>',
		replace: true
	};
});