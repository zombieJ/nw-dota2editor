'use strict';

var hammerControllers = angular.module('hammerControllers', ['ngRoute', 'app.components']);

hammerControllers.controller('indexCtrl', function ($scope) {
});

hammerControllers.controller('abilityCtrl', function ($scope, $http, NODE, globalContent, KV, Ability, Event, Operation, Modifier, Language) {
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

	$scope.setLanguage = function(language) {
		$scope.language = language;
	};

	// ================================================================
	// =                           文件操作                           =
	// ================================================================
	// 读取技能文件
	if(!globalContent.abilityList) {
		NODE.loadFile(Ability.folderPath, "utf8").then(function(data) {
			var _kv = new KV(data, true);
			$.each(_kv.kvList, function(i, unit) {
				if(typeof  unit.value !== "string") {
					var _ability = Ability.parse(unit, 1);
					_LOG("Ability",0 ,"实体：",_ability._name ,_ability);

					$scope.abilityList.push(_ability);
				}
			});

			globalContent.abilityList = $scope.abilityList;
			$scope.ability = $scope.abilityList[0];

			console.log("Scope >>>",$scope);
		}, function(){
			$.dialog({
				title: "OPS!",
				content: "Can't find npc_abilities_custom.txt <br/> 【打开npc_abilities_custom.txt失败】",
			});
		});
	} else {
		$scope.abilityList = globalContent.abilityList;
		$scope.ability = $scope.abilityList[0];
	}

	// 读取技能文件
	NODE.listFiles(Language.folderPath, /^addon_\w+\.txt$/i).then(function(fileList) {
		$scope.languageList = $.map(fileList, function(fileName) {
			return new Language(fileName);
		});
		$scope.language = $scope.languageList[0];
	}, function(){
		$scope.languageList = [];
	});
});