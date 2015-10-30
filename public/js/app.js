'use strict';

/* App Module */
var app = angular.module('app', ['ngRoute', 'hammerControllers', 'app.components']);

app.config(function($routeProvider) {
	$routeProvider.when('/index', {
		templateUrl: 'partials/index.html',
		controller: 'indexCtrl'
	}).when('/ability', {
		templateUrl: 'partials/ability.html',
		controller: 'abilityCtrl'
	}).otherwise({
		redirectTo : '/index'
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
	return window.process ? window.process.mainModule.exports : null;
});

app.controller('main', function($scope, $route, $q, Ability, Event, Operation, Modifier, Language, KV, globalContent, NODE) {
	$scope.Ability = Ability;
	$scope.Event = Event;
	$scope.Operation = Operation;
	$scope.Modifier = Modifier;
	$scope.Language = Language;
	$scope.common = common;
	$scope.jQuery = $;

	$scope.globalContent = globalContent;

	NODE && NODE.init(globalContent, $q);

	$scope.loadProject = function() {
		var _promise = NODE.loadProject(globalContent.project);

		_promise.then(function() {
			localStorage.setItem("project", globalContent.project);
			globalContent.isOpen = true;

			$route.reload();
		}, function () {
			$.dialog({
				title: "OPS!",
				content: "Project folder not exist!<br>【文件路径不存在！】",
			});
		});
	};

	/*var _kv = new KV($("#test").html(), true);
	_LOG("KV", 0, "技能列表",_kv);
	$.each(_kv.kvList, function(i, unit) {
		if(typeof  unit.value !== "string") {
			var _ability = Ability.parse(unit, 1);
			console.log("[Ability] 实体：",_ability);
			//return false;
		}
	});*/
});