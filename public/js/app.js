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
	}).when('/item', {
		templateUrl: 'partials/ability.html',
		controller: 'itemCtrl'
	}).otherwise({
		redirectTo : '/index'
	});
});

app.factory("globalContent", function() {
	var _globalContent = {
		project: localStorage.getItem("project"),
		isOpen: false,
		abilityList: null,
		itemList: null,
		languageList: [],
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

			// 总是读取多语言文件
			var _listFilesPromise = NODE.listFiles(Language.folderPath, Language.fileNameRegex);
			globalContent.languageList._promise = _listFilesPromise;
			_listFilesPromise.then(function(fileList) {
				common.array.replace(globalContent.languageList, $.map(fileList, function(fileName) {
					return new Language(fileName);
				}));
			}, function(){
				common.array.replace(globalContent.languageList, []);
			});

			$route.reload();
		}, function () {
			$.dialog({
				title: "OPS!",
				content: "Project folder not exist!<br>【文件路径不存在！】",
			});
		});
	};

	// 保存项目
	function saveAbilityFunc(isItem) {
		return function() {
			var _deferred = $q.defer();
			var _globalListKey = isItem ? "itemList" : "abilityList";
			var _filePath = isItem ? Ability.exportItemFilePath : Ability.exportFilePath;

			if(!globalContent[_globalListKey]) {
				_deferred.resolve(4);
			} else {
				var _writer = new KV.Writer();
				_writer.withHeader("DOTAAbilities", {Version: 1});
				$.each(globalContent[_globalListKey], function(i, ability) {
					_writer.write('');
					ability.doWriter(_writer);
				});
				_writer.withEnd();

				_writer.save(_filePath, "utf8",_deferred);
			}
			return _deferred.promise;
		};
	}

	$scope.saveMSG = "";
	$scope.saveLock = false;
	$scope.saveFileList = [
		// ===================================================================
		// =                          保存 【技能】                          =
		// ===================================================================
		{name: "Ability", desc: "技能", selected: true, saveFunc: saveAbilityFunc(false)},

		// ===================================================================
		// =                          保存 【语言】                          =
		// ===================================================================
		{name: "Language", desc: "语言", selected: true, saveFunc: function() {
			var _deferred = $q.defer();

			if(!globalContent.languageList) {
				_deferred.resolve(4);
			} else {
				var _promiseList = [];

				$.each(globalContent.languageList, function(i, language) {
					var _writer = new KV.Writer();
					_writer.withHeader("lang", {Language: language.name});
					_writer.write('"Tokens"');
					_writer.write('{');

					$.each(language.map, function(key, value) {
						_writer.write('"$1"		"$2"', key, value);
					});

					_writer.write('}');
					_writer.withEnd();

					_promiseList.push(_writer.save(Language.folderPath + "/" + language.fileName.replace(/^_/, "").replace(/\.bac/, ""), "ucs2"));
					$q.all(_promiseList).then(function() {
						_deferred.resolve();
					}, function() {
						_deferred.reject();
					});
				});
			}
			return _deferred.promise;
		}},
	];




	// 保存文件
	// 状态码：0 初始化；1 运行中；2 成功；3 失败；4 未变更
	$scope.saveFiles = function() {
		$scope.saveLock = true;
		var _promiseList = [];

		$.each($scope.saveFileList, function(i, saveItem) {
			if(!saveItem.selected || !saveItem.saveFunc) return;

			saveItem.status = 1;
			var _promise = saveItem.saveFunc();
			_promiseList.push(_promise);

			_promise.then(function(statusCode) {
				saveItem.status = statusCode !== undefined ? statusCode : 2;
			},function() {
				saveItem.status = 3;
			});
		});

		$q.all(_promiseList).finally(function() {
			$scope.saveMSG = "Finished! 【完成】";
			$scope.saveLock = false;
		});
	};

	// 弹出保存对话框
	$scope.showSaveMDL = function() {
		$("#saveMDL").modal();

		$scope.saveMSG = "";
		$.each($scope.saveFileList, function(i, saveItem) {
			saveItem.status = 0;
		});
	};
});