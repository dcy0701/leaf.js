### leaf.js

##### 一个使用Proxy劫持的下一代状态管理方案


##### Example
```
const {observable,observe} = require('./src/observers.js')

function print() {
    console.log('changed')
}

observe(print)

const observable1 = observable({
    abc: {
        c: 1
    }
})

observable1.abc = {}// changed
observable1.abc.d = 2//changed
```

###### TODO
暂未支持es6新数据结构的劫持 比如*set, map, weakmap, weakset*
