'use strict';

// ======================================================
// =                        操作                        =
// ======================================================
app.factory("Modifier", function(Event) {
	var Modifier = function(kvUnit) {
		if(!kvUnit._entity) {
			kvUnit._entity = new Mdf(kvUnit);
		}
		return kvUnit._entity;
	};

	var Mdf = function(kvUnit) {
		var _my = this;

		// Aura
		if(kvUnit.get("Aura")) {
			kvUnit.set("_IsAura", "1");
		}

		// Event List
		_my._eventList = [];

		return _my;
	};

	// Get Events
	Mdf.prototype.getEventList = function() {
		var _my = _this;
		_my._eventList.splice(0);
		$.each(_my.kv.value, function(i, kv) {
			if(common.array.find(kv.key, Event.ModifierEventList, "", false, false)) {
				_my._eventList.push(kv);
			}
		});
		return _my._eventList;
	};

	// ================================================
	// =                  Attr List                   =
	// ================================================
	var _auraFunc = function(modifier) {
		return modifier && modifier.get("_IsAura") === "1";
	};

	Modifier.AttrList = [
		[
			{group: "common", attr: "Attributes", type: "group"},
			{group: "common", attr: "Duration", type: "text"},
			{group: "common", attr: "Passive", type: "boolean"},
			{group: "common", attr: "TextureName", type: "text"},
		],
		[
			{group: "state", attr: "IsBuff", type: "boolean"},
			{group: "state", attr: "IsDebuff", type: "boolean"},
			{group: "state", attr: "IsHidden", type: "boolean"},
			{group: "state", attr: "IsPurgable", type: "boolean"},
			{group: "state", attr: "AllowIllusionDuplicate", type: "boolean"},
		],
		[
			{group: "aura", attr: "_IsAura", type: "boolean", change: function(modifier) {
				if(modifier.get("_IsAura") !== "1") {
					modifier.set("Aura", "");
					modifier.set("Aura_Radius", "");
					modifier.set("Aura_Teams", "");
					modifier.set("Aura_Types", "");
					modifier.set("Aura_Flags", "");
					modifier.set("Aura_ApplyToCaster", "");
				}
			}},
			{group: "aura", attr: "Aura", type: "text", showFunc: _auraFunc},
			{group: "aura", attr: "Aura_Radius", type: "text", showFunc: _auraFunc},
			{group: "aura", attr: "Aura_Teams", type: "single", showFunc: _auraFunc},
			{group: "aura", attr: "Aura_Types", type: "group", showFunc: _auraFunc},
			{group: "aura", attr: "Aura_Flags", type: "group", showFunc: _auraFunc},
			{group: "aura", attr: "Aura_ApplyToCaster", type: "boolean", showFunc: _auraFunc},
		],
		[
			{group: "effect", attr: "EffectName", type: "text"},
			{group: "effect", attr: "EffectAttachType", type: "single"},
		],
		[
			{group: "statusEffect", attr: "StatusEffectName", type: "text"},
			{group: "statusEffect", attr: "StatusEffectPriority", type: "text"},
			{group: "statusEffect", attr: "OverrideAnimation", type: "single"},
		],
	];

	// ================================================
	// =                     Enum                     =
	// ================================================
	Modifier.Attributes = [
		["MODIFIER_ATTRIBUTE_NONE"],
		["MODIFIER_ATTRIBUTE_MULTIPLE"],
		["MODIFIER_ATTRIBUTE_PERMANENT"],
		["MODIFIER_ATTRIBUTE_IGNORE_INVULNERABLE"],
	];

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

	Modifier.AllowIllusionDuplicate = Modifier.IsBuff = Modifier.IsDebuff = Modifier.IsHidden = Modifier.IsPurgable = Modifier.Aura_ApplyToCaster = [
		["-","默认",true],
		["0","不是",false],
		["1","是",false],
	];

	Modifier.EffectAttachType = [
		["attach_hitloc"],
		["follow_origin"],
		["follow_overhead"],
		["follow_chest"],
		["follow_head"],
		//["start_at_customorigin","",true],
		["world_origin"],
	];

	Modifier.OverrideAnimation = [
		["ACT_DOTA_ATTACK"],
		["ACT_DOTA_CAST_ABILITY_1"],
		["ACT_DOTA_CHANNEL_ABILITY_1"],
		["ACT_DOTA_DISABLED"],
		["ACT_DOTA_RUN"],
		["ACT_DOTA_SPAWN"],
		["ACT_DOTA_TELEPORT"],
		["ACT_DOTA_VICTORY"],
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
		["MODIFIER_PROPERTY_MIN_HEALTH","生命值不小于"],
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