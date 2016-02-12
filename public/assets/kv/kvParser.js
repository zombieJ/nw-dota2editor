'use strict';

(function() {
	var KV = function(key, value, comment) {
		this.key = key || "";
		this.value = value || "";
		this.comment = comment || "";
		this.keep = false;

		return this;
	};

	KV.prototype.getKV = function(key, caseSensitive) {
		var i = this.value.length;
		key = caseSensitive === false ? key.toUpperCase() : key;

		while (i--) {
			if (this.value[i].key === key || (caseSensitive === false && this.value[i].key.toUpperCase() === key)) {
				return this.value[i];
			}
		}
		return null;
	};

	KV.prototype.get = function(key, caseSensitive) {
		if(arguments.length === 0) return this.value;

		var _kv = this.getKV.apply(this, arguments);
		if(_kv) {
			return _kv.value;
		} else {
			return null;
		}
	};

	KV.prototype.isList = function() {
		return (typeof this.value) !== "string";
	};

	KV.prototype.set = function(key, value) {
		var _kv = this.getKV(key, false);
		if(_kv) {
			_kv.value = value;
		} else {
			_kv = new KV(key, value);
			this.value.push(_kv);
		}
		return this;
	};

	KV.prototype.delete = function(key, caseSensitive) {
		var _key = key.toUpperCase();
		for(var i = 0 ; i < this.value.length ; i += 1) {
			if(this.value[i].key === key || (caseSensitive && this.value[i].key.toUpperCase() === _key)) {
				this.value.splice(i, 1);
				i -= 1;
			}
		}
	};

	KV.prototype.clone = function(keepEmpty) {
		return KV.parse(this.toString(keepEmpty !== false));
	};

	/*
	 * saveFunc:Function
	 * keepEmpty:boolean
	 */
	KV.prototype.toString = function(saveFunc) {
		var _func;
		if(saveFunc === false) {
			_func = function(kv) {
				if(kv.value === "") return false;
			};
		} else if(typeof saveFunc === "function") {
			_func = saveFunc;
		} else {
			_func = null;
		}

		return this._toString(null, null, _func);
	};

	KV.prototype._toString = function(_data, _lvl, saveFunc) {
		_data = _data || "";
		_lvl = _lvl || 0;

		var _write = function(text) {
			var _des = _lvl;
			while(_des) {
				_data += "	";
				_des -= 1;
			}

			_data += text + "\n";
		};

		// Comment
		if(this.comment) {
			this.comment.split("\n").forEach(function(line) {
				_write("// " + line);
			});
		}

		// Key - Value
		if(typeof this.value === "string") {
			_write('"' + this.key + '"	"'
			+ this.value.replace(/\\"/g, '"').replace(/"/g, '\\"').replace(/\r\n/g, "\\n").replace(/\n/g, "\\n").replace(/\r/g, "\\n")
			+ '"');
		} else if(this.value.length === 0) {
			_write('"' + this.key + '"	{}');
		} else {
			_write('"' + this.key + '"');
			_write('{');
			this.value.forEach(function(subKV) {
				if(saveFunc && saveFunc(subKV) === false) return;

				_data = subKV._toString(_data, _lvl + 1, saveFunc) + "\n";
			});
			_write('}');
		}

		return _data.replace(/\n$/, "");
	};

	KV.inArray = function(value, array) {
		var i = array.length;
		while (i--) {
			if (array[i] === value) {
				break;
			}
		}
		return i;
	};

	var STATE_NORMAL = KV.STATE_NORMAL = 0;
	var STATE_COMMENT = KV.STATE_COMMENT = 1;
	var STATE_KEY = KV.STATE_KEY = 2;
	var STATE_KEY_END = KV.STATE_KEY_END = 3;
	var STATE_VALUE = KV.STATE_VALUE = 4;
	var STATE_VALUE_END = KV.STATE_VALUE_END = 5;
	var STATE_VALUE_LIST = KV.STATE_VALUE_LIST = 6;

	KV.parse = function(text, startLoc) {
		if(!text) {
			console.error("KV Parser can't process empty text!");
			throw "Text can't be empty";
		}

		var _preState = STATE_NORMAL;
		var _state = STATE_NORMAL;
		var _len = text.length;
		var _i, _c, _subKV, _breakFor = false;
		var _startLoc;
		var _endLoc;
		var _comment = "";
		var _key = "";
		var _value = null;

		if(typeof startLoc === "boolean") {
			_startLoc = undefined;
		} else {
			_startLoc = startLoc;
		}

		function _setState(state) {
			if(_state === state) return;

			_preState = _state;
			_state = state;
		}

		function _matchComment() {
			if(text[_i] === '/' && text[_i + 1] === '/') {
				_i += 1;
				if(text[_i + 1] === ' ') _i += 1;
				return true;
			}
			return false;
		}

		for(_i = _startLoc || 0 ; _i < _len ; _i += 1) {
			_c = text[_i];

			switch(_state) {
			case STATE_NORMAL:
				// Ignore empty char
				if(KV.inArray(_c, [' ','\t','\n','\r']) !== -1) continue;

				if(_matchComment()) {
					// Match comment
					_setState(STATE_COMMENT);
				} else if(_c === '"') {
					// Match Key
					_setState(STATE_KEY);
				} else if(_c === '}' && _startLoc !== undefined) {
					_endLoc = _i;
					_breakFor = true;
				} else {
					console.warn("[STATE_NORMAL] Not match:'" + _c + "', index:", _i);
				}
				break;

			case STATE_COMMENT:
				if(KV.inArray(_c, ['\n','\r']) !== -1) {
					_comment += "\n";
					_setState(_preState);

					if(_state === STATE_VALUE_END) {
						_endLoc = _i;
						_breakFor = true;
					}
					continue;
				} else {
					_comment += _c;
				}
				break;

			case STATE_KEY:
				if(_c === '"') {
					_setState(STATE_KEY_END);
				} else {
					_key += _c;
				}
				break;

			case STATE_KEY_END:
				if(KV.inArray(_c, [' ','\t','\n','\r']) !== -1) continue;

				if(_matchComment()) {
					// Match comment
					_setState(STATE_COMMENT);
				} else if(_c === '"') {
					// Match Key
					_value = "";
					_setState(STATE_VALUE);
				} else if(_c === '{') {
					// Match Value List
					_value = [];
					_setState(STATE_VALUE_LIST);
				} else {
					console.warn("[STATE_KEY_END] Not match:'" + _c + "', index:", _i);
				}
				break;

			case STATE_VALUE:
				if(_c === '"') {
					_setState(STATE_VALUE_END);
					_endLoc = _i;
				} else if(_c === '\\') {
					_i += 1;
					_value += '\\' + text[_i];
				} else {
					_value += _c;
				}
				break;

			case STATE_VALUE_LIST:
				if(_c === "}") {
					_setState(STATE_VALUE_END);
					_endLoc = _i;
				} else {
					_subKV = KV.parse(text, _i + 1);
					if (_subKV.kv) {
						_value.push(_subKV.kv);
					} else {
						_setState(STATE_VALUE_END);
						_endLoc = _subKV.endLoc;
					}
					_i = _subKV.endLoc;
				}
				break;

			case STATE_VALUE_END:
				// Ignore empty char
				if(KV.inArray(_c, [' ','\t']) !== -1) continue;
				if(_matchComment()) {
					// Match comment
					_setState(STATE_COMMENT);
				} else {
					_breakFor = true;
				}
				break;
			}

			if(_breakFor) break;
		}

		var _kv = new KV(_key, _value, _comment.replace(/[\r\n]+$/, ""));

		if(_startLoc === undefined) {
			return _kv;
		} else {
			return {
				kv: _value !== null ? _kv : null,
				startLoc: _startLoc,
				endLoc: _endLoc
			};
		}
	};


	if(!window.KV) {
		window.KV = KV;
	}
	window._KVParser = KV;
})();
