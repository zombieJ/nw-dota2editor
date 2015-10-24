'use strict';

// ======================================================
// =                        操作                        =
// ======================================================
app.factory("Modifier", function() {
	function fillAttr(modifier, attr, defaultValue) {
		if(defaultValue === undefined) {
			modifier[attr] = {};
			$.each(_modifier[attr], function(i, item) {
				modifier[attr][item[0]] = false;
			});
		} else {
			modifier[attr] = defaultValue;
		}

		return function(desc, title) {
			modifier._requireList.push({
				attr: attr,
				title: title,
				desc: desc,
			});
		};
	}

	var _modifier = function() {
		var _my = this;
		_my._requireList = [];

		// ========================================
		// =                 属性                 =
		// ========================================
		// 名字
		fillAttr(_my, "_name", "undefined")("修饰器名", "Name");

		// 属性
		fillAttr(_my, "Attributes", "MODIFIER_ATTRIBUTE_NONE")("属性");

		// 持续时间
		fillAttr(_my, "Duration", "")("持续时间");

		// 默认拥有
		fillAttr(_my, "Passive", false)("默认拥有");

		return _my;
	};

	_modifier.Attributes = [
		["MODIFIER_ATTRIBUTE_NONE","无",true],
		["MODIFIER_ATTRIBUTE_MULTIPLE","可重复",true],
		["MODIFIER_ATTRIBUTE_PERMANENT","死亡保持",false],
		["MODIFIER_ATTRIBUTE_IGNORE_INVULNERABLE","无敌保持",false],
	];

	return _modifier;
});