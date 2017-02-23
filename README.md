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
        d: 1
    }
}, true)
observable1.abc = {}// changed
observable1.abc.d = 2//changed
```

###### TODO
该项目目前有很多缺点: 暂未支持es6新数据结构的劫持 比如*set, map, weakmap, weakset*
