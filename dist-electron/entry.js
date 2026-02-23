"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const electron = require("electron");
const path = require("path");
const typeorm = require("typeorm");
const fs = require("fs");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var Reflect2;
(function(Reflect3) {
  (function(factory) {
    var root = typeof commonjsGlobal === "object" ? commonjsGlobal : typeof self === "object" ? self : typeof this === "object" ? this : Function("return this;")();
    var exporter = makeExporter(Reflect3);
    if (typeof root.Reflect === "undefined") {
      root.Reflect = Reflect3;
    } else {
      exporter = makeExporter(root.Reflect, exporter);
    }
    factory(exporter);
    function makeExporter(target, previous) {
      return function(key, value) {
        if (typeof target[key] !== "function") {
          Object.defineProperty(target, key, { configurable: true, writable: true, value });
        }
        if (previous)
          previous(key, value);
      };
    }
  })(function(exporter) {
    var hasOwn = Object.prototype.hasOwnProperty;
    var supportsSymbol = typeof Symbol === "function";
    var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
    var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
    var supportsCreate = typeof Object.create === "function";
    var supportsProto = { __proto__: [] } instanceof Array;
    var downLevel = !supportsCreate && !supportsProto;
    var HashMap = {
      // create an object in dictionary mode (a.k.a. "slow" mode in v8)
      create: supportsCreate ? function() {
        return MakeDictionary(/* @__PURE__ */ Object.create(null));
      } : supportsProto ? function() {
        return MakeDictionary({ __proto__: null });
      } : function() {
        return MakeDictionary({});
      },
      has: downLevel ? function(map, key) {
        return hasOwn.call(map, key);
      } : function(map, key) {
        return key in map;
      },
      get: downLevel ? function(map, key) {
        return hasOwn.call(map, key) ? map[key] : void 0;
      } : function(map, key) {
        return map[key];
      }
    };
    var functionPrototype = Object.getPrototypeOf(Function);
    var usePolyfill = typeof process === "object" && process["env"] && process["env"]["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
    var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
    var _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
    var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
    var Metadata = new _WeakMap();
    function decorate(decorators, target, propertyKey, attributes) {
      if (!IsUndefined(propertyKey)) {
        if (!IsArray(decorators))
          throw new TypeError();
        if (!IsObject(target))
          throw new TypeError();
        if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
          throw new TypeError();
        if (IsNull(attributes))
          attributes = void 0;
        propertyKey = ToPropertyKey(propertyKey);
        return DecorateProperty(decorators, target, propertyKey, attributes);
      } else {
        if (!IsArray(decorators))
          throw new TypeError();
        if (!IsConstructor(target))
          throw new TypeError();
        return DecorateConstructor(decorators, target);
      }
    }
    exporter("decorate", decorate);
    function metadata(metadataKey, metadataValue) {
      function decorator(target, propertyKey) {
        if (!IsObject(target))
          throw new TypeError();
        if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
          throw new TypeError();
        OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
      }
      return decorator;
    }
    exporter("metadata", metadata);
    function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
    }
    exporter("defineMetadata", defineMetadata);
    function hasMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryHasMetadata(metadataKey, target, propertyKey);
    }
    exporter("hasMetadata", hasMetadata);
    function hasOwnMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
    }
    exporter("hasOwnMetadata", hasOwnMetadata);
    function getMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryGetMetadata(metadataKey, target, propertyKey);
    }
    exporter("getMetadata", getMetadata);
    function getOwnMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
    }
    exporter("getOwnMetadata", getOwnMetadata);
    function getMetadataKeys(target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryMetadataKeys(target, propertyKey);
    }
    exporter("getMetadataKeys", getMetadataKeys);
    function getOwnMetadataKeys(target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryOwnMetadataKeys(target, propertyKey);
    }
    exporter("getOwnMetadataKeys", getOwnMetadataKeys);
    function deleteMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      var metadataMap = GetOrCreateMetadataMap(
        target,
        propertyKey,
        /*Create*/
        false
      );
      if (IsUndefined(metadataMap))
        return false;
      if (!metadataMap.delete(metadataKey))
        return false;
      if (metadataMap.size > 0)
        return true;
      var targetMetadata = Metadata.get(target);
      targetMetadata.delete(propertyKey);
      if (targetMetadata.size > 0)
        return true;
      Metadata.delete(target);
      return true;
    }
    exporter("deleteMetadata", deleteMetadata);
    function DecorateConstructor(decorators, target) {
      for (var i = decorators.length - 1; i >= 0; --i) {
        var decorator = decorators[i];
        var decorated = decorator(target);
        if (!IsUndefined(decorated) && !IsNull(decorated)) {
          if (!IsConstructor(decorated))
            throw new TypeError();
          target = decorated;
        }
      }
      return target;
    }
    function DecorateProperty(decorators, target, propertyKey, descriptor) {
      for (var i = decorators.length - 1; i >= 0; --i) {
        var decorator = decorators[i];
        var decorated = decorator(target, propertyKey, descriptor);
        if (!IsUndefined(decorated) && !IsNull(decorated)) {
          if (!IsObject(decorated))
            throw new TypeError();
          descriptor = decorated;
        }
      }
      return descriptor;
    }
    function GetOrCreateMetadataMap(O, P, Create) {
      var targetMetadata = Metadata.get(O);
      if (IsUndefined(targetMetadata)) {
        if (!Create)
          return void 0;
        targetMetadata = new _Map();
        Metadata.set(O, targetMetadata);
      }
      var metadataMap = targetMetadata.get(P);
      if (IsUndefined(metadataMap)) {
        if (!Create)
          return void 0;
        metadataMap = new _Map();
        targetMetadata.set(P, metadataMap);
      }
      return metadataMap;
    }
    function OrdinaryHasMetadata(MetadataKey, O, P) {
      var hasOwn2 = OrdinaryHasOwnMetadata(MetadataKey, O, P);
      if (hasOwn2)
        return true;
      var parent = OrdinaryGetPrototypeOf(O);
      if (!IsNull(parent))
        return OrdinaryHasMetadata(MetadataKey, parent, P);
      return false;
    }
    function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
      var metadataMap = GetOrCreateMetadataMap(
        O,
        P,
        /*Create*/
        false
      );
      if (IsUndefined(metadataMap))
        return false;
      return ToBoolean(metadataMap.has(MetadataKey));
    }
    function OrdinaryGetMetadata(MetadataKey, O, P) {
      var hasOwn2 = OrdinaryHasOwnMetadata(MetadataKey, O, P);
      if (hasOwn2)
        return OrdinaryGetOwnMetadata(MetadataKey, O, P);
      var parent = OrdinaryGetPrototypeOf(O);
      if (!IsNull(parent))
        return OrdinaryGetMetadata(MetadataKey, parent, P);
      return void 0;
    }
    function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
      var metadataMap = GetOrCreateMetadataMap(
        O,
        P,
        /*Create*/
        false
      );
      if (IsUndefined(metadataMap))
        return void 0;
      return metadataMap.get(MetadataKey);
    }
    function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
      var metadataMap = GetOrCreateMetadataMap(
        O,
        P,
        /*Create*/
        true
      );
      metadataMap.set(MetadataKey, MetadataValue);
    }
    function OrdinaryMetadataKeys(O, P) {
      var ownKeys = OrdinaryOwnMetadataKeys(O, P);
      var parent = OrdinaryGetPrototypeOf(O);
      if (parent === null)
        return ownKeys;
      var parentKeys = OrdinaryMetadataKeys(parent, P);
      if (parentKeys.length <= 0)
        return ownKeys;
      if (ownKeys.length <= 0)
        return parentKeys;
      var set = new _Set();
      var keys = [];
      for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
        var key = ownKeys_1[_i];
        var hasKey = set.has(key);
        if (!hasKey) {
          set.add(key);
          keys.push(key);
        }
      }
      for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
        var key = parentKeys_1[_a];
        var hasKey = set.has(key);
        if (!hasKey) {
          set.add(key);
          keys.push(key);
        }
      }
      return keys;
    }
    function OrdinaryOwnMetadataKeys(O, P) {
      var keys = [];
      var metadataMap = GetOrCreateMetadataMap(
        O,
        P,
        /*Create*/
        false
      );
      if (IsUndefined(metadataMap))
        return keys;
      var keysObj = metadataMap.keys();
      var iterator = GetIterator(keysObj);
      var k = 0;
      while (true) {
        var next = IteratorStep(iterator);
        if (!next) {
          keys.length = k;
          return keys;
        }
        var nextValue = IteratorValue(next);
        try {
          keys[k] = nextValue;
        } catch (e) {
          try {
            IteratorClose(iterator);
          } finally {
            throw e;
          }
        }
        k++;
      }
    }
    function Type(x) {
      if (x === null)
        return 1;
      switch (typeof x) {
        case "undefined":
          return 0;
        case "boolean":
          return 2;
        case "string":
          return 3;
        case "symbol":
          return 4;
        case "number":
          return 5;
        case "object":
          return x === null ? 1 : 6;
        default:
          return 6;
      }
    }
    function IsUndefined(x) {
      return x === void 0;
    }
    function IsNull(x) {
      return x === null;
    }
    function IsSymbol(x) {
      return typeof x === "symbol";
    }
    function IsObject(x) {
      return typeof x === "object" ? x !== null : typeof x === "function";
    }
    function ToPrimitive(input, PreferredType) {
      switch (Type(input)) {
        case 0:
          return input;
        case 1:
          return input;
        case 2:
          return input;
        case 3:
          return input;
        case 4:
          return input;
        case 5:
          return input;
      }
      var hint = "string";
      var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
      if (exoticToPrim !== void 0) {
        var result = exoticToPrim.call(input, hint);
        if (IsObject(result))
          throw new TypeError();
        return result;
      }
      return OrdinaryToPrimitive(input);
    }
    function OrdinaryToPrimitive(O, hint) {
      var valueOf, result;
      {
        var toString_1 = O.toString;
        if (IsCallable(toString_1)) {
          var result = toString_1.call(O);
          if (!IsObject(result))
            return result;
        }
        var valueOf = O.valueOf;
        if (IsCallable(valueOf)) {
          var result = valueOf.call(O);
          if (!IsObject(result))
            return result;
        }
      }
      throw new TypeError();
    }
    function ToBoolean(argument) {
      return !!argument;
    }
    function ToString(argument) {
      return "" + argument;
    }
    function ToPropertyKey(argument) {
      var key = ToPrimitive(argument);
      if (IsSymbol(key))
        return key;
      return ToString(key);
    }
    function IsArray(argument) {
      return Array.isArray ? Array.isArray(argument) : argument instanceof Object ? argument instanceof Array : Object.prototype.toString.call(argument) === "[object Array]";
    }
    function IsCallable(argument) {
      return typeof argument === "function";
    }
    function IsConstructor(argument) {
      return typeof argument === "function";
    }
    function IsPropertyKey(argument) {
      switch (Type(argument)) {
        case 3:
          return true;
        case 4:
          return true;
        default:
          return false;
      }
    }
    function GetMethod(V, P) {
      var func = V[P];
      if (func === void 0 || func === null)
        return void 0;
      if (!IsCallable(func))
        throw new TypeError();
      return func;
    }
    function GetIterator(obj) {
      var method = GetMethod(obj, iteratorSymbol);
      if (!IsCallable(method))
        throw new TypeError();
      var iterator = method.call(obj);
      if (!IsObject(iterator))
        throw new TypeError();
      return iterator;
    }
    function IteratorValue(iterResult) {
      return iterResult.value;
    }
    function IteratorStep(iterator) {
      var result = iterator.next();
      return result.done ? false : result;
    }
    function IteratorClose(iterator) {
      var f = iterator["return"];
      if (f)
        f.call(iterator);
    }
    function OrdinaryGetPrototypeOf(O) {
      var proto = Object.getPrototypeOf(O);
      if (typeof O !== "function" || O === functionPrototype)
        return proto;
      if (proto !== functionPrototype)
        return proto;
      var prototype = O.prototype;
      var prototypeProto = prototype && Object.getPrototypeOf(prototype);
      if (prototypeProto == null || prototypeProto === Object.prototype)
        return proto;
      var constructor = prototypeProto.constructor;
      if (typeof constructor !== "function")
        return proto;
      if (constructor === O)
        return proto;
      return constructor;
    }
    function CreateMapPolyfill() {
      var cacheSentinel = {};
      var arraySentinel = [];
      var MapIterator = (
        /** @class */
        function() {
          function MapIterator2(keys, values, selector) {
            this._index = 0;
            this._keys = keys;
            this._values = values;
            this._selector = selector;
          }
          MapIterator2.prototype["@@iterator"] = function() {
            return this;
          };
          MapIterator2.prototype[iteratorSymbol] = function() {
            return this;
          };
          MapIterator2.prototype.next = function() {
            var index = this._index;
            if (index >= 0 && index < this._keys.length) {
              var result = this._selector(this._keys[index], this._values[index]);
              if (index + 1 >= this._keys.length) {
                this._index = -1;
                this._keys = arraySentinel;
                this._values = arraySentinel;
              } else {
                this._index++;
              }
              return { value: result, done: false };
            }
            return { value: void 0, done: true };
          };
          MapIterator2.prototype.throw = function(error) {
            if (this._index >= 0) {
              this._index = -1;
              this._keys = arraySentinel;
              this._values = arraySentinel;
            }
            throw error;
          };
          MapIterator2.prototype.return = function(value) {
            if (this._index >= 0) {
              this._index = -1;
              this._keys = arraySentinel;
              this._values = arraySentinel;
            }
            return { value, done: true };
          };
          return MapIterator2;
        }()
      );
      return (
        /** @class */
        function() {
          function Map2() {
            this._keys = [];
            this._values = [];
            this._cacheKey = cacheSentinel;
            this._cacheIndex = -2;
          }
          Object.defineProperty(Map2.prototype, "size", {
            get: function() {
              return this._keys.length;
            },
            enumerable: true,
            configurable: true
          });
          Map2.prototype.has = function(key) {
            return this._find(
              key,
              /*insert*/
              false
            ) >= 0;
          };
          Map2.prototype.get = function(key) {
            var index = this._find(
              key,
              /*insert*/
              false
            );
            return index >= 0 ? this._values[index] : void 0;
          };
          Map2.prototype.set = function(key, value) {
            var index = this._find(
              key,
              /*insert*/
              true
            );
            this._values[index] = value;
            return this;
          };
          Map2.prototype.delete = function(key) {
            var index = this._find(
              key,
              /*insert*/
              false
            );
            if (index >= 0) {
              var size = this._keys.length;
              for (var i = index + 1; i < size; i++) {
                this._keys[i - 1] = this._keys[i];
                this._values[i - 1] = this._values[i];
              }
              this._keys.length--;
              this._values.length--;
              if (key === this._cacheKey) {
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
              }
              return true;
            }
            return false;
          };
          Map2.prototype.clear = function() {
            this._keys.length = 0;
            this._values.length = 0;
            this._cacheKey = cacheSentinel;
            this._cacheIndex = -2;
          };
          Map2.prototype.keys = function() {
            return new MapIterator(this._keys, this._values, getKey);
          };
          Map2.prototype.values = function() {
            return new MapIterator(this._keys, this._values, getValue);
          };
          Map2.prototype.entries = function() {
            return new MapIterator(this._keys, this._values, getEntry);
          };
          Map2.prototype["@@iterator"] = function() {
            return this.entries();
          };
          Map2.prototype[iteratorSymbol] = function() {
            return this.entries();
          };
          Map2.prototype._find = function(key, insert) {
            if (this._cacheKey !== key) {
              this._cacheIndex = this._keys.indexOf(this._cacheKey = key);
            }
            if (this._cacheIndex < 0 && insert) {
              this._cacheIndex = this._keys.length;
              this._keys.push(key);
              this._values.push(void 0);
            }
            return this._cacheIndex;
          };
          return Map2;
        }()
      );
      function getKey(key, _) {
        return key;
      }
      function getValue(_, value) {
        return value;
      }
      function getEntry(key, value) {
        return [key, value];
      }
    }
    function CreateSetPolyfill() {
      return (
        /** @class */
        function() {
          function Set2() {
            this._map = new _Map();
          }
          Object.defineProperty(Set2.prototype, "size", {
            get: function() {
              return this._map.size;
            },
            enumerable: true,
            configurable: true
          });
          Set2.prototype.has = function(value) {
            return this._map.has(value);
          };
          Set2.prototype.add = function(value) {
            return this._map.set(value, value), this;
          };
          Set2.prototype.delete = function(value) {
            return this._map.delete(value);
          };
          Set2.prototype.clear = function() {
            this._map.clear();
          };
          Set2.prototype.keys = function() {
            return this._map.keys();
          };
          Set2.prototype.values = function() {
            return this._map.values();
          };
          Set2.prototype.entries = function() {
            return this._map.entries();
          };
          Set2.prototype["@@iterator"] = function() {
            return this.keys();
          };
          Set2.prototype[iteratorSymbol] = function() {
            return this.keys();
          };
          return Set2;
        }()
      );
    }
    function CreateWeakMapPolyfill() {
      var UUID_SIZE = 16;
      var keys = HashMap.create();
      var rootKey = CreateUniqueKey();
      return (
        /** @class */
        function() {
          function WeakMap2() {
            this._key = CreateUniqueKey();
          }
          WeakMap2.prototype.has = function(target) {
            var table = GetOrCreateWeakMapTable(
              target,
              /*create*/
              false
            );
            return table !== void 0 ? HashMap.has(table, this._key) : false;
          };
          WeakMap2.prototype.get = function(target) {
            var table = GetOrCreateWeakMapTable(
              target,
              /*create*/
              false
            );
            return table !== void 0 ? HashMap.get(table, this._key) : void 0;
          };
          WeakMap2.prototype.set = function(target, value) {
            var table = GetOrCreateWeakMapTable(
              target,
              /*create*/
              true
            );
            table[this._key] = value;
            return this;
          };
          WeakMap2.prototype.delete = function(target) {
            var table = GetOrCreateWeakMapTable(
              target,
              /*create*/
              false
            );
            return table !== void 0 ? delete table[this._key] : false;
          };
          WeakMap2.prototype.clear = function() {
            this._key = CreateUniqueKey();
          };
          return WeakMap2;
        }()
      );
      function CreateUniqueKey() {
        var key;
        do
          key = "@@WeakMap@@" + CreateUUID();
        while (HashMap.has(keys, key));
        keys[key] = true;
        return key;
      }
      function GetOrCreateWeakMapTable(target, create) {
        if (!hasOwn.call(target, rootKey)) {
          if (!create)
            return void 0;
          Object.defineProperty(target, rootKey, { value: HashMap.create() });
        }
        return target[rootKey];
      }
      function FillRandomBytes(buffer, size) {
        for (var i = 0; i < size; ++i)
          buffer[i] = Math.random() * 255 | 0;
        return buffer;
      }
      function GenRandomBytes(size) {
        if (typeof Uint8Array === "function") {
          if (typeof crypto !== "undefined")
            return crypto.getRandomValues(new Uint8Array(size));
          if (typeof msCrypto !== "undefined")
            return msCrypto.getRandomValues(new Uint8Array(size));
          return FillRandomBytes(new Uint8Array(size), size);
        }
        return FillRandomBytes(new Array(size), size);
      }
      function CreateUUID() {
        var data = GenRandomBytes(UUID_SIZE);
        data[6] = data[6] & 79 | 64;
        data[8] = data[8] & 191 | 128;
        var result = "";
        for (var offset = 0; offset < UUID_SIZE; ++offset) {
          var byte = data[offset];
          if (offset === 4 || offset === 6 || offset === 8)
            result += "-";
          if (byte < 16)
            result += "0";
          result += byte.toString(16).toLowerCase();
        }
        return result;
      }
    }
    function MakeDictionary(obj) {
      obj.__ = void 0;
      delete obj.__;
      return obj;
    }
  });
})(Reflect2 || (Reflect2 = {}));
var __defProp$e = Object.defineProperty;
var __decorateClass$e = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = decorator(target, key, result) || result;
  if (result) __defProp$e(target, key, result);
  return result;
};
class BaseEntity {
  constructor() {
    __publicField(this, "id");
    __publicField(this, "createdAt");
    __publicField(this, "updatedAt");
  }
}
__decorateClass$e([
  typeorm.PrimaryGeneratedColumn("uuid")
], BaseEntity.prototype, "id");
__decorateClass$e([
  typeorm.CreateDateColumn({ type: "datetime" })
], BaseEntity.prototype, "createdAt");
__decorateClass$e([
  typeorm.UpdateDateColumn({ type: "datetime" })
], BaseEntity.prototype, "updatedAt");
var __defProp$d = Object.defineProperty;
var __getOwnPropDesc$d = Object.getOwnPropertyDescriptor;
var __decorateClass$d = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$d(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$d(target, key, result);
  return result;
};
let PurchaseInvoiceItem = class extends BaseEntity {
  constructor() {
    super(...arguments);
    __publicField(this, "invoiceId");
    __publicField(this, "invoice");
    __publicField(this, "productId");
    __publicField(this, "quantity");
    __publicField(this, "netPrice");
    __publicField(this, "vatRate");
    __publicField(this, "vatAmount");
    __publicField(this, "grossPrice");
    __publicField(this, "gtuCode");
    __publicField(this, "batchNumber");
  }
};
__decorateClass$d([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoiceItem.prototype, "invoiceId", 2);
__decorateClass$d([
  typeorm.ManyToOne(() => PurchaseInvoice, (invoice) => invoice.items, { onDelete: "CASCADE" }),
  typeorm.JoinColumn({ name: "invoiceId" })
], PurchaseInvoiceItem.prototype, "invoice", 2);
__decorateClass$d([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoiceItem.prototype, "productId", 2);
__decorateClass$d([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], PurchaseInvoiceItem.prototype, "quantity", 2);
__decorateClass$d([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], PurchaseInvoiceItem.prototype, "netPrice", 2);
__decorateClass$d([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoiceItem.prototype, "vatRate", 2);
__decorateClass$d([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], PurchaseInvoiceItem.prototype, "vatAmount", 2);
__decorateClass$d([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], PurchaseInvoiceItem.prototype, "grossPrice", 2);
__decorateClass$d([
  typeorm.Column({ type: "varchar", nullable: true })
], PurchaseInvoiceItem.prototype, "gtuCode", 2);
__decorateClass$d([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoiceItem.prototype, "batchNumber", 2);
PurchaseInvoiceItem = __decorateClass$d([
  typeorm.Entity("purchase_invoice_items")
], PurchaseInvoiceItem);
var __defProp$c = Object.defineProperty;
var __getOwnPropDesc$c = Object.getOwnPropertyDescriptor;
var __decorateClass$c = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$c(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$c(target, key, result);
  return result;
};
let PurchaseInvoice = class extends BaseEntity {
  constructor() {
    super(...arguments);
    __publicField(this, "supplier");
    __publicField(this, "supplierNip");
    __publicField(this, "supplierAddress");
    __publicField(this, "invoiceNumber");
    __publicField(this, "invoiceDate");
    __publicField(this, "ksefId");
    __publicField(this, "isMpp");
    __publicField(this, "vatAmount");
    __publicField(this, "grossAmount");
    __publicField(this, "currency");
    __publicField(this, "status");
    __publicField(this, "items");
  }
};
__decorateClass$c([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoice.prototype, "supplier", 2);
__decorateClass$c([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoice.prototype, "supplierNip", 2);
__decorateClass$c([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoice.prototype, "supplierAddress", 2);
__decorateClass$c([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoice.prototype, "invoiceNumber", 2);
__decorateClass$c([
  typeorm.Column({ type: "date" })
], PurchaseInvoice.prototype, "invoiceDate", 2);
__decorateClass$c([
  typeorm.Column({ type: "varchar", length: 40, nullable: true })
], PurchaseInvoice.prototype, "ksefId", 2);
__decorateClass$c([
  typeorm.Column({ type: "boolean", default: false })
], PurchaseInvoice.prototype, "isMpp", 2);
__decorateClass$c([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], PurchaseInvoice.prototype, "vatAmount", 2);
__decorateClass$c([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], PurchaseInvoice.prototype, "grossAmount", 2);
__decorateClass$c([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoice.prototype, "currency", 2);
__decorateClass$c([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoice.prototype, "status", 2);
__decorateClass$c([
  typeorm.OneToMany(() => PurchaseInvoiceItem, (item) => item.invoice, { cascade: true })
], PurchaseInvoice.prototype, "items", 2);
PurchaseInvoice = __decorateClass$c([
  typeorm.Entity("purchase_invoices")
], PurchaseInvoice);
var __defProp$b = Object.defineProperty;
var __getOwnPropDesc$b = Object.getOwnPropertyDescriptor;
var __decorateClass$b = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$b(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$b(target, key, result);
  return result;
};
let Project = class {
  constructor() {
    __publicField(this, "id");
    __publicField(this, "name");
    __publicField(this, "clientName");
    __publicField(this, "status");
    __publicField(this, "assignedEmployeeId");
    __publicField(this, "materialsUsed");
    __publicField(this, "totalMaterialCost");
    __publicField(this, "createdAt");
    __publicField(this, "updatedAt");
  }
};
__decorateClass$b([
  typeorm.PrimaryGeneratedColumn("uuid")
], Project.prototype, "id", 2);
__decorateClass$b([
  typeorm.Column({ type: "varchar" })
], Project.prototype, "name", 2);
__decorateClass$b([
  typeorm.Column({ type: "varchar" })
], Project.prototype, "clientName", 2);
__decorateClass$b([
  typeorm.Column({ type: "varchar" })
], Project.prototype, "status", 2);
__decorateClass$b([
  typeorm.Column({ type: "varchar" })
], Project.prototype, "assignedEmployeeId", 2);
__decorateClass$b([
  typeorm.Column("simple-json")
], Project.prototype, "materialsUsed", 2);
__decorateClass$b([
  typeorm.Column("decimal", { precision: 10, scale: 2, default: 0 })
], Project.prototype, "totalMaterialCost", 2);
__decorateClass$b([
  typeorm.CreateDateColumn({ type: "datetime" })
], Project.prototype, "createdAt", 2);
__decorateClass$b([
  typeorm.UpdateDateColumn({ type: "datetime" })
], Project.prototype, "updatedAt", 2);
Project = __decorateClass$b([
  typeorm.Entity()
], Project);
var __defProp$a = Object.defineProperty;
var __getOwnPropDesc$a = Object.getOwnPropertyDescriptor;
var __decorateClass$a = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$a(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$a(target, key, result);
  return result;
};
let InventoryBatch = class extends BaseEntity {
  constructor() {
    super(...arguments);
    __publicField(this, "productId");
    __publicField(this, "batchNumber");
    __publicField(this, "purchasePrice");
    __publicField(this, "originalQuantity");
    __publicField(this, "remainingQuantity");
    __publicField(this, "expirationDate");
    __publicField(this, "categoryId");
  }
  // Helper to check if batch is depleted
  get isDepleted() {
    return this.remainingQuantity <= 0;
  }
};
__decorateClass$a([
  typeorm.Column({ type: "varchar" })
], InventoryBatch.prototype, "productId", 2);
__decorateClass$a([
  typeorm.Column({ type: "varchar" })
], InventoryBatch.prototype, "batchNumber", 2);
__decorateClass$a([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], InventoryBatch.prototype, "purchasePrice", 2);
__decorateClass$a([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], InventoryBatch.prototype, "originalQuantity", 2);
__decorateClass$a([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], InventoryBatch.prototype, "remainingQuantity", 2);
__decorateClass$a([
  typeorm.Column({ type: "date", nullable: true })
], InventoryBatch.prototype, "expirationDate", 2);
__decorateClass$a([
  typeorm.Column({ type: "varchar", nullable: true })
], InventoryBatch.prototype, "categoryId", 2);
InventoryBatch = __decorateClass$a([
  typeorm.Entity("inventory_batches")
], InventoryBatch);
var __defProp$9 = Object.defineProperty;
var __getOwnPropDesc$9 = Object.getOwnPropertyDescriptor;
var __decorateClass$9 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$9(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$9(target, key, result);
  return result;
};
let InventoryBatchUsage = class extends BaseEntity {
  constructor() {
    super(...arguments);
    __publicField(this, "batchId");
    __publicField(this, "documentItemId");
    __publicField(this, "quantity");
  }
};
__decorateClass$9([
  typeorm.Column({ type: "varchar" })
], InventoryBatchUsage.prototype, "batchId", 2);
__decorateClass$9([
  typeorm.Column({ type: "varchar" })
], InventoryBatchUsage.prototype, "documentItemId", 2);
__decorateClass$9([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], InventoryBatchUsage.prototype, "quantity", 2);
InventoryBatchUsage = __decorateClass$9([
  typeorm.Entity("inventory_batch_usages")
], InventoryBatchUsage);
var __defProp$8 = Object.defineProperty;
var __getOwnPropDesc$8 = Object.getOwnPropertyDescriptor;
var __decorateClass$8 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$8(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$8(target, key, result);
  return result;
};
var ProductType = /* @__PURE__ */ ((ProductType2) => {
  ProductType2["TOWAR"] = "TOWAR";
  ProductType2["USLUGA"] = "USLUGA";
  return ProductType2;
})(ProductType || {});
let Product = class extends BaseEntity {
  constructor() {
    super(...arguments);
    __publicField(this, "name");
    __publicField(this, "type");
    __publicField(this, "gtuCode");
    __publicField(this, "vatRate");
    __publicField(this, "unit");
    __publicField(this, "isActive");
  }
};
__decorateClass$8([
  typeorm.Column({ type: "varchar" })
], Product.prototype, "name", 2);
__decorateClass$8([
  typeorm.Column({
    type: "simple-enum",
    enum: ProductType,
    default: "TOWAR"
    /* TOWAR */
  })
], Product.prototype, "type", 2);
__decorateClass$8([
  typeorm.Column({ type: "varchar", nullable: true })
], Product.prototype, "gtuCode", 2);
__decorateClass$8([
  typeorm.Column({ type: "varchar" })
], Product.prototype, "vatRate", 2);
__decorateClass$8([
  typeorm.Column({ type: "varchar" })
], Product.prototype, "unit", 2);
__decorateClass$8([
  typeorm.Column({ type: "boolean", default: true })
], Product.prototype, "isActive", 2);
Product = __decorateClass$8([
  typeorm.Entity("products")
], Product);
var __defProp$7 = Object.defineProperty;
var __getOwnPropDesc$7 = Object.getOwnPropertyDescriptor;
var __decorateClass$7 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$7(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$7(target, key, result);
  return result;
};
let InventoryDocumentItem = class extends BaseEntity {
  constructor() {
    super(...arguments);
    __publicField(this, "documentId");
    __publicField(this, "document");
    __publicField(this, "productId");
    __publicField(this, "product");
    __publicField(this, "quantity");
    __publicField(this, "price");
    __publicField(this, "unit");
  }
};
__decorateClass$7([
  typeorm.Column({ type: "varchar" })
], InventoryDocumentItem.prototype, "documentId", 2);
__decorateClass$7([
  typeorm.ManyToOne(() => InventoryDocument, (doc) => doc.items, { onDelete: "CASCADE" }),
  typeorm.JoinColumn({ name: "documentId" })
], InventoryDocumentItem.prototype, "document", 2);
__decorateClass$7([
  typeorm.Column({ type: "varchar" })
], InventoryDocumentItem.prototype, "productId", 2);
__decorateClass$7([
  typeorm.ManyToOne(() => Product),
  typeorm.JoinColumn({ name: "productId" })
], InventoryDocumentItem.prototype, "product", 2);
__decorateClass$7([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], InventoryDocumentItem.prototype, "quantity", 2);
__decorateClass$7([
  typeorm.Column("decimal", { precision: 10, scale: 2, nullable: true })
], InventoryDocumentItem.prototype, "price", 2);
__decorateClass$7([
  typeorm.Column({ type: "varchar", nullable: true })
], InventoryDocumentItem.prototype, "unit", 2);
InventoryDocumentItem = __decorateClass$7([
  typeorm.Entity("inventory_document_items")
], InventoryDocumentItem);
var __defProp$6 = Object.defineProperty;
var __getOwnPropDesc$6 = Object.getOwnPropertyDescriptor;
var __decorateClass$6 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$6(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$6(target, key, result);
  return result;
};
var DocumentType = /* @__PURE__ */ ((DocumentType2) => {
  DocumentType2["PZ"] = "PZ";
  DocumentType2["WZ"] = "WZ";
  DocumentType2["RW"] = "RW";
  DocumentType2["PW"] = "PW";
  DocumentType2["INW"] = "INW";
  return DocumentType2;
})(DocumentType || {});
let InventoryDocument = class extends BaseEntity {
  constructor() {
    super(...arguments);
    __publicField(this, "documentNumber");
    __publicField(this, "type");
    __publicField(this, "date");
    __publicField(this, "referenceId");
    __publicField(this, "contractor");
    __publicField(this, "items");
  }
};
__decorateClass$6([
  typeorm.Column({ type: "varchar", unique: true })
], InventoryDocument.prototype, "documentNumber", 2);
__decorateClass$6([
  typeorm.Column({ type: "varchar" })
], InventoryDocument.prototype, "type", 2);
__decorateClass$6([
  typeorm.Column({ type: "date" })
], InventoryDocument.prototype, "date", 2);
__decorateClass$6([
  typeorm.Column({ type: "varchar", nullable: true })
], InventoryDocument.prototype, "referenceId", 2);
__decorateClass$6([
  typeorm.Column({ type: "varchar", nullable: true })
], InventoryDocument.prototype, "contractor", 2);
__decorateClass$6([
  typeorm.OneToMany(() => InventoryDocumentItem, (item) => item.document, { cascade: true })
], InventoryDocument.prototype, "items", 2);
InventoryDocument = __decorateClass$6([
  typeorm.Entity("inventory_documents")
], InventoryDocument);
var __defProp$5 = Object.defineProperty;
var __getOwnPropDesc$5 = Object.getOwnPropertyDescriptor;
var __decorateClass$5 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$5(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$5(target, key, result);
  return result;
};
let InvoiceItem = class extends BaseEntity {
  constructor() {
    super(...arguments);
    __publicField(this, "invoiceId");
    __publicField(this, "invoice");
    __publicField(this, "productId");
    __publicField(this, "productName");
    __publicField(this, "type");
    __publicField(this, "unit");
    __publicField(this, "quantity");
    __publicField(this, "priceNetCents");
    __publicField(this, "vatRate");
    __publicField(this, "vatValueCents");
    __publicField(this, "priceGrossCents");
  }
};
__decorateClass$5([
  typeorm.Column({ type: "varchar" })
], InvoiceItem.prototype, "invoiceId", 2);
__decorateClass$5([
  typeorm.ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: "CASCADE" }),
  typeorm.JoinColumn({ name: "invoiceId" })
], InvoiceItem.prototype, "invoice", 2);
__decorateClass$5([
  typeorm.Column({ type: "varchar", nullable: true })
], InvoiceItem.prototype, "productId", 2);
__decorateClass$5([
  typeorm.Column({ type: "varchar", nullable: true })
], InvoiceItem.prototype, "productName", 2);
__decorateClass$5([
  typeorm.Column({
    type: "varchar",
    default: "USLUGA"
  })
], InvoiceItem.prototype, "type", 2);
__decorateClass$5([
  typeorm.Column({ type: "varchar", nullable: true })
], InvoiceItem.prototype, "unit", 2);
__decorateClass$5([
  typeorm.Column({ type: "decimal", precision: 10, scale: 2 })
], InvoiceItem.prototype, "quantity", 2);
__decorateClass$5([
  typeorm.Column({ type: "integer" })
], InvoiceItem.prototype, "priceNetCents", 2);
__decorateClass$5([
  typeorm.Column({ type: "varchar" })
], InvoiceItem.prototype, "vatRate", 2);
__decorateClass$5([
  typeorm.Column({ type: "integer" })
], InvoiceItem.prototype, "vatValueCents", 2);
__decorateClass$5([
  typeorm.Column({ type: "integer" })
], InvoiceItem.prototype, "priceGrossCents", 2);
InvoiceItem = __decorateClass$5([
  typeorm.Entity("invoice_items")
], InvoiceItem);
var __defProp$4 = Object.defineProperty;
var __getOwnPropDesc$4 = Object.getOwnPropertyDescriptor;
var __decorateClass$4 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$4(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$4(target, key, result);
  return result;
};
var InvoiceType = /* @__PURE__ */ ((InvoiceType2) => {
  InvoiceType2["PURCHASE"] = "PURCHASE";
  InvoiceType2["SALE"] = "SALE";
  return InvoiceType2;
})(InvoiceType || {});
var KsefStatus = /* @__PURE__ */ ((KsefStatus2) => {
  KsefStatus2["NIEPRZESŁANO"] = "NIEPRZESŁANO";
  KsefStatus2["OCZEKUJE"] = "OCZEKUJE";
  KsefStatus2["PRZYJĘTO"] = "PRZYJĘTO";
  KsefStatus2["BŁĄD"] = "BŁĄD";
  return KsefStatus2;
})(KsefStatus || {});
let Invoice = class extends BaseEntity {
  constructor() {
    super(...arguments);
    __publicField(this, "type");
    __publicField(this, "invoiceNumber");
    __publicField(this, "issueDate");
    __publicField(this, "dueDate");
    __publicField(this, "nip");
    __publicField(this, "ksefId");
    __publicField(this, "currency");
    __publicField(this, "totalNetCents");
    __publicField(this, "totalVatCents");
    __publicField(this, "totalGrossCents");
    __publicField(this, "isPaid");
    __publicField(this, "ksefStatus");
    __publicField(this, "ksefReferenceNumber");
    __publicField(this, "ksefArchiveLink");
    __publicField(this, "items");
    __publicField(this, "clientId");
    __publicField(this, "client");
  }
};
__decorateClass$4([
  typeorm.Column({
    type: "simple-enum",
    enum: InvoiceType,
    default: "SALE"
    /* SALE */
  })
], Invoice.prototype, "type", 2);
__decorateClass$4([
  typeorm.Column({ type: "varchar" })
], Invoice.prototype, "invoiceNumber", 2);
__decorateClass$4([
  typeorm.Column({ type: "datetime" })
], Invoice.prototype, "issueDate", 2);
__decorateClass$4([
  typeorm.Column({ type: "datetime" })
], Invoice.prototype, "dueDate", 2);
__decorateClass$4([
  typeorm.Column({ type: "varchar", nullable: true })
], Invoice.prototype, "nip", 2);
__decorateClass$4([
  typeorm.Column({ type: "varchar", nullable: true })
], Invoice.prototype, "ksefId", 2);
__decorateClass$4([
  typeorm.Column({ type: "varchar", default: "PLN" })
], Invoice.prototype, "currency", 2);
__decorateClass$4([
  typeorm.Column({ type: "integer", default: 0 })
], Invoice.prototype, "totalNetCents", 2);
__decorateClass$4([
  typeorm.Column({ type: "integer", default: 0 })
], Invoice.prototype, "totalVatCents", 2);
__decorateClass$4([
  typeorm.Column({ type: "integer", default: 0 })
], Invoice.prototype, "totalGrossCents", 2);
__decorateClass$4([
  typeorm.Column({ type: "boolean", default: false })
], Invoice.prototype, "isPaid", 2);
__decorateClass$4([
  typeorm.Column({
    type: "simple-enum",
    enum: KsefStatus,
    default: "NIEPRZESŁANO"
    /* NIEPRZESŁANO */
  })
], Invoice.prototype, "ksefStatus", 2);
__decorateClass$4([
  typeorm.Column({ type: "varchar", nullable: true })
], Invoice.prototype, "ksefReferenceNumber", 2);
__decorateClass$4([
  typeorm.Column({ type: "varchar", nullable: true })
], Invoice.prototype, "ksefArchiveLink", 2);
__decorateClass$4([
  typeorm.OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
], Invoice.prototype, "items", 2);
__decorateClass$4([
  typeorm.Column({ type: "uuid", nullable: true })
], Invoice.prototype, "clientId", 2);
__decorateClass$4([
  typeorm.ManyToOne(() => Client, (client) => client.invoices),
  typeorm.JoinColumn({ name: "clientId" })
], Invoice.prototype, "client", 2);
Invoice = __decorateClass$4([
  typeorm.Entity("invoices")
], Invoice);
var __defProp$3 = Object.defineProperty;
var __getOwnPropDesc$3 = Object.getOwnPropertyDescriptor;
var __decorateClass$3 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$3(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$3(target, key, result);
  return result;
};
let Client = class extends BaseEntity {
  constructor() {
    super(...arguments);
    __publicField(this, "name");
    __publicField(this, "nip");
    __publicField(this, "phone");
    __publicField(this, "address");
    __publicField(this, "regon");
    __publicField(this, "email");
    __publicField(this, "type");
    __publicField(this, "isActive");
    __publicField(this, "invoices");
  }
};
__decorateClass$3([
  typeorm.Column({ type: "varchar" })
], Client.prototype, "name", 2);
__decorateClass$3([
  typeorm.Column({ type: "varchar", unique: true, nullable: true })
], Client.prototype, "nip", 2);
__decorateClass$3([
  typeorm.Column({ type: "varchar", nullable: true })
], Client.prototype, "phone", 2);
__decorateClass$3([
  typeorm.Column({ type: "varchar", nullable: true })
], Client.prototype, "address", 2);
__decorateClass$3([
  typeorm.Column({ type: "varchar", nullable: true })
], Client.prototype, "regon", 2);
__decorateClass$3([
  typeorm.Column({ type: "varchar", nullable: true })
], Client.prototype, "email", 2);
__decorateClass$3([
  typeorm.Column({ type: "varchar", default: "CUSTOMER" })
], Client.prototype, "type", 2);
__decorateClass$3([
  typeorm.Column({ type: "boolean", default: true })
], Client.prototype, "isActive", 2);
__decorateClass$3([
  typeorm.OneToMany(() => Invoice, (invoice) => invoice.client)
], Client.prototype, "invoices", 2);
Client = __decorateClass$3([
  typeorm.Entity("clients")
], Client);
var __defProp$2 = Object.defineProperty;
var __getOwnPropDesc$2 = Object.getOwnPropertyDescriptor;
var __decorateClass$2 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$2(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$2(target, key, result);
  return result;
};
let Dictionary = class {
  constructor() {
    __publicField(this, "id");
    __publicField(this, "category");
    __publicField(this, "code");
    __publicField(this, "value");
    __publicField(this, "isSystem");
    __publicField(this, "createdAt");
    __publicField(this, "updatedAt");
  }
};
__decorateClass$2([
  typeorm.PrimaryGeneratedColumn("uuid")
], Dictionary.prototype, "id", 2);
__decorateClass$2([
  typeorm.Column({ type: "varchar" })
], Dictionary.prototype, "category", 2);
__decorateClass$2([
  typeorm.Column({ type: "varchar", nullable: true })
], Dictionary.prototype, "code", 2);
__decorateClass$2([
  typeorm.Column({ type: "varchar" })
], Dictionary.prototype, "value", 2);
__decorateClass$2([
  typeorm.Column({ type: "boolean", default: false })
], Dictionary.prototype, "isSystem", 2);
__decorateClass$2([
  typeorm.CreateDateColumn({ type: "datetime" })
], Dictionary.prototype, "createdAt", 2);
__decorateClass$2([
  typeorm.UpdateDateColumn({ type: "datetime" })
], Dictionary.prototype, "updatedAt", 2);
Dictionary = __decorateClass$2([
  typeorm.Entity()
], Dictionary);
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$1(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$1(target, key, result);
  return result;
};
let Expense = class extends BaseEntity {
  constructor() {
    super(...arguments);
    __publicField(this, "category");
    __publicField(this, "description");
    __publicField(this, "amountCents");
    __publicField(this, "date");
  }
};
__decorateClass$1([
  typeorm.Column({ type: "varchar" })
], Expense.prototype, "category", 2);
__decorateClass$1([
  typeorm.Column({ type: "varchar", nullable: true })
], Expense.prototype, "description", 2);
__decorateClass$1([
  typeorm.Column({ type: "integer" })
], Expense.prototype, "amountCents", 2);
__decorateClass$1([
  typeorm.Column({ type: "datetime" })
], Expense.prototype, "date", 2);
Expense = __decorateClass$1([
  typeorm.Entity("expenses")
], Expense);
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp2(target, key, result);
  return result;
};
var InventoryTransactionType = /* @__PURE__ */ ((InventoryTransactionType2) => {
  InventoryTransactionType2["PZ"] = "PZ";
  InventoryTransactionType2["WZ"] = "WZ";
  return InventoryTransactionType2;
})(InventoryTransactionType || {});
let InventoryTransaction = class extends BaseEntity {
  constructor() {
    super(...arguments);
    __publicField(this, "type");
    __publicField(this, "productId");
    __publicField(this, "quantity");
    __publicField(this, "invoiceId");
    __publicField(this, "costPrice");
  }
  // Cena zakupu wyliczona przez FIFO (dla WZ)
};
__decorateClass([
  typeorm.Column({
    type: "simple-enum",
    enum: InventoryTransactionType
  })
], InventoryTransaction.prototype, "type", 2);
__decorateClass([
  typeorm.Column({ type: "varchar" })
], InventoryTransaction.prototype, "productId", 2);
__decorateClass([
  typeorm.Column({ type: "decimal", precision: 10, scale: 2 })
], InventoryTransaction.prototype, "quantity", 2);
__decorateClass([
  typeorm.Column({ type: "varchar", nullable: true })
], InventoryTransaction.prototype, "invoiceId", 2);
__decorateClass([
  typeorm.Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
], InventoryTransaction.prototype, "costPrice", 2);
InventoryTransaction = __decorateClass([
  typeorm.Entity("inventory_transactions")
], InventoryTransaction);
let dbPath = ":memory:";
try {
  if (process.env.NODE_ENV !== "test") {
    const userDataPath = electron.app ? electron.app.getPath("userData") : null;
    if (userDataPath) {
      dbPath = path.join(userDataPath, "green_manager.sqlite");
    } else if (!electron.app) {
      dbPath = path.join(__dirname, "../../../../green_manager_dev.sqlite");
    }
  }
} catch (e) {
  console.warn("[DB] Could not resolve userData path yet, using :memory: or default.");
}
const AppDataSource = new typeorm.DataSource({
  type: "better-sqlite3",
  database: dbPath,
  synchronize: true,
  // Auto-create tables for dev only
  logging: true,
  entities: [
    PurchaseInvoice,
    PurchaseInvoiceItem,
    Project,
    InventoryBatch,
    InventoryBatchUsage,
    InventoryDocument,
    InventoryDocumentItem,
    Client,
    Dictionary,
    Invoice,
    Expense,
    Product,
    InvoiceItem,
    InventoryTransaction
  ],
  migrations: [],
  subscribers: []
});
class InsufficientStockException extends Error {
  constructor(productId, required, available) {
    const missing = required - available;
    super(
      `Insufficient stock for product ${productId}. Required: ${required}, Available: ${available}, Missing: ${missing}`
    );
    this.name = "InsufficientStockException";
  }
}
class InventoryService {
  constructor(dataSourceOrManager = AppDataSource) {
    __publicField(this, "batchRepository");
    __publicField(this, "docRepository");
    this.batchRepository = dataSourceOrManager.getRepository(InventoryBatch);
    this.docRepository = dataSourceOrManager.getRepository(InventoryDocument);
  }
  async generateDocumentNumber(type) {
    const date = /* @__PURE__ */ new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const prefix = `${type}/${year}/${month}/`;
    const latestDoc = await this.docRepository.createQueryBuilder("doc").where("doc.documentNumber LIKE :prefix", { prefix: `${prefix}%` }).orderBy("doc.documentNumber", "DESC").getOne();
    let sequence = 1;
    if (latestDoc) {
      const parts = latestDoc.documentNumber.split("/");
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) {
        sequence = lastNum + 1;
      }
    }
    return `${prefix}${String(sequence).padStart(3, "0")}`;
  }
  async createDocument(type, referenceId, items) {
    const doc = new InventoryDocument();
    doc.documentNumber = await this.generateDocumentNumber(type);
    doc.type = type;
    doc.date = /* @__PURE__ */ new Date();
    doc.referenceId = referenceId;
    doc.items = items.map((item) => {
      const docItem = new InventoryDocumentItem();
      docItem.productId = item.productId;
      docItem.quantity = item.quantity;
      docItem.price = item.price;
      return docItem;
    });
    return await this.docRepository.save(doc);
  }
  async getDocuments() {
    return await this.docRepository.find({
      relations: ["items"],
      order: { createdAt: "DESC" }
    });
  }
  async addStock(productIdOrName, batchNumber, quantity, price, unit = "szt", categoryId) {
    if (price < 0) {
      throw new Error("Price must be non-negative");
    }
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }
    return await AppDataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const batchRepo = manager.getRepository(InventoryBatch);
      const docRepo = manager.getRepository(InventoryDocument);
      const docItemRepo = manager.getRepository(InventoryDocumentItem);
      const transRepo = manager.getRepository(InventoryTransaction);
      let product = await productRepo.findOne({
        where: [
          { id: productIdOrName },
          { name: productIdOrName }
        ]
      });
      if (!product) {
        product = new Product();
        product.name = productIdOrName;
        product.type = ProductType.TOWAR;
        product.unit = unit;
        product.vatRate = "23%";
        product.isActive = true;
        await productRepo.save(product);
      } else if (product.unit !== unit) {
        product.unit = unit;
        await productRepo.save(product);
      }
      const doc = new InventoryDocument();
      doc.documentNumber = await this.generateDocumentNumber(DocumentType.PZ);
      doc.type = DocumentType.PZ;
      doc.date = /* @__PURE__ */ new Date();
      doc.referenceId = `MANUAL-${Date.now()}`;
      doc.contractor = "PRZYJĘCIE RĘCZNE";
      await docRepo.save(doc);
      const docItem = new InventoryDocumentItem();
      docItem.documentId = doc.id;
      docItem.productId = product.id;
      docItem.quantity = quantity;
      docItem.price = price;
      docItem.unit = unit;
      await docItemRepo.save(docItem);
      const batch = new InventoryBatch();
      batch.productId = product.id;
      batch.batchNumber = batchNumber;
      batch.originalQuantity = quantity;
      batch.remainingQuantity = quantity;
      batch.purchasePrice = price;
      batch.categoryId = categoryId;
      const savedBatch = await batchRepo.save(batch);
      const transaction = new InventoryTransaction();
      transaction.type = InventoryTransactionType.PZ;
      transaction.productId = product.id;
      transaction.quantity = quantity;
      transaction.invoiceId = doc.referenceId;
      await transRepo.save(transaction);
      return savedBatch;
    });
  }
  async calculateFIFOCost(productId, quantityRequired) {
    if (quantityRequired <= 0) throw new Error("Quantity must be positive");
    const batches = await this.batchRepository.find({
      where: { productId },
      order: { createdAt: "ASC" }
    });
    const activeBatches = batches.filter((b) => b.remainingQuantity > 0);
    const totalAvailable = activeBatches.reduce((sum, b) => sum + b.remainingQuantity, 0);
    if (totalAvailable < quantityRequired) {
      throw new InsufficientStockException(productId, quantityRequired, totalAvailable);
    }
    let totalCost = 0;
    let remainingNeeded = quantityRequired;
    for (const batch of activeBatches) {
      if (remainingNeeded <= 0) break;
      const takeFromBatch = Math.min(remainingNeeded, batch.remainingQuantity);
      totalCost += takeFromBatch * batch.purchasePrice;
      remainingNeeded -= takeFromBatch;
    }
    return Math.round(totalCost * 100) / 100;
  }
  // This method would be called within a transaction
  async consumeStock(productId, quantityRequired) {
    const manager = AppDataSource.manager;
    await this.calculateFIFOCostAndConsume(productId, quantityRequired, "internal", manager);
  }
  /**
   * TICKET 10.2: Implementacja algorytmu FIFO (Rozchód i Wycena)
   * Pobiera towar z najstarszych partii, tworzy rekordy użycia i zwraca całkowity koszt.
   */
  async calculateFIFOCostAndConsume(productId, quantityRequired, documentItemId, manager) {
    if (quantityRequired <= 0) throw new Error("Quantity must be positive");
    const batchRepo = manager.getRepository(InventoryBatch);
    const usageRepo = manager.getRepository(InventoryBatchUsage);
    const batches = await batchRepo.find({
      where: { productId },
      order: { createdAt: "ASC" }
    });
    const activeBatches = batches.filter((b) => b.remainingQuantity > 0);
    const totalAvailable = activeBatches.reduce((sum, b) => sum + Number(b.remainingQuantity), 0);
    if (totalAvailable < quantityRequired) {
      throw new InsufficientStockException(productId, quantityRequired, totalAvailable);
    }
    let totalCost = 0;
    let remainingNeeded = quantityRequired;
    for (const batch of activeBatches) {
      if (remainingNeeded <= 0) break;
      const takeFromBatch = Math.min(remainingNeeded, batch.remainingQuantity);
      const batchCost = takeFromBatch * Number(batch.purchasePrice);
      batch.remainingQuantity -= takeFromBatch;
      await batchRepo.save(batch);
      const usage = new InventoryBatchUsage();
      usage.batchId = batch.id;
      usage.documentItemId = documentItemId;
      usage.quantity = takeFromBatch;
      await usageRepo.save(usage);
      totalCost += batchCost;
      remainingNeeded -= takeFromBatch;
    }
    const averagePrice = quantityRequired > 0 ? totalCost / quantityRequired : 0;
    return {
      totalCost: Math.round(totalCost * 100) / 100,
      averagePrice: Math.round(averagePrice * 100) / 100
    };
  }
  /**
   * TICKET 10.2: Logika Cofania (Revert)
   * Wraca towar do oryginalnych partii i usuwa rekordy użycia.
   */
  async revertConsumption(documentItemId, manager) {
    const batchRepo = manager.getRepository(InventoryBatch);
    const usageRepo = manager.getRepository(InventoryBatchUsage);
    const usages = await usageRepo.find({ where: { documentItemId } });
    for (const usage of usages) {
      const batch = await batchRepo.findOne({ where: { id: usage.batchId } });
      if (batch) {
        batch.remainingQuantity += Number(usage.quantity);
        await batchRepo.save(batch);
      }
      await usageRepo.remove(usage);
    }
  }
  async getProducts() {
    const query = this.batchRepository.manager.createQueryBuilder(Product, "p").leftJoin(InventoryBatch, "b", "b.productId = p.id").select([
      "p.id AS id",
      "p.name AS name",
      "p.type AS type",
      "p.vatRate AS vatRate",
      "p.unit AS unit",
      "p.isActive AS isActive"
    ]).addSelect("SUM(CASE WHEN p.type = 'TOWAR' THEN b.remainingQuantity ELSE 0 END)", "totalQuantity").where("p.isActive = :isActive", { isActive: true }).groupBy("p.id").orderBy("p.name", "ASC");
    const results = await query.getRawMany();
    return results.map((r) => ({
      ...r,
      totalQuantity: r.type === "TOWAR" ? Number(r.totalQuantity) || 0 : void 0
    }));
  }
  async getStockLevels() {
    const query = this.batchRepository.manager.createQueryBuilder(Product, "p").leftJoin(InventoryBatch, "b", "b.productId = p.id").select("p.id", "productId").addSelect("p.name", "name").addSelect("p.unit", "unit").addSelect("p.vatRate", "vatRate").addSelect("COALESCE(SUM(b.remainingQuantity), 0)", "totalQuantity").addSelect("COALESCE(SUM(b.remainingQuantity * b.purchasePrice), 0)", "fifoValue").groupBy("p.id").addGroupBy("p.name").addGroupBy("p.unit").addGroupBy("p.vatRate");
    return await query.getRawMany();
  }
  async getProductHistory(productId) {
    const items = await this.batchRepository.manager.getRepository(InventoryDocumentItem).find({
      where: { productId },
      relations: ["document"],
      order: {
        document: {
          date: "DESC"
        }
      }
    });
    const enrichedItems = await Promise.all(items.map(async (item) => {
      const enriched = { ...item };
      if (item.document && item.document.type === "WZ") {
        const transaction = await this.batchRepository.manager.getRepository(InventoryTransaction).findOne({
          where: {
            productId: item.productId,
            invoiceId: item.document.referenceId
          }
        });
        if (transaction) {
          enriched.costPrice = transaction.costPrice;
        }
      }
      return enriched;
    }));
    return enrichedItems;
  }
  async getTotalInventoryValue() {
    const batches = await this.batchRepository.find();
    const totalValue = batches.reduce((sum, batch) => {
      return sum + batch.remainingQuantity * batch.purchasePrice;
    }, 0);
    return Math.round(totalValue * 100) / 100;
  }
  /**
   * TICKET 11: Podgląd zawartości dokumentu magazynowego
   */
  async getInventoryDocumentDetails(documentId) {
    return await this.docRepository.findOne({
      where: { id: documentId },
      relations: ["items", "items.product"]
    });
  }
}
class KSeFCalculator {
  /**
   * Weryfikuje czy Netto + VAT = Brutto w groszach.
   */
  static validate(netCents, vatCents, grossCents) {
    return netCents + vatCents === grossCents;
  }
  /**
   * Oblicza wartość VAT i Brutto na podstawie Netto i stawki procentowej.
   * Uwaga: stawka VAT jako string np. "23%".
   */
  static calculateFromNet(netCents, vatRateStr) {
    const rate = parseInt(vatRateStr.replace("%", ""), 10) / 100;
    const vatCents = Math.round(netCents * rate);
    return {
      vatCents,
      grossCents: netCents + vatCents
    };
  }
}
class InvoiceService {
  /**
   * Tworzy fakturę wraz z pozycjami i ruchami magazynowymi w jednej transakcji.
   */
  async createInvoice(invoiceData, items) {
    console.log(`[InvoiceService] createInvoice called. Items count: ${items.length}`);
    return await AppDataSource.transaction(async (manager) => {
      const totals = this.validateAndCalculateTotals(items);
      await this.processInventoryTransactions(invoiceData, items, manager);
      const invoice = manager.create(Invoice, {
        ...invoiceData,
        totalNetCents: totals.totalNet,
        totalVatCents: totals.totalVat,
        totalGrossCents: totals.totalGross
      });
      const savedInvoice = await manager.save(invoice);
      await this.saveInvoiceItems(savedInvoice.id, items, manager);
      console.log(`[InvoiceService] Pomyślnie utworzono fakturę ${savedInvoice.invoiceNumber} wraz z pozycjami.`);
      return savedInvoice;
    });
  }
  /**
   * Aktualizuje fakturę wraz z pozycjami i koryguje ruchy magazynowe.
   */
  async updateInvoice(id, invoiceData, items) {
    return await AppDataSource.transaction(async (manager) => {
      const existingInvoice = await manager.findOne(Invoice, { where: { id } });
      if (!existingInvoice) throw new Error("Faktura nie istnieje.");
      const totals = this.validateAndCalculateTotals(items);
      await manager.delete(InvoiceItem, { invoiceId: id });
      await this.processInventoryTransactions(invoiceData, items, manager);
      const updatedInvoice = manager.merge(Invoice, existingInvoice, {
        invoiceNumber: invoiceData.invoiceNumber ?? existingInvoice.invoiceNumber,
        type: invoiceData.type ?? existingInvoice.type,
        issueDate: invoiceData.issueDate ?? existingInvoice.issueDate,
        dueDate: invoiceData.dueDate ?? existingInvoice.dueDate,
        nip: invoiceData.nip ?? existingInvoice.nip,
        currency: invoiceData.currency ?? existingInvoice.currency,
        isPaid: invoiceData.isPaid ?? existingInvoice.isPaid,
        clientId: invoiceData.clientId ?? existingInvoice.clientId,
        totalNetCents: totals.totalNet,
        totalVatCents: totals.totalVat,
        totalGrossCents: totals.totalGross
      });
      const savedInvoice = await manager.save(updatedInvoice);
      await this.saveInvoiceItems(savedInvoice.id, items, manager);
      console.log(`[InvoiceService] Pomyślnie zaktualizowano fakturę ${savedInvoice.invoiceNumber}.`);
      return savedInvoice;
    });
  }
  validateAndCalculateTotals(items) {
    let totalNet = 0;
    let totalVat = 0;
    let totalGross = 0;
    for (const item of items) {
      if (!item.priceNetCents || !item.vatValueCents || !item.priceGrossCents) {
        throw new Error("Brakujące dane finansowe w pozycji faktury.");
      }
      if (!KSeFCalculator.validate(item.priceNetCents, item.vatValueCents, item.priceGrossCents)) {
        throw new Error(`Błąd matematyczny w pozycji dla produktu ID: ${item.productId}`);
      }
      totalNet += item.priceNetCents;
      totalVat += item.vatValueCents;
      totalGross += item.priceGrossCents;
    }
    return { totalNet, totalVat, totalGross };
  }
  async processInventoryTransactions(invoiceData, items, manager) {
    var _a, _b;
    const isSale = invoiceData.type === InvoiceType.SALE;
    const currentInvoiceNumber = invoiceData.invoiceNumber;
    if (!currentInvoiceNumber) throw new Error("Numer faktury jest wymagany do procesowania magazynu.");
    console.log(`[InvoiceService] Processing ${items.length} items for inventory transactions. isSale: ${isSale}`);
    let invDoc = await manager.findOne(InventoryDocument, {
      where: { referenceId: currentInvoiceNumber }
    });
    const inventoryService2 = new InventoryService(manager);
    if (invDoc) {
      console.log(`[InvoiceService] Znaleziono istniejący dokument: ${invDoc.documentNumber}. Cofanie FIFO i czyszczenie...`);
      const oldItems = await manager.find(InventoryDocumentItem, { where: { documentId: invDoc.id } });
      for (const oldItem of oldItems) {
        await inventoryService2.revertConsumption(oldItem.id, manager);
      }
      await manager.delete(InventoryDocumentItem, { documentId: invDoc.id });
      await manager.delete(InventoryTransaction, { invoiceId: currentInvoiceNumber });
      invDoc.date = /* @__PURE__ */ new Date();
      invDoc.contractor = ((_a = invoiceData.client) == null ? void 0 : _a.name) || invoiceData.nip || void 0;
      invDoc = await manager.save(invDoc);
    }
    if (!invDoc && items.some((i) => i.type === "TOWAR")) {
      const docType = isSale ? DocumentType.WZ : DocumentType.PZ;
      const docNumber = await this.generateInventoryDocNumber(docType, manager);
      invDoc = new InventoryDocument();
      invDoc.documentNumber = docNumber;
      invDoc.type = docType;
      invDoc.date = /* @__PURE__ */ new Date();
      invDoc.referenceId = currentInvoiceNumber;
      invDoc.contractor = ((_b = invoiceData.client) == null ? void 0 : _b.name) || invoiceData.nip || void 0;
      invDoc = await manager.save(invDoc);
      console.log(`[Magazyn] Wygenerowano NOWY dokument: ${docNumber}`);
    }
    const transactions = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId && item.type === "TOWAR") {
        const { Raw } = require("typeorm");
        const normalizedName = item.productName.trim();
        const normalizedUnit = (item.unit || "szt.").trim();
        let product2 = await manager.findOne(Product, {
          where: {
            name: Raw((alias) => `LOWER(TRIM(${alias})) = LOWER(TRIM(:name))`, { name: normalizedName }),
            unit: Raw((alias) => `LOWER(TRIM(${alias})) = LOWER(TRIM(:unit))`, { unit: normalizedUnit })
          }
        });
        if (!product2) {
          product2 = manager.create(Product, {
            name: normalizedName,
            type: ProductType.TOWAR,
            unit: normalizedUnit,
            vatRate: item.vatRate || "23%",
            isActive: true
          });
          product2 = await manager.save(product2);
        }
        item.productId = product2.id;
      }
      if (!item.productId) continue;
      const product = await manager.findOne(Product, { where: { id: item.productId } });
      if (!product) throw new Error(`Produkt o ID ${item.productId} nie istnieje.`);
      if (product.type === ProductType.TOWAR) {
        const docItem = new InventoryDocumentItem();
        docItem.documentId = invDoc.id;
        docItem.productId = item.productId;
        docItem.quantity = item.quantity;
        docItem.price = item.priceNetCents ? item.priceNetCents / 100 : 0;
        const savedDocItem = await manager.save(docItem);
        const transaction = new InventoryTransaction();
        transaction.productId = item.productId;
        transaction.quantity = item.quantity;
        transaction.invoiceId = currentInvoiceNumber;
        if (isSale) {
          console.log(`[FIFO] Rozpoczynam konsumpcję dla: ${product.name}`);
          const fifoResult = await inventoryService2.calculateFIFOCostAndConsume(
            item.productId,
            item.quantity,
            savedDocItem.id,
            manager
          );
          transaction.type = InventoryTransactionType.WZ;
          transaction.costPrice = fifoResult.averagePrice;
          console.log(`[FIFO] Konsumpcja zakończona. Średnia cena zakupu: ${fifoResult.averagePrice}`);
        } else {
          transaction.type = InventoryTransactionType.PZ;
          console.log(`[FIFO] Tworzenie partii dla produktu: ${product.name}`);
          const batch = new InventoryBatch();
          batch.productId = item.productId;
          batch.batchNumber = currentInvoiceNumber;
          batch.purchasePrice = item.priceNetCents ? item.priceNetCents / 100 : 0;
          batch.originalQuantity = item.quantity;
          batch.remainingQuantity = item.quantity;
          await manager.save(InventoryBatch, batch);
        }
        transactions.push(transaction);
      }
    }
    if (transactions.length > 0) {
      await manager.save(InventoryTransaction, transactions);
      console.log(`[InvoiceService] Zapisano ${transactions.length} transakcji magazynowych.`);
    } else {
      if (invDoc) {
        console.log(`[InvoiceService] Brak pozycji TOWAR. Usuwanie dokumentu.`);
        await manager.delete(InventoryDocument, { id: invDoc.id });
      }
    }
  }
  /**
   * Pomocnicza metoda do generowania numeru dokumentu magazynowego bezpośrednio w transakcji.
   * Unika circular dependency z InventoryService.
   */
  async generateInventoryDocNumber(type, manager) {
    const date = /* @__PURE__ */ new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const prefix = `${type}/${year}/${month}/`;
    const latestDoc = await manager.createQueryBuilder(InventoryDocument, "doc").where("doc.documentNumber LIKE :prefix", { prefix: `${prefix}%` }).orderBy("doc.documentNumber", "DESC").getOne();
    let sequence = 1;
    if (latestDoc) {
      const parts = latestDoc.documentNumber.split("/");
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) {
        sequence = lastNum + 1;
      }
    }
    return `${prefix}${String(sequence).padStart(3, "0")}`;
  }
  async saveInvoiceItems(invoiceId, items, manager) {
    for (const item of items) {
      const invoiceItem = manager.create(InvoiceItem, {
        ...item,
        invoiceId
      });
      await manager.save(invoiceItem);
    }
  }
  /**
   * Oblicza aktualny stan magazynowy na podstawie ruchów (PZ - WZ).
   */
  async calculateStock(productId, manager = AppDataSource.manager) {
    const transactions = await manager.find(InventoryTransaction, { where: { productId } });
    return transactions.reduce((acc, t) => {
      if (t.type === InventoryTransactionType.PZ) return acc + Number(t.quantity);
      if (t.type === InventoryTransactionType.WZ) return acc - Number(t.quantity);
      return acc;
    }, 0);
  }
}
class FinanceService {
  constructor(dataSource) {
    __publicField(this, "invoiceService");
    this.dataSource = dataSource;
    this.invoiceService = new InvoiceService();
  }
  async createPurchaseInvoice(dto) {
    return await this.dataSource.transaction(async (transactionalEntityManager) => {
      const invoice = new PurchaseInvoice();
      invoice.supplier = dto.vendorName;
      invoice.supplierNip = dto.supplierNip;
      invoice.supplierAddress = dto.supplierAddress;
      invoice.invoiceNumber = dto.invoiceNumber;
      invoice.invoiceDate = new Date(dto.invoiceDate);
      invoice.isMpp = dto.isMpp;
      invoice.ksefId = dto.ksefId;
      invoice.items = dto.items.map((itemDto) => {
        const item = new PurchaseInvoiceItem();
        item.productId = itemDto.productId;
        item.quantity = itemDto.quantity;
        item.netPrice = itemDto.netPrice;
        item.vatRate = itemDto.vatRate;
        item.vatAmount = itemDto.vatAmount;
        item.grossPrice = itemDto.grossPrice;
        item.batchNumber = itemDto.batchNumber;
        item.gtuCode = itemDto.gtuCode;
        return item;
      });
      const totalGross = dto.items.reduce((sum, item) => sum + item.quantity * item.grossPrice, 0);
      const totalVat = dto.items.reduce((sum, item) => sum + item.quantity * item.vatAmount, 0);
      invoice.grossAmount = totalGross;
      invoice.vatAmount = totalVat;
      invoice.currency = "PLN";
      invoice.status = "POSTED";
      const savedInvoice = await transactionalEntityManager.save(PurchaseInvoice, invoice);
      const transactionalInventoryService = new InventoryService(transactionalEntityManager);
      const pzItems = dto.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.netPrice
      }));
      await transactionalInventoryService.createDocument(DocumentType.PZ, savedInvoice.invoiceNumber, pzItems);
      for (const item of dto.items) {
        const product = await transactionalEntityManager.findOne(Product, { where: { id: item.productId } });
        if (product && product.type === ProductType.TOWAR) {
          await transactionalInventoryService.addStock(
            item.productId,
            item.batchNumber || savedInvoice.invoiceNumber,
            item.quantity,
            item.netPrice,
            product.unit
          );
        } else {
          console.log(`[FinanceService] Skipping inventory batch for non-GOODS product: ${item.productId}`);
        }
      }
      return savedInvoice;
    });
  }
  async getPurchaseInvoices() {
    return await this.dataSource.getRepository(PurchaseInvoice).find({
      order: {
        createdAt: "DESC"
      }
    });
  }
  // Metody Modułu Finansowego (Master Plan)
  async getAllInvoices() {
    return await this.dataSource.getRepository(Invoice).find({
      relations: ["items"],
      order: {
        issueDate: "DESC"
      }
    });
  }
  async addInvoice(invoicePayload, items) {
    return await this.invoiceService.createInvoice(invoicePayload, items);
  }
  async updateInvoice(id, invoicePayload, items) {
    return await this.invoiceService.updateInvoice(id, invoicePayload, items);
  }
  async getFinancialSummary() {
    const invoices = await this.dataSource.getRepository(Invoice).find();
    const expenses = await this.dataSource.getRepository(Expense).find();
    let totalIncomesCents = 0;
    let totalExpensesCents = 0;
    invoices.forEach((inv) => {
      if (inv.type === InvoiceType.SALE) {
        totalIncomesCents += inv.totalGrossCents;
      } else {
        totalExpensesCents += inv.totalGrossCents;
      }
    });
    expenses.forEach((exp) => {
      totalExpensesCents += exp.amountCents;
    });
    return {
      totalIncomesCents,
      totalExpensesCents,
      balanceCents: totalIncomesCents - totalExpensesCents
    };
  }
}
class ProjectService {
  constructor(dataSource) {
    this.dataSource = dataSource;
  }
  async createProject(dto) {
    return await this.dataSource.transaction(async (transactionalEntityManager) => {
      const project = new Project();
      project.name = dto.name;
      project.clientName = dto.clientName;
      project.assignedEmployeeId = dto.assignedEmployeeId;
      project.status = "IN_PROGRESS";
      project.materialsUsed = [];
      let totalProjectCost = 0;
      const transactionalInventoryService = new InventoryService(transactionalEntityManager);
      const rwItems = [];
      for (const item of dto.materialsToConsume) {
        const cost = await transactionalInventoryService.calculateFIFOCost(item.productId, item.quantity);
        await transactionalInventoryService.consumeStock(item.productId, item.quantity);
        project.materialsUsed.push({
          productId: item.productId,
          quantity: item.quantity,
          cost
        });
        rwItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: cost / item.quantity
          // Average price per unit consumed
        });
        totalProjectCost += cost;
      }
      project.totalMaterialCost = totalProjectCost;
      const generatedProject = await transactionalEntityManager.save(Project, project);
      await transactionalInventoryService.createDocument(DocumentType.RW, generatedProject.id, rwItems);
      return generatedProject;
    });
  }
  async getProjects() {
    return await this.dataSource.getRepository(Project).find({
      order: {
        createdAt: "DESC"
      }
    });
  }
}
class ClientService {
  constructor(dataSource) {
    this.dataSource = dataSource;
  }
  async createClient(dto) {
    const client = new Client();
    client.name = dto.name;
    client.nip = dto.nip || "";
    client.phone = dto.phone || "";
    client.address = dto.address || "";
    client.type = dto.type;
    if (dto.isActive !== void 0) {
      client.isActive = dto.isActive;
    }
    return await this.dataSource.getRepository(Client).save(client);
  }
  async updateClient(id, dto) {
    const repo = this.dataSource.getRepository(Client);
    const client = await repo.findOneByOrFail({ id });
    client.name = dto.name;
    client.nip = dto.nip || "";
    client.phone = dto.phone || "";
    client.address = dto.address || "";
    client.type = dto.type;
    client.isActive = dto.isActive;
    return await repo.save(client);
  }
  async getClients() {
    return await this.dataSource.getRepository(Client).find({
      order: {
        createdAt: "DESC"
      }
    });
  }
}
class DictionaryService {
  constructor(dataSource) {
    __publicField(this, "repo");
    this.dataSource = dataSource;
    this.repo = this.dataSource.getRepository(Dictionary);
  }
  async seedDefaults() {
    const count = await this.repo.count();
    if (count > 0) {
      console.log("Dictionaries already seeded.");
      return;
    }
    console.log("Seeding default dictionaries...");
    const defaults = [
      // Jednostki Miary (UNIT)
      { category: "UNIT", code: "SZT", value: "szt.", isSystem: true },
      { category: "UNIT", code: "M2", value: "m2", isSystem: true },
      { category: "UNIT", code: "MB", value: "mb", isSystem: true },
      { category: "UNIT", code: "L", value: "litr", isSystem: true },
      { category: "UNIT", code: "KG", value: "kg", isSystem: true },
      { category: "UNIT", code: "RBH", value: "rbh", isSystem: true },
      // Kategorie Asortymentu (MATERIAL_CATEGORY)
      { category: "MATERIAL_CATEGORY", code: "PLANT", value: "Rośliny", isSystem: true },
      { category: "MATERIAL_CATEGORY", code: "FERTILIZER", value: "Nawozy i Środki Ochrony", isSystem: true },
      { category: "MATERIAL_CATEGORY", code: "SOIL", value: "Kruszywa i Ziemia", isSystem: true },
      { category: "MATERIAL_CATEGORY", code: "ARCHITECTURE", value: "Elementy Architektury", isSystem: true },
      { category: "MATERIAL_CATEGORY", code: "TOOL", value: "Narzędzia", isSystem: true },
      { category: "MATERIAL_CATEGORY", code: "SERVICE", value: "Usługi", isSystem: true },
      // Typy Usług (SERVICE_TYPE)
      { category: "SERVICE_TYPE", code: "DESIGN", value: "Projektowanie", isSystem: true },
      { category: "SERVICE_TYPE", code: "EARTHWORK", value: "Prace Ziemne", isSystem: true },
      { category: "SERVICE_TYPE", code: "PLANTING", value: "Nasadzenia", isSystem: true },
      { category: "SERVICE_TYPE", code: "MAINTENANCE", value: "Pielęgnacja", isSystem: true },
      { category: "SERVICE_TYPE", code: "IRRIGATION", value: "Systemy Nawadniające", isSystem: true },
      // Stawki VAT (TAX_RATE)
      { category: "TAX_RATE", code: "23", value: "23%", isSystem: true },
      { category: "TAX_RATE", code: "8", value: "8%", isSystem: true },
      { category: "TAX_RATE", code: "0", value: "0%", isSystem: true },
      { category: "TAX_RATE", code: "ZW", value: "ZW", isSystem: true }
    ];
    for (const item of defaults) {
      const entry = new Dictionary();
      entry.category = item.category;
      entry.code = item.code;
      entry.value = item.value;
      entry.isSystem = item.isSystem;
      await this.repo.save(entry);
    }
    console.log("Default dictionaries seeded successfully.");
  }
  async getDictionaries() {
    console.log("[DB] Fetching dictionaries...");
    const all = await this.repo.find({
      order: { category: "ASC", value: "ASC" }
    });
    const grouped = {};
    const categories = ["UNIT", "MATERIAL_CATEGORY", "SERVICE_TYPE", "TAX_RATE"];
    categories.forEach((cat) => grouped[cat] = []);
    for (const item of all) {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    }
    return grouped;
  }
  async addDictionary(category, value, code) {
    const entry = new Dictionary();
    entry.category = category;
    entry.value = value;
    entry.code = code || value.toUpperCase().replace(/\s+/g, "_");
    entry.isSystem = false;
    return await this.repo.save(entry);
  }
  async updateDictionary(id, value, code) {
    const entry = await this.repo.findOneBy({ id });
    if (!entry) throw new Error("Słownik nie został znaleziony.");
    if (entry.isSystem) throw new Error("Nie można edytować wartości systemowych.");
    entry.value = value;
    if (code !== void 0) {
      entry.code = code;
    }
    return await this.repo.save(entry);
  }
  async deleteDictionary(id) {
    const entry = await this.repo.findOneBy({ id });
    if (!entry) throw new Error("Słownik nie został znaleziony.");
    if (entry.isSystem) throw new Error("Nie można usunąć wartości systemowej.");
    await this.repo.remove(entry);
  }
}
class PrintService {
  /**
   * Główna metoda generująca PDF dla faktury.
   */
  async printInvoice(invoiceId) {
    try {
      const invoiceRepo = AppDataSource.getRepository(Invoice);
      const invoice = await invoiceRepo.findOne({
        where: { id: invoiceId },
        relations: ["items"]
      });
      if (!invoice) {
        throw new Error(`Nie znaleziono faktury o ID: ${invoiceId}`);
      }
      const productRepo = AppDataSource.getRepository(Product);
      const enrichedItems = await Promise.all(invoice.items.map(async (item) => {
        let productName = item.productName || "Nieznany produkt";
        if (item.productId) {
          const product = await productRepo.findOne({ where: { id: item.productId } });
          if (product) productName = product.name;
        }
        return {
          ...item,
          productName,
          priceNet: (item.priceNetCents / 100).toLocaleString("pl-PL", { minimumFractionDigits: 2 }),
          vatValue: (item.vatValueCents / 100).toLocaleString("pl-PL", { minimumFractionDigits: 2 }),
          priceGross: (item.priceGrossCents / 100).toLocaleString("pl-PL", { minimumFractionDigits: 2 }),
          totalGross: (item.priceGrossCents * item.quantity / 100).toLocaleString("pl-PL", { minimumFractionDigits: 2 })
        };
      }));
      const payload = {
        template: "invoice_template.docx",
        // Domyślny szablon
        output_format: "pdf",
        data: {
          invoice_number: invoice.invoiceNumber,
          issue_date: new Date(invoice.issueDate).toLocaleDateString("pl-PL"),
          due_date: new Date(invoice.dueDate).toLocaleDateString("pl-PL"),
          client_nip: invoice.nip || "",
          currency: invoice.currency,
          total_net: (invoice.totalNetCents / 100).toLocaleString("pl-PL", { minimumFractionDigits: 2 }) + " " + invoice.currency,
          total_vat: (invoice.totalVatCents / 100).toLocaleString("pl-PL", { minimumFractionDigits: 2 }) + " " + invoice.currency,
          total_gross: (invoice.totalGrossCents / 100).toLocaleString("pl-PL", { minimumFractionDigits: 2 }) + " " + invoice.currency,
          items: enrichedItems.map((item, index) => ({
            no: index + 1,
            name: item.productName,
            quantity: item.quantity,
            unit: "szt.",
            // Uproszczenie dla mocka
            net_price: item.priceNet,
            vat_rate: item.vatRate,
            gross_price: item.priceGross,
            total_gross: item.totalGross
          }))
        }
      };
      console.log("[PrintService] Wysyłanie żądania do mikroserwisu...");
      const response = await fetch("http://localhost:5000/PrintDocument", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Błąd mikroserwisu (${response.status}): ${errorText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const { filePath, canceled } = await electron.dialog.showSaveDialog({
        title: "Zapisz fakturę jako PDF",
        defaultPath: `Faktura_${invoice.invoiceNumber.replace(/\//g, "_")}.pdf`,
        filters: [{ name: "Pliki PDF", extensions: ["pdf"] }]
      });
      if (canceled || !filePath) {
        console.log("[PrintService] Zapisywanie anulowane przez użytkownika.");
        return;
      }
      fs__namespace.writeFileSync(filePath, buffer);
      console.log(`[PrintService] Faktura zapisana pomyślnie: ${filePath}`);
    } catch (error) {
      console.error("[PrintService] Błąd podczas generowania faktury:", error);
      throw error;
    }
  }
}
class KsefService {
  /**
   * Czyści NIP z myślników i spacji.
   */
  cleanNIP(nip) {
    return nip.replace(/[- ]/g, "");
  }
  /**
   * Konwertuje grosze na format dziesiętny (string).
   */
  toDecimal(cents) {
    return (cents / 100).toFixed(2);
  }
  /**
   * Generuje strukturę JSON odpowiadającą schemie XML FA(2).
   */
  async generateKsefXml(invoiceId) {
    const invoiceRepo = AppDataSource.getRepository(Invoice);
    const invoice = await invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: ["items"]
    });
    if (!invoice) {
      throw new Error(`Nie znaleziono faktury o ID: ${invoiceId}`);
    }
    const cleanNip = invoice.nip ? this.cleanNIP(invoice.nip) : "";
    const ksefData = {
      Naglowek: {
        KodFormularza: {
          value: "FA",
          kodSystemowy: "FA (2)",
          wersjaSchemy: "1-0E"
        },
        VariantFormularza: 2,
        DataWytworzeniaFa: (/* @__PURE__ */ new Date()).toISOString()
      },
      Podmiot1: {
        DaneIdentyfikacyjne: {
          NIP: "PL5260000000",
          // Przykładowy NIP sprzedawcy
          Nazwa: "PRODECO SYSTEMS SP. Z O.O."
        },
        Adres: {
          KodKraju: "PL",
          AdresL1: "ul. Przykładowa 123",
          AdresL2: "00-001 Warszawa"
        }
      },
      Podmiot2: {
        DaneIdentyfikacyjne: {
          NIP: cleanNip,
          Nazwa: "Kontrahent Mock"
          // W realnym systemie pobierane z encji klienta
        }
      },
      Fa: {
        KodWaluty: invoice.currency,
        P_1: new Date(invoice.issueDate).toISOString().split("T")[0],
        P_2: invoice.invoiceNumber,
        P_13_1: this.toDecimal(invoice.totalNetCents),
        P_14_1: this.toDecimal(invoice.totalVatCents),
        P_15: this.toDecimal(invoice.totalGrossCents),
        Adnotacje: {
          P_16: 2,
          // Brak MPP
          P_17: 2,
          P_18: 2,
          P_18A: 2,
          P_19: 2,
          P_22: 2,
          P_23: 2
        },
        RodzajFaktury: "VAT",
        FaWiersze: invoice.items.map((item, index) => ({
          NrWierszaFa: index + 1,
          P_7: item.productId,
          // Opis towaru/usługi
          P_8A: "szt.",
          P_8B: item.quantity,
          P_9A: this.toDecimal(item.priceNetCents),
          P_11: this.toDecimal(item.priceNetCents * item.quantity),
          P_12: item.vatRate.replace("%", "")
        }))
      }
    };
    console.log(`[KSeF] Generowanie struktury XML dla dokumentu: ${invoice.invoiceNumber}`);
    console.log(JSON.stringify(ksefData, null, 2));
    return ksefData;
  }
  /**
   * Aktualizuje status KSeF faktury.
   */
  async updateKsefStatus(invoiceId, status, referenceNumber) {
    const invoiceRepo = AppDataSource.getRepository(Invoice);
    await invoiceRepo.update(invoiceId, {
      ksefStatus: status,
      ksefReferenceNumber: referenceNumber || void 0
    });
    console.log(`[KSeF] Zaktualizowano status faktury ${invoiceId} na: ${status}`);
  }
}
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = electron.app.isPackaged ? process.env.DIST : path.join(__dirname, "../public");
let win;
let inventoryService;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function createWindow() {
  win = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    // Frameless for custom Aurora UI
    titleBarStyle: "hidden",
    backgroundColor: "#0f172a",
    // Dark theme background
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    if (!process.env.DIST) throw new Error("DIST path not defined");
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
electron.app.whenReady().then(async () => {
  electron.ipcMain.on("window:minimize", () => {
    console.log("[IPC] window:minimize called");
    const focusedWin = electron.BrowserWindow.getFocusedWindow();
    focusedWin == null ? void 0 : focusedWin.minimize();
  });
  electron.ipcMain.on("window:maximize", () => {
    console.log("[IPC] window:maximize called");
    const focusedWin = electron.BrowserWindow.getFocusedWindow();
    if (focusedWin == null ? void 0 : focusedWin.isMaximized()) {
      focusedWin == null ? void 0 : focusedWin.unmaximize();
    } else {
      focusedWin == null ? void 0 : focusedWin.maximize();
    }
  });
  electron.ipcMain.on("window:close", () => {
    console.log("[IPC] window:close called");
    const focusedWin = electron.BrowserWindow.getFocusedWindow();
    focusedWin == null ? void 0 : focusedWin.close();
  });
  await AppDataSource.initialize();
  console.log("Database initialized");
  inventoryService = new InventoryService(AppDataSource);
  const financeService = new FinanceService(AppDataSource);
  const projectService = new ProjectService(AppDataSource);
  const clientService = new ClientService(AppDataSource);
  const printService = new PrintService();
  const ksefService = new KsefService();
  const dictionaryService = new DictionaryService(AppDataSource);
  await dictionaryService.seedDefaults();
  electron.ipcMain.handle("projects:createProject", async (_, data) => {
    return await projectService.createProject(data);
  });
  electron.ipcMain.handle("projects:getAll", async () => {
    return await projectService.getProjects();
  });
  electron.ipcMain.handle("inventory:getAll", async () => {
    return await inventoryService.getStockLevels();
  });
  electron.ipcMain.handle("inventory:getDocuments", async () => {
    return await inventoryService.getDocuments();
  });
  electron.ipcMain.handle("inventory:addStock", async (_, data) => {
    const { productId, batchNumber, quantity, price, categoryId, unit } = data;
    return await inventoryService.addStock(productId, batchNumber, quantity, price, unit, categoryId);
  });
  electron.ipcMain.handle("inventory:getValue", async () => {
    return await inventoryService.getTotalInventoryValue();
  });
  electron.ipcMain.handle("inventory:getProducts", async () => {
    return await inventoryService.getProducts();
  });
  electron.ipcMain.handle("inventory:getProductHistory", async (_, productId) => {
    return await inventoryService.getProductHistory(productId);
  });
  electron.ipcMain.handle("inventory:getInventoryDocumentDetails", async (_, documentId) => {
    return await inventoryService.getInventoryDocumentDetails(documentId);
  });
  electron.ipcMain.handle("finance:createInvoice", async (_, data) => {
    return await financeService.createPurchaseInvoice(data);
  });
  electron.ipcMain.handle("finance:getInvoices", async () => {
    return await financeService.getAllInvoices();
  });
  electron.ipcMain.handle("finance:addInvoice", async (_, invoice, items) => {
    return await financeService.addInvoice(invoice, items);
  });
  electron.ipcMain.handle("finance:updateInvoice", async (_, id, invoice, items) => {
    return await financeService.updateInvoice(id, invoice, items);
  });
  electron.ipcMain.handle("finance:getFinancialSummary", async () => {
    return await financeService.getFinancialSummary();
  });
  electron.ipcMain.handle("finance:printInvoice", async (_, invoiceId) => {
    return await printService.printInvoice(invoiceId);
  });
  electron.ipcMain.handle("finance:sendToKsef", async (_, invoiceId) => {
    await ksefService.generateKsefXml(invoiceId);
    return await ksefService.updateKsefStatus(invoiceId, "OCZEKUJE");
  });
  electron.ipcMain.handle("clients:create", async (_, data) => {
    return await clientService.createClient(data);
  });
  electron.ipcMain.handle("clients:getAll", async () => {
    return await clientService.getClients();
  });
  electron.ipcMain.handle("clients:update", async (_, data) => {
    return await clientService.updateClient(data.id, data);
  });
  electron.ipcMain.handle("dictionaries:getAll", async () => {
    return await dictionaryService.getDictionaries();
  });
  electron.ipcMain.handle("dictionaries:add", async (_, data) => {
    return await dictionaryService.addDictionary(data.category, data.value, data.code);
  });
  electron.ipcMain.handle("dictionaries:update", async (_, data) => {
    return await dictionaryService.updateDictionary(data.id, data.value, data.code);
  });
  electron.ipcMain.handle("dictionaries:delete", async (_, id) => {
    return await dictionaryService.deleteDictionary(id);
  });
  createWindow();
});
