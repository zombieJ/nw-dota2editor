'use strict';

// ======================================================
// =                        操作                        =
// ======================================================
app.factory("Modifier", function(Event) {
	var Modifier = function(kvUnit) {
		if(!kvUnit) return null;

		if(!kvUnit._entity) {
			kvUnit._entity = new Mdf(kvUnit);

			Object.defineProperty(kvUnit._entity, "_name", {
				get: function() {
					return kvUnit.key;
				}, set: function(value) {
					kvUnit.key = value;
				}
			});
		}
		return kvUnit._entity;
	};

	var Mdf = function(kvUnit) {
		var _my = this;

		// Aura
		if(kvUnit.get("Aura")) {
			kvUnit.set("_IsAura", "1");
		}

		// Orb
		if(kvUnit.get("Orb")) {
			kvUnit.set("_Orb", "1");
		}

		// Event List
		_my._eventList = [];
		_my.getEventList = function() {
			_my._eventList.splice(0);
			$.each(kvUnit.value, function(i, kv) {
				if(kv._isEvent || common.array.find(kv.key, Event.ModifierEventList, "value", false, false)) {
					_my._eventList.push(kv);
				}
			});
			return _my._eventList;
		};

		// Get Pre-Cache list
		_my.getKVPrecacheList = function() {
			var _list = [];

			if(kvUnit.get("EffectName")) _list.push(new KV("particle", kvUnit.get("EffectName")));
			if(kvUnit.getValueByPath("Orb.ProjectileName")) _list.push(new KV("particle", kvUnit.getValueByPath("Orb.ProjectileName")));
			$.each(_my.getEventList(), function(i, eventKV) {
				_list = _list.concat(Event(eventKV).getKVPrecacheList());
			});

			return _list;
		};

		// Save process
		_my.saveProcess = function() {
			$.each(_my.getEventList(), function(i, event) {
				if(!(event.key + "").trim()) common.array.remove(event, kvUnit.value);

				Event(event).saveProcess();
			});
		};

		return _my;
	};

	// ================================================
	// =                  Attr List                   =
	// ================================================
	var _auraFunc = function(modifier) {
		return modifier && modifier.get("_IsAura") === "1";
	};
	var _orbFunc = function(modifier) {
		return modifier && modifier.get("_Orb") === "1";
	};

	Modifier.AttrList = [
		[
			{group: "common", attr: "Attributes", type: "group"},
			{group: "common", attr: "Duration", type: "text"},
			{group: "common", attr: "Passive", type: "boolean"},
			{group: "common", attr: "TextureName", type: "text"}
		],
		[
			{group: "state", attr: "IsBuff", type: "boolean"},
			{group: "state", attr: "IsDebuff", type: "boolean"},
			{group: "state", attr: "IsHidden", type: "boolean"},
			{group: "state", attr: "IsPurgable", type: "boolean"},
			{group: "state", attr: "AllowIllusionDuplicate", type: "boolean"}
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
			{group: "aura", attr: "Aura_ApplyToCaster", type: "boolean", showFunc: _auraFunc}
		],
		[
			{group: "orb", attr: "_Orb", type: "boolean", change: function(modifier) {
				if(modifier.get("_Orb") !== "1") {
					modifier.delete("Orb");
				} else {
					modifier.assumeKey("Orb", true);
				}
			}},
			{group: "orb", path: "Orb", attr: "Priority", type: "text", showFunc: _orbFunc},
			{group: "orb", path: "Orb", attr: "ProjectileName", type: "text", showFunc: _orbFunc},
			{group: "orb", path: "Orb", attr: "CastAttack", type: "boolean", showFunc: _orbFunc}
		],
		[
			{group: "effect", attr: "EffectName", type: "text"},
			{group: "effect", attr: "EffectAttachType", type: "single"}
		],
		[
			{group: "statusEffect", attr: "StatusEffectName", type: "text"},
			{group: "statusEffect", attr: "StatusEffectPriority", type: "text"},
			{group: "statusEffect", attr: "OverrideAnimation", type: "single"}
		],
	];

	// ================================================
	// =                     Enum                     =
	// ================================================
	Modifier.Attributes = [
		["MODIFIER_ATTRIBUTE_NONE"],
		["MODIFIER_ATTRIBUTE_MULTIPLE"],
		["MODIFIER_ATTRIBUTE_PERMANENT"],
		["MODIFIER_ATTRIBUTE_IGNORE_INVULNERABLE"]
	];

	Modifier.Aura_Teams = [
		["DOTA_UNIT_TARGET_TEAM_BOTH", true],
		["DOTA_UNIT_TARGET_TEAM_ENEMY", true],
		["DOTA_UNIT_TARGET_TEAM_FRIENDLY", true],
		["DOTA_UNIT_TARGET_TEAM_CUSTOM"],
		["DOTA_UNIT_TARGET_TEAM_NONE"]
	];

	Modifier.Aura_Types = [
		["DOTA_UNIT_TARGET_HERO", true],
		["DOTA_UNIT_TARGET_BASIC", true],
		["DOTA_UNIT_TARGET_ALL"],
		["DOTA_UNIT_TARGET_BUILDING"],
		["DOTA_UNIT_TARGET_COURIER"],
		["DOTA_UNIT_TARGET_CREEP"],
		["DOTA_UNIT_TARGET_CUSTOM"],
		["DOTA_UNIT_TARGET_MECHANICAL"],
		["DOTA_UNIT_TARGET_NONE"],
		["DOTA_UNIT_TARGET_OTHER"],
		["DOTA_UNIT_TARGET_TREE"]
	];

	Modifier.Aura_Flags = [
		["DOTA_UNIT_TARGET_FLAG_CHECK_DISABLE_HELP"],
		["DOTA_UNIT_TARGET_FLAG_DEAD"],
		["DOTA_UNIT_TARGET_FLAG_FOW_VISIBLE"],
		["DOTA_UNIT_TARGET_FLAG_INVULNERABLE"],
		["DOTA_UNIT_TARGET_FLAG_MAGIC_IMMUNE_ENEMIES"],
		["DOTA_UNIT_TARGET_FLAG_MANA_ONLY"],
		["DOTA_UNIT_TARGET_FLAG_MELEE_ONLY"],
		["DOTA_UNIT_TARGET_FLAG_NO_INVIS"],
		["DOTA_UNIT_TARGET_FLAG_NONE"],
		["DOTA_UNIT_TARGET_FLAG_NOT_ANCIENTS"],
		["DOTA_UNIT_TARGET_FLAG_NOT_ATTACK_IMMUNE"],
		["DOTA_UNIT_TARGET_FLAG_NOT_CREEP_HERO"],
		["DOTA_UNIT_TARGET_FLAG_NOT_DOMINATED"],
		["DOTA_UNIT_TARGET_FLAG_NOT_ILLUSIONS"],
		["DOTA_UNIT_TARGET_FLAG_NOT_MAGIC_IMMUNE_ALLIES"],
		["DOTA_UNIT_TARGET_FLAG_NOT_NIGHTMARED"],
		["DOTA_UNIT_TARGET_FLAG_NOT_SUMMONED"],
		["DOTA_UNIT_TARGET_FLAG_OUT_OF_WORLD"],
		["DOTA_UNIT_TARGET_FLAG_PLAYER_CONTROLLED"],
		["DOTA_UNIT_TARGET_FLAG_RANGED_ONLY"],
		["DOTA_UNIT_TARGET_FLAG_PREFER_ENEMIES"]
	];

	Modifier["Orb.Priority"] = [
		{value: "DOTA_ORB_PRIORITY_ABILITY"},
		{value: "DOTA_ORB_PRIORITY_DEFAULT"},
		{value: "DOTA_ORB_PRIORITY_ITEM"},
		{value: "DOTA_ORB_PRIORITY_ITEM_PROC"},
		{value: "DOTA_ORB_PRIORITY_NONE"}
	];

	Modifier.AllowIllusionDuplicate = Modifier.IsBuff = Modifier.IsDebuff = Modifier.IsHidden = Modifier.IsPurgable = Modifier.Aura_ApplyToCaster = [
		["-","默认",true],
		["0","不是",false],
		["1","是",false],
	];

	Modifier.EffectAttachType = [
		["attach_hitloc"],
		["attach_origin"],
		["attach_attack"],
		["attach_attack1"],
		["attach_attack2"],
		["follow_origin"],
		["follow_hitloc"],
		["follow_overhead"],
		["follow_chest"],
		["follow_head"],
		["follow_customorigin"],
		["follow_attachment"],
		["follow_eyes"],
		["follow_attachment_substepped"],
		["follow_renderorigin"],
		["follow_rootbone"],
		["world_origin"],
		["start_at_customorigin"],
		["start_at_origin"],
		["start_at_attachment"]
	];

	Modifier.OverrideAnimation = [
		["ACT_DOTA_ATTACK"],
		["ACT_DOTA_CAST_ABILITY_1"],
		["ACT_DOTA_CAST_ABILITY_1_END"],
		["ACT_DOTA_CHANNEL_ABILITY_1"],
		["ACT_DOTA_DISABLED"],
		["ACT_DOTA_RUN"],
		["ACT_DOTA_SPAWN"],
		["ACT_DOTA_TELEPORT"],
		["ACT_DOTA_VICTORY"]
	];

	Modifier.Properties = [
		{value: "MODIFIER_PROPERTY_ABSOLUTE_NO_DAMAGE_MAGICAL"},
		{value: "MODIFIER_PROPERTY_ABSOLUTE_NO_DAMAGE_PHYSICAL"},
		{value: "MODIFIER_PROPERTY_ABSOLUTE_NO_DAMAGE_PURE"},
		{value: "MODIFIER_PROPERTY_ABSORB_SPELL"},
		{value: "MODIFIER_PROPERTY_ATTACK_RANGE_BONUS"},
		{value: "MODIFIER_PROPERTY_ATTACKSPEED_BONUS_CONSTANT"},
		{value: "MODIFIER_PROPERTY_ATTACKSPEED_BONUS_CONSTANT_POWER_TREADS"},
		{value: "MODIFIER_PROPERTY_ATTACKSPEED_BONUS_CONSTANT_SECONDARY"},
		{value: "MODIFIER_PROPERTY_AVOID_CONSTANT"},
		{value: "MODIFIER_PROPERTY_AVOID_SPELL"},
		{value: "MODIFIER_PROPERTY_BASEATTACK_BONUSDAMAGE"},
		{value: "MODIFIER_PROPERTY_BASE_ATTACK_TIME_CONSTANT"},
		{value: "MODIFIER_PROPERTY_BASEDAMAGEOUTGOING_PERCENTAGE"},
		{value: "MODIFIER_PROPERTY_BASE_MANA_REGEN"},
		{value: "MODIFIER_PROPERTY_BONUS_DAY_VISION"},
		{value: "MODIFIER_PROPERTY_BONUS_NIGHT_VISION"},
		{value: "MODIFIER_PROPERTY_BONUS_VISION_PERCENTAGE"},
		{value: "MODIFIER_PROPERTY_CHANGE_ABILITY_VALUE"},
		{value: "MODIFIER_PROPERTY_COOLDOWN_REDUCTION_CONSTANT"},
		{value: "MODIFIER_PROPERTY_DAMAGEOUTGOING_PERCENTAGE"},
		{value: "MODIFIER_PROPERTY_DAMAGEOUTGOING_PERCENTAGE_ILLUSION"},
		{value: "MODIFIER_PROPERTY_DEATHGOLDCOST"},
		{value: "MODIFIER_PROPERTY_DISABLE_AUTOATTACK"},
		{value: "MODIFIER_PROPERTY_DISABLE_HEALING"},
		{value: "MODIFIER_PROPERTY_DISABLE_TURNING"},
		{value: "MODIFIER_PROPERTY_EVASION_CONSTANT"},
		{value: "MODIFIER_PROPERTY_EXTRA_HEALTH_BONUS"},
		{value: "MODIFIER_PROPERTY_EXTRA_MANA_BONUS"},
		{value: "MODIFIER_PROPERTY_EXTRA_STRENGTH_BONUS"},
		{value: "MODIFIER_PROPERTY_FORCE_DRAW_MINIMAP"},
		{value: "MODIFIER_PROPERTY_HEALTH_BONUS"},
		{value: "MODIFIER_PROPERTY_HEALTH_REGEN_CONSTANT"},
		{value: "MODIFIER_PROPERTY_HEALTH_REGEN_PERCENTAGE"},
		{value: "MODIFIER_PROPERTY_IGNORE_CAST_ANGLE"},
		{value: "MODIFIER_PROPERTY_INCOMING_DAMAGE_PERCENTAGE"},
		{value: "MODIFIER_PROPERTY_INCOMING_PHYSICAL_DAMAGE_PERCENTAGE"},
		{value: "MODIFIER_PROPERTY_INCOMING_SPELL_DAMAGE_CONSTANT"},
		{value: "MODIFIER_PROPERTY_INVISIBILITY_LEVEL"},
		{value: "MODIFIER_PROPERTY_IS_ILLUSION"},
		{value: "MODIFIER_PROPERTY_IS_SCEPTER"},
		{value: "MODIFIER_PROPERTY_LIFETIME_FRACTION"},
		{value: "MODIFIER_PROPERTY_MAGICAL_RESISTANCE_BONUS"},
		{value: "MODIFIER_PROPERTY_MAGICAL_RESISTANCE_DECREPIFY_UNIQUE"},
		{value: "MODIFIER_PROPERTY_MAGICAL_RESISTANCE_ITEM_UNIQUE"},
		{value: "MODIFIER_PROPERTY_MANA_BONUS"},
		{value: "MODIFIER_PROPERTY_MANA_REGEN_CONSTANT"},
		{value: "MODIFIER_PROPERTY_MANA_REGEN_CONSTANT_UNIQUE"},
		{value: "MODIFIER_PROPERTY_MANA_REGEN_PERCENTAGE"},
		{value: "MODIFIER_PROPERTY_MANA_REGEN_TOTAL_PERCENTAGE"},
		{value: "MODIFIER_PROPERTY_MIN_HEALTH"},
		{value: "MODIFIER_PROPERTY_MISS_PERCENTAGE"},
		{value: "MODIFIER_PROPERTY_MODEL_CHANGE"},
		{value: "MODIFIER_PROPERTY_MODEL_SCALE"},
		{value: "MODIFIER_PROPERTY_MOVESPEED_ABSOLUTE"},
		{value: "MODIFIER_PROPERTY_MOVESPEED_BASE_OVERRIDE"},
		{value: "MODIFIER_PROPERTY_MOVESPEED_BONUS_CONSTANT"},
		{value: "MODIFIER_PROPERTY_MOVESPEED_BONUS_PERCENTAGE"},
		{value: "MODIFIER_PROPERTY_MOVESPEED_BONUS_PERCENTAGE_UNIQUE"},
		{value: "MODIFIER_PROPERTY_MOVESPEED_BONUS_UNIQUE"},
		{value: "MODIFIER_PROPERTY_MOVESPEED_LIMIT"},
		{value: "MODIFIER_PROPERTY_MOVESPEED_MAX"},
		{value: "MODIFIER_PROPERTY_OVERRIDE_ANIMATION"},
		{value: "MODIFIER_PROPERTY_OVERRIDE_ANIMATION_RATE"},
		{value: "MODIFIER_PROPERTY_OVERRIDE_ANIMATION_WEIGHT"},
		{value: "MODIFIER_PROPERTY_OVERRIDE_ATTACK_MAGICAL"},
		{value: "MODIFIER_PROPERTY_PERSISTENT_INVISIBILITY"},
		{value: "MODIFIER_PROPERTY_PHYSICAL_ARMOR_BONUS"},
		{value: "MODIFIER_PROPERTY_PHYSICAL_ARMOR_BONUS_ILLUSIONS"},
		{value: "MODIFIER_PROPERTY_PHYSICAL_ARMOR_BONUS_UNIQUE"},
		{value: "MODIFIER_PROPERTY_PHYSICAL_ARMOR_BONUS_UNIQUE_ACTIVE"},
		{value: "MODIFIER_PROPERTY_PHYSICAL_CONSTANT_BLOCK"},
		{value: "MODIFIER_PROPERTY_POST_ATTACK"},
		{value: "MODIFIER_PROPERTY_PREATTACK_BONUS_DAMAGE"},
		{value: "MODIFIER_PROPERTY_PREATTACK_BONUS_DAMAGE_POST_CRIT"},
		{value: "MODIFIER_PROPERTY_PREATTACK_CRITICALSTRIKE"},
		{value: "MODIFIER_PROPERTY_PROCATTACK_BONUS_DAMAGE_COMPOSITE"},
		{value: "MODIFIER_PROPERTY_PROCATTACK_BONUS_DAMAGE_MAGICAL"},
		{value: "MODIFIER_PROPERTY_PROCATTACK_BONUS_DAMAGE_PHYSICAL"},
		{value: "MODIFIER_PROPERTY_PROCATTACK_BONUS_DAMAGE_PURE"},
		{value: "MODIFIER_PROPERTY_PROCATTACK_FEEDBACK"},
		{value: "MODIFIER_PROPERTY_PROVIDES_FOW_POSITION"},
		{value: "MODIFIER_PROPERTY_REINCARNATION"},
		{value: "MODIFIER_PROPERTY_RESPAWNTIME"},
		{value: "MODIFIER_PROPERTY_RESPAWNTIME_PERCENTAGE"},
		{value: "MODIFIER_PROPERTY_RESPAWNTIME_STACKING"},
		{value: "MODIFIER_PROPERTY_STATS_AGILITY_BONUS"},
		{value: "MODIFIER_PROPERTY_STATS_INTELLECT_BONUS"},
		{value: "MODIFIER_PROPERTY_STATS_STRENGTH_BONUS"},
		{value: "MODIFIER_PROPERTY_TOOLTIP"},
		{value: "MODIFIER_PROPERTY_TOTAL_CONSTANT_BLOCK"},
		{value: "MODIFIER_PROPERTY_TOTAL_CONSTANT_BLOCK_UNAVOIDABLE_PRE_ARMOR"},
		{value: "MODIFIER_PROPERTY_TOTALDAMAGEOUTGOING_PERCENTAGE"},
		{value: "MODIFIER_PROPERTY_TRANSLATE_ACTIVITY_MODIFIERS"},
		{value: "MODIFIER_PROPERTY_TRANSLATE_ATTACK_SOUND"},
		{value: "MODIFIER_PROPERTY_TURN_RATE_PERCENTAGE"},
		{value: "MODIFIER_PROPERTY_MAGICDAMAGEOUTGOING_PERCENTAGE"},
		{value: "MODIFIER_PROPERTY_INCOMING_PHYSICAL_DAMAGE_CONSTANT"},
		{value: "MODIFIER_PROPERTY_NEGATIVE_EVASION_CONSTANT"},
		{value: "MODIFIER_PROPERTY_CAST_RANGE_BONUS"},
		{value: "MODIFIER_PROPERTY_ATTACK_RANGE_BONUS_UNIQUE"},
		{value: "MODIFIER_PROPERTY_MAX_ATTACK_RANGE"},
		{value: "MODIFIER_PROPERTY_COOLDOWN_PERCENTAGE"},
		{value: "MODIFIER_PROPERTY_COOLDOWN_PERCENTAGE_STACKING"},
		{value: "MODIFIER_PROPERTY_SUPER_ILLUSION_WITH_ULTIMATE"},

		{value: "MODIFIER_PROPERTY_IGNORE_COOLDOWN"},
		{value: "MODIFIER_PROPERTY_ALWAYS_ALLOW_ATTACK"},
		{value: "MODIFIER_PROPERTY_MAGICAL_CONSTANT_BLOCK"},
		{value: "MODIFIER_PROPERTY_MOVESPEED_BONUS_PERCENTAGE_UNIQUE_2"},
		{value: "MODIFIER_PROPERTY_MOVESPEED_BONUS_UNIQUE_2"},
		{value: "MODIFIER_PROPERTY_PHYSICAL_CONSTANT_BLOCK_SPECIAL"},
		{value: "MODIFIER_PROPERTY_PREATTACK_TARGET_CRITICALSTRIKE"},
		{value: "MODIFIER_PROPERTY_SPELL_AMPLIFY_PERCENTAGE"},

		{value: "MODIFIER_PROPERTY_CAN_ATTACK_TREES"},
		{value: "MODIFIER_PROPERTY_VISUAL_Z_DELTA"}
	];

	Modifier.States = [
		{value: "MODIFIER_STATE_ATTACK_IMMUNE"},
		{value: "MODIFIER_STATE_BLIND"},
		{value: "MODIFIER_STATE_BLOCK_DISABLED"},
		{value: "MODIFIER_STATE_CANNOT_MISS"},
		{value: "MODIFIER_STATE_COMMAND_RESTRICTED"},
		{value: "MODIFIER_STATE_DISARMED"},
		{value: "MODIFIER_STATE_DOMINATED"},
		{value: "MODIFIER_STATE_EVADE_DISABLED"},
		{value: "MODIFIER_STATE_FLYING"},
		{value: "MODIFIER_STATE_FROZEN"},
		{value: "MODIFIER_STATE_HEXED"},
		{value: "MODIFIER_STATE_INVISIBLE"},
		{value: "MODIFIER_STATE_INVULNERABLE"},
		{value: "MODIFIER_STATE_LOW_ATTACK_PRIORITY"},
		{value: "MODIFIER_STATE_MAGIC_IMMUNE"},
		{value: "MODIFIER_STATE_MUTED"},
		{value: "MODIFIER_STATE_NIGHTMARED"},
		{value: "MODIFIER_STATE_NO_HEALTH_BAR"},
		{value: "MODIFIER_STATE_NO_TEAM_MOVE_TO"},
		{value: "MODIFIER_STATE_NO_TEAM_SELECT"},
		{value: "MODIFIER_STATE_NOT_ON_MINIMAP"},
		{value: "MODIFIER_STATE_NOT_ON_MINIMAP_FOR_ENEMIES"},
		{value: "MODIFIER_STATE_NO_UNIT_COLLISION"},
		{value: "MODIFIER_STATE_OUT_OF_GAME"},
		{value: "MODIFIER_STATE_PASSIVES_DISABLED"},
		{value: "MODIFIER_STATE_PROVIDES_VISION"},
		{value: "MODIFIER_STATE_ROOTED"},
		{value: "MODIFIER_STATE_SILENCED"},
		{value: "MODIFIER_STATE_SOFT_DISARMED"},
		{value: "MODIFIER_STATE_SPECIALLY_DENIABLE"},
		{value: "MODIFIER_STATE_STUNNED"},
		{value: "MODIFIER_STATE_UNSELECTABLE"}
	];

	Modifier.StateValues = [
		{value: "MODIFIER_STATE_VALUE_ENABLED"},
	{value: "MODIFIER_STATE_VALUE_DISABLED"}
	];

	return Modifier;
});