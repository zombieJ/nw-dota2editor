'use strict';

/* App Module */
var APP_APP_NAME = "Dota2 Editor";
var APP_APP_AUTHOR = "zombieJ";
var APP_APP_GITHUB = "https://github.com/zombieJ/nw-dota2editor";

var app = angular.module('app', ['ngRoute', 'hammerControllers', 'app.components', 'ui.sortable']);

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
	}).when('/language', {
		templateUrl: 'partials/language.html',
		controller: 'languageCtrl'
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

		abilityConfig: null,
		itemConfig: null,

		languageList: [],

		system: {
			hideMenu: true,
		},
	};

	return _globalContent;
});

app.factory("NODE", function() {
	return window.process ? window.process.mainModule.exports : null;
});

app.factory("GUI", function() {
	return require('nw.gui');
});

app.controller('main', function($scope, $route, $location, $q, Ability, Event, Operation, Modifier, Language, KV, Sound, globalContent, NODE) {
	window.Ability = $scope.Ability = Ability;
	window.Event = $scope.Event = Event;
	window.Operation = $scope.Operation = Operation;
	window.Modifier = $scope.Modifier = Modifier;
	window.Language = $scope.Language = Language;
	window.Sound = $scope.Sound = Sound;
	$scope.common = common;
	$scope.jQuery = $;

	$scope.globalContent = globalContent;

	NODE && NODE.init(globalContent, $q);

	$scope.navSelected = function(path) {
		return path === $location.path();
	};

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
			}).finally(function() {
				$route.reload();
			});

			//$route.reload();
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
			var _deferred_file = $q.defer();
			var _deferred_config = $q.defer();
			var _globalListKey = isItem ? "itemList" : "abilityList";
			var _globalConfigKey = isItem ? "abilityConfig" : "itemConfig";
			var _filePath = isItem ? Ability.exportItemFilePath : Ability.exportFilePath;

			// File
			if(!globalContent[_globalListKey]) {
				_deferred_file.resolve(4);
			} else {
				var _writer = new KV.Writer();
				_writer.withHeader("DOTAAbilities", {Version: 1});
				$.each(globalContent[_globalListKey], function(i, ability) {
					_writer.write('');
					ability.doWriter(_writer);
				});
				_writer.withEnd();

				_writer.save(_filePath, "utf8",_deferred_file);
			}

			// Config
			if(!globalContent[_globalConfigKey]) {
				_deferred_config.resolve(4);
			} else {
				_deferred_config = NODE.saveFile(isItem ? Ability.itemConfig : Ability.abilityConfig, "utf8", JSON.stringify(globalContent[_globalConfigKey], null, "\t"));
			}

			var _deferred_all = $q.all([_deferred_file.promise, _deferred_config.promise]).then(function(result) {
				return result[0];
			});

			return _deferred_all;
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
		// =                          保存 【物品】                          =
		// ===================================================================
		{name: "Item", desc: "物品", selected: true, saveFunc: saveAbilityFunc(true)},

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

	// ================================================================
	// =                              UI                              =
	// ================================================================
	// 弹出保存对话框
	$scope.showSaveMDL = function() {
		$("#saveMDL").modal();

		$scope.saveMSG = "";
		$.each($scope.saveFileList, function(i, saveItem) {
			saveItem.status = 0;
		});
	};

	// 隐藏菜单栏
	$(document).on("click.hideMenu", function (e) {
		setTimeout(function() {
			if(globalContent.system.hideMenu) {
				$(".app-menu.app-float-menu").hide();
			}
			globalContent.system.hideMenu = true;
		}, 1);
	});

	// 阻止隐藏菜单
	$(document).on("click.preventHideMenu", ".app-submenu > a", function (e) {
		globalContent.system.hideMenu = false;
	});

	var _refreshMenuID;
	function _refreshMenu(ele) {
		ele = $(ele);

		var _offset = ele.offset();
		var _eleHeight = ele.outerHeight();
		var _winHeight = $(window).height();

		if(_offset.top + _eleHeight > _winHeight) {
			ele.offset({
				top: _winHeight - _eleHeight
			});
		}

		// Sub Menu
		var _subMenu = ele.find(".app-menu:visible:first");
		if(_subMenu.length) _refreshMenu(_subMenu);
	};
	window.refreshMenu = function(ele) {
		ele = $(ele);
		clearInterval(_refreshMenuID);

		_refreshMenuID = setInterval(function() {
			if(ele.is(":visible")) {
				_refreshMenu(ele);
			} else {
				ele.find(".app-menu").css("top", 0);
				clearInterval(_refreshMenuID);
			}
		}, 100);
	};

	// 对话框确认
	$(document).on("keydown.dialog", ".modal-dialog input[type='text']", function (e) {
		if(e.which === 13) {
			$(this).closest(".modal-content").find(".modal-footer .btn-primary").click();
		}
	});

	// ================================================================
	// =                            初始化                            =
	// ================================================================
	Sound.init();
});