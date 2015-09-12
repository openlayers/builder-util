var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var util = require('../lib/index');

lab.experiment('getLongId()', function() {

  lab.test('scenario 1', function(done) {
    var buildConfig = {
      symbols: {
        'symbol.0': true,
        'symbol.2': true,
        'symbol.4': true,
        'symbol.6': true,
        'symbol.8': true
      },
      defines: {
        'define.0': false,
        'define.1': true,
        'define.2': false,
        'define.3': true
      }
    };

    var releaseInfo = {
      symbols: [
        {name: 'symbol.0'},
        {name: 'symbol.1'},
        {name: 'symbol.2'},
        {name: 'symbol.3'},
        {name: 'symbol.4'},
        {name: 'symbol.5'},
        {name: 'symbol.6'},
        {name: 'symbol.7'},
        {name: 'symbol.8'}
      ],
      defines: [
        {name: 'define.0', default: false},
        {name: 'define.1', default: false},
        {name: 'define.2', default: false},
        {name: 'define.3', default: false}
      ]
    };

    var id = util.getLongId(buildConfig, releaseInfo);
    expect(id).to.equal('l5.a');
    done();
  });

  lab.test('scenario 2', function(done) {
    var buildConfig = {
      symbols: {
        'symbol.1': true,
        'symbol.3': true
      },
      defines: {
        'define.0': true,
        'define.1': false,
        'define.2': true,
        'define.3': false
      }
    };

    var releaseInfo = {
      symbols: [
        {name: 'symbol.0'},
        {name: 'symbol.1'},
        {name: 'symbol.2'},
        {name: 'symbol.3'}
      ],
      defines: [
        {name: 'define.0', default: false},
        {name: 'define.1', default: false},
        {name: 'define.2', default: false},
        {name: 'define.3', default: false}
      ]
    };

    var id = util.getLongId(buildConfig, releaseInfo);
    expect(id).to.equal('a.5');
    done();
  });

  lab.test('scenario 3', function(done) {
    var buildConfig = {
      symbols: {
        'symbol.1': true,
        'symbol.3': true
      },
      defines: {
        // accept the defaults
      }
    };

    var releaseInfo = {
      symbols: [
        {name: 'symbol.0'},
        {name: 'symbol.1'},
        {name: 'symbol.2'},
        {name: 'symbol.3'}
      ],
      defines: [
        {name: 'define.0', default: true},
        {name: 'define.1', default: false},
        {name: 'define.2', default: true},
        {name: 'define.3', default: false}
      ]
    };

    var id = util.getLongId(buildConfig, releaseInfo);
    expect(id).to.equal('a.5');
    done();
  });

});
