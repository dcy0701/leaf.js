'use strict'
const {observable,observe} = require('./observer.js')
function print() {
    console.log('变化了')
}


observe(print)
const observable1 = observable({
    abc: {
        d: 1
    }
}, true)
observable1.abc = {}
observable1.abc.d = 1
