var base64chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';

/**
 * Error representing an invalid build config.
 * @param {string} message Error message.
 * @constructor
 */
var InvalidConfig = exports.InvalidConfig = function(message) {
  this.message = message;
  this.stack = (new Error()).stack;
};
InvalidConfig.prototype = new Error();
InvalidConfig.prototype.name = 'InvalidConfig';

/**
 * Get a unique identifier for a user generated build configuration.  The
 * identifier takes the form <symbols_enc>.<defines_enc> where the
 * symbols_enc and defines_enc are base 64 encoded values.  The symbols value
 * can be thought of a bit map where each bit determines if a particular symbol
 * is exported.  Likewise, the boolean defines can be represented as a binary
 * where each bit determines the value of the define.  These two values are
 * base64 encoded and concatenated with a dot to generate the build identifier.
 *
 * Throws InvalidConfig if the build config includes invalid symbols or defines.
 *
 * @param {Object} jobConfig A build configuration with a symbols object
 *     and a defines object.
 * @param {Object} releaseInfo An info.json object for a release.
 * @return {string} A unique identifier for the build.
 */
var getLongId = exports.getLongId = function(jobConfig, releaseInfo) {
  var id = '';
  var bits = 6;
  var validSymbols = {};
  var validDefines = {};
  var i, ii, j, value, name;

  // encode exported symbols
  for (i = 0, ii = releaseInfo.symbols.length; i < ii; i += bits) {
    value = 0;
    for (j = 0; j < bits && i + j < ii; ++j) {
      name = releaseInfo.symbols[i + j].name;
      validSymbols[name] = true;
      if (jobConfig.symbols[name]) {
        value |= 1 << j;
      }
    }
    id += base64chars[value];
  }

  id += '.';

  // encode defines
  for (i = 0, ii = releaseInfo.defines.length; i < ii; i += bits) {
    value = 0;
    for (j = 0; j < bits && i + j < ii; ++j) {
      name = releaseInfo.defines[i + j].name;
      validDefines[name] = true;
      if (name in jobConfig.defines) {
        if (jobConfig.defines[name]) {
          value |= 1 << j;
        }
      } else if (releaseInfo.defines[i + j].default) {
        value |= 1 << j;
      }
    }
    id += base64chars[value];
  }

  // validate symbols
  for (name in jobConfig.symbols) {
    if (!(name in validSymbols)) {
      throw new InvalidConfig('Invalid symbol name: ' + name);
    }
  }

  // validate defines
  for (name in jobConfig.defines) {
    if (!(name in validDefines)) {
      throw new InvalidConfig('Invalid define: ' + name);
    }
  }

  return id;
};

exports.getLongId = getLongId;
