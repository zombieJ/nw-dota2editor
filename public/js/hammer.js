'use strict';

var hammerControllers = angular.module('hammerControllers', ['ngRoute', 'app.components']);

hammerControllers.controller('indexCtrl', function ($scope) {
});

hammerControllers.controller('abilityCtrl', function ($scope, $http, NODE, globalContent, Ability, Event, Operation, Modifier) {
	if(!globalContent.isOpen) return;

	NODE.loadFile("scripts/npc/npc_abilities_custom.txt", "utf8").then(function(data) {
		console.log(data);

		$scope.ability = new Ability();

		$scope.getType = function(attr, src) {
			src = src || $scope.ability;
			return typeof src[attr];
		};

		$scope.addEvent = function(unit) {
			(unit || $scope.ability)._eventList.push(new Event());
		};

		$scope.addModifier = function() {
			$scope.ability._modifierList.push(new Modifier());
		};
	});

	//console.log($scope.ability);
});