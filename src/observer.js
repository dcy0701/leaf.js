// created by onion 2017/2/23
'use strict'
const observeSymbol = Symbol('leaf key')
const queuedObservers = new Set()
const proxies = new WeakMap()
const observers = new WeakMap()
const handler = {
    get,
    set,
    deleteProperty
}

module.exports = {
    observe,
    observable,
    isObservable
}

function observe(fn, thisobj) {
    const observer = {
        fn,
        thisobj,
    }
    queuedObservers.add(observer)
    return observer
}

function observable(obj) {
    return observers.get(obj) || toObservable(obj)
}

function toObservable(obj) {
    let observered
    if (Reflect.has(obj, observeSymbol)) {
        observered = obj
    } else {
        observered = new Proxy(obj, handler)
        Reflect.set(observered, observeSymbol, true)
    }
    proxies.set(obj, observered)
    observers.set(observered, observered)
    return observered
}


function get(target, key, receiver) {
    const value = Reflect.get(...arguments)
    const isObject = typeof value === 'object'
    let result = proxies.get(value)

    if (isObject && !result) {
        result = toObservable(value)
        Reflect.set(target, key, result, receiver)
    }
    return result || value
}

function deleteProperty (target, key) {
  if (Reflect.has(target, key)) {
    runObservers()
  }
  return Reflect.deleteProperty(target, key)
}
function set(target, key, value, receiver) {
    if(typeof key==='symbol') return Reflect.set(...arguments)
    if(Reflect.get(target,key,receiver)!==value){
        runObservers()
    }
    let result = value
    if(typeof value === 'object'){
        result = toObservable(value)
    }
    return Reflect.set(target, key, result, receiver)
}

function runObservers(){
    Promise.resolve().then(()=>{
        queuedObservers.forEach((observer)=>{
            observer.fn.apply(observer.thisobj)
        })
    })
}

function isObservable(obj) {
    return Reflect.has(obj, observeSymbol)
}
