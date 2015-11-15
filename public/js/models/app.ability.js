'use strict';

// ======================================================
// =                        技能                        =
// ======================================================
app.factory("Ability", function($q, Event, Modifier) {
	var Ability = function(isItem) {
		var _my = this;
		_my._attrList = [];
		_my._attrItemList = [];
		_my._isItem = isItem;
		_my._changed = false;
		_my._oriContent = null;

		// ========================================
		// =                 属性                 =
		// ========================================
		// 名字
		_my._name = "undefined";

		// 备注
		_my._comment = "";

		// 基类
		this.fillAttr("common", "BaseClass", "text", "ability_datadriven");

		// 图标
		this.fillAttr("common", "AbilityTextureName", "text", "");

		// 脚本文件
		this.fillAttr("common", "ScriptFile", "text", "").showFunc = function() {
			return _my.BaseClass === "ability_lua";
		};

		// 行为
		this.fillAttr("common", "AbilityBehavior", "group");

		// 目标类型
		this.fillAttr("target", "AbilityUnitTargetType", "group");

		// 目标队伍
		this.fillAttr("target", "AbilityUnitTargetTeam", "single", "DOTA_UNIT_TARGET_TEAM_NONE");

		// 目标标记
		this.fillAttr("target", "AbilityUnitTargetFlags", "group");

		// 伤害类型
		this.fillAttr("target", "AbilityUnitDamageType", "single", "-");

		// 技能类型
		this.fillAttr("skill", "AbilityType", "single", "DOTA_ABILITY_TYPE_BASIC");

		// 热键
		this.fillAttr("skill", "HotKeyOverride", "text", "");

		// 最大等级
		this.fillAttr("skill", "MaxLevel", "text","4");

		// 需要等级
		this.fillAttr("skill", "RequiredLevel", "text","1");

		// 升级等级间隔
		this.fillAttr("skill", "LevelsBetweenUpgrades", "text","2");

		// 施法前摇
		this.fillAttr("animation", "AbilityCastPoint", "text","0");

		// 施法动作
		this.fillAttr("animation", "AbilityCastAnimation", "text","");

		// 冷却时间
		this.fillAttr("usage", "AbilityCooldown","text","0");

		// 魔法消耗
		this.fillAttr("usage", "AbilityManaCost","text","0");

		// 施法距离
		this.fillAttr("usage", "AbilityCastRange","text","0");

		// 施法距离缓冲
		this.fillAttr("usage", "AbilityCastRangeBuffer","text","0");

		// Channel
		var _channelFunc = function() {
			return _my.AbilityBehavior["DOTA_ABILITY_BEHAVIOR_CHANNELLED"] === true;
		};
		// 持续施法时间
		this.fillAttr("usage", "AbilityChannelTime","text","0").showFunc = _channelFunc;

		// 持续施法每秒耗魔
		this.fillAttr("usage", "AbilityChannelledManaCostPerSecond","text","0").showFunc = _channelFunc;

		// AOE范围
		this.fillAttr("usage", "AOERadius","text","0").showFunc = function() {
			return _my.AbilityBehavior["DOTA_ABILITY_BEHAVIOR_AOE"] === true;
		};

		// ========================================
		// =                 物品                 =
		// ========================================
		if (isItem) {
			this.fillAttr("item", "ID", "text", "");
			this.fillAttr("item", "ItemCost", "text", "0");
			this.fillAttr("item", "ItemDroppable", "boolean", true);
			this.fillAttr("item", "ItemSellable", "boolean", true);
			this.fillAttr("item", "ItemShareability", "single", "-");

			this.fillAttr("item", "ItemPurchasable", "single", "-");
			this.fillAttr("item", "ItemDeclarations", "group", "-");
			this.fillAttr("item", "ItemKillable", "boolean", true);
			this.fillAttr("item", "ItemAlertable", "boolean", false);
			this.fillAttr("item", "ItemPermanent", "single", "-");
			this.fillAttr("item", "ItemInitialCharges", "text", "");
			this.fillAttr("item", "ItemRequiresCharges", "single", "-");
			this.fillAttr("item", "ItemStackable", "boolean", false);
			this.fillAttr("item", "SideShop", "text", "-");
			this.fillAttr("item", "SecretShop", "text", "-");
			this.fillAttr("item", "ItemCastOnPickup", "boolean", false);
			this.fillAttr("item", "ItemQuality", "single", "");
			this.fillAttr("item", "ItemShopTags", "text", "");
			this.fillAttr("item", "ItemAliases", "text", "");
			this.fillAttr("item", "MaxUpgradeLevel", "text", "");
			this.fillAttr("item", "ItemBaseLevel", "text", "");
			this.fillAttr("item", "ItemRecipe", "boolean", false);
			this.fillAttr("item", "ItemResult", "text", "");
			this.fillAttr("item", "ItemRequirements", "blob", "");  // TODO: 合成公式！
			this.fillAttr("item", "ItemDisassembleRule", "single", "-");
		}

		// ========================================
		// =                 事件                 =
		// ========================================
		_my._eventList = [];

		// ========================================
		// =                修饰器                =
		// ========================================
		_my._modifierList = [];

		// ========================================
		// =                自定义                =
		// ========================================
		_my._abilitySpecialList = [];

		// ========================================
		// =                 语言                 =
		// ========================================
		_my._languages = {};

		return this;
	};

	Ability.prototype.fillAttr = function(group, attr, type, defaultValue) {
		var _my = this;
		var _list = group.match(/^item/) ? _my._attrItemList : _my._attrList;

		// Get group
		var _group = common.array.find(group, _list, "name");
		if(!_group) {
			_group = {
				name: group,
				list: [],
			};
			_list.push(_group);
		}

		// Fill value
		if(type === "group") {
			_my[attr] = {};
			$.each(Ability[attr], function(i, item) {
				_my[attr][item[0]] = false;
			});
		} else {
			_my[attr] = defaultValue;
		}

		// Config unit
		var _unit = {
			attr: attr,
			type: type,

			// Display logic
			showFunc: null,
		};

		_group.list.push(_unit);
		return _unit;
	};

	// ================================================
	// =                     特效                     =
	// ================================================
	Ability.prototype.getPrecacheList = function() {
		var _list = [];

		// Particle File
		// Sound File
		// TODO: model File

		$.each(this._eventList, function(i, event) {
			_list = _list.concat(event.getPrecacheList());
		});

		$.each(this._modifierList, function(i, modifier) {
			_list = _list.concat(modifier.getPrecacheList());
		});

		return _list;
	};

	// ================================================
	// =                     解析                     =
	// ================================================
	Ability.parse = function(kvUnit, isItem, lvl) {
		lvl = lvl || 0;
		_LOG("KV", lvl, "└ 技能：",kvUnit.key, kvUnit);

		var _ability = new Ability(isItem);
		_ability._name = kvUnit.key;
		_ability._comment = kvUnit.comment;
		_ability._oriContent = kvUnit;

		$.each(kvUnit.value, function(i, unit) {
			var _attr = null;
			$.each(_ability._attrList, function(i, group) {
				_attr = common.array.find(unit.key, group.list, "attr", false, false);
				if(_attr) return false;
			});
			if(!_attr) {
				$.each(_ability._attrItemList, function (i, group) {
					_attr = common.array.find(unit.key, group.list, "attr", false, false);
					if (_attr) return false;
				});
			}

			// 匹配 _attrList
			if(_attr) {
				unit.key = _attr.attr;

				switch (typeof _ability[unit.key]) {
					case "string":
						_ability[unit.key] = unit.value;
						break;
					case "boolean":
						_ability[unit.key] = unit.value === "1";
						break;
					case "object":
						$.each(unit.value.split("|"), function (i, _value) {
							_value = _value.trim();
							if (_value in _ability[unit.key]) {
								_ability[unit.key][_value] = true;
							} else {
								_WARN("KV", lvl + 1, "Ability value not match:", unit.key, _value);
							}
						});
						break;
					default :
						_WARN("KV", lvl + 1, "Unmatched Ability type:", unit.key, _ability[unit.key]);
				}
			}

			// 匹配 Event
			else if(common.array.find(unit.key, Event.EventList, "0")) {
				_ability._eventList.push(Event.parse(unit, lvl + 1));
			}

			// 匹配 Modifiers
			else if(unit.key === "Modifiers") {
				_LOG("KV", lvl + 1, "└ 修饰器列表", unit.value);
				$.each(unit.value, function(i, _modifier) {
					_ability._modifierList.push(Modifier.parse(_modifier, lvl + 2));
				});
			}

			// 匹配 Modifiers
			else if(unit.key === "AbilitySpecial") {
				_LOG("KV", lvl + 1, "└ 自定义值列表", unit.value);
				_ability._abilitySpecialList = $.map(unit.value, function(asUnit) {
					return [[asUnit.value[1].key, asUnit.value[0].value, asUnit.value[1].value]];
				});
			}

			// 匹配 precache
			else if(unit.key === "precache") {
				// 不作为
			}

			// 不匹配
			else {
				_WARN("KV", lvl + 1, "Unmatched Ability key:", unit.key, unit.value);
			}
		});
		return _ability;
	};

	// ================================================
	// =                    格式化                    =
	// ================================================
	Ability.prototype.doWriter = function(writer) {
		// If not change, don't override
		if(!this._changed) {
			if(typeof this._oriContent === "object") {
				writer.writeContent(this._oriContent.toString());
			} else {
				writer.writeComment(this._comment);
				writer.writeContent(this._oriContent);
			}
			return;
		} else {
			writer.writeComment(this._comment);
		}

		var _writerStartLoc = writer._data.length;

		// 名称
		writer.write('"$1"', this._name);
		writer.write('{');

		// 物品属性
		if (this._attrItemList.length) {
			writer.writeComment('Item');
			writer.withAttrList(this, this._attrItemList);
		}

		// 常规属性
		writer.writeComment('Common');
		writer.withAttrList(this, this._attrList);

		// 预载入特效
		var _precacheList = this.getPrecacheList();
		if(_precacheList.length) {
			writer.write('');
			writer.write('"precache"');
			writer.write('{');
			$.each(_precacheList, function (i, _effectUnit) {
				writer.write('"$1"		"$2"', _effectUnit[0], _effectUnit[1]);
			});
			writer.write('}');
		}

		// 事件
		if(this._eventList.length) {
			writer.write('');

			$.each(this._eventList, function (i, event) {
				if(i !== 0) writer.write('');

				event.doWriter(writer);
			});
		}

		// 修饰器
		if(this._modifierList.length) {
			writer.write('');
			writer.write('"Modifiers"');
			writer.write('{');

			$.each(this._modifierList, function (i, modifier) {
				if(i !== 0) writer.write('');

				modifier.doWriter(writer);
			});

			writer.write('}');
		}

		// 自定义值
		if(this._abilitySpecialList.length) {
			writer.write('');
			writer.write('"AbilitySpecial"');
			writer.write('{');

			$.each(this._abilitySpecialList, function (i, _specialUnit) {
				writer.write('"$1"', common.text.preFill(i+1, "0", 2));
				writer.write('{');
				writer.write('"var_type"		"$1"', _specialUnit[1]);
				writer.write('"$1"		"$2"', _specialUnit[0], _specialUnit[2]);
				writer.write('}');
			});

			writer.write('}');
		}

		writer.write('}');

		// Get update ability content
		this._oriContent = writer._data.slice(_writerStartLoc);

		return writer;
	};

	// ================================================
	// =                     常量                     =
	// ================================================
	Ability.filePath = "scripts/npc/npc_abilities_custom.txt";
	Ability.exportFilePath = "scripts/npc/npc_abilities_custom.txt";

	Ability.itemFilePath = "scripts/npc/npc_items_custom.txt";
	Ability.exportItemFilePath = "scripts/npc/npc_items_custom.txt";

	Ability.abilityConfig = ".dota2editor/ability.conf";
	Ability.itemConfig = ".dota2editor/item.conf";

	// ================================================
	// =                     属性                     =
	// ================================================
	Ability.ItemShareability = [
		["ITEM_FULLY_SHAREABLE","都可以共享"],
		["ITEM_FULLY_SHAREABLE_STACKING","库存共享"],
		["ITEM_NOT_SHAREABLE","不可共享"],
		["ITEM_PARTIALLY_SHAREABLE","部分共享"],
	];

	Ability.ItemDeclarations = [
		["DECLARE_PURCHASES_IN_SPEECH","语音"],
		["DECLARE_PURCHASES_TO_SPECTATORS","观众"],
		["DECLARE_PURCHASES_TO_TEAMMATES","播音员"],
	];

	Ability.ItemQuality = [
		["component","组件"],
		["rare","稀有(蓝)"],
		["epic","史诗(紫)"],
		["common","常见(绿)"],
		["consumable","消耗品(白)"],
		["secret_shop","神秘商店(青蓝)"],
		["artifact","神器(橙)"],
	];

	Ability.ItemDisassembleRule = [
		["-","无"],
		["DOTA_ITEM_DISASSEMBLE_ALWAYS","可拆分"],
		["DOTA_ITEM_DISASSEMBLE_NEVER","不可拆分"],
	];

	Ability.ItemPurchasable = Ability.ItemPermanent = Ability.ItemRequiresCharges = [
		["-","无"],
		["0","否"],
		["1","是"],
	];

	Ability.AbilityBehavior = [
		["DOTA_ABILITY_BEHAVIOR_IMMEDIATE","立即",true],
		["DOTA_ABILITY_BEHAVIOR_HIDDEN","隐藏", true],
		["DOTA_ABILITY_BEHAVIOR_PASSIVE","被动", true],
		["DOTA_ABILITY_BEHAVIOR_NO_TARGET","无目标", true],
		["DOTA_ABILITY_BEHAVIOR_UNIT_TARGET","目标", true],
		["DOTA_ABILITY_BEHAVIOR_POINT","点", true],
		["DOTA_ABILITY_BEHAVIOR_AOE","AOE", true],
		["DOTA_ABILITY_BEHAVIOR_CHANNELLED","持续施法", true],
		["DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE","不可学习"],
		["DOTA_ABILITY_BEHAVIOR_ITEM","物品？"],
		["DOTA_ABILITY_BEHAVIOR_TOGGLE","开关"],
		["DOTA_ABILITY_BEHAVIOR_DIRECTIONAL","方向"],
		["DOTA_ABILITY_BEHAVIOR_AUTOCAST","自动施法"],
		["DOTA_ABILITY_BEHAVIOR_NOASSIST","无辅助网格"],
		["DOTA_ABILITY_BEHAVIOR_AURA","光环（无用）"],
		["DOTA_ABILITY_BEHAVIOR_ATTACK","法球"],
		["DOTA_ABILITY_BEHAVIOR_DONT_RESUME_MOVEMENT","不恢复移动"],
		["DOTA_ABILITY_BEHAVIOR_ROOT_DISABLES","定身无法释放"],
		["DOTA_ABILITY_BEHAVIOR_UNRESTRICTED","无视限制"],
		["DOTA_ABILITY_BEHAVIOR_IGNORE_PSEUDO_QUEUE","总有效-自动施法"],
		["DOTA_ABILITY_BEHAVIOR_IGNORE_CHANNEL","施法打断有效"],
		["DOTA_ABILITY_BEHAVIOR_DONT_CANCEL_MOVEMENT","不影响移动"],
		["DOTA_ABILITY_BEHAVIOR_DONT_ALERT_TARGET","不惊醒目标"],
		["DOTA_ABILITY_BEHAVIOR_DONT_RESUME_ATTACK","不恢复攻击"],
		["DOTA_ABILITY_BEHAVIOR_NORMAL_WHEN_STOLEN","偷取保持前摇"],
		["DOTA_ABILITY_BEHAVIOR_IGNORE_BACKSWING","无视后摇"],
		["DOTA_ABILITY_BEHAVIOR_RUNE_TARGET","神符目标"],
	];

	Ability.AbilityUnitTargetType = [
		["DOTA_UNIT_TARGET_HERO","英雄", true],
		["DOTA_UNIT_TARGET_BASIC","基本", true],
		["DOTA_UNIT_TARGET_ALL","所有"],
		["DOTA_UNIT_TARGET_BUILDING","建筑"],
		["DOTA_UNIT_TARGET_COURIER","信使"],
		["DOTA_UNIT_TARGET_CREEP","野怪"],
		["DOTA_UNIT_TARGET_CUSTOM","普通"],
		["DOTA_UNIT_TARGET_MECHANICAL","机械"],
		["DOTA_UNIT_TARGET_NONE","无"],
		["DOTA_UNIT_TARGET_OTHER","其他"],
		["DOTA_UNIT_TARGET_TREE","树木"],
	];

	Ability.AbilityUnitTargetTeam = [
		["DOTA_UNIT_TARGET_TEAM_BOTH","双方队伍", true],
		["DOTA_UNIT_TARGET_TEAM_ENEMY","敌方队伍", true],
		["DOTA_UNIT_TARGET_TEAM_FRIENDLY","友方队伍", true],
		["DOTA_UNIT_TARGET_TEAM_CUSTOM","普通队伍"],
		["DOTA_UNIT_TARGET_TEAM_NONE","无"],
	];

	Ability.AbilityUnitTargetFlags = [
		["DOTA_UNIT_TARGET_FLAG_CHECK_DISABLE_HELP","检测玩家'禁用帮助'选项"],
		["DOTA_UNIT_TARGET_FLAG_DEAD","已死亡"],
		["DOTA_UNIT_TARGET_FLAG_FOW_VISIBLE","*暂无说明*"],
		["DOTA_UNIT_TARGET_FLAG_INVULNERABLE","无敌"],
		["DOTA_UNIT_TARGET_FLAG_MAGIC_IMMUNE_ENEMIES","魔法免疫的敌人"],
		["DOTA_UNIT_TARGET_FLAG_MANA_ONLY","*暂无说明*"],
		["DOTA_UNIT_TARGET_FLAG_MELEE_ONLY","*暂无说明*"],
		["DOTA_UNIT_TARGET_FLAG_NO_INVIS","不是隐形的"],
		["DOTA_UNIT_TARGET_FLAG_NONE","无"],
		["DOTA_UNIT_TARGET_FLAG_NOT_ANCIENTS","不是远古"],
		["DOTA_UNIT_TARGET_FLAG_NOT_ATTACK_IMMUNE","不是攻击免疫"],
		["DOTA_UNIT_TARGET_FLAG_NOT_CREEP_HERO","不是野怪"],
		["DOTA_UNIT_TARGET_FLAG_NOT_DOMINATED","不可控制的"],
		["DOTA_UNIT_TARGET_FLAG_NOT_ILLUSIONS","不是幻象"],
		["DOTA_UNIT_TARGET_FLAG_NOT_MAGIC_IMMUNE_ALLIES","不是魔法免疫的盟友"],
		["DOTA_UNIT_TARGET_FLAG_NOT_NIGHTMARED","非被催眠的"],
		["DOTA_UNIT_TARGET_FLAG_NOT_SUMMONED","非召唤的"],
		["DOTA_UNIT_TARGET_FLAG_OUT_OF_WORLD","被放逐出世界的"],
		["DOTA_UNIT_TARGET_FLAG_PLAYER_CONTROLLED","玩家控制的"],
		["DOTA_UNIT_TARGET_FLAG_RANGED_ONLY","范围唯一的"],
	];

	Ability.AbilityUnitDamageType = [
		["-","无",true],
		["DAMAGE_TYPE_MAGICAL","魔法伤害",true],
		["DAMAGE_TYPE_PHYSICAL","物理伤害",true],
		["DAMAGE_TYPE_PURE","纯粹伤害",true],
	];

	Ability.AbilityType = [
		["DOTA_ABILITY_TYPE_BASIC","普通技能",true],
		["DOTA_ABILITY_TYPE_ULTIMATE","终极技能"],
		["DOTA_ABILITY_TYPE_ATTRIBUTES","用于属性奖励"],
		["DOTA_ABILITY_TYPE_HIDDEN","干啥的?"],
	];

	Ability.AbilityCastAnimation = [
		["","默认",true],
		["ACT_DOTA_ATTACK","攻击",true],
		["ACT_DOTA_CAST_ABILITY_1","施法",true],
		["ACT_DOTA_CHANNEL_ABILITY_1","持续施法"],
		["ACT_DOTA_DISABLED","伤残"],
		["ACT_DOTA_RUN","奔跑"],
		["ACT_DOTA_SPAWN","出生"],
		["ACT_DOTA_TELEPORT","传送"],
		["ACT_DOTA_VICTORY","胜利"],
	];

	Ability.AbilitySpecialType = [
		["FIELD_INTEGER", "int", true],
		["FIELD_FLOAT", "float", true],
	];

	return Ability;
});