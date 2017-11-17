/*************************************************************************
 *************************************************************************
 **
 ** File:        museUtilsJsPolyfill.js
 ** Project:
 ** Author:      Steven C. Buttgereit
 **
 ** (C) 2016-2017 Lima Buttgereit Holdings LLC d/b/a Muse Systems
 **
 ** Contact:
 ** muse.information@musesystems.com  :: https://muse.systems
 **
 ** License: MIT License. See LICENSE.md for complete licensing details.
 **
 *************************************************************************
 ************************************************************************/
try {
    //////////////////////////////////////////////////////////////////////////
    //  Namespace Definition
    //////////////////////////////////////////////////////////////////////////

    this.MuseUtils = this.MuseUtils || {};

    /**
     *  NOTE: Many of the polyfills here are copied from other sources verbatim.
     *  Each function will identify the source and applicable license.
     */

    /**
     * isIntger polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
     * This code is in the Public Domain per the licensing terms of the source
     * website.
     */
    Number.isInteger =
        Number.isInteger ||
        function(value) {
            return (
                typeof value === "number" &&
                isFinite(value) &&
                Math.floor(value) === value
            );
        };

    /**
     * isFinite polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite
     * This code is in the Public Domain per the licensing terms of the source
     * website.
     */
    Number.isFinite =
        Number.isFinite ||
        function(value) {
            return typeof value === "number" && isFinite(value);
        };

    /**
     * Object.assign polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
     * This code is in the Public Domain per the licensing terms of the source
     * website.
     */
    if (typeof Object.assign != "function") {
        (function() {
            Object.assign = function(target) {
                "use strict";
                // We must check against these specific cases.
                if (target === undefined || target === null) {
                    throw new TypeError(
                        "Cannot convert undefined or null to object"
                    );
                }

                var output = Object(target);
                for (var index = 1; index < arguments.length; index++) {
                    var source = arguments[index];
                    if (source !== undefined && source !== null) {
                        for (var nextKey in source) {
                            if (source.hasOwnProperty(nextKey)) {
                                output[nextKey] = source[nextKey];
                            }
                        }
                    }
                }
                return output;
            };
        })();
    }

    /**
     * Array.prototype.includes polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
     * This code is in the Public Domain per the licensing terms of the source
     * website.
     */
    // https://tc39.github.io/ecma262/#sec-array.prototype.includes
    if (!Array.prototype.includes) {
        Object.defineProperty(Array.prototype, "includes", {
            value: function(searchElement, fromIndex) {
                // 1. Let O be ? ToObject(this value).
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }

                var o = Object(this);

                // 2. Let len be ? ToLength(? Get(O, "length")).
                var len = o.length >>> 0;

                // 3. If len is 0, return false.
                if (len === 0) {
                    return false;
                }

                // 4. Let n be ? ToInteger(fromIndex).
                //    (If fromIndex is undefined, this step produces the value 0.)
                var n = fromIndex | 0;

                // 5. If n ≥ 0, then
                //  a. Let k be n.
                // 6. Else n < 0,
                //  a. Let k be len + n.
                //  b. If k < 0, let k be 0.
                var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

                // 7. Repeat, while k < len
                while (k < len) {
                    // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                    // b. If SameValueZero(searchElement, elementK) is true, return true.
                    // c. Increase k by 1.
                    // NOTE: === provides the correct "SameValueZero" comparison needed here.
                    if (o[k] === searchElement) {
                        return true;
                    }
                    k++;
                }

                // 8. Return false
                return false;
            }
        });
    }

    /**
     * Object.keys polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
     * This code is in the Public Domain per the licensing terms of the source
     * website.
    */
    if (!Object.keys) {
        Object.keys = (function() {
            "use strict";
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !{ toString: null }.propertyIsEnumerable(
                    "toString"
                ),
                dontEnums = [
                    "toString",
                    "toLocaleString",
                    "valueOf",
                    "hasOwnProperty",
                    "isPrototypeOf",
                    "propertyIsEnumerable",
                    "constructor"
                ],
                dontEnumsLength = dontEnums.length;

            return function(obj) {
                if (
                    typeof obj !== "function" &&
                    (typeof obj !== "object" || obj === null)
                ) {
                    throw new TypeError("Object.keys called on non-object");
                }

                var result = [],
                    prop,
                    i;

                for (prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) {
                        result.push(prop);
                    }
                }

                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }
                return result;
            };
        })();
    }

    // Set a flag indicating that this library is loaded.
    MuseUtils.isMuseUtilsJsPolyfillLoaded = true;
} catch (e) {
    QMessageBox.critical(
        mainwindow,
        "Muse Systems xTuple Utilities",
        "We failed loading the exception utilities. \n\n" + e.message
    );
}
