'use strict';

// ======================================================
// =                        语言                        =
// ======================================================
app.factory("Locale", function() {
	var Locale = function(key) {
		return Locale.langMap[Locale.lang][key] || "NONE";
	};

	Locale.lang = "cn";
	Locale.langMap = {};

	// ========================================
	// =                  CN                  =
	// ========================================
	Locale.langMap["cn"] = {
		// 属性
		BaseClass: "基类",
		AbilityTextureName: "图标",
		ScriptFile: "脚本文件",
		AbilityBehavior: "行为",

		AbilityUnitTargetType: "目标类型",
		AbilityUnitTargetTeam: "目标队伍",
		AbilityUnitTargetFlags: "目标标记",
		AbilityUnitDamageType: "伤害类型",

		AbilityType: "技能类型",
		HotKeyOverride: "热键",
		MaxLevel: "最大等级",
		RequiredLevel: "需求等级",
		LevelsBetweenUpgrades: "升级间隔",

		AbilityCastPoint: "施法前摇",
		AbilityCastAnimation: "施法动作",

		AbilityCooldown: "冷却时间",
		AbilityManaCost: "魔法消耗",
		AbilityCastRange: "施法距离",
		AbilityCastRangeBuffer: "施法距离缓冲",

		AbilityChannelTime: "持续施法时间",
		AbilityChannelledManaCostPerSecond: "持续施法每秒耗魔",
		AOERadius: "AOE范围",

		// 物品
		ID: "ID",
		ItemCost: "花费",
		ItemDroppable: "可丢弃",
		ItemSellable: "可出售",
		ItemShareability: "共享方式",

		ItemPurchasable: "可购买",
		ItemDeclarations: "购买提醒",
		ItemKillable: "可摧毁",
		ItemAlertable: "可提醒",
		ItemPermanent: "永久的",
		ItemInitialCharges: "初始数量",
		ItemRequiresCharges: "需要数量才能使用",
		ItemStackable: "可叠加",
		SideShop: "基地商店",
		SecretShop: "神秘商店",
		ItemCastOnPickup: "拾起使用",
		ItemQuality: "物品质量",
		ItemShopTags: "商店标签",
		ItemAliases: "物品别名",
		MaxUpgradeLevel: "物品最大等级",
		ItemBaseLevel: "物品基础等级",
		ItemRecipe: "合成菜单",
		ItemResult: "合成结果",
		ItemRequirements: "合成需要",
		ItemDisassembleRule: "可拆分",

		// 修饰器
		_name: "名称",
		_comment: "备注",
		Attributes: "属性",
		Duration: "持续时间",
		Passive: "默认拥有",
		TextureName: "图标",
		IsBuff: "正面效果",
		IsDebuff: "负面效果",
		IsHidden: "隐藏图标",
		IsPurgable: "可净化",
		AllowIllusionDuplicate: "幻象可继承",
		_IsAura: "作为光环",
		Aura: "光环赋予的修饰器",
		Aura_Radius: "光环影响半径",
		Aura_Teams: "光环影响队伍",
		Aura_Types: "光环影响类型",
		Aura_Flags: "光环影响标记",
		Aura_ApplyToCaster: "光环影响拥有者",
		EffectName: "特效名",
		EffectAttachType: "特效绑定位置",
		StatusEffectName: "状态特效",
		StatusEffectPriority: "状态特效优先级",
		OverrideAnimation: "覆盖动画",

		Properties: "属性",
		States: "状态",
		Events: "事件",
		Operation: "操作",

		"Event Type": "事件类型",
	};

	return Locale;
});