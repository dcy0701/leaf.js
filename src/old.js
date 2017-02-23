// created by onion 2017.2.19
'use strict'

const queuedObservers = new Set()
const proxies = new WeakMap()

function observe(fn, thisobj) {
    const observer = {
        fn,
        thisobj,
    }
    queuedObservers.add(observer)
    return observer
}

function observable(obj, deep, flag) {
    return proxies.get(obj) && proxies.get(obj).observable || toObservable(obj, deep, flag)
}

function toObservable(obj, deep, flag) {
    if (deep) {
        obj = observableAllKey(obj)
    }
    let observable = new Proxy(obj, {set})
    if (!flag) {
        proxies.set(obj, {
            observable: observable,
            deep: deep
        })
    }
    return observable
}

function observableAllKey(obj) {
    for (let key of Object.keys(obj)) {
        let datatype = {}.toString.call(obj[key])
        if ( datatype === '[object Object]' || datatype === '[object Array]') {
            obj[key] = observable(obj[key], true, true)
        }
    }
    return obj
}

function set(target, key, value, receiver) {
    let old = Reflect.get(target, key, receiver),
        datatype = {}.toString.call(value)
    if (value !== old && (datatype === '[object Object]' || datatype === '[object Array]')) {
        value = observable(value, true, true)
    }
    if (value !== old) {
        queuedObservers.forEach(observer => observer.fn.call(observer.thisobj, value, old))
    }

    return Reflect.set(...arguments)
}

function isObservable(obj) {
    return (proxies.get(obj)&&proxies.get(obj).observable === obj)
}

function apply(target,context,args){
    queuedObservers.forEach(observer => observer.fn.call(observer.thisobj))
    return Reflect.apply(...arguments)
}

// // 劫持数组
//
// const native = Array.prototype
// const methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
//
// for (let method of methods) {
//     native[method] = new Proxy(native[method], {apply})
// }

module.exports = {
    observe,
    observable,
    isObservable
}
