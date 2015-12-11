// ======================================================
// =                      Sequence                      =
// ======================================================
app.factory("Sequence", function($q) {
	'use strict';

	var SQ = function(func) {
		this.func = func;
		this._next = null;
		this.root = this;
	};

	SQ.prototype.next = function(func) {
		this._next = new SQ(func);
		this._next.root = this.root;
		return this._next;
	};

	SQ.prototype.then = function(successFunc, FailedFunc) {
		this.root._deferred = this.root._deferred || $q.defer();
		this.root._deferred.promise.then(successFunc, FailedFunc);
		return this;
	};

	SQ.prototype.finally = function(func) {
		this.root._deferred = this.root._deferred || $q.defer();
		this.root._deferred.promise.finally(func);
		return this;
	};

	SQ.prototype.doStep = function(args) {
		var _deferred = $q.defer();
		_deferred.promise.then(function(_args) {
			if(this._next && this._next.func) {
				this._next.doStep();
			} else {
				this.root._deferred.resolve(args);
			}
		}.bind(this), function(args) {
			this.root._deferred.reject(args);
		}.bind(this));

		// Call function
		try {
			this.func(_deferred, args);
		} catch(err) {
			this.root._deferred.reject(err);
		}

		return this;
	};

	SQ.prototype.start = function(args) {
		this.root._deferred = this.root._deferred || $q.defer();
		this.root.doStep(args);

		return this.root;
	};

	return SQ;
});