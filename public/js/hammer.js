'use strict';

var hammerControllers = angular.module('hammerControllers', ['ngRoute', 'app.components']);

hammerControllers.controller('indexCtrl', function ($scope) {
});

hammerControllers.controller('abilityCtrl', function ($scope, $http, NODE, globalContent, KV, Ability, Event, Operation, Modifier) {
	if(!globalContent.isOpen) return;

	$scope.abilityList = [];

	$scope.setAbility = function(ability) {
		$scope.ability = ability;
	};

	$scope.getType = function(attr, src) {
		src = src || $scope.ability;
		if(typeof attr === "string") {
			return typeof src[attr];
		} else {
			return attr.type || typeof src[attr.attr];
		}
	};

	$scope.addEvent = function(unit) {
		(unit || $scope.ability)._eventList.push(new Event());
	};

	$scope.addModifier = function() {
		$scope.ability._modifierList.push(new Modifier());
	};

	NODE.loadFile("scripts/npc/npc_abilities_custom.txt", "utf8").then(function(data) {
		var _kv = new KV(data, true);
		$.each(_kv.kvList, function(i, unit) {
			if(typeof  unit.value !== "string") {
				var _ability = Ability.parse(unit, 1);
				_LOG("Ability",0 ,"实体：",_ability._name ,_ability);

				$scope.abilityList.push(_ability);
			}
		});

		console.log($scope.abilityList);
		$scope.ability = $scope.abilityList[0];

		//$scope.ability = new Ability();
		console.log("Scope >>>",$scope);
	}, function(){
		$.dialog({
			title: "OPS!",
			content: "Can't find npc_abilities_custom.txt <br/> 【打开npc_abilities_custom.txt失败】",
		});
	});

	//console.log($scope.ability);
});