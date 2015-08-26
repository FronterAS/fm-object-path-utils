fng-object-path-utils
=====================

A stripped down version of chaijs libraries to give both front and backend path parse and value
retrieval functionality without having to compile libraries with Browserify etc.

## Usage

As with chaijs (and filtr which uses the same code), usage is a string path to the desired property.

```javascript
var data = {
    nested: [
        {'body': 'foobar'}
    ]
};

ObjectPathUtils.getValue('nested[0].body', data);
// 'foobar'

```

## Compatibility

Module written to work in nodejs, vanilla frontend and angularjs.

### Vanilla

```html
<script src="fm-object-path-utils.js"></script>
<script>
    var data = {
        nested: [
            {'body': 'foobar'}
        ]
    };

    ObjectPathUtils.getValue('nested[0].body', data);
    // 'foobar'
</script>

```


### NodeJS

```javascript
var ObjectPathUtils = require('./fm-object-path-utils'),

    data = {
        nested: [
            {'body': 'foobar'}
        ]
    };

ObjectPathUtils.getValue('nested[0].body', data);
// 'foobar'
```


### AngularJS

```javascript
angular.module('myApp', ['fng.utils.object.path'])
    .controller(function (ObjectPathUtils) {
        var data = {
            nested: [
                {'body': 'foobar'}
            ]
        };

        ObjectPathUtils.getValue('nested[0].body', data);
        // 'foobar'
    });
```
