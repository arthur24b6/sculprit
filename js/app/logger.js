/**
 * @file
 * Provides an easy wrapper around logging.
 */

define(['config'], function(config) {

	return function(message) {
		if (typeof config.debug != 'undefined') {
			console.log(message);
		}
	};

});