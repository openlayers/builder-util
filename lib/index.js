var bits = 6;

var base64chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';

var base64index = {};
for (var i = 0, ii = base64chars.length; i < ii; ++i) {
  base64index[base64chars.charAt(i)] = i;
}

/**
 * Error representing an invalid build config.
 * @param {string} message Error message.
 * @constructor
 */
function InvalidConfig(message) {
  this.message = message;
  this.stack = (new Error()).stack;
}
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
function getLongId(jobConfig, releaseInfo) {
  var id = '';
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
}

/**
 * Generate a build config from a long id and release info.  This performs
 * the inverse of the `getLongId()` function.
 * @param {string} longId A long build job identifier.
 * @param {Object} releaseInfo An object with a symbols array and a defines
 *     array.
 * @return {Object} An object with a symbols lookup and a defines lookup.
 */
function configForLongId(longId, releaseInfo) {
  var parts = longId.split('.');
  if (parts.length !== 2) {
    throw new Error('Invalid longId: ' + longId);
  }

  var numSymbols = releaseInfo.symbols.length;
  var encodedSymbols = parts[0];
  var symbols = {};
  for (var s = 0, ss = encodedSymbols.length; s < ss; ++s) {
    var symbolValue = base64index[encodedSymbols.charAt(s)];
    for (var bs = 0; bs < bits; ++bs) {
      var symbolOffset = s * bits + bs;
      if (symbolOffset < numSymbols) {
        var symbolCheck = 1 << bs;
        if ((symbolValue & symbolCheck) === symbolCheck) {
          symbols[releaseInfo.symbols[symbolOffset].name] = true;
        }
      } else if (s !== ss - 1) {
        throw new Error('Invalid longId: ' + longId);
      } else {
        break;
      }
    }
  }

  var numDefines = releaseInfo.defines.length;
  var encodedDefines = parts[1];
  var defines = {};
  for (var d = 0, dd = encodedDefines.length; d < dd; ++d) {
    var defineValue = base64index[encodedDefines.charAt(d)];
    for (var bd = 0; bd < bits; ++bd) {
      var defineCheck = 1 << bd;
      var defineOffset = d * bits + bd;
      if (defineOffset < numDefines) {
        defines[releaseInfo.defines[defineOffset].name] =
            (defineValue & defineCheck) === defineCheck;
      } else if (d !== dd - 1) {
        throw new Error('Invalid longId: ' + longId);
      } else {
        break;
      }
    }
  }

  return {
    symbols: symbols,
    defines: defines
  };
}

exports.InvalidConfig = InvalidConfig;
exports.configForLongId = configForLongId;
exports.getLongId = getLongId;
