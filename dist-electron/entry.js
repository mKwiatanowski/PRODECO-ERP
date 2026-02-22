"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const electron = require("electron");
const path = require("path");
const typeorm = require("typeorm");
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
var __defProp$8 = Object.defineProperty;
var __decorateClass$8 = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = decorator(target, key, result) || result;
  if (result) __defProp$8(target, key, result);
  return result;
};
class BaseEntity {
  constructor() {
    __publicField(this, "id");
    __publicField(this, "createdAt");
    __publicField(this, "updatedAt");
  }
}
__decorateClass$8([
  typeorm.PrimaryGeneratedColumn("uuid")
], BaseEntity.prototype, "id");
__decorateClass$8([
  typeorm.CreateDateColumn({ type: "datetime" })
], BaseEntity.prototype, "createdAt");
__decorateClass$8([
  typeorm.UpdateDateColumn({ type: "datetime" })
], BaseEntity.prototype, "updatedAt");
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
__decorateClass$7([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoiceItem.prototype, "invoiceId", 2);
__decorateClass$7([
  typeorm.ManyToOne(() => PurchaseInvoice, (invoice) => invoice.items, { onDelete: "CASCADE" }),
  typeorm.JoinColumn({ name: "invoiceId" })
], PurchaseInvoiceItem.prototype, "invoice", 2);
__decorateClass$7([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoiceItem.prototype, "productId", 2);
__decorateClass$7([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], PurchaseInvoiceItem.prototype, "quantity", 2);
__decorateClass$7([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], PurchaseInvoiceItem.prototype, "netPrice", 2);
__decorateClass$7([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoiceItem.prototype, "vatRate", 2);
__decorateClass$7([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], PurchaseInvoiceItem.prototype, "vatAmount", 2);
__decorateClass$7([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], PurchaseInvoiceItem.prototype, "grossPrice", 2);
__decorateClass$7([
  typeorm.Column({ type: "varchar", nullable: true })
], PurchaseInvoiceItem.prototype, "gtuCode", 2);
__decorateClass$7([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoiceItem.prototype, "batchNumber", 2);
PurchaseInvoiceItem = __decorateClass$7([
  typeorm.Entity("purchase_invoice_items")
], PurchaseInvoiceItem);
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
__decorateClass$6([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoice.prototype, "supplier", 2);
__decorateClass$6([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoice.prototype, "supplierNip", 2);
__decorateClass$6([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoice.prototype, "supplierAddress", 2);
__decorateClass$6([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoice.prototype, "invoiceNumber", 2);
__decorateClass$6([
  typeorm.Column({ type: "date" })
], PurchaseInvoice.prototype, "invoiceDate", 2);
__decorateClass$6([
  typeorm.Column({ type: "varchar", length: 40, nullable: true })
], PurchaseInvoice.prototype, "ksefId", 2);
__decorateClass$6([
  typeorm.Column({ type: "boolean", default: false })
], PurchaseInvoice.prototype, "isMpp", 2);
__decorateClass$6([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], PurchaseInvoice.prototype, "vatAmount", 2);
__decorateClass$6([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], PurchaseInvoice.prototype, "grossAmount", 2);
__decorateClass$6([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoice.prototype, "currency", 2);
__decorateClass$6([
  typeorm.Column({ type: "varchar" })
], PurchaseInvoice.prototype, "status", 2);
__decorateClass$6([
  typeorm.OneToMany(() => PurchaseInvoiceItem, (item) => item.invoice, { cascade: true })
], PurchaseInvoice.prototype, "items", 2);
PurchaseInvoice = __decorateClass$6([
  typeorm.Entity("purchase_invoices")
], PurchaseInvoice);
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
__decorateClass$5([
  typeorm.PrimaryGeneratedColumn("uuid")
], Project.prototype, "id", 2);
__decorateClass$5([
  typeorm.Column({ type: "varchar" })
], Project.prototype, "name", 2);
__decorateClass$5([
  typeorm.Column({ type: "varchar" })
], Project.prototype, "clientName", 2);
__decorateClass$5([
  typeorm.Column({ type: "varchar" })
], Project.prototype, "status", 2);
__decorateClass$5([
  typeorm.Column({ type: "varchar" })
], Project.prototype, "assignedEmployeeId", 2);
__decorateClass$5([
  typeorm.Column("simple-json")
], Project.prototype, "materialsUsed", 2);
__decorateClass$5([
  typeorm.Column("decimal", { precision: 10, scale: 2, default: 0 })
], Project.prototype, "totalMaterialCost", 2);
__decorateClass$5([
  typeorm.CreateDateColumn({ type: "datetime" })
], Project.prototype, "createdAt", 2);
__decorateClass$5([
  typeorm.UpdateDateColumn({ type: "datetime" })
], Project.prototype, "updatedAt", 2);
Project = __decorateClass$5([
  typeorm.Entity()
], Project);
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
__decorateClass$4([
  typeorm.Column({ type: "varchar" })
], InventoryBatch.prototype, "productId", 2);
__decorateClass$4([
  typeorm.Column({ type: "varchar" })
], InventoryBatch.prototype, "batchNumber", 2);
__decorateClass$4([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], InventoryBatch.prototype, "purchasePrice", 2);
__decorateClass$4([
  typeorm.Column("int")
], InventoryBatch.prototype, "originalQuantity", 2);
__decorateClass$4([
  typeorm.Column("int")
], InventoryBatch.prototype, "remainingQuantity", 2);
__decorateClass$4([
  typeorm.Column({ type: "date", nullable: true })
], InventoryBatch.prototype, "expirationDate", 2);
__decorateClass$4([
  typeorm.Column({ type: "varchar", nullable: true })
], InventoryBatch.prototype, "categoryId", 2);
InventoryBatch = __decorateClass$4([
  typeorm.Entity("inventory_batches")
], InventoryBatch);
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
let InventoryDocumentItem = class extends BaseEntity {
  constructor() {
    super(...arguments);
    __publicField(this, "documentId");
    __publicField(this, "document");
    __publicField(this, "productId");
    __publicField(this, "quantity");
    __publicField(this, "price");
  }
  // Optional for RW, required for PZ
};
__decorateClass$3([
  typeorm.Column({ type: "varchar" })
], InventoryDocumentItem.prototype, "documentId", 2);
__decorateClass$3([
  typeorm.ManyToOne(() => InventoryDocument, (doc) => doc.items, { onDelete: "CASCADE" }),
  typeorm.JoinColumn({ name: "documentId" })
], InventoryDocumentItem.prototype, "document", 2);
__decorateClass$3([
  typeorm.Column({ type: "varchar" })
], InventoryDocumentItem.prototype, "productId", 2);
__decorateClass$3([
  typeorm.Column("decimal", { precision: 10, scale: 2 })
], InventoryDocumentItem.prototype, "quantity", 2);
__decorateClass$3([
  typeorm.Column("decimal", { precision: 10, scale: 2, nullable: true })
], InventoryDocumentItem.prototype, "price", 2);
InventoryDocumentItem = __decorateClass$3([
  typeorm.Entity("inventory_document_items")
], InventoryDocumentItem);
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
    __publicField(this, "items");
  }
};
__decorateClass$2([
  typeorm.Column({ type: "varchar", unique: true })
], InventoryDocument.prototype, "documentNumber", 2);
__decorateClass$2([
  typeorm.Column({ type: "varchar" })
], InventoryDocument.prototype, "type", 2);
__decorateClass$2([
  typeorm.Column({ type: "date" })
], InventoryDocument.prototype, "date", 2);
__decorateClass$2([
  typeorm.Column({ type: "varchar", nullable: true })
], InventoryDocument.prototype, "referenceId", 2);
__decorateClass$2([
  typeorm.OneToMany(() => InventoryDocumentItem, (item) => item.document, { cascade: true })
], InventoryDocument.prototype, "items", 2);
InventoryDocument = __decorateClass$2([
  typeorm.Entity("inventory_documents")
], InventoryDocument);
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
let Client = class {
  constructor() {
    __publicField(this, "id");
    __publicField(this, "name");
    __publicField(this, "nip");
    __publicField(this, "phone");
    __publicField(this, "address");
    // 'SUPPLIER' or 'CUSTOMER'
    __publicField(this, "type");
    __publicField(this, "isActive");
    __publicField(this, "createdAt");
    __publicField(this, "updatedAt");
  }
};
__decorateClass$1([
  typeorm.PrimaryGeneratedColumn("uuid")
], Client.prototype, "id", 2);
__decorateClass$1([
  typeorm.Column({ type: "varchar" })
], Client.prototype, "name", 2);
__decorateClass$1([
  typeorm.Column({ type: "varchar", nullable: true })
], Client.prototype, "nip", 2);
__decorateClass$1([
  typeorm.Column({ type: "varchar", nullable: true })
], Client.prototype, "phone", 2);
__decorateClass$1([
  typeorm.Column({ type: "varchar", nullable: true })
], Client.prototype, "address", 2);
__decorateClass$1([
  typeorm.Column({ type: "varchar", default: "CUSTOMER" })
], Client.prototype, "type", 2);
__decorateClass$1([
  typeorm.Column({ type: "boolean", default: true })
], Client.prototype, "isActive", 2);
__decorateClass$1([
  typeorm.CreateDateColumn({ type: "datetime" })
], Client.prototype, "createdAt", 2);
__decorateClass$1([
  typeorm.UpdateDateColumn({ type: "datetime" })
], Client.prototype, "updatedAt", 2);
Client = __decorateClass$1([
  typeorm.Entity()
], Client);
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
__decorateClass([
  typeorm.PrimaryGeneratedColumn("uuid")
], Dictionary.prototype, "id", 2);
__decorateClass([
  typeorm.Column({ type: "varchar" })
], Dictionary.prototype, "category", 2);
__decorateClass([
  typeorm.Column({ type: "varchar", nullable: true })
], Dictionary.prototype, "code", 2);
__decorateClass([
  typeorm.Column({ type: "varchar" })
], Dictionary.prototype, "value", 2);
__decorateClass([
  typeorm.Column({ type: "boolean", default: false })
], Dictionary.prototype, "isSystem", 2);
__decorateClass([
  typeorm.CreateDateColumn({ type: "datetime" })
], Dictionary.prototype, "createdAt", 2);
__decorateClass([
  typeorm.UpdateDateColumn({ type: "datetime" })
], Dictionary.prototype, "updatedAt", 2);
Dictionary = __decorateClass([
  typeorm.Entity()
], Dictionary);
let dbPath = ":memory:";
if (process.env.NODE_ENV !== "test" && electron.app) {
  dbPath = path.join(electron.app.getPath("userData"), "green_manager.sqlite");
} else if (!electron.app) {
  dbPath = path.join(__dirname, "../../../../green_manager_dev.sqlite");
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
    InventoryDocument,
    InventoryDocumentItem,
    Client,
    Dictionary
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
  async addStock(productId, batchNumber, quantity, price, categoryId) {
    if (price <= 0) {
      throw new Error("Price must be positive");
    }
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }
    const batch = new InventoryBatch();
    batch.productId = productId;
    batch.batchNumber = batchNumber;
    batch.originalQuantity = quantity;
    batch.remainingQuantity = quantity;
    batch.purchasePrice = price;
    batch.categoryId = categoryId;
    return await this.batchRepository.save(batch);
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
    const batches = await this.batchRepository.find({
      where: { productId },
      order: { createdAt: "ASC" }
    });
    const activeBatches = batches.filter((b) => b.remainingQuantity > 0);
    const totalAvailable = activeBatches.reduce((sum, b) => sum + b.remainingQuantity, 0);
    if (totalAvailable < quantityRequired) {
      throw new InsufficientStockException(productId, quantityRequired, totalAvailable);
    }
    let remainingNeeded = quantityRequired;
    for (const batch of activeBatches) {
      if (remainingNeeded <= 0) break;
      const takeFromBatch = Math.min(remainingNeeded, batch.remainingQuantity);
      batch.remainingQuantity -= takeFromBatch;
      remainingNeeded -= takeFromBatch;
      await this.batchRepository.save(batch);
    }
  }
  async getTotalInventoryValue() {
    const batches = await this.batchRepository.find();
    const totalValue = batches.reduce((sum, batch) => {
      return sum + batch.remainingQuantity * batch.purchasePrice;
    }, 0);
    return Math.round(totalValue * 100) / 100;
  }
}
class FinanceService {
  constructor(dataSource) {
    this.dataSource = dataSource;
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
        await transactionalInventoryService.addStock(
          item.productId,
          item.batchNumber,
          // In real app, maybe auto-generate or use invoice number
          item.quantity,
          item.netPrice
        );
      }
      return savedInvoice;
    });
  }
  async getPurchaseInvoices() {
    return await this.dataSource.getRepository(PurchaseInvoice).find({
      order: {
        createdAt: "DESC"
        // or invoiceDate, let's stick to createdAt for newest first
      }
    });
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
    const all = await this.repo.find({
      order: { category: "ASC", value: "ASC" }
    });
    const grouped = {};
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
  const dictionaryService = new DictionaryService(AppDataSource);
  await dictionaryService.seedDefaults();
  electron.ipcMain.handle("projects:createProject", async (_, data) => {
    return await projectService.createProject(data);
  });
  electron.ipcMain.handle("projects:getAll", async () => {
    return await projectService.getProjects();
  });
  electron.ipcMain.handle("inventory:getAll", async () => {
    const repo = AppDataSource.getRepository("InventoryBatch");
    return await repo.find({ order: { createdAt: "DESC" } });
  });
  electron.ipcMain.handle("inventory:getDocuments", async () => {
    return await inventoryService.getDocuments();
  });
  electron.ipcMain.handle("inventory:addStock", async (_, data) => {
    const { productId, batchNumber, quantity, price, categoryId } = data;
    return await inventoryService.addStock(productId, batchNumber, quantity, price, categoryId);
  });
  electron.ipcMain.handle("inventory:getValue", async () => {
    return await inventoryService.getTotalInventoryValue();
  });
  electron.ipcMain.handle("finance:createInvoice", async (_, data) => {
    return await financeService.createPurchaseInvoice(data);
  });
  electron.ipcMain.handle("finance:getInvoices", async () => {
    return await financeService.getPurchaseInvoices();
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
