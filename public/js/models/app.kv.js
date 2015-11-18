'use strict';

// ======================================================
// =                        键值                        =
// ======================================================
app.factory("KV", function(NODE, $q) {
	var _KV = KV;

	_KV.prototype.assumeKey = function(key, valueIsList) {
		var _kv = this;
		var _split = key.split(".");

		$.each(_split, function (i, _key) {
			var _current = common.array.find(_key, _kv.value, "key", false, false);
			if(!_current) {
				_current = new _KV(_key, (i !== _split.length - 1) || valueIsList ? [] : "");
				_kv.value.push(_current);
			}
			_kv = _current;
		});

		return _kv;
	};

	_KV.prototype.getValueByPath = function (path, defaultValue) {
		var _kv = this;
		var _split = path.split(".");

		$.each(_split, function (i, _key) {
			_kv = common.array.find(_key, _kv.value, "key", false, false);
			if(!_kv) {
				return false;
			}
		});

		return _kv ? _kv.value : defaultValue;
	};

	_KV.prototype.bind = function(key, valueIsList) {
		var _kv = this.assumeKey(key, valueIsList);

		return function(value) {
			return (arguments.length ? (_kv.value = value) : _kv.value) || "";
		};
	};

	_KV.prototype.getBoolValue = function(key) {
		var _kv = this.assumeKey(key, false);
		return _kv.value === "1" ? true : false;
	};
	_KV.prototype.reverseBoolValue = function(key) {
		var _kv = this.assumeKey(key, false);
		_kv.value = _kv.value === "1" ? "0" : "1";
	};

	_KV.prototype.kvToString = function() {
		var _str = $.map(this.value, function(kv) {
			return '"'+kv.key+'"    "'+kv.value+'"';
		}).join("\n");
		return _str;
	};

	_KV.prototype.kvToMap = function() {
		if(!this._map) {
			var _map = this._map = {};
			$.each(this.value, function(i, kvUnit) {
				_map[kvUnit.key] = kvUnit.value;
			});
		}

		return this._map;
	};

	// ================================================
	// =                    格式化                    =
	// ================================================
	_KV.Writer = function() {
		this._writeTabIndex = 0;
		this._data = "";

		return this;
	};

	_KV.Writer.prototype.withHeader = function(title, initKV) {
		var _my = this;

		_my.writeComment(APP_APP_NAME);
		_my.writeComment("Get latest version: " + APP_APP_GITHUB);
		_my.write('');
		_my.write('"$1"', title);
		_my.write('{');
		$.each(initKV || {}, function(key, value) {
			_my.write('"$1"		"$2"', key, value);
		});
	};

	_KV.Writer.prototype.withEnd = function() {
		this.write('}');
	};

	_KV.Writer.prototype.withAttrList = function(entity, list) {
		var _my = this;

		$.each(list, function(i, group) {
			$.each(group.list, function(i, requestUnit) {
				if(/^_/.test(requestUnit.attr)) return;
				if(requestUnit.showFunc && !requestUnit.showFunc()) return;

				var _content = entity[requestUnit.attr];
				switch(typeof _content) {
					case "boolean":
						_content = _content ? "1" : "0";
						break;
					case "object":
						_content = common.map.join(_content, " | ");
						break;
				}

				if(_content && _content !== "-") {
					_my.write('"$1"					"$2"', requestUnit.attr, _content);
				}
			});
		});
	};

	_KV.Writer.prototype.writeContent = function(content) {
		var _my = this;
		$.each(content.split("\n"), function(i, line) {
			line = line.trim();
			if(!line) return;
			_my.write(line);
		});
	};

	_KV.Writer.prototype.write = function(template) {
		var _my = this;
		var text = template;
		for(var i = 1 ; i < arguments.length ; i += 1) {
			text = text.replace("$" + i, arguments[i]);
		}

		if(text.trim() === "}") this._writeTabIndex -= 1;

		$.each(text.split("\n"), function(i, line) {
			_my._data += (text ? common.text.repeat("	", _my._writeTabIndex) : "") + line + "\n";
		});

		if(text.trim() === "{") this._writeTabIndex += 1;
	}

	_KV.Writer.prototype.writeComment = function(text) {
		var _my = this;
		text = (text || "").trim();

		if(text) {
			$.each(text.split("\n"), function(i, line) {
				_my.write("// " + line);
			});
		}
	};

	_KV.Writer.prototype.save = function(path, encoding, _deferred) {
		_deferred = _deferred || $q.defer();
		NODE.saveFile(path, encoding, this._data).then(function() {
			_deferred.resolve();
		}, function(err) {
			_deferred.reject(err);
		});
		return _deferred;
	};

	return _KV;
});