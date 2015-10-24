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

		// 图标
		fillAttr(_my, "TextureName", "")("图标");


		fillAttr(_my, "IsBuff", "-")("正面效果");
		fillAttr(_my, "IsDebuff", "-")("负面效果");
		fillAttr(_my, "IsHidden", false)("隐藏图标");
		fillAttr(_my, "IsPurgable", true)("可净化");

		fillAttr(_my, "EffectName", "")("特效名");
		fillAttr(_my, "EffectAttachType", "-")("特效绑定位置");

		fillAttr(_my, "StatusEffectName", "")("状态特效");
		fillAttr(_my, "StatusEffectPriority", "")("状态特效优先级");
		fillAttr(_my, "OverrideAnimation", "-")("覆盖动画");

		fillAttr(_my, "Properties", "")("属性");


		return _my;
	};

	_modifier.Attributes = [
		["MODIFIER_ATTRIBUTE_NONE","无",true],
		["MODIFIER_ATTRIBUTE_MULTIPLE","可重复",true],
		["MODIFIER_ATTRIBUTE_PERMANENT","死亡保持",false],
		["MODIFIER_ATTRIBUTE_IGNORE_INVULNERABLE","无敌保持",false],
	];

	_modifier.IsBuff =_modifier.IsDebuff = [
		["-","默认",true],
		["0","不是",false],
		["1","是",false],
	];

	_modifier.EffectAttachType = [
		["-","默认",true],
		["attach_hitloc","受伤点",true],
		["follow_origin","位置",true],
		["follow_overhead","头顶",false],
		["follow_chest","胸部",false],
		["follow_head","头部",false],
		//["start_at_customorigin","",true],
		["world_origin","世界中心",false],
	];

	_modifier.OverrideAnimation = [
		["-","默认",true],
		["ACT_DOTA_ATTACK","攻击",true],
		["ACT_DOTA_CAST_ABILITY_1","施法",true],
		["ACT_DOTA_CHANNEL_ABILITY_1","持续施法"],
		["ACT_DOTA_DISABLED","伤残"],
		["ACT_DOTA_RUN","奔跑"],
		["ACT_DOTA_SPAWN","出生"],
		["ACT_DOTA_TELEPORT","传送"],
		["ACT_DOTA_VICTORY","胜利"],
	];

	return _modifier;
});