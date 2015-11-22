'use strict';

// =======================================================
// =                        Event                        =
// =======================================================
app.factory("Event", function() {
	var Event = function() {};

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
		{value: "OnUpgrade"},
	];

	Event.ModifierEventList = [
		{value: "OnCreated"},
		{value: "OnDestroy"},
		{value: "OnIntervalThink"},

		{value: "OnAttackLanded"},
		{value: "OnAttackStart"},
		{value: "OnDealDamage"},
		{value: "OnDeath"},
		{value: "OnOrbFire"},
		{value: "OnOrbImpact"},
		{value: "OnTakeDamage"},
		{value: "Orb"},
	].concat(Event.EventList);

	return Event;
});