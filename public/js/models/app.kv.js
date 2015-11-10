'use strict';

// ======================================================
// =                        键值                        =
// ======================================================
app.factory("KV", function(NODE, $q) {
	var _KV = function(list, keepValObjContent) {
		var _lines;
		if(typeof list === "string") {
			list = list.replace(/\{/g, "\n{").replace(/\}/g, "\n}");
			_lines = list.split(/\n/);
		} else {
			_lines = list;
		}

		var _tmpComment = "";
		var _tmpEntity, _tmpEntityStartLine;
		var _tmpLF = 0;

		this.title = null;
		this.comment = "";
		this.kvList = [];


		var _phase = 0;// 0 { not match; 1 { matched; 2 inner holder; 3 } matched;

		for(var _lineNum = 0 ; _lineNum < _lines.length ; _lineNum += 1) {
			var _line = (_lines[_lineNum] || "").trim();

			var _content = "";
			var _comment = "";

			var _commentPos = _line.indexOf("//");
			_content = _commentPos != -1 ? _line.slice(0, _commentPos) : _line;
			_comment = _commentPos != -1 ? _line.slice(_commentPos + 2) : "";
			_comment = _comment.replace(/^ /, "");

			_content = _content.trim();

			// 如果标题尚未匹配
			if(this.title === null) {
				if(_comment) this.comment += _comment + "\n";
				var _match = _content.match(/"(.*)"/);
				if(_match) {
					this.title = _match[1];
				}
			}

			// 如果已经匹配标题
			else {
				// 匹配 "{"
				if(_phase === 0) {
					if(_comment) this.comment += _comment + "\n";
					if(_content === "{") _phase = 1;

				// 匹配 Key - Value
				} else if(_phase === 1) {
					if(_comment) _tmpComment += _comment + "\n";
					var _match = _content.match(/"([^"]*)"(\s+"([^"]*)")?/);
					if(!_match) continue;

					var _key = _match[1];
					var _value = _match[3];
					if(_value !== undefined) {
						this.kvList.push({
							key: _key,
							value: _value,
							comment: _tmpComment,
						});
						_tmpComment = "";
					} else {
						_phase = 2;
						_tmpEntityStartLine = _lineNum;
						_tmpEntity = {
							key: _key,
							value: null,
							comment: _tmpComment,
						}
						this.kvList.push(_tmpEntity);
						_tmpComment = "";
					}

				// 匹配 Value Entity
				} else if(_phase === 2) {
					if(_content === "{") {
						_tmpLF += 1;
					} else if(_content === "}") {
						_tmpLF -= 1;
						if(_tmpLF === 0) {
							_tmpEntity.value = new _KV(_lines.slice(_tmpEntityStartLine, _lineNum + 1));
							_tmpEntity.value.comment = _tmpEntity.comment;
							if(keepValObjContent) _tmpEntity.value.content = _lines.slice(_tmpEntityStartLine, _lineNum + 1).join("\n");
							_phase = 1;
						}
					}
				}
			}
		}

		return this;
	};

	_KV.prototype.kvToString = function() {
		var _str = $.map(this.kvList, function(kv) {
			return '"'+kv.key+'"    "'+kv.value+'"';
		}).join("\n");
		return _str;
	};

	_KV.prototype.kvToMap = function() {
		if(!this._map) {
			var _map = this._map = {};
			$.each(this.kvList, function(i, kvUnit) {
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

	_KV.Writer.prototype.withKVList = function(entity, list) {
		var _my = this;

		$.each(list, function(i, requestUnit) {
			if(/^_/.test(requestUnit.attr)) return;

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