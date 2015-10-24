'use strict';

// ======================================================
// =                        技能                        =
// ======================================================
app.factory("Event", function() {
	var _event = function() {
		var _my = this;

		_my.name = "OnSpellStart";

		_my._operationList = [{}];

		return _my;
	};

	_event.EventList = [
		["OnSpellStart","开始施法"],
		["OnAbilityEndChannel","停止施法"],
		["OnAbilityPhaseStart","开始阶段（转身之前）"],
		["OnAbilityStart","技能开始"],
		["OnAttack","攻击"],
		["OnAttackAllied","攻击生效？"],
		["OnAttackFailed","攻击失败"],
		["OnChannelFinish","持续施法结束"],
		["OnChannelInterrupted","持续施法中断"],
		["OnChannelSucceeded","持续施法成功"],
		["OnCreated","创建"],
		["OnEquip","装备？"],
		["OnHealReceived","受到治疗？"],
		["OnHealthGained","获得治疗"],
		["OnHeroKilled","英雄被杀？"],
		["OnManaGained","获得魔法值"],
		["OnOrder","命令？"],
		["OnOwnerDied","拥有者死亡"],
		["OnOwnerSpawned","拥有者出生"],
		["OnProjectileDodge","投射物闪避"],
		["OnProjectileFinish","投射物结束"],
		["OnProjectileHitUnit","投射物命中"],
		["OnRespawn","重生"],
		["OnSpentMana","消耗魔法"],
		["OnStateChanged","状态改变？"],
		["OnTeleported","传送完成"],
		["OnTeleporting","传送中"],
		["OnToggleOff","开关：关"],
		["OnToggleOn","开关：开"],
		["OnUnitMoved","移动"],
		["OnUpgrade","技能升级"],
	];

	return _event;
});