# fis3-hook-fix
fix something of fis3 build

## fix addSameNameRequire
fis 没有提供接口设置文件的后缀名，默认把 `xxx.yy` 的 `.yy` 作为文件后缀名<br>
这也没什么错误，但是 fis 有一个逻辑是 `addSameNameRequire`(通过设置 `useSameNameRequire`)<br>
它会把同名的关联文件添加依赖，比如依赖 `index.js` 模块，也会同时依赖 `index.css`(如果存在的话)<br>
这个方式在实现的时候，会把文件名去掉后缀名，然后在添加需要同名依赖的类型，然后去找文件<br>
因为后缀名的关系，如果希望 `index.es6.js` 同名依赖 `index.css` 的话，就有问题了<br>
因此通过此插件 fix 这个问题，例子如下：
```
fis.hook('commonjs', {
    fixAddSameNameRequire: ['.es6.js']
});
```