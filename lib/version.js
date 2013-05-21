(function (define) {
    define([], function () {
        "use strict";

        function search (ary, cb) {
            for (var i = 0, len = ary.length; i < len; i++) {
                if (cb(ary[i], i) === true) return [ ary[i], i ];
            }
            return null;
        }

        var version = {
            isPattern: /^JDK(\d+)u(\d+)$/
        };

        var _valid = function (s) {
            return (typeof s !== 'string') ? null
                                           : s.match( version.isPattern );
        };

        version.isValid = function (val) { return !! _valid( val ) };
        version.parse   = function (val) {
            var res = _valid( val );

            if (! res) throw new Error('Invalid Value - can not parse');

            return new Version(res[1], res[2]);
        };

        function Version (familyNumber, updateNumber) {
            this.familyNumber = Number(familyNumber);
            this.updateNumber = Number(updateNumber);
        }

        Version.prototype._numbering = function () {
            return (this.familyNumber * 100) + this.updateNumber;
        };

        var operators = {
            gt: function (num) { return num > 0 }
          , lt: function (num) { return num < 0 }
        //  , ge: function (num) { return num >= 0 }
        //  , le: function (num) { return num <= 0 }
        //  , eq: function (num) { return num === 0 }
        //  , ne: function (num) { return num !== 0 }
        };

        search(Object.keys(operators), function (key, i) {
            Version.prototype[key] = function (another) {
                if (typeof another !== 'object' ||
                    another === null ||
                    another.constructor !== this.constructor
                ) {
                    throw new TypeError(
                        '1st argument is not "version object"');
                }

                return operators[key](this._numbering() - another._numbering());
            };
        });

        var nexts = {
            nextLimitedUpdate: function (n) {
                return (Math.floor( n / 20 ) + 1) * 20;
            }
          , nextCriticalPatchUpdate: function (n) {
                n = (Math.floor( n / 5 ) + 1) * 5;
                return n % 2 == 0 ? n + 1 : n;
            }
          , nextSecurityAlert: function (n) {
                var helper = function (n) {
                    return [ 0, 5, 11, 15 ].some(function (ng) {
                        return (n % 20) === ng;
                    }) ? helper(n + 1) : n;
                };

                return helper(n + 1);
            }
        };

        search(Object.keys(nexts), function (update, i) {
            Version.prototype[update] = function () {
                var that = this;
                return new Version(
                    that.familyNumber
                  , nexts[update](that.updateNumber)
                );
            };
        });

        return version;
    });
})( // AMD - requirejs
    ( 'function' === typeof define &&
      'function' === typeof requirejs
    )
  ?
    define
  : // CommonJS - node.js
    ( 'undefined' !== typeof module && module.exports &&
      'function'  === typeof require
    )
  ?
    function (_deps, f) { module.exports.version = f() }
  : // this === window
    function (_deps, f) { this.version = f() }
);
