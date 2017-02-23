// created by onion 2017.2.19
'use strict'

const observeSymbol = Symbol('leaf key')
// 这个属性作为proxy对象和普通对象的区别！
const queuedObservers = new Set()
// 观察者函数集合
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
    // 将一个函数加入观察者函数的集合
    const observer = {
        fn,
        thisobj,
    }
    queuedObservers.add(observer)
    return observer
}

function observable(obj) {
    // 代理一个普通对象 返回自身或者将其设置为代理对象
    return observers.get(obj) || toObservable(obj)
}

function toObservable(obj) {
    // 如果他是一个已经被代理的对象，则返回自身
    let observered
    if (Reflect.has(obj, observeSymbol)) {
        observered = obj
    } else {
        observered = new Proxy(obj, handler)
        Reflect.set(observered, observeSymbol, true)
    }
    proxies.set(obj, observered)
    observers.set(observered, new Map())
    return observered
}


function get(target, key, receiver) {
    const value = Reflect.get(...arguments)
    // 这里的处理逻辑是这样的，只有当用户get了这个key。 我们才会判断这个key是不是Object
    // 而且呢，只判断一层
    // 不读取所有 length valueOf Symbol inspect 属性
    const isObject = typeof value === 'object'
    let result = proxies.get(value)

    if (isObject && !result) {
        result = toObservable(value)
        Reflect.set(target, key, result, receiver)
        // get时候设置当前 不会引起set观察
        // 读取到的子属性，返回的值永远都是get并且原来的值已经直接丢弃掉
        // 不用担心一个问题。 直接get到的，都是proxy对象！~ 除非在observerable之前，就赋值。这种行为应该避免~~
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
    // 其实这里，主要是为了通知所有相关的函数
    // 假设对于所有注册的函数都通知吧
    if(typeof key==='symbol') return Reflect.set(...arguments)
    if(Reflect.get(target,key,receiver)!==value){
        // 执行观察者函数。异步
        runObservers()
    }
    // 如果 赋值的是一个对象
    let result = value
    if(typeof value === 'object'){
        // 则尝试去设置他
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
