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
		'<div ng-switch="Operation.EventOperationMap[opcol].type">' +

			// Single
		'	<select class="form-control" ng-model="operation.attrs[opcol]" ng-switch-when="single">' +
		'		<option ng-repeat="opVal in Operation.EventOperationMap[opcol].value track by $index">{{::opVal}}</option>' +
		'	</select>'+

			// Text
		'	<div ng-switch-when="text">'+
			// Sound need additional effort
		'		<input tipfield type="text" class="form-control" ng-model="operation.attrs[opcol]" data-matchfuc="Sound.match" ng-if="operation.name === \'FireSound\'" />'+
			//Other text field
		'		<input type="text" class="form-control" ng-model="operation.attrs[opcol]" ng-if="operation.name !== \'FireSound\'" />' +
		'	</div>'+

			// Blob
		'	<textarea class="form-control" ng-model="operation.attrs[opcol]" rows="5" ng-switch-when="blob"></textarea>'+

			// Bool
		'<input ng-switch-when="bool"' +
		'   type="checkbox" ng-checked="operation.attrs[opcol] === true"' +
		'   ng-click="operation.attrs[opcol] = !operation.attrs[opcol]" />'+

			// Group
		'	<div groupselect data-ability="operation.attrs" data-attr="{{opcol}}" data-base="Operation.EventOperationMap" ng-switch-when="group"></div>'+

			// Unit Group
		'<div ng-switch-when="unitGroup">' +
		'	<select class="form-control" ng-model="operation.attrs[opcol].target">' +
		'		<option ng-repeat="opVal in Operation.EventOperationMap[opcol].value track by $index">{{::opVal}}</option>' +
		'	</select>' +

		'	<table class="table" ng-show="operation.attrs[opcol].target === \'[Group Units]\'">' +
		'		<tbody>' +
		'			<tr>' +
		'				<td>Types 【类型】</td>' +
		'				<td><div groupselect data-ability="operation.attrs[opcol]" data-attr="AbilityUnitTargetType" data-tgtattr="Types" data-base="Ability"></div></td>' +
		'			</tr>' +
		'			<tr>' +
		'				<td>Teams 【队伍】</td>' +
		'				<td><div groupselect data-ability="operation.attrs[opcol]" data-attr="AbilityUnitTargetTeam" data-tgtattr="Teams" data-base="Ability" data-single="true"></div></td>' +
		'			</tr>' +
		'			<tr>' +
		'				<td>Flags 【标记】</td>' +
		'				<td><div groupselect data-ability="operation.attrs[opcol]" data-attr="AbilityUnitTargetFlags" data-tgtattr="Flags" data-base="Ability"></div></td>' +
		'			</tr>' +
		'			<tr>' +
		'				<td>Center 【中点】</td>' +
		'				<td>' +
		'					<select class="form-control" ng-model="operation.attrs[opcol].Center">' +
		'						<option ng-repeat="opVal in Operation.EventOperationMap.Center.value track by $index">{{::opVal}}</option>' +
		'					</select>' +
		'				</td>' +
		'			</tr>' +
		'			<tr>' +
		'				<td>Action 【行为】</td>' +
		'				<td>' +
		'					<select class="form-control" ng-model="operation.attrs[opcol]._action">' +
		'						<option value="radius">Radius 【范围】</option>' +
		'						<option value="line">Line 【连线】</option>' +
		'					</select>' +
		'				</td>' +
		'			</tr>' +
		'			<tr ng-if="operation.attrs[opcol]._action === \'radius\'">' +
		'				<td>Radius 【半径】</td>' +
		'				<td>' +
		'					<input type="text" class="form-control" ng-model="operation.attrs[opcol].Radius" />' +
		'				</td>' +
		'			</tr>' +
		'			<tr ng-if="operation.attrs[opcol]._action === \'line\'">' +
		'				<td>Length 【长度】</td>' +
		'				<td>' +
		'					<input type="text" class="form-control" ng-model="operation.attrs[opcol].Line.Length" />' +
		'				</td>' +
		'			</tr>' +
		'			<tr ng-if="operation.attrs[opcol]._action === \'line\'">' +
		'				<td>Thickness 【厚度】</td>' +
		'				<td>' +
		'					<input type="text" class="form-control" ng-model="operation.attrs[opcol].Line.Thickness" />' +
		'				</td>' +
		'			</tr>' +
		'		</tbody>' +
		'	</table>' +
		'</div>' +

			// Operation
		'	<div class="operationList" ng-switch-when="operation">' +
		'		<div eventoperation data-container="operation.attrs" data-path="{{opcol}}"></div>' +
		'	</div>' +

		'</div>',
		replace: true
	};
});