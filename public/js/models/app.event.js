'use strict';

// =======================================================
// =                        Event                        =
// =======================================================
app.factory("Event", function(Operation) {
	var Event = function(kvUnit) {
		return new Evnt(kvUnit);
	};

	var Evnt = function(kvUnit) {
		this.kv = kvUnit;
		return this;
	};

	Evnt.prototype.getKVPrecacheList = function() {
		var _list = [];

		$.each(this.kv.value, function(i, operation) {
			var _effectList = Operation(operation).getKVPrecacheList();
			if(_effectList) {
				_list.push.apply(_list, _effectList);
			}
		});

		return _list;
	};

	Evnt.prototype.saveProcess = function() {
		this.kv.value = $.grep(this.kv.value, function(operationKV) {
			// Ignore empty key
			if((operationKV.key + "").trim() === "") {
				return false;
			} else {
				Operation(operationKV).saveProcess();
			}
			return true;
		});
	};

	// ================================================
	// =                  Event List                  =
	// ================================================
	Event.EventList = [
		{value: "OnSpellStart"},

		{value: "OnAbilityStart"},
		{value: "OnAbilityExecuted"},
		{value: "OnAbilityEndChannel"},
		{value: "OnAbilityPhaseStart"},

		{value: "OnAttack"},
		{value: "OnAttacked"},
		{value: "OnAttackAllied"},
		{value: "OnAttackFailed"},
		{value: "OnAttackFinished"},
		{value: "OnAttackStart"},
		{value: "OnChannelFinish"},
		{value: "OnChannelInterrupted"},
		{value: "OnChannelSucceeded"},
		{value: "OnEquip"},
		{value: "OnUnequip"},
		{value: "OnHealReceived"},
		{value: "OnHealthGained"},
		{value: "OnHeroKilled"},
		{value: "OnKill"},
		{value: "OnManaGained"},
		{value: "OnOrder"},
		{value: "OnOwnerDied"},
		{value: "OnOwnerSpawned"},
		{value: "OnProjectileDodge"},
		{value: "OnProjectileFinish"},
		{value: "OnProjectileHitUnit"},
		{value: "OnRespawn"},
		{value: "OnSpentMana"},
		{value: "OnStateChanged"},
		{value: "OnTeleported"},
		{value: "OnTeleporting"},
		{value: "OnToggleOff"},
		{value: "OnToggleOn"},
		{value: "OnUnitMoved"},
		{value: "OnUpgrade"}
	];

	Event.ModifierEventList = [
		{value: "OnCreated"},
		{value: "OnDestroy"},
		{value: "OnIntervalThink"},

		{value: "OnAttackLanded"},
		{value: "OnDealDamage"},
		{value: "OnDeath"},
		{value: "OnOrbFire"},
		{value: "OnOrbImpact"},
		{value: "OnSpellTargetReady"},
		{value: "OnTakeDamage"}
	].concat(Event.EventList);

	return Event;
});