(function (BASIC_TEST) {
    "use strict";

    if ( 'function' === typeof define &&
         'function' === typeof requirejs
    ) {

         (function (global) {
            requirejs.config({
                baseUrl: '../lib/'
            });
            requirejs([ 'version' ], function (version) {
                QUnit.start();

                global.is  = QUnit.strictEqual;
                global.mod = QUnit.module;


                BASIC_TEST(version);
            });
         })(window);

    } else if (
         'undefined' !== typeof module && module.exports &&
         'function'  === typeof require
    ) {

        (function () {
            var path  = require('path');
            var QUnit = require(path.join(
                            __dirname, 'qunit/qunit-1.10.0'));
            var qTap  = require(path.join(
                            __dirname, 'qunit/qunit-tap')).qunitTap;

            qTap( QUnit, console.log.bind(console) );
            QUnit.init();
            QUnit.config.updateRate = 0;

            [ "test", "asyncTest", "ok", "equal", "notEqual"
            , "deepEqual", "notDeepEqual", "strictEqual", "notStrictEqual"
            , "throws", "start", "stop"

            ].forEach(function (keyword) {
                global[keyword] = QUnit[keyword];
            });

            global.is  = QUnit.strictEqual;
            global.mod = QUnit.module;

            var version = require(path.join(
                              __dirname, '../lib/version')).version;

            BASIC_TEST(version);
        })();
    } else {

        (function (global) {
            global.is  = QUnit.strictEqual;
            global.mod = QUnit.module;

             BASIC_TEST(version);
        })(window);
    }

})(function (version) {
    "use strict";

    mod('00: exists "version"');
    test('exists "version"', function () {
        ok(version);
    });


    mod('01: validかどうか調べる。version.isValid(str)');
    test('case "JDK7u40"', function () {
        ok( version.isValid("JDK7u40") );
    });
    test('case "JDK1.6u11"', function () {
        ok( version.isValid("JDK1.6u11") );
    });
    test('case "hoge"', function () {
        ok( ! version.isValid("hoge") );
    });
    test('case "JDK7u9x"', function () {
        ok( ! version.isValid("JDK7u9x") );
    });
    test('case ""', function () {
        ok( ! version.isValid("") );
    });
    test('case {foo: "bar"}', function () {
        ok( ! version.isValid({foo: "bar"}) );
    });
    test('case null', function () {
        ok( ! version.isValid(null) );
    });
    test('case undefined', function () {
        ok( ! version.isValid() );
    });


    mod('02: parseしよう。version.parse(str)');
    test('case "JDK7u40"', function () {
        var v = version.parse("JDK7u40");
        ok(v);
        is( v.familyNumber, 7 );
        is( v.updateNumber, 40);
    });
    test('case "JDK12u0"', function () {
        var v = version.parse("JDK12u0");
        ok(v);
        is( v.familyNumber, 12 );
        is( v.updateNumber, 0);
    });
    test('case "JDK1.6u18"', function () {
        var v = version.parse("JDK1.6u18");
        ok(v);
        is( v.familyNumber, 1.6);
        is( v.updateNumber, 18);
    });
    test('case "" empty string', function () {
        throws(
            function () { version.parse("") }
          , /can not parse/
        );
    });
    test('case {foo: "bar"}', function () {
        throws(
            function () { version.parse({foo: "bar"}) }
          , /can not parse/
        );
    });
    test('case null', function () {
        throws(
            function () { version.parse(null) }
          , /can not parse/
        );
    });
    test('case undefined', function () {
        throws(
            function () { version.parse() }
          , /can not parse/
        );
    });


    mod('*: ._numbering()');
    test('u40._numbering()', function () {
        var us = ('7u40 8u0 9u9 10u1 1.6u11').split(' ').map(function (p) {
            return version.parse("JDK" + p);
        });
        var res = [ 7040, 8000, 9009, 10001, 1611 ];
        us.forEach(function (jdkNuNN, i) {
            is( jdkNuNN._numbering(), res[i] );
        });
    });


    mod('03: 大小比較しよう v.gt(versionObject) or v.lt(versionObject)', {
        setup: function () { this.u40 = version.parse('JDK7u40'); }
    });
    test('exists "u40"', function () {
        var u40 = this.u40;
        ok(u40);
        is(u40.familyNumber, 7);
        is(u40.updateNumber, 40);
    });
    test('u40.gt()', function () {
        var u40 = this.u40;
        throws(
            function () { u40.gt() }
          , /not "version object"/
        );
    });
    test('u40.gt(null)', function () {
        var u40 = this.u40;
        throws(
            function () { u40.gt(null) }
          , /not "version object"/
        );
    });
    test('u40.gt({familyNumber: 8, updateNumber: 12})', function () {
        var u40 = this.u40;
        throws(
            function () { u40.gt({familyNumber: 8, updateNumber: 12}) }
          , /not "version object"/
        );
    });
    test('u40.lt(version.parse("JDK7u51"))', function () {
        var u51 = version.parse("JDK7u51");
        ok(this.u40.lt(u51));
        ok(! this.u40.gt(u51));
    });
    test('! u40.lt(version.parse("JDK8u0"))', function () {
        var jdk8u0 =  version.parse("JDK8u0");
        ok(this.u40.lt(jdk8u0));
        ok(jdk8u0.gt(version.parse("JDK7u51")));
    });


    mod('04: 次の番号を計算しよう', {
        setup: function () {
            this.u45 = version.parse("JDK7u45");
            this.update = function (next, updateNumber) {
                ok(next);
                is(next.updateNumber, updateNumber);
                return next;
            };
        }
    });
    test('u60 = u45.nextLimitedUpdate()', function () {
        var u60 = this.update(this.u45.nextLimitedUpdate(), 60);
    });
    test('u51 = u45.nextCriticalPatchUpdate()', function () {
        var u51 = this.update(this.u45.nextCriticalPatchUpdate(), 51);
        var u55 = this.update(u51.nextCriticalPatchUpdate(), 55);
        var u61 = this.update(u55.nextCriticalPatchUpdate(), 61);
    });
    test('u5 = jdk7u[0~4].nextCriticalPatchUpdate()', function () {
        ('0 1 2 3 4').split(' ').map(function (nn) {
            return version.parse('JDK7u' + nn);
        }).forEach(function (jdk7uN) {
            var u5 = jdk7uN.nextCriticalPatchUpdate();
            ok(u5);
            is(u5.updateNumber, 5);
        });
    });
    test('u11 = jdk7u[5~9].nextCriticalPatchUpdate()', function () {
        ('5 6 7 8 9').split(' ').map(function (nn) {
            return version.parse('JDK7u' + nn);
        }).forEach(function (jdk7uN) {
            var u11 = jdk7uN.nextCriticalPatchUpdate();
            ok(u11);
            is(u11.updateNumber, 11);
        });
    });
    test('u46 = u45.nextSecurityAlert()', function () {
        var u46 = this.update(this.u45.nextSecurityAlert(), 46);
    });
    test('version.parse("JDK7u40").nextSecurityAlert()', function () {
        var update = this.update;
        var least = version.parse("JDK7u40");

        [ 41, 42, 43, 44, 46, 47, 48, 49, 50, 52, 53, 54, 56, 57, 58, 59 ]
        .forEach(function (ver) {
            least = update(least.nextSecurityAlert(), ver);
        });
    });
    test('version.parse("JDK8u0").nextSecurityAlert()', function () {
        var update = this.update;
        var least = version.parse("JDK8u0");

        [ 1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 16, 17, 18, 19 ]
        .forEach(function (ver) {
            least = update(least.nextSecurityAlert(), ver);
        });
    });


});
