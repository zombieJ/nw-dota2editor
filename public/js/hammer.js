'use strict';

var hammerControllers = angular.module('hammerControllers', ['ngRoute', 'app.components']);
hammerControllers.controller('abilityCtrl', function ($scope, $http, $routeParams, Ability, Event, Operation, Modifier) {
	$scope.ability = new Ability();

	$scope.getType = function(attr, src) {
		src = src || $scope.ability;
		return typeof src[attr];
	};

	$scope.addEvent = function() {
		$scope.ability._eventList.push(new Event());
	};

	$scope.addModifier = function() {
		$scope.ability._modifierList.push(new Modifier());
	};

	console.log($scope.ability);
});