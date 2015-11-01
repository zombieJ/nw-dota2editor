'use strict';

/* App Module */
var APP_APP_NAME = "Dota2 Editor";
var APP_APP_AUTHOR = "zombieJ";
var APP_APP_GITHUB = "https://github.com/zombieJ/nw-dota2editor";

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
		abilityList: null,
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

	// 载入项目
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

	// 保存项目
	$scope.saveMSG = "";
	$scope.saveLock = false;
	$scope.saveFileList = [
		// 保存 【技能】
		{name: "Ability", desc: "技能", selected: true, saveFunc: function() {
			var _deferred = $q.defer();

			if(!globalContent.abilityList) {
				_deferred.resolve();
			} else {
				var _writer = new KV.Writer();
				_writer.withHeader("DOTAAbilities");
				$.each(globalContent.abilityList, function(i, ability) {
					_writer.write('');
					ability.doWriter(_writer);

					//return false;
				});
				_writer.withEnd();

				_writer.save(Ability.exportFolderPath, "utf8",_deferred);
			}
			return _deferred.promise;
		}},

		// 保存 【语言】
		{name: "Language", desc: "语言", selected: false, ready: false},
	];
	$scope.showSaveMDL = function() {
		$("#saveMDL").modal();

		$scope.saveMSG = "";
		$.each($scope.saveFileList, function(i, saveItem) {
			saveItem.status = 0;
		});
	};
	$scope.saveFiles = function() {
		$scope.saveLock = true;
		var _promiseList = [];

		$.each($scope.saveFileList, function(i, saveItem) {
			if(!saveItem.selected || !saveItem.saveFunc) return;

			saveItem.status = 1;
			var _promise = saveItem.saveFunc();
			_promiseList.push(_promise);

			_promise.then(function() {
				saveItem.status = 2;
			},function() {
				saveItem.status = 3;
			});
		});

		$q.all(_promiseList).finally(function() {
			$scope.saveMSG = "Finished! 【完成】";
			$scope.saveLock = false;
		});
	};
});