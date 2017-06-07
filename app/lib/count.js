'use strict';

module.exports = function (goods, address) {

    let total = 0;
    let addressKey = '';
    let whole = 0;

    for (let i = 0, l = goods.length; i < l; i++) {
        whole += parseInt(goods[i].price) * goods[i].quantity;
    }
    if (whole > 150) {
        return 0;
    }

    if ('KP'.indexOf(address) !== -1) {
        addressKey = 'a';
    }
    if ('PH,MY,TH,SG,ID,VN'.indexOf(address) !== -1) {
        addressKey = 'b';
    }
    if ('AU,PG,JP,NZ,BN'.indexOf(address) !== -1) {
        addressKey = 'c';
    }
    if ('US'.indexOf(address) !== -1) {
        addressKey = 'd';
    }
    if ('IE,AT,BE,DK,DE,FR,FJ,FI,CA,NL,LU,MT,NO,PT,SE,CH,ES,GB,IT'.indexOf(address) !== -1) {
        addressKey = 'e';
    }
    if ('BD,MM,NP,LK,TR,GR,IN,GI'.indexOf(address) !== -1) {
        addressKey = 'f';
    }
    if ('AR,AE,OM,EG,BB,BS,PY,BH,PA,BR,GD,CU,HN,KW,PE,QA,MX,SV,TT,JM,CY,SA,IL,JO,DZ,AZ,ET,CL,AL,EE,AD,AO,AI,AW,PH'.indexOf(address) !== -1) {
        addressKey = 'g';
    }

    function ceiling(x) {
        if (x <= 0.5) {
            return 0
        }
        if (Math.ceil(x) - x >= 0.5) {
            x = Math.ceil(x) - 0.5;
        } else {
            x = Math.ceil(x);
        }
        return x;
    }

    let map = {
        'a': function (x) {
            return 90 + ceiling(x) * 2*20+4
        },
        'b': function (x) {
            return 95 + ceiling(x) * 2*22.5+4
        },
        'c': function (x) {
            return 105 + ceiling(x) * 2*27.5+4
        },
        'd': function (x) {
            return 120 + ceiling(x) * 2*37.5+4
        },
        'e': function (x) {
            return 140 + ceiling(x) * 2*37.5+4
        },
        'f': function (x) {
            return 150 + ceiling(x) * 2*40+4
        },
        'g': function (x) {
            return 167.5 + ceiling(x) * 2*50+4
        }
    }

    if (goods) {
        for (let i = 0, l = goods.length; i < l; i++) {
            total += map[addressKey](goods[i].quantity * goods[i].weight);
        }
    } else {
        total = 0;
    }
    return total

}