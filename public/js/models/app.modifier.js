'use strict';

// ======================================================
// =                        操作                        =
// ======================================================
app.factory("Modifier", function(Event) {
	function fillAttr(modifier, attr, defaultValue) {
		if(defaultValue === undefined) {
			modifier[attr] = {};
			$.each(Modifier[attr], function(i, item) {
				modifier[attr][item[0]] = false;
			});
		} else {
			modifier[attr] = defaultValue;
		}

		return function(desc, title, type) {
			modifier._requireList.push({
				attr: attr,
				title: title,
				desc: desc,
				type: type,
			});
		};
	}

	var _id = 0;
	var Modifier = function() {
		var _my = this;
		_my._requireList = [];
		_my._innerID = ++_id;

		// ========================================
		// =                 属性                 =
		// ========================================
		// 名字
		fillAttr(_my, "_name", "undefined")("修饰器名", "Name");

		// 备注
		fillAttr(_my, "_comment", "")("备注", "Comment", "blob");

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
		fillAttr(_my, "IsHidden", "-")("隐藏图标");
		fillAttr(_my, "IsPurgable", "-")("可净化");

		fillAttr(_my, "AllowIllusionDuplicate", "-")("幻象可继承");

		// 光环
		fillAttr(_my, "Aura", "")("光环赋予的修饰器");
		fillAttr(_my, "Aura_Radius", "")("光环影响半径");
		fillAttr(_my, "Aura_Teams")("光环影响队伍");
		fillAttr(_my, "Aura_Types")("光环影响类型");
		fillAttr(_my, "Aura_Flags")("光环影响标记");
		fillAttr(_my, "Aura_ApplyToCaster", "-")("光环影响拥有者");

		// 特效
		fillAttr(_my, "EffectName", "")("特效名");
		fillAttr(_my, "EffectAttachType", "-")("特效绑定位置");

		// 状态特效
		fillAttr(_my, "StatusEffectName", "")("状态特效");
		fillAttr(_my, "StatusEffectPriority", "")("状态特效优先级");
		fillAttr(_my, "OverrideAnimation", "-")("覆盖动画");

		_my._propertyList = [];
		_my._stateList = [];
		_my._eventList = [];

		return _my;
	};

	Modifier.prototype.getPrecacheList = function() {
		var _list = [];

		$.each(this._eventList, function(i, event) {
			_list = _list.concat(event.getPrecacheList());
		});

		if(this.EffectName) _list.push(["particle", this.EffectName]);

		return _list;
	};

	// ================================================
	// =                     解析                     =
	// ================================================
	Modifier.parse = function(kvUnit, lvl) {
		_LOG("KV", lvl, "└ 修饰器：", kvUnit.value.title,kvUnit);

		var _modifier = new Modifier();
		_modifier._name = kvUnit.value.title;
		_modifier._comment = kvUnit.value.comment;

		var _ThinkIntervalList = [];

		$.each(kvUnit.value.kvList, function(i, unit) {
			var _attr = common.array.find(unit.key, _modifier._requireList, "attr", false, false);

			// 匹配 _requireList
			if (_attr) {
				unit.key = _attr.attr;

				switch (typeof _modifier[unit.key]) {
					case "boolean":
						_modifier[unit.key] = unit.value === "1" || unit.value === "true" || unit.value === "MODIFIER_STATE_VALUE_ENABLED";
						break;
					case "string":
						_modifier[unit.key] = unit.value;
						break;
					case "object":
						$.each(unit.value.split("|"), function (i, _value) {
							_value = _value.trim();
							if (_value in _modifier[unit.key]) {
								_modifier[unit.key][_value] = true;
							} else {
								_WARN("KV", lvl + 1, "Modifier value not match:", unit.key, _value);
							}
						});
						break;
					default :
						_WARN("KV", lvl + 1, "Unmatched Modifier type:", unit.key, _modifier[unit.key]);
				}
			}

			// 匹配 Properties
			else if(unit.key === "Properties") {
				_LOG("KV", lvl + 1, "└ 修饰器属性", unit.value);
				$.each(unit.value.kvList, function(i, _prop) {
					_modifier._propertyList.push([_prop.key, _prop.value]);
				});
			}

			// 匹配 States
			else if(unit.key === "States") {
				_LOG("KV", lvl + 1, "└ 修饰器状态", unit.value);
				$.each(unit.value.kvList, function(i, _state) {
					_modifier._stateList.push([_state.key, _state.value]);
				});
			}

			// 匹配 Event
			else if(common.array.find(unit.key, Event.ModifierEventList, "0")) {
				_LOG("KV", lvl + 1, "└ 修饰器事件", unit.value);
				_modifier._eventList.push(Event.parse(unit, lvl + 1));
			}
			// 匹配 ThinkInterval
			else if(unit.key === "ThinkInterval") {
				_LOG("KV", lvl + 1, "└ 修饰器计时器", unit.value);
				_ThinkIntervalList.push(unit.value);
			}

			// 不匹配
			else {
				_WARN("KV", lvl + 1, "Unmatched Modifier key:", unit.key);
			}
		});

		// 计时器赋值
		$.each(_modifier._eventList, function(i, event) {
			if(event._name === "OnIntervalThink") {
				event.ThinkInterval = _ThinkIntervalList.shift();
			}
		});

		return _modifier;
	};

	// ================================================
	// =                    格式化                    =
	// ================================================
	Modifier.prototype.doWriter = function(writer) {
		writer.writeComment(this._comment);

		// 名称
		writer.write('"$1"', this._name);
		writer.write('{');

		// 常规属性
		writer.withKVList(this, this._requireList);

		// 修饰器属性
		if(this._propertyList.length) {
			writer.write('"Properties"');
			writer.write("{");
			$.each(this._propertyList, function(i, _propUnit) {
				writer.write('"$1"		"$2"', _propUnit[0], _propUnit[1]);
			});
			writer.write("}");
		}

		// 修饰器状态
		if(this._stateList.length) {
			writer.write('"States"');
			writer.write("{");
			$.each(this._stateList, function(i, _stateUnit) {
				writer.write('"$1"		"$2"', _stateUnit[0], _stateUnit[1]);
			});
			writer.write("}");
		}

		// 修饰器事件
		if(this._eventList.length) {
			writer.write('');

			$.each(this._eventList, function (i, event) {
				if(i !== 0) writer.write('');

				event.doWriter(writer);
			});
		}

		writer.write('}');
		return writer;
	};

	Modifier.Aura_Teams = [
		["DOTA_UNIT_TARGET_TEAM_BOTH","双方队伍", true],
		["DOTA_UNIT_TARGET_TEAM_ENEMY","敌方队伍", true],
		["DOTA_UNIT_TARGET_TEAM_FRIENDLY","友方队伍", true],
		["DOTA_UNIT_TARGET_TEAM_CUSTOM","普通队伍"],
		["DOTA_UNIT_TARGET_TEAM_NONE","无"],
	];

	Modifier.Aura_Types = [
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

	Modifier.Aura_Flags = [
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

	Modifier.Attributes = [
		["MODIFIER_ATTRIBUTE_NONE","无",true],
		["MODIFIER_ATTRIBUTE_MULTIPLE","可重复",true],
		["MODIFIER_ATTRIBUTE_PERMANENT","死亡保持",false],
		["MODIFIER_ATTRIBUTE_IGNORE_INVULNERABLE","无敌保持",false],
	];

	Modifier.AllowIllusionDuplicate = Modifier.IsBuff = Modifier.IsDebuff = Modifier.IsHidden = Modifier.IsPurgable = Modifier.Aura_ApplyToCaster = [
		["-","默认",true],
		["0","不是",false],
		["1","是",false],
	];

	Modifier.EffectAttachType = [
		["-","默认",true],
		["attach_hitloc","受伤点",true],
		["follow_origin","位置",true],
		["follow_overhead","头顶",false],
		["follow_chest","胸部",false],
		["follow_head","头部",false],
		//["start_at_customorigin","",true],
		["world_origin","世界中心",false],
	];

	Modifier.OverrideAnimation = [
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

	Modifier.Properties = [
		["MODIFIER_PROPERTY_ABSOLUTE_NO_DAMAGE_MAGICAL","魔法攻击无效"],
		["MODIFIER_PROPERTY_ABSOLUTE_NO_DAMAGE_PHYSICAL","物理攻击无效"],
		["MODIFIER_PROPERTY_ABSOLUTE_NO_DAMAGE_PURE","纯粹攻击无效"],
		["MODIFIER_PROPERTY_ABSORB_SPELL","偷取法术？"],
		["MODIFIER_PROPERTY_ATTACK_RANGE_BONUS","攻击范围奖励"],
		["MODIFIER_PROPERTY_ATTACKSPEED_BONUS_CONSTANT","修改攻击速度"],
		["MODIFIER_PROPERTY_ATTACKSPEED_BONUS_CONSTANT_POWER_TREADS","？"],
		["MODIFIER_PROPERTY_ATTACKSPEED_BONUS_CONSTANT_SECONDARY","？"],
		["MODIFIER_PROPERTY_AVOID_CONSTANT","虚空假面闪避？"],
		["MODIFIER_PROPERTY_AVOID_SPELL","虚空假面法术闪避？"],
		["MODIFIER_PROPERTY_BASEATTACK_BONUSDAMAGE","修改基础攻击力"],
		["MODIFIER_PROPERTY_BASE_ATTACK_TIME_CONSTANT","修改基础攻击间隔"],
		["MODIFIER_PROPERTY_BASEDAMAGEOUTGOING_PERCENTAGE","百分比修改基础伤害"],
		["MODIFIER_PROPERTY_BASE_MANA_REGEN","修改基础魔法恢复数值"],
		["MODIFIER_PROPERTY_BONUS_DAY_VISION","奖励白天视野"],
		["MODIFIER_PROPERTY_BONUS_NIGHT_VISION","奖励黑夜视野"],
		["MODIFIER_PROPERTY_BONUS_VISION_PERCENTAGE","奖励百分比视野"],
		["MODIFIER_PROPERTY_CHANGE_ABILITY_VALUE","改变技能数值"],
		["MODIFIER_PROPERTY_COOLDOWN_REDUCTION_CONSTANT","减少冷却时间"],
		["MODIFIER_PROPERTY_DAMAGEOUTGOING_PERCENTAGE","百分比修改攻击力，负降正升"],
		["MODIFIER_PROPERTY_DAMAGEOUTGOING_PERCENTAGE_ILLUSION","百分比修改幻象攻击力"],
		["MODIFIER_PROPERTY_DEATHGOLDCOST","修改死亡损失的金钱"],
		["MODIFIER_PROPERTY_DISABLE_AUTOATTACK","禁止自动攻击"],
		["MODIFIER_PROPERTY_DISABLE_HEALING","禁止生命回复"],
		["MODIFIER_PROPERTY_DISABLE_TURNING","禁止转身（无效）"],
		["MODIFIER_PROPERTY_EVASION_CONSTANT","闪避"],
		["MODIFIER_PROPERTY_EXTRA_HEALTH_BONUS","额外生命值（无效）"],
		["MODIFIER_PROPERTY_EXTRA_MANA_BONUS","额外魔法值（无效）"],
		["MODIFIER_PROPERTY_EXTRA_STRENGTH_BONUS","额外力量（无效）"],
		["MODIFIER_PROPERTY_FORCE_DRAW_MINIMAP","?"],
		["MODIFIER_PROPERTY_HEALTH_BONUS","生命值奖励"],
		["MODIFIER_PROPERTY_HEALTH_REGEN_CONSTANT","固定的生命回复数值"],
		["MODIFIER_PROPERTY_HEALTH_REGEN_PERCENTAGE","百分比生命回复数值"],
		["MODIFIER_PROPERTY_IGNORE_CAST_ANGLE","?"],
		["MODIFIER_PROPERTY_INCOMING_DAMAGE_PERCENTAGE","百分比修改受到所有伤害，负降正升"],
		["MODIFIER_PROPERTY_INCOMING_PHYSICAL_DAMAGE_PERCENTAGE","百分比修改受到物理伤害，负降正升"],
		["MODIFIER_PROPERTY_INCOMING_SPELL_DAMAGE_CONSTANT","百分比修改受到技能伤害，负降正升"],
		["MODIFIER_PROPERTY_INVISIBILITY_LEVEL","隐身等级?"],
		["MODIFIER_PROPERTY_IS_ILLUSION","是否为某个单位的幻象"],
		["MODIFIER_PROPERTY_IS_SCEPTER","是否携带蓝杖？"],
		["MODIFIER_PROPERTY_LIFETIME_FRACTION","?"],
		["MODIFIER_PROPERTY_MAGICAL_RESISTANCE_BONUS","魔法抗性，对神圣伤害无效，可以累加"],
		["MODIFIER_PROPERTY_MAGICAL_RESISTANCE_DECREPIFY_UNIQUE","骨法的衰老，影响魔法抗性，不可累加"],
		["MODIFIER_PROPERTY_MAGICAL_RESISTANCE_ITEM_UNIQUE","魔法抗性，对神圣伤害无效，不可以累加"],
		["MODIFIER_PROPERTY_MANA_BONUS","魔法值奖励"],
		["MODIFIER_PROPERTY_MANA_REGEN_CONSTANT","修改基础魔法回复数值"],
		["MODIFIER_PROPERTY_MANA_REGEN_CONSTANT_UNIQUE","修改基础魔法回复数值，不可叠加"],
		["MODIFIER_PROPERTY_MANA_REGEN_PERCENTAGE","百分比基础魔法恢复"],
		["MODIFIER_PROPERTY_MANA_REGEN_TOTAL_PERCENTAGE","百分比所有魔法恢复"],
		["MODIFIER_PROPERTY_MIN_HEALTH","最小生命值"],
		["MODIFIER_PROPERTY_MISS_PERCENTAGE","MISS几率"],
		["MODIFIER_PROPERTY_MODEL_CHANGE","设定模型"],
		["MODIFIER_PROPERTY_MODEL_SCALE","模型大小（无效）"],
		["MODIFIER_PROPERTY_MOVESPEED_ABSOLUTE","设置移动速度"],
		["MODIFIER_PROPERTY_MOVESPEED_BASE_OVERRIDE","设置基础移动速度"],
		["MODIFIER_PROPERTY_MOVESPEED_BONUS_CONSTANT","增加移动速度数值"],
		["MODIFIER_PROPERTY_MOVESPEED_BONUS_PERCENTAGE","百分比增加移动速度，自身不叠加"],
		["MODIFIER_PROPERTY_MOVESPEED_BONUS_PERCENTAGE_UNIQUE","独立百分比增加移动速度，不叠加"],
		["MODIFIER_PROPERTY_MOVESPEED_BONUS_UNIQUE","增加移动速度数值，不叠加"],
		["MODIFIER_PROPERTY_MOVESPEED_LIMIT","限制移动速度（无效）"],
		["MODIFIER_PROPERTY_MOVESPEED_MAX","最大移动速度（无效）"],
		["MODIFIER_PROPERTY_OVERRIDE_ANIMATION","强制播放模型动作"],
		["MODIFIER_PROPERTY_OVERRIDE_ANIMATION_RATE","设置播放模型动作快慢"],
		["MODIFIER_PROPERTY_OVERRIDE_ANIMATION_WEIGHT","强制播放模型动作_重？"],
		["MODIFIER_PROPERTY_OVERRIDE_ATTACK_MAGICAL","魔法攻击"],
		["MODIFIER_PROPERTY_PERSISTENT_INVISIBILITY","永久性隐身"],
		["MODIFIER_PROPERTY_PHYSICAL_ARMOR_BONUS","增加护甲"],
		["MODIFIER_PROPERTY_PHYSICAL_ARMOR_BONUS_ILLUSIONS","增加幻象的护甲"],
		["MODIFIER_PROPERTY_PHYSICAL_ARMOR_BONUS_UNIQUE","增加护甲，不可叠加"],
		["MODIFIER_PROPERTY_PHYSICAL_ARMOR_BONUS_UNIQUE_ACTIVE","改变圆盾减伤的效果？"],
		["MODIFIER_PROPERTY_PHYSICAL_CONSTANT_BLOCK","数值减免伤害？"],
		["MODIFIER_PROPERTY_POST_ATTACK","增加攻击力？"],
		["MODIFIER_PROPERTY_PREATTACK_BONUS_DAMAGE","修改附加攻击力"],
		["MODIFIER_PROPERTY_PREATTACK_BONUS_DAMAGE_POST_CRIT","以增加伤害的方式修改伤害值，不计入暴击计算"],
		["MODIFIER_PROPERTY_PREATTACK_CRITICALSTRIKE","致命一击"],
		["MODIFIER_PROPERTY_PROCATTACK_BONUS_DAMAGE_COMPOSITE","修改在普通攻击后计算的神圣伤害"],
		["MODIFIER_PROPERTY_PROCATTACK_BONUS_DAMAGE_MAGICAL","修改在普通攻击后计算的魔法伤害"],
		["MODIFIER_PROPERTY_PROCATTACK_BONUS_DAMAGE_PHYSICAL","修改在普通攻击后计算的物理伤害"],
		["MODIFIER_PROPERTY_PROCATTACK_BONUS_DAMAGE_PURE","修改在普通攻击后计算的纯粹伤害"],
		["MODIFIER_PROPERTY_PROCATTACK_FEEDBACK","法力燃烧？"],
		["MODIFIER_PROPERTY_PROVIDES_FOW_POSITION","?"],
		["MODIFIER_PROPERTY_REINCARNATION","不朽之守护或者是骷髅王的大招？"],
		["MODIFIER_PROPERTY_RESPAWNTIME","修改重生时间"],
		["MODIFIER_PROPERTY_RESPAWNTIME_PERCENTAGE","百分比修改重生时间"],
		["MODIFIER_PROPERTY_RESPAWNTIME_STACKING","累积重生时间"],
		["MODIFIER_PROPERTY_STATS_AGILITY_BONUS","修改敏捷"],
		["MODIFIER_PROPERTY_STATS_INTELLECT_BONUS","修改智力"],
		["MODIFIER_PROPERTY_STATS_STRENGTH_BONUS","修改力量"],
		["MODIFIER_PROPERTY_TOOLTIP","可被用于任何提示， 比如臂章的血量移除"],
		["MODIFIER_PROPERTY_TOTAL_CONSTANT_BLOCK","减免所有来源的伤害"],
		["MODIFIER_PROPERTY_TOTAL_CONSTANT_BLOCK_UNAVOIDABLE_PRE_ARMOR","对于自动攻击的伤害减免"],
		["MODIFIER_PROPERTY_TOTALDAMAGEOUTGOING_PERCENTAGE","（无效）"],
		["MODIFIER_PROPERTY_TRANSLATE_ACTIVITY_MODIFIERS","动作修改？"],
		["MODIFIER_PROPERTY_TRANSLATE_ATTACK_SOUND","攻击音效修改？"],
		["MODIFIER_PROPERTY_TURN_RATE_PERCENTAGE","百分比修改转向速度"],
	];

	Modifier.States = [
		["MODIFIER_STATE_ATTACK_IMMUNE","攻击免疫"],
		["MODIFIER_STATE_BLIND","致盲？"],
		["MODIFIER_STATE_BLOCK_DISABLED","禁用伤害减免？"],
		["MODIFIER_STATE_CANNOT_MISS","无法闪避？"],
		["MODIFIER_STATE_COMMAND_RESTRICTED","不能执行命令"],
		["MODIFIER_STATE_DISARMED","缴械"],
		["MODIFIER_STATE_DOMINATED","支配？"],
		["MODIFIER_STATE_EVADE_DISABLED","无法躲避？"],
		["MODIFIER_STATE_FLYING","飞行"],
		["MODIFIER_STATE_FROZEN","冰冻"],
		["MODIFIER_STATE_HEXED","妖术"],
		["MODIFIER_STATE_INVISIBLE","隐身"],
		["MODIFIER_STATE_INVULNERABLE","无敌"],
		["MODIFIER_STATE_LOW_ATTACK_PRIORITY","低攻击优先级"],
		["MODIFIER_STATE_MAGIC_IMMUNE","魔免"],
		["MODIFIER_STATE_MUTED","禁用物品"],
		["MODIFIER_STATE_NIGHTMARED","催眠"],
		["MODIFIER_STATE_NO_HEALTH_BAR","无生命条"],
		["MODIFIER_STATE_NO_TEAM_MOVE_TO","没有移动到队伍"],
		["MODIFIER_STATE_NO_TEAM_SELECT","没有选择队伍"],
		["MODIFIER_STATE_NOT_ON_MINIMAP","无小地图"],
		["MODIFIER_STATE_NOT_ON_MINIMAP_FOR_ENEMIES","对敌方无小地图"],
		["MODIFIER_STATE_NO_UNIT_COLLISION","无碰撞"],
		["MODIFIER_STATE_OUT_OF_GAME","离开游戏"],
		["MODIFIER_STATE_PASSIVES_DISABLED","禁用被动"],
		["MODIFIER_STATE_PROVIDES_VISION","提供视野"],
		["MODIFIER_STATE_ROOTED","被缠绕"],
		["MODIFIER_STATE_SILENCED","沉默"],
		["MODIFIER_STATE_SOFT_DISARMED","解除武器"],
		["MODIFIER_STATE_SPECIALLY_DENIABLE","？"],
		["MODIFIER_STATE_STUNNED","眩晕"],
		["MODIFIER_STATE_UNSELECTABLE","不可选"],
	];

	Modifier.StateValues = [
		//["MODIFIER_STATE_VALUE_NO_ACTION", "无"],
		["MODIFIER_STATE_VALUE_ENABLED", "启用"],
		["MODIFIER_STATE_VALUE_DISABLED", "禁用"],
	];

	return Modifier;
});