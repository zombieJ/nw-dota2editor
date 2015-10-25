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

app.factory("globalContent", function() {
	var _globalContent = {
		project: localStorage.getItem("project"),
		isOpen: false,
	};

	return _globalContent;
});

app.factory("NODE", function() {
	return process.mainModule.exports;
});

app.controller('main', function($scope, $q, Ability, Event, Operation, Modifier, globalContent, NODE) {
	$scope.Ability = Ability;
	$scope.Event = Event;
	$scope.Operation = Operation;
	$scope.Modifier = Modifier;
	$scope.common = common;

	$scope.globalContent = globalContent;

	$scope.loadProject = function() {
		var _promise = NODE.loadProject($q, globalContent.project);

		_promise.then(function() {
			localStorage.setItem("project", globalContent.project);
			globalContent.isOpen = true;
		}, function () {
			$.dialog({
				title: "OPS!",
				content: "Project folder not exist!<br>【文件路径不存在！】",
			});
		});
	};
});