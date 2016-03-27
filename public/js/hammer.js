'use strict';

var hammerControllers = angular.module('hammerControllers', ['ngRoute', 'app.components','ui.bootstrap']);

hammerControllers.controller('indexCtrl', function ($scope) {
});

hammerControllers.controller('kvCtrl', function ($scope, KV) {
	$scope.kv1 = new KV("Test1", "Fuck!");
	$scope.kv2 = KV.parse('"Test2" { "LV2" "Yes!" "LV2" { "God!" "No!" }}');
});