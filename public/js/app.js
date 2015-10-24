'use strict';

/* App Module */
var app = angular.module('app', ['ngRoute', 'hammerControllers', 'app.components']);

app.config(function($routeProvider) {
	$routeProvider.when('/ability', {
		templateUrl: 'partials/ability.html',
		controller: 'abilityCtrl'
	}).otherwise({
		redirectTo : '/ability'
	});
});

app.controller('main', function($scope, $http, Ability, Event, Operation, Modifier) {
	$scope.Ability = Ability;
	$scope.Event = Event;
	$scope.Operation = Operation;
	$scope.Modifier = Modifier;
});