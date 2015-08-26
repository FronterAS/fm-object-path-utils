/**
 * Taken from Chai - hasProperty, getValue, getInfo utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 *
 * Also taken from type-detect
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
(function (isNode, isAngular) {

    'use strict';

    var literals = {
            'number': Number,
            'string': String
        },

        objectTypeRegexp = /^\[object (.*)\]$/,

        getType = function (obj) {
            var type = Object.prototype.toString.call(obj).match(objectTypeRegexp)[1].toLowerCase();
            // Let "new String('')" return 'object'

            if (typeof Promise === 'function' && obj instanceof Promise) {
                return 'promise';
            }

            // PhantomJS has type "DOMWindow" for null
            if (obj === null) {
                return 'null';
            }

            // PhantomJS has type "DOMWindow" for undefined
            if (obj === undefined) {
                return 'undefined';
            }

            return type;
        },

        /**
         * ### .hasProperty(object, name)
         *
         * This allows checking whether an object has
         * named property or numeric array index.
         *
         * Basically does the same thing as the `in`
         * operator but works properly with natives
         * and null/undefined values.
         *
         *     var obj = {
         *         arr: ['a', 'b', 'c']
         *       , str: 'Hello'
         *     }
         *
         * The following would be the results.
         *
         *     hasProperty('str', obj);  // true
         *     hasProperty('constructor', obj);  // true
         *     hasProperty('bar', obj);  // false
         *
         *     hasProperty('length', obj.str); // true
         *     hasProperty(1, obj.str);  // true
         *     hasProperty(5, obj.str);  // false
         *
         *     hasProperty('length', obj.arr);  // true
         *     hasProperty(2, obj.arr);  // true
         *     hasProperty(3, obj.arr);  // false
         *
         * @static
         * @param {string|number} name
         * @param {Object} obj
         * @returns {boolean} whether it exists
         */
        hasProperty = function (name, obj) {
            var objectType = getType(obj);

            // Bad Object, obviously no props at all
            if (objectType === 'null' || objectType === 'undefined') {
                return false;
            }

            // The `in` operator does not work with certain literals
            // box these before the check
            if (literals[objectType] && typeof obj !== 'object') {
                obj = new literals[objectType](obj);
            }

            return name in obj;
        },

        /**
         * ## parse(path)
         *
         * Helper function used to parse string object
         * paths. Use in conjunction with `_getValue`.
         *
         *      var parsed = parse('myobject.property.subprop');
         *
         * ### Paths:
         *
         * * Can be as near infinitely deep and nested
         * * Arrays are also valid using the formal `myobject.document[3].property`.
         * * Literal dots and brackets (not delimiter) must be backslash-escaped.
         *
         * @private
         * @param {string} path
         * @returns {Object} parsed
         */
        parse = function (path) {
            var str = path.replace(/([^\\])\[/g, '$1.['),
                parts = str.match(/(\\\.|[^.]+?)+/g),

                toPropMap = function (value) {
                    var re = /^\[(\d+)\]$/,
                        mArr = re.exec(value);

                    if (mArr) {
                        return {
                            'i': parseFloat(mArr[1])
                        };

                    } else {
                        return {
                            'p': value.replace(/\\([.\[\]])/g, '$1')
                        };
                    }
                };

            return parts.map(toPropMap);
        },

        /**
         * ## _getValue(parsed, obj)
         *
         * Helper companion function for `.parse` that returns
         * the value located at the parsed address.
         *
         *      var value = getValue(parsed, obj);
         *
         * @private
         * @param {Object} parsed definition from `parse`.
         * @param {Object} obj to search against
         * @param {number} index to search against
         * @returns {Object|undefined} value
         */
        _getValue = function (parsed, obj, index) {
            var tmp = obj,
                part,
                res,
                i, l;

            index = (index === undefined ? parsed.length : index);

            for (i = 0, l = index; i < l; i += 1) {
                part = parsed[i];

                if (tmp) {
                    if (typeof part.p !== 'undefined') {
                        tmp = tmp[part.p];

                    } else if (typeof part.i !== 'undefined') {
                        tmp = tmp[part.i];
                    }

                    if (i === (l - 1)) {
                        res = tmp;
                    }

                } else {
                    res = undefined;
                }
            }

            return res;
        },

        /**
         * ### .getInfo(path, object)
         *
         * This allows the retrieval of property info in an
         * object given a string path.
         *
         * The path info consists of an object with the
         * following properties:
         *
         * * parent - The parent object of the property referenced by `path`
         * * name - The name of the final property, a number if it was an array indexer
         * * value - The value of the property, if it exists, otherwise `undefined`
         * * exists - Whether the property exists or nostatic
         *
         * @static
         * @param {string} path
         * @param {Object} obj
         * @returns {Object} info
         */
        getInfo = function (path, obj) {
            var parsed = parse(path),
                last   = parsed[parsed.length - 1],
                parent = parsed.length > 1 ? _getValue(parsed, obj, parsed.length - 1) : obj,

                info = {
                    'parent': parent,
                    'name': last.p || last.i,
                    'value': _getValue(parsed, obj)
                };

            info.exists = hasProperty(info.name, info.parent);

            return info;
        },

        /**
         * ### .getValue(path, object)
         *
         * This allows the retrieval of values in an
         * object given a string path.
         *
         *     var obj = {
         *         prop1: {
         *             arr: ['a', 'b', 'c']
         *           , str: 'Hello'
         *         }
         *       , prop2: {
         *             arr: [ { nested: 'Universe' } ]
         *           , str: 'Hello again!'
         *         }
         *     }
         *
         * The following would be the results.
         *
         *     getValue('prop1.str', obj); // Hello
         *     getValue('prop1.att[2]', obj); // b
         *     getValue('prop2.arr[0].nested', obj); // Universe
         *
         * @static
         * @param {string} path
         * @param {Object} obj
         * @returns {Object} value or `undefined`
         */
        getValue = function (path, obj) {
            var info = getInfo(path, obj);

            return info.value;
        },

        ObjectPathUtils = function () {};

    ObjectPathUtils.prototype.parse       = parse;
    ObjectPathUtils.prototype.getInfo     = getInfo;
    ObjectPathUtils.prototype.getValue    = getValue;
    ObjectPathUtils.prototype.hasProperty = hasProperty;

    if (isAngular) {
        angular.module('fng.utils.object.path', []).service('ObjectPathUtils', ObjectPathUtils);

    } else if (isNode) {
        exports.parse       = parse;
        exports.getInfo     = getInfo;
        exports.getValue    = getValue;
        exports.hasProperty = hasProperty;

    } else {
        window.ObjectPathUtils = new ObjectPathUtils();
    }

}(
    typeof module !== 'undefined' && module.exports,
    typeof window !== 'undefined' && !!window.angular
));
