function version1 () {
    var version = {
        reg: /^JDK(\d+)u(\d+)$/
    };
    version.valid = function (s) {
        return (typeof s !== 'string') ? false : this.reg.test(s);
    };
    version.parse = function (s) {
        if (! this.valid(s)) throw {name: 'error', message: 'parse error' };

        return s.match(this.reg);
    };

    return version;
}

function version2 () {
    var version = {
        reg: /^JDK(\d+)u(\d+)$/
    };
    version._parse = function (s) {
        return (typeof s !== 'string') ? null : s.match(this.reg);
    };
    version.valid = function (s) { return !! this._parse(s); };
    version.parse = function (s) {
        var res = this._parse(s);

        if (! res) throw {name: 'error', message: 'parse error'};

        return res;
    };

    return version;
}

var v1 = version1(), v2 = version2();

(new (require('benchmark')).Suite)

.add('version 1', function () {
    v1.parse('JDK12u0');
})

.add('version 2', function () {
    v2.parse('JDK12u0');
})

.on('cycle', function (e) {
    console.log(String(e.target));
})

.on('complete', function () {
    console.log('Fastest is "%s"', this.filter('fastest').pluck('name'));
})

.run({async: true})
;
