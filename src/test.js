'use strict'
const {observable,observe} = require('./observer.js')

function print(newV, oldV) {
    console.log(oldV, `====>`, newV)
}


observe(print)
const observable1 = observable({
    abc: []
}, true)
console.log(observable1);
observable1.abc.push(1)
observable1.abc = [1, 2, 3, 4, 5]
observable1.abc[0] = 1
observable1.abc.push(2)
observable1.abc = {}
observable1.abc.c = {}
console.log(observable1);
