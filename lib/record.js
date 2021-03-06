/**
 * Forward/Record
 */

var inherits = require('util').inherits;
var Resource = require('./resource').Resource;

/**
 * Record constructor
 *
 * @param  string url
 * @param  mixed result
 * @param  Client client
 * @param  Collection Collection
 */
var Record = function(url, result, client, collection) {

	Resource.call(this, url, result, client);

	if (this.$links) {
		this.__initLinks(this.$links);
	}

	this.collection = collection;
};

inherits(Record, Resource);

/**
 * Initialize record links
 *
 * @param  links
 */
Record.prototype.__initLinks = function(links) {

	for (var key in links) {
		if (!links.hasOwnProperty(key)) {
			continue;
		}
		(function(res, key) {
			var url = res.__linkUrl(key);
			// record.link(...)
			res[key] = function(callback) {
				if (typeof callback !== 'function') return;
				res.__client.get(url, null, callback);
				return this;
			};
			// record.link.each(...)
			res[key].each = function(callback) {
				if (typeof callback !== 'function') return;
				res[key](function(result) {
					if (result && result.results) {
						for (var i = 0; i < result.results.length; i++) {
							callback(result.results[i]);
						}
					} else {
						callback(result);
					}
				});
			};
			// record.link.get(...)
			res[key].get = function(relUrl, relData, callback) {
				if (typeof relUrl === 'function') {
					callback = relUrl;
					relUrl = null;
				} else if (typeof relData === 'function') {
					callback = relData;
					relData = null;
				}
				if (typeof relUrl === 'object') {
					relData = relUrl;
					relUrl = null;
					if (typeof relData === 'function') {
						callback = relData;
						relData = null;
					}
				}
				if (typeof callback !== 'function') return;
				if (relUrl) {
					url = url + '/' + relUrl.replace(/^\//, '');
				}
				res.__client.get(url, relData, callback);
				return this;
			};
			// api.put(record.link, ...)
			res[key].toString = function() {
				return url;
			};
		}(this, key));
	}
};

/**
 * Build a link url for client request
 *
 * @param  string field
 * @return string
 */
Record.prototype.__linkUrl = function(field) {

	var url = this.__url;
	var qpos = this.__url.indexOf('?');
	if (qpos !== -1) {
		url = url.substring(0, qpos);
	}
	return url.replace(/\/$/, '') + '/' + field;
};

/**
 * Record as inspected
 *
 * @return object
 */
Record.prototype.inspect = function() {
	var props = this.__getData();
	if (this.$links) {
		if (!this.collection) {
			props.$links = this.$links;
		}
	}
	return require('util').inspect(props);
};

// Exports
exports.Record = Record;