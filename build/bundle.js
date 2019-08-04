(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function() {
  var MutationObserver, Util, WeakMap, getComputedStyle, getComputedStyleRX,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Util = (function() {
    function Util() {}

    Util.prototype.extend = function(custom, defaults) {
      var key, value;
      for (key in defaults) {
        value = defaults[key];
        if (custom[key] == null) {
          custom[key] = value;
        }
      }
      return custom;
    };

    Util.prototype.isMobile = function(agent) {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(agent);
    };

    Util.prototype.createEvent = function(event, bubble, cancel, detail) {
      var customEvent;
      if (bubble == null) {
        bubble = false;
      }
      if (cancel == null) {
        cancel = false;
      }
      if (detail == null) {
        detail = null;
      }
      if (document.createEvent != null) {
        customEvent = document.createEvent('CustomEvent');
        customEvent.initCustomEvent(event, bubble, cancel, detail);
      } else if (document.createEventObject != null) {
        customEvent = document.createEventObject();
        customEvent.eventType = event;
      } else {
        customEvent.eventName = event;
      }
      return customEvent;
    };

    Util.prototype.emitEvent = function(elem, event) {
      if (elem.dispatchEvent != null) {
        return elem.dispatchEvent(event);
      } else if (event in (elem != null)) {
        return elem[event]();
      } else if (("on" + event) in (elem != null)) {
        return elem["on" + event]();
      }
    };

    Util.prototype.addEvent = function(elem, event, fn) {
      if (elem.addEventListener != null) {
        return elem.addEventListener(event, fn, false);
      } else if (elem.attachEvent != null) {
        return elem.attachEvent("on" + event, fn);
      } else {
        return elem[event] = fn;
      }
    };

    Util.prototype.removeEvent = function(elem, event, fn) {
      if (elem.removeEventListener != null) {
        return elem.removeEventListener(event, fn, false);
      } else if (elem.detachEvent != null) {
        return elem.detachEvent("on" + event, fn);
      } else {
        return delete elem[event];
      }
    };

    Util.prototype.innerHeight = function() {
      if ('innerHeight' in window) {
        return window.innerHeight;
      } else {
        return document.documentElement.clientHeight;
      }
    };

    return Util;

  })();

  WeakMap = this.WeakMap || this.MozWeakMap || (WeakMap = (function() {
    function WeakMap() {
      this.keys = [];
      this.values = [];
    }

    WeakMap.prototype.get = function(key) {
      var i, item, j, len, ref;
      ref = this.keys;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        item = ref[i];
        if (item === key) {
          return this.values[i];
        }
      }
    };

    WeakMap.prototype.set = function(key, value) {
      var i, item, j, len, ref;
      ref = this.keys;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        item = ref[i];
        if (item === key) {
          this.values[i] = value;
          return;
        }
      }
      this.keys.push(key);
      return this.values.push(value);
    };

    return WeakMap;

  })());

  MutationObserver = this.MutationObserver || this.WebkitMutationObserver || this.MozMutationObserver || (MutationObserver = (function() {
    function MutationObserver() {
      if (typeof console !== "undefined" && console !== null) {
        console.warn('MutationObserver is not supported by your browser.');
      }
      if (typeof console !== "undefined" && console !== null) {
        console.warn('WOW.js cannot detect dom mutations, please call .sync() after loading new content.');
      }
    }

    MutationObserver.notSupported = true;

    MutationObserver.prototype.observe = function() {};

    return MutationObserver;

  })());

  getComputedStyle = this.getComputedStyle || function(el, pseudo) {
    this.getPropertyValue = function(prop) {
      var ref;
      if (prop === 'float') {
        prop = 'styleFloat';
      }
      if (getComputedStyleRX.test(prop)) {
        prop.replace(getComputedStyleRX, function(_, _char) {
          return _char.toUpperCase();
        });
      }
      return ((ref = el.currentStyle) != null ? ref[prop] : void 0) || null;
    };
    return this;
  };

  getComputedStyleRX = /(\-([a-z]){1})/g;

  this.WOW = (function() {
    WOW.prototype.defaults = {
      boxClass: 'wow',
      animateClass: 'animated',
      offset: 0,
      mobile: true,
      live: true,
      callback: null,
      scrollContainer: null
    };

    function WOW(options) {
      if (options == null) {
        options = {};
      }
      this.scrollCallback = bind(this.scrollCallback, this);
      this.scrollHandler = bind(this.scrollHandler, this);
      this.resetAnimation = bind(this.resetAnimation, this);
      this.start = bind(this.start, this);
      this.scrolled = true;
      this.config = this.util().extend(options, this.defaults);
      if (options.scrollContainer != null) {
        this.config.scrollContainer = document.querySelector(options.scrollContainer);
      }
      this.animationNameCache = new WeakMap();
      this.wowEvent = this.util().createEvent(this.config.boxClass);
    }

    WOW.prototype.init = function() {
      var ref;
      this.element = window.document.documentElement;
      if ((ref = document.readyState) === "interactive" || ref === "complete") {
        this.start();
      } else {
        this.util().addEvent(document, 'DOMContentLoaded', this.start);
      }
      return this.finished = [];
    };

    WOW.prototype.start = function() {
      var box, j, len, ref;
      this.stopped = false;
      this.boxes = (function() {
        var j, len, ref, results;
        ref = this.element.querySelectorAll("." + this.config.boxClass);
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          box = ref[j];
          results.push(box);
        }
        return results;
      }).call(this);
      this.all = (function() {
        var j, len, ref, results;
        ref = this.boxes;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          box = ref[j];
          results.push(box);
        }
        return results;
      }).call(this);
      if (this.boxes.length) {
        if (this.disabled()) {
          this.resetStyle();
        } else {
          ref = this.boxes;
          for (j = 0, len = ref.length; j < len; j++) {
            box = ref[j];
            this.applyStyle(box, true);
          }
        }
      }
      if (!this.disabled()) {
        this.util().addEvent(this.config.scrollContainer || window, 'scroll', this.scrollHandler);
        this.util().addEvent(window, 'resize', this.scrollHandler);
        this.interval = setInterval(this.scrollCallback, 50);
      }
      if (this.config.live) {
        return new MutationObserver((function(_this) {
          return function(records) {
            var k, len1, node, record, results;
            results = [];
            for (k = 0, len1 = records.length; k < len1; k++) {
              record = records[k];
              results.push((function() {
                var l, len2, ref1, results1;
                ref1 = record.addedNodes || [];
                results1 = [];
                for (l = 0, len2 = ref1.length; l < len2; l++) {
                  node = ref1[l];
                  results1.push(this.doSync(node));
                }
                return results1;
              }).call(_this));
            }
            return results;
          };
        })(this)).observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    };

    WOW.prototype.stop = function() {
      this.stopped = true;
      this.util().removeEvent(this.config.scrollContainer || window, 'scroll', this.scrollHandler);
      this.util().removeEvent(window, 'resize', this.scrollHandler);
      if (this.interval != null) {
        return clearInterval(this.interval);
      }
    };

    WOW.prototype.sync = function(element) {
      if (MutationObserver.notSupported) {
        return this.doSync(this.element);
      }
    };

    WOW.prototype.doSync = function(element) {
      var box, j, len, ref, results;
      if (element == null) {
        element = this.element;
      }
      if (element.nodeType !== 1) {
        return;
      }
      element = element.parentNode || element;
      ref = element.querySelectorAll("." + this.config.boxClass);
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        box = ref[j];
        if (indexOf.call(this.all, box) < 0) {
          this.boxes.push(box);
          this.all.push(box);
          if (this.stopped || this.disabled()) {
            this.resetStyle();
          } else {
            this.applyStyle(box, true);
          }
          results.push(this.scrolled = true);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    WOW.prototype.show = function(box) {
      this.applyStyle(box);
      box.className = box.className + " " + this.config.animateClass;
      if (this.config.callback != null) {
        this.config.callback(box);
      }
      this.util().emitEvent(box, this.wowEvent);
      this.util().addEvent(box, 'animationend', this.resetAnimation);
      this.util().addEvent(box, 'oanimationend', this.resetAnimation);
      this.util().addEvent(box, 'webkitAnimationEnd', this.resetAnimation);
      this.util().addEvent(box, 'MSAnimationEnd', this.resetAnimation);
      return box;
    };

    WOW.prototype.applyStyle = function(box, hidden) {
      var delay, duration, iteration;
      duration = box.getAttribute('data-wow-duration');
      delay = box.getAttribute('data-wow-delay');
      iteration = box.getAttribute('data-wow-iteration');
      return this.animate((function(_this) {
        return function() {
          return _this.customStyle(box, hidden, duration, delay, iteration);
        };
      })(this));
    };

    WOW.prototype.animate = (function() {
      if ('requestAnimationFrame' in window) {
        return function(callback) {
          return window.requestAnimationFrame(callback);
        };
      } else {
        return function(callback) {
          return callback();
        };
      }
    })();

    WOW.prototype.resetStyle = function() {
      var box, j, len, ref, results;
      ref = this.boxes;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        box = ref[j];
        results.push(box.style.visibility = 'visible');
      }
      return results;
    };

    WOW.prototype.resetAnimation = function(event) {
      var target;
      if (event.type.toLowerCase().indexOf('animationend') >= 0) {
        target = event.target || event.srcElement;
        return target.className = target.className.replace(this.config.animateClass, '').trim();
      }
    };

    WOW.prototype.customStyle = function(box, hidden, duration, delay, iteration) {
      if (hidden) {
        this.cacheAnimationName(box);
      }
      box.style.visibility = hidden ? 'hidden' : 'visible';
      if (duration) {
        this.vendorSet(box.style, {
          animationDuration: duration
        });
      }
      if (delay) {
        this.vendorSet(box.style, {
          animationDelay: delay
        });
      }
      if (iteration) {
        this.vendorSet(box.style, {
          animationIterationCount: iteration
        });
      }
      this.vendorSet(box.style, {
        animationName: hidden ? 'none' : this.cachedAnimationName(box)
      });
      return box;
    };

    WOW.prototype.vendors = ["moz", "webkit"];

    WOW.prototype.vendorSet = function(elem, properties) {
      var name, results, value, vendor;
      results = [];
      for (name in properties) {
        value = properties[name];
        elem["" + name] = value;
        results.push((function() {
          var j, len, ref, results1;
          ref = this.vendors;
          results1 = [];
          for (j = 0, len = ref.length; j < len; j++) {
            vendor = ref[j];
            results1.push(elem["" + vendor + (name.charAt(0).toUpperCase()) + (name.substr(1))] = value);
          }
          return results1;
        }).call(this));
      }
      return results;
    };

    WOW.prototype.vendorCSS = function(elem, property) {
      var j, len, ref, result, style, vendor;
      style = getComputedStyle(elem);
      result = style.getPropertyCSSValue(property);
      ref = this.vendors;
      for (j = 0, len = ref.length; j < len; j++) {
        vendor = ref[j];
        result = result || style.getPropertyCSSValue("-" + vendor + "-" + property);
      }
      return result;
    };

    WOW.prototype.animationName = function(box) {
      var animationName, error;
      try {
        animationName = this.vendorCSS(box, 'animation-name').cssText;
      } catch (error) {
        animationName = getComputedStyle(box).getPropertyValue('animation-name');
      }
      if (animationName === 'none') {
        return '';
      } else {
        return animationName;
      }
    };

    WOW.prototype.cacheAnimationName = function(box) {
      return this.animationNameCache.set(box, this.animationName(box));
    };

    WOW.prototype.cachedAnimationName = function(box) {
      return this.animationNameCache.get(box);
    };

    WOW.prototype.scrollHandler = function() {
      return this.scrolled = true;
    };

    WOW.prototype.scrollCallback = function() {
      var box;
      if (this.scrolled) {
        this.scrolled = false;
        this.boxes = (function() {
          var j, len, ref, results;
          ref = this.boxes;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            box = ref[j];
            if (!(box)) {
              continue;
            }
            if (this.isVisible(box)) {
              this.show(box);
              continue;
            }
            results.push(box);
          }
          return results;
        }).call(this);
        if (!(this.boxes.length || this.config.live)) {
          return this.stop();
        }
      }
    };

    WOW.prototype.offsetTop = function(element) {
      var top;
      while (element.offsetTop === void 0) {
        element = element.parentNode;
      }
      top = element.offsetTop;
      while (element = element.offsetParent) {
        top += element.offsetTop;
      }
      return top;
    };

    WOW.prototype.isVisible = function(box) {
      var bottom, offset, top, viewBottom, viewTop;
      offset = box.getAttribute('data-wow-offset') || this.config.offset;
      viewTop = (this.config.scrollContainer && this.config.scrollContainer.scrollTop) || window.pageYOffset;
      viewBottom = viewTop + Math.min(this.element.clientHeight, this.util().innerHeight()) - offset;
      top = this.offsetTop(box);
      bottom = top + box.clientHeight;
      return top <= viewBottom && bottom >= viewTop;
    };

    WOW.prototype.util = function() {
      return this._util != null ? this._util : this._util = new Util();
    };

    WOW.prototype.disabled = function() {
      return !this.config.mobile && this.util().isMobile(navigator.userAgent);
    };

    return WOW;

  })();

}).call(this);

},{}],2:[function(require,module,exports){
"use strict";

var _wowjs = require("wowjs");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

// MOBILE MENU
var menuBtns = document.querySelectorAll('.main-header__menu-toggle');
var menuItems = document.querySelector('.main-header__nav-items'); // menuBtns.forEach((btn) => {
//   btn.addEventListener('click', () => menuItems.classList.toggle('active'))
// })

menuItems.addEventListener('click', function (e) {
  if (e.target.tagName === 'A') {
    menuItems.classList.remove('active');
  }
}); // WOWJS

new _wowjs.WOW().init(); // OUR CLIENTS SHOW INFO

var aboutUsTeam = document.querySelector('.about-us__team');

function init() {
  document.onscroll = null;

  var clients = _toConsumableArray(document.querySelectorAll('.about-us__team-person'));

  var currentClient = 0;
  setInterval(function () {
    if (currentClient === clients.length) {
      clients[currentClient - 1].classList.remove('active');
      currentClient = 0;
    }

    if (currentClient !== 0) clients[currentClient - 1].classList.remove('active');
    clients[currentClient].classList.add('active');
    currentClient += 1;
  }, 2000);
}

document.onscroll = function () {
  if (aboutUsTeam.getBoundingClientRect().top - window.outerHeight <= 0) init();
};

},{"wowjs":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvd293anMvZGlzdC93b3cuanMiLCJzcmMvanMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDamdCQTs7Ozs7Ozs7OztBQUVBO0FBQ0EsSUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGdCQUFULENBQTBCLDJCQUExQixDQUFqQjtBQUNBLElBQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLHlCQUF2QixDQUFsQixDLENBRUE7QUFDQTtBQUNBOztBQUVBLFNBQVMsQ0FBQyxnQkFBVixDQUEyQixPQUEzQixFQUFvQyxVQUFDLENBQUQsRUFBTztBQUN6QyxNQUFJLENBQUMsQ0FBQyxNQUFGLENBQVMsT0FBVCxLQUFxQixHQUF6QixFQUE4QjtBQUM1QixJQUFBLFNBQVMsQ0FBQyxTQUFWLENBQW9CLE1BQXBCLENBQTJCLFFBQTNCO0FBQ0Q7QUFDRixDQUpELEUsQ0FNQTs7QUFDQSxJQUFJLFVBQUosR0FBVSxJQUFWLEcsQ0FFQTs7QUFDQSxJQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixpQkFBdkIsQ0FBcEI7O0FBRUEsU0FBUyxJQUFULEdBQWdCO0FBQ2QsRUFBQSxRQUFRLENBQUMsUUFBVCxHQUFvQixJQUFwQjs7QUFFQSxNQUFNLE9BQU8sc0JBQU8sUUFBUSxDQUFDLGdCQUFULENBQTBCLHdCQUExQixDQUFQLENBQWI7O0FBRUEsTUFBSSxhQUFhLEdBQUcsQ0FBcEI7QUFFQSxFQUFBLFdBQVcsQ0FBQyxZQUFNO0FBQ2hCLFFBQUksYUFBYSxLQUFLLE9BQU8sQ0FBQyxNQUE5QixFQUFzQztBQUNwQyxNQUFBLE9BQU8sQ0FBQyxhQUFhLEdBQUcsQ0FBakIsQ0FBUCxDQUEyQixTQUEzQixDQUFxQyxNQUFyQyxDQUE0QyxRQUE1QztBQUNBLE1BQUEsYUFBYSxHQUFHLENBQWhCO0FBQ0Q7O0FBQ0QsUUFBSSxhQUFhLEtBQUssQ0FBdEIsRUFBeUIsT0FBTyxDQUFDLGFBQWEsR0FBRyxDQUFqQixDQUFQLENBQTJCLFNBQTNCLENBQXFDLE1BQXJDLENBQTRDLFFBQTVDO0FBQ3pCLElBQUEsT0FBTyxDQUFDLGFBQUQsQ0FBUCxDQUF1QixTQUF2QixDQUFpQyxHQUFqQyxDQUFxQyxRQUFyQztBQUNBLElBQUEsYUFBYSxJQUFJLENBQWpCO0FBQ0QsR0FSVSxFQVFSLElBUlEsQ0FBWDtBQVNEOztBQUVELFFBQVEsQ0FBQyxRQUFULEdBQW9CLFlBQU07QUFDeEIsTUFBSSxXQUFXLENBQUMscUJBQVosR0FBb0MsR0FBcEMsR0FBMEMsTUFBTSxDQUFDLFdBQWpELElBQWdFLENBQXBFLEVBQXVFLElBQUk7QUFDNUUsQ0FGRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIihmdW5jdGlvbigpIHtcbiAgdmFyIE11dGF0aW9uT2JzZXJ2ZXIsIFV0aWwsIFdlYWtNYXAsIGdldENvbXB1dGVkU3R5bGUsIGdldENvbXB1dGVkU3R5bGVSWCxcbiAgICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgICBpbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbiAgVXRpbCA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBVdGlsKCkge31cblxuICAgIFV0aWwucHJvdG90eXBlLmV4dGVuZCA9IGZ1bmN0aW9uKGN1c3RvbSwgZGVmYXVsdHMpIHtcbiAgICAgIHZhciBrZXksIHZhbHVlO1xuICAgICAgZm9yIChrZXkgaW4gZGVmYXVsdHMpIHtcbiAgICAgICAgdmFsdWUgPSBkZWZhdWx0c1trZXldO1xuICAgICAgICBpZiAoY3VzdG9tW2tleV0gPT0gbnVsbCkge1xuICAgICAgICAgIGN1c3RvbVtrZXldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjdXN0b207XG4gICAgfTtcblxuICAgIFV0aWwucHJvdG90eXBlLmlzTW9iaWxlID0gZnVuY3Rpb24oYWdlbnQpIHtcbiAgICAgIHJldHVybiAvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnl8SUVNb2JpbGV8T3BlcmEgTWluaS9pLnRlc3QoYWdlbnQpO1xuICAgIH07XG5cbiAgICBVdGlsLnByb3RvdHlwZS5jcmVhdGVFdmVudCA9IGZ1bmN0aW9uKGV2ZW50LCBidWJibGUsIGNhbmNlbCwgZGV0YWlsKSB7XG4gICAgICB2YXIgY3VzdG9tRXZlbnQ7XG4gICAgICBpZiAoYnViYmxlID09IG51bGwpIHtcbiAgICAgICAgYnViYmxlID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoY2FuY2VsID09IG51bGwpIHtcbiAgICAgICAgY2FuY2VsID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoZGV0YWlsID09IG51bGwpIHtcbiAgICAgICAgZGV0YWlsID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudCAhPSBudWxsKSB7XG4gICAgICAgIGN1c3RvbUV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XG4gICAgICAgIGN1c3RvbUV2ZW50LmluaXRDdXN0b21FdmVudChldmVudCwgYnViYmxlLCBjYW5jZWwsIGRldGFpbCk7XG4gICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0ICE9IG51bGwpIHtcbiAgICAgICAgY3VzdG9tRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpO1xuICAgICAgICBjdXN0b21FdmVudC5ldmVudFR5cGUgPSBldmVudDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1c3RvbUV2ZW50LmV2ZW50TmFtZSA9IGV2ZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN1c3RvbUV2ZW50O1xuICAgIH07XG5cbiAgICBVdGlsLnByb3RvdHlwZS5lbWl0RXZlbnQgPSBmdW5jdGlvbihlbGVtLCBldmVudCkge1xuICAgICAgaWYgKGVsZW0uZGlzcGF0Y2hFdmVudCAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBlbGVtLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgfSBlbHNlIGlmIChldmVudCBpbiAoZWxlbSAhPSBudWxsKSkge1xuICAgICAgICByZXR1cm4gZWxlbVtldmVudF0oKTtcbiAgICAgIH0gZWxzZSBpZiAoKFwib25cIiArIGV2ZW50KSBpbiAoZWxlbSAhPSBudWxsKSkge1xuICAgICAgICByZXR1cm4gZWxlbVtcIm9uXCIgKyBldmVudF0oKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgVXRpbC5wcm90b3R5cGUuYWRkRXZlbnQgPSBmdW5jdGlvbihlbGVtLCBldmVudCwgZm4pIHtcbiAgICAgIGlmIChlbGVtLmFkZEV2ZW50TGlzdGVuZXIgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZWxlbS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBmbiwgZmFsc2UpO1xuICAgICAgfSBlbHNlIGlmIChlbGVtLmF0dGFjaEV2ZW50ICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0uYXR0YWNoRXZlbnQoXCJvblwiICsgZXZlbnQsIGZuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBlbGVtW2V2ZW50XSA9IGZuO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBVdGlsLnByb3RvdHlwZS5yZW1vdmVFdmVudCA9IGZ1bmN0aW9uKGVsZW0sIGV2ZW50LCBmbikge1xuICAgICAgaWYgKGVsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lciAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGZuLCBmYWxzZSk7XG4gICAgICB9IGVsc2UgaWYgKGVsZW0uZGV0YWNoRXZlbnQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZWxlbS5kZXRhY2hFdmVudChcIm9uXCIgKyBldmVudCwgZm4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRlbGV0ZSBlbGVtW2V2ZW50XTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgVXRpbC5wcm90b3R5cGUuaW5uZXJIZWlnaHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgnaW5uZXJIZWlnaHQnIGluIHdpbmRvdykge1xuICAgICAgICByZXR1cm4gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBVdGlsO1xuXG4gIH0pKCk7XG5cbiAgV2Vha01hcCA9IHRoaXMuV2Vha01hcCB8fCB0aGlzLk1veldlYWtNYXAgfHwgKFdlYWtNYXAgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gV2Vha01hcCgpIHtcbiAgICAgIHRoaXMua2V5cyA9IFtdO1xuICAgICAgdGhpcy52YWx1ZXMgPSBbXTtcbiAgICB9XG5cbiAgICBXZWFrTWFwLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBpLCBpdGVtLCBqLCBsZW4sIHJlZjtcbiAgICAgIHJlZiA9IHRoaXMua2V5cztcbiAgICAgIGZvciAoaSA9IGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBpID0gKytqKSB7XG4gICAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICAgIGlmIChpdGVtID09PSBrZXkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy52YWx1ZXNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgV2Vha01hcC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgdmFyIGksIGl0ZW0sIGosIGxlbiwgcmVmO1xuICAgICAgcmVmID0gdGhpcy5rZXlzO1xuICAgICAgZm9yIChpID0gaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGkgPSArK2opIHtcbiAgICAgICAgaXRlbSA9IHJlZltpXTtcbiAgICAgICAgaWYgKGl0ZW0gPT09IGtleSkge1xuICAgICAgICAgIHRoaXMudmFsdWVzW2ldID0gdmFsdWU7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmtleXMucHVzaChrZXkpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWVzLnB1c2godmFsdWUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gV2Vha01hcDtcblxuICB9KSgpKTtcblxuICBNdXRhdGlvbk9ic2VydmVyID0gdGhpcy5NdXRhdGlvbk9ic2VydmVyIHx8IHRoaXMuV2Via2l0TXV0YXRpb25PYnNlcnZlciB8fCB0aGlzLk1vek11dGF0aW9uT2JzZXJ2ZXIgfHwgKE11dGF0aW9uT2JzZXJ2ZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gTXV0YXRpb25PYnNlcnZlcigpIHtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBjb25zb2xlICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignTXV0YXRpb25PYnNlcnZlciBpcyBub3Qgc3VwcG9ydGVkIGJ5IHlvdXIgYnJvd3Nlci4nKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBjb25zb2xlICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignV09XLmpzIGNhbm5vdCBkZXRlY3QgZG9tIG11dGF0aW9ucywgcGxlYXNlIGNhbGwgLnN5bmMoKSBhZnRlciBsb2FkaW5nIG5ldyBjb250ZW50LicpO1xuICAgICAgfVxuICAgIH1cblxuICAgIE11dGF0aW9uT2JzZXJ2ZXIubm90U3VwcG9ydGVkID0gdHJ1ZTtcblxuICAgIE11dGF0aW9uT2JzZXJ2ZXIucHJvdG90eXBlLm9ic2VydmUgPSBmdW5jdGlvbigpIHt9O1xuXG4gICAgcmV0dXJuIE11dGF0aW9uT2JzZXJ2ZXI7XG5cbiAgfSkoKSk7XG5cbiAgZ2V0Q29tcHV0ZWRTdHlsZSA9IHRoaXMuZ2V0Q29tcHV0ZWRTdHlsZSB8fCBmdW5jdGlvbihlbCwgcHNldWRvKSB7XG4gICAgdGhpcy5nZXRQcm9wZXJ0eVZhbHVlID0gZnVuY3Rpb24ocHJvcCkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIGlmIChwcm9wID09PSAnZmxvYXQnKSB7XG4gICAgICAgIHByb3AgPSAnc3R5bGVGbG9hdCc7XG4gICAgICB9XG4gICAgICBpZiAoZ2V0Q29tcHV0ZWRTdHlsZVJYLnRlc3QocHJvcCkpIHtcbiAgICAgICAgcHJvcC5yZXBsYWNlKGdldENvbXB1dGVkU3R5bGVSWCwgZnVuY3Rpb24oXywgX2NoYXIpIHtcbiAgICAgICAgICByZXR1cm4gX2NoYXIudG9VcHBlckNhc2UoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gKChyZWYgPSBlbC5jdXJyZW50U3R5bGUpICE9IG51bGwgPyByZWZbcHJvcF0gOiB2b2lkIDApIHx8IG51bGw7XG4gICAgfTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBnZXRDb21wdXRlZFN0eWxlUlggPSAvKFxcLShbYS16XSl7MX0pL2c7XG5cbiAgdGhpcy5XT1cgPSAoZnVuY3Rpb24oKSB7XG4gICAgV09XLnByb3RvdHlwZS5kZWZhdWx0cyA9IHtcbiAgICAgIGJveENsYXNzOiAnd293JyxcbiAgICAgIGFuaW1hdGVDbGFzczogJ2FuaW1hdGVkJyxcbiAgICAgIG9mZnNldDogMCxcbiAgICAgIG1vYmlsZTogdHJ1ZSxcbiAgICAgIGxpdmU6IHRydWUsXG4gICAgICBjYWxsYmFjazogbnVsbCxcbiAgICAgIHNjcm9sbENvbnRhaW5lcjogbnVsbFxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBXT1cob3B0aW9ucykge1xuICAgICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgICB9XG4gICAgICB0aGlzLnNjcm9sbENhbGxiYWNrID0gYmluZCh0aGlzLnNjcm9sbENhbGxiYWNrLCB0aGlzKTtcbiAgICAgIHRoaXMuc2Nyb2xsSGFuZGxlciA9IGJpbmQodGhpcy5zY3JvbGxIYW5kbGVyLCB0aGlzKTtcbiAgICAgIHRoaXMucmVzZXRBbmltYXRpb24gPSBiaW5kKHRoaXMucmVzZXRBbmltYXRpb24sIHRoaXMpO1xuICAgICAgdGhpcy5zdGFydCA9IGJpbmQodGhpcy5zdGFydCwgdGhpcyk7XG4gICAgICB0aGlzLnNjcm9sbGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuY29uZmlnID0gdGhpcy51dGlsKCkuZXh0ZW5kKG9wdGlvbnMsIHRoaXMuZGVmYXVsdHMpO1xuICAgICAgaWYgKG9wdGlvbnMuc2Nyb2xsQ29udGFpbmVyICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5jb25maWcuc2Nyb2xsQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihvcHRpb25zLnNjcm9sbENvbnRhaW5lcik7XG4gICAgICB9XG4gICAgICB0aGlzLmFuaW1hdGlvbk5hbWVDYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG4gICAgICB0aGlzLndvd0V2ZW50ID0gdGhpcy51dGlsKCkuY3JlYXRlRXZlbnQodGhpcy5jb25maWcuYm94Q2xhc3MpO1xuICAgIH1cblxuICAgIFdPVy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlZjtcbiAgICAgIHRoaXMuZWxlbWVudCA9IHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICBpZiAoKHJlZiA9IGRvY3VtZW50LnJlYWR5U3RhdGUpID09PSBcImludGVyYWN0aXZlXCIgfHwgcmVmID09PSBcImNvbXBsZXRlXCIpIHtcbiAgICAgICAgdGhpcy5zdGFydCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51dGlsKCkuYWRkRXZlbnQoZG9jdW1lbnQsICdET01Db250ZW50TG9hZGVkJywgdGhpcy5zdGFydCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hlZCA9IFtdO1xuICAgIH07XG5cbiAgICBXT1cucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYm94LCBqLCBsZW4sIHJlZjtcbiAgICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5ib3hlcyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGosIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgICAgICByZWYgPSB0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5cIiArIHRoaXMuY29uZmlnLmJveENsYXNzKTtcbiAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICBib3ggPSByZWZbal07XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKGJveCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9KS5jYWxsKHRoaXMpO1xuICAgICAgdGhpcy5hbGwgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBqLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICAgICAgcmVmID0gdGhpcy5ib3hlcztcbiAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICBib3ggPSByZWZbal07XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKGJveCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9KS5jYWxsKHRoaXMpO1xuICAgICAgaWYgKHRoaXMuYm94ZXMubGVuZ3RoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKCkpIHtcbiAgICAgICAgICB0aGlzLnJlc2V0U3R5bGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWYgPSB0aGlzLmJveGVzO1xuICAgICAgICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgYm94ID0gcmVmW2pdO1xuICAgICAgICAgICAgdGhpcy5hcHBseVN0eWxlKGJveCwgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuZGlzYWJsZWQoKSkge1xuICAgICAgICB0aGlzLnV0aWwoKS5hZGRFdmVudCh0aGlzLmNvbmZpZy5zY3JvbGxDb250YWluZXIgfHwgd2luZG93LCAnc2Nyb2xsJywgdGhpcy5zY3JvbGxIYW5kbGVyKTtcbiAgICAgICAgdGhpcy51dGlsKCkuYWRkRXZlbnQod2luZG93LCAncmVzaXplJywgdGhpcy5zY3JvbGxIYW5kbGVyKTtcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKHRoaXMuc2Nyb2xsQ2FsbGJhY2ssIDUwKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmNvbmZpZy5saXZlKSB7XG4gICAgICAgIHJldHVybiBuZXcgTXV0YXRpb25PYnNlcnZlcigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmVjb3Jkcykge1xuICAgICAgICAgICAgdmFyIGssIGxlbjEsIG5vZGUsIHJlY29yZCwgcmVzdWx0cztcbiAgICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoayA9IDAsIGxlbjEgPSByZWNvcmRzLmxlbmd0aDsgayA8IGxlbjE7IGsrKykge1xuICAgICAgICAgICAgICByZWNvcmQgPSByZWNvcmRzW2tdO1xuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBsLCBsZW4yLCByZWYxLCByZXN1bHRzMTtcbiAgICAgICAgICAgICAgICByZWYxID0gcmVjb3JkLmFkZGVkTm9kZXMgfHwgW107XG4gICAgICAgICAgICAgICAgcmVzdWx0czEgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGwgPSAwLCBsZW4yID0gcmVmMS5sZW5ndGg7IGwgPCBsZW4yOyBsKyspIHtcbiAgICAgICAgICAgICAgICAgIG5vZGUgPSByZWYxW2xdO1xuICAgICAgICAgICAgICAgICAgcmVzdWx0czEucHVzaCh0aGlzLmRvU3luYyhub2RlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzMTtcbiAgICAgICAgICAgICAgfSkuY2FsbChfdGhpcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkodGhpcykpLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICBzdWJ0cmVlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBXT1cucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG4gICAgICB0aGlzLnV0aWwoKS5yZW1vdmVFdmVudCh0aGlzLmNvbmZpZy5zY3JvbGxDb250YWluZXIgfHwgd2luZG93LCAnc2Nyb2xsJywgdGhpcy5zY3JvbGxIYW5kbGVyKTtcbiAgICAgIHRoaXMudXRpbCgpLnJlbW92ZUV2ZW50KHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMuc2Nyb2xsSGFuZGxlcik7XG4gICAgICBpZiAodGhpcy5pbnRlcnZhbCAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBXT1cucHJvdG90eXBlLnN5bmMgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICBpZiAoTXV0YXRpb25PYnNlcnZlci5ub3RTdXBwb3J0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZG9TeW5jKHRoaXMuZWxlbWVudCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIFdPVy5wcm90b3R5cGUuZG9TeW5jID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdmFyIGJveCwgaiwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgICBpZiAoZWxlbWVudCA9PSBudWxsKSB7XG4gICAgICAgIGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQ7XG4gICAgICB9XG4gICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSAhPT0gMSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlIHx8IGVsZW1lbnQ7XG4gICAgICByZWYgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuXCIgKyB0aGlzLmNvbmZpZy5ib3hDbGFzcyk7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgYm94ID0gcmVmW2pdO1xuICAgICAgICBpZiAoaW5kZXhPZi5jYWxsKHRoaXMuYWxsLCBib3gpIDwgMCkge1xuICAgICAgICAgIHRoaXMuYm94ZXMucHVzaChib3gpO1xuICAgICAgICAgIHRoaXMuYWxsLnB1c2goYm94KTtcbiAgICAgICAgICBpZiAodGhpcy5zdG9wcGVkIHx8IHRoaXMuZGlzYWJsZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldFN0eWxlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXBwbHlTdHlsZShib3gsIHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5zY3JvbGxlZCA9IHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgV09XLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oYm94KSB7XG4gICAgICB0aGlzLmFwcGx5U3R5bGUoYm94KTtcbiAgICAgIGJveC5jbGFzc05hbWUgPSBib3guY2xhc3NOYW1lICsgXCIgXCIgKyB0aGlzLmNvbmZpZy5hbmltYXRlQ2xhc3M7XG4gICAgICBpZiAodGhpcy5jb25maWcuY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNvbmZpZy5jYWxsYmFjayhib3gpO1xuICAgICAgfVxuICAgICAgdGhpcy51dGlsKCkuZW1pdEV2ZW50KGJveCwgdGhpcy53b3dFdmVudCk7XG4gICAgICB0aGlzLnV0aWwoKS5hZGRFdmVudChib3gsICdhbmltYXRpb25lbmQnLCB0aGlzLnJlc2V0QW5pbWF0aW9uKTtcbiAgICAgIHRoaXMudXRpbCgpLmFkZEV2ZW50KGJveCwgJ29hbmltYXRpb25lbmQnLCB0aGlzLnJlc2V0QW5pbWF0aW9uKTtcbiAgICAgIHRoaXMudXRpbCgpLmFkZEV2ZW50KGJveCwgJ3dlYmtpdEFuaW1hdGlvbkVuZCcsIHRoaXMucmVzZXRBbmltYXRpb24pO1xuICAgICAgdGhpcy51dGlsKCkuYWRkRXZlbnQoYm94LCAnTVNBbmltYXRpb25FbmQnLCB0aGlzLnJlc2V0QW5pbWF0aW9uKTtcbiAgICAgIHJldHVybiBib3g7XG4gICAgfTtcblxuICAgIFdPVy5wcm90b3R5cGUuYXBwbHlTdHlsZSA9IGZ1bmN0aW9uKGJveCwgaGlkZGVuKSB7XG4gICAgICB2YXIgZGVsYXksIGR1cmF0aW9uLCBpdGVyYXRpb247XG4gICAgICBkdXJhdGlvbiA9IGJveC5nZXRBdHRyaWJ1dGUoJ2RhdGEtd293LWR1cmF0aW9uJyk7XG4gICAgICBkZWxheSA9IGJveC5nZXRBdHRyaWJ1dGUoJ2RhdGEtd293LWRlbGF5Jyk7XG4gICAgICBpdGVyYXRpb24gPSBib3guZ2V0QXR0cmlidXRlKCdkYXRhLXdvdy1pdGVyYXRpb24nKTtcbiAgICAgIHJldHVybiB0aGlzLmFuaW1hdGUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuY3VzdG9tU3R5bGUoYm94LCBoaWRkZW4sIGR1cmF0aW9uLCBkZWxheSwgaXRlcmF0aW9uKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgV09XLnByb3RvdHlwZS5hbmltYXRlID0gKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUnIGluIHdpbmRvdykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KSgpO1xuXG4gICAgV09XLnByb3RvdHlwZS5yZXNldFN0eWxlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYm94LCBqLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICAgIHJlZiA9IHRoaXMuYm94ZXM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgYm94ID0gcmVmW2pdO1xuICAgICAgICByZXN1bHRzLnB1c2goYm94LnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcblxuICAgIFdPVy5wcm90b3R5cGUucmVzZXRBbmltYXRpb24gPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIHRhcmdldDtcbiAgICAgIGlmIChldmVudC50eXBlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignYW5pbWF0aW9uZW5kJykgPj0gMCkge1xuICAgICAgICB0YXJnZXQgPSBldmVudC50YXJnZXQgfHwgZXZlbnQuc3JjRWxlbWVudDtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5jbGFzc05hbWUgPSB0YXJnZXQuY2xhc3NOYW1lLnJlcGxhY2UodGhpcy5jb25maWcuYW5pbWF0ZUNsYXNzLCAnJykudHJpbSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBXT1cucHJvdG90eXBlLmN1c3RvbVN0eWxlID0gZnVuY3Rpb24oYm94LCBoaWRkZW4sIGR1cmF0aW9uLCBkZWxheSwgaXRlcmF0aW9uKSB7XG4gICAgICBpZiAoaGlkZGVuKSB7XG4gICAgICAgIHRoaXMuY2FjaGVBbmltYXRpb25OYW1lKGJveCk7XG4gICAgICB9XG4gICAgICBib3guc3R5bGUudmlzaWJpbGl0eSA9IGhpZGRlbiA/ICdoaWRkZW4nIDogJ3Zpc2libGUnO1xuICAgICAgaWYgKGR1cmF0aW9uKSB7XG4gICAgICAgIHRoaXMudmVuZG9yU2V0KGJveC5zdHlsZSwge1xuICAgICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiBkdXJhdGlvblxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChkZWxheSkge1xuICAgICAgICB0aGlzLnZlbmRvclNldChib3guc3R5bGUsIHtcbiAgICAgICAgICBhbmltYXRpb25EZWxheTogZGVsYXlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoaXRlcmF0aW9uKSB7XG4gICAgICAgIHRoaXMudmVuZG9yU2V0KGJveC5zdHlsZSwge1xuICAgICAgICAgIGFuaW1hdGlvbkl0ZXJhdGlvbkNvdW50OiBpdGVyYXRpb25cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLnZlbmRvclNldChib3guc3R5bGUsIHtcbiAgICAgICAgYW5pbWF0aW9uTmFtZTogaGlkZGVuID8gJ25vbmUnIDogdGhpcy5jYWNoZWRBbmltYXRpb25OYW1lKGJveClcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGJveDtcbiAgICB9O1xuXG4gICAgV09XLnByb3RvdHlwZS52ZW5kb3JzID0gW1wibW96XCIsIFwid2Via2l0XCJdO1xuXG4gICAgV09XLnByb3RvdHlwZS52ZW5kb3JTZXQgPSBmdW5jdGlvbihlbGVtLCBwcm9wZXJ0aWVzKSB7XG4gICAgICB2YXIgbmFtZSwgcmVzdWx0cywgdmFsdWUsIHZlbmRvcjtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAobmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIHZhbHVlID0gcHJvcGVydGllc1tuYW1lXTtcbiAgICAgICAgZWxlbVtcIlwiICsgbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgaiwgbGVuLCByZWYsIHJlc3VsdHMxO1xuICAgICAgICAgIHJlZiA9IHRoaXMudmVuZG9ycztcbiAgICAgICAgICByZXN1bHRzMSA9IFtdO1xuICAgICAgICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgdmVuZG9yID0gcmVmW2pdO1xuICAgICAgICAgICAgcmVzdWx0czEucHVzaChlbGVtW1wiXCIgKyB2ZW5kb3IgKyAobmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSkgKyAobmFtZS5zdWJzdHIoMSkpXSA9IHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHMxO1xuICAgICAgICB9KS5jYWxsKHRoaXMpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG5cbiAgICBXT1cucHJvdG90eXBlLnZlbmRvckNTUyA9IGZ1bmN0aW9uKGVsZW0sIHByb3BlcnR5KSB7XG4gICAgICB2YXIgaiwgbGVuLCByZWYsIHJlc3VsdCwgc3R5bGUsIHZlbmRvcjtcbiAgICAgIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtKTtcbiAgICAgIHJlc3VsdCA9IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUocHJvcGVydHkpO1xuICAgICAgcmVmID0gdGhpcy52ZW5kb3JzO1xuICAgICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgIHZlbmRvciA9IHJlZltqXTtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0IHx8IHN0eWxlLmdldFByb3BlcnR5Q1NTVmFsdWUoXCItXCIgKyB2ZW5kb3IgKyBcIi1cIiArIHByb3BlcnR5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIFdPVy5wcm90b3R5cGUuYW5pbWF0aW9uTmFtZSA9IGZ1bmN0aW9uKGJveCkge1xuICAgICAgdmFyIGFuaW1hdGlvbk5hbWUsIGVycm9yO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYW5pbWF0aW9uTmFtZSA9IHRoaXMudmVuZG9yQ1NTKGJveCwgJ2FuaW1hdGlvbi1uYW1lJykuY3NzVGV4dDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGFuaW1hdGlvbk5hbWUgPSBnZXRDb21wdXRlZFN0eWxlKGJveCkuZ2V0UHJvcGVydHlWYWx1ZSgnYW5pbWF0aW9uLW5hbWUnKTtcbiAgICAgIH1cbiAgICAgIGlmIChhbmltYXRpb25OYW1lID09PSAnbm9uZScpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGFuaW1hdGlvbk5hbWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIFdPVy5wcm90b3R5cGUuY2FjaGVBbmltYXRpb25OYW1lID0gZnVuY3Rpb24oYm94KSB7XG4gICAgICByZXR1cm4gdGhpcy5hbmltYXRpb25OYW1lQ2FjaGUuc2V0KGJveCwgdGhpcy5hbmltYXRpb25OYW1lKGJveCkpO1xuICAgIH07XG5cbiAgICBXT1cucHJvdG90eXBlLmNhY2hlZEFuaW1hdGlvbk5hbWUgPSBmdW5jdGlvbihib3gpIHtcbiAgICAgIHJldHVybiB0aGlzLmFuaW1hdGlvbk5hbWVDYWNoZS5nZXQoYm94KTtcbiAgICB9O1xuXG4gICAgV09XLnByb3RvdHlwZS5zY3JvbGxIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY3JvbGxlZCA9IHRydWU7XG4gICAgfTtcblxuICAgIFdPVy5wcm90b3R5cGUuc2Nyb2xsQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBib3g7XG4gICAgICBpZiAodGhpcy5zY3JvbGxlZCkge1xuICAgICAgICB0aGlzLnNjcm9sbGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYm94ZXMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGosIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgICAgICAgIHJlZiA9IHRoaXMuYm94ZXM7XG4gICAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgYm94ID0gcmVmW2pdO1xuICAgICAgICAgICAgaWYgKCEoYm94KSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmlzVmlzaWJsZShib3gpKSB7XG4gICAgICAgICAgICAgIHRoaXMuc2hvdyhib3gpO1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChib3gpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfSkuY2FsbCh0aGlzKTtcbiAgICAgICAgaWYgKCEodGhpcy5ib3hlcy5sZW5ndGggfHwgdGhpcy5jb25maWcubGl2ZSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgV09XLnByb3RvdHlwZS5vZmZzZXRUb3AgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgdG9wO1xuICAgICAgd2hpbGUgKGVsZW1lbnQub2Zmc2V0VG9wID09PSB2b2lkIDApIHtcbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICAgIH1cbiAgICAgIHRvcCA9IGVsZW1lbnQub2Zmc2V0VG9wO1xuICAgICAgd2hpbGUgKGVsZW1lbnQgPSBlbGVtZW50Lm9mZnNldFBhcmVudCkge1xuICAgICAgICB0b3AgKz0gZWxlbWVudC5vZmZzZXRUb3A7XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9wO1xuICAgIH07XG5cbiAgICBXT1cucHJvdG90eXBlLmlzVmlzaWJsZSA9IGZ1bmN0aW9uKGJveCkge1xuICAgICAgdmFyIGJvdHRvbSwgb2Zmc2V0LCB0b3AsIHZpZXdCb3R0b20sIHZpZXdUb3A7XG4gICAgICBvZmZzZXQgPSBib3guZ2V0QXR0cmlidXRlKCdkYXRhLXdvdy1vZmZzZXQnKSB8fCB0aGlzLmNvbmZpZy5vZmZzZXQ7XG4gICAgICB2aWV3VG9wID0gKHRoaXMuY29uZmlnLnNjcm9sbENvbnRhaW5lciAmJiB0aGlzLmNvbmZpZy5zY3JvbGxDb250YWluZXIuc2Nyb2xsVG9wKSB8fCB3aW5kb3cucGFnZVlPZmZzZXQ7XG4gICAgICB2aWV3Qm90dG9tID0gdmlld1RvcCArIE1hdGgubWluKHRoaXMuZWxlbWVudC5jbGllbnRIZWlnaHQsIHRoaXMudXRpbCgpLmlubmVySGVpZ2h0KCkpIC0gb2Zmc2V0O1xuICAgICAgdG9wID0gdGhpcy5vZmZzZXRUb3AoYm94KTtcbiAgICAgIGJvdHRvbSA9IHRvcCArIGJveC5jbGllbnRIZWlnaHQ7XG4gICAgICByZXR1cm4gdG9wIDw9IHZpZXdCb3R0b20gJiYgYm90dG9tID49IHZpZXdUb3A7XG4gICAgfTtcblxuICAgIFdPVy5wcm90b3R5cGUudXRpbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3V0aWwgIT0gbnVsbCA/IHRoaXMuX3V0aWwgOiB0aGlzLl91dGlsID0gbmV3IFV0aWwoKTtcbiAgICB9O1xuXG4gICAgV09XLnByb3RvdHlwZS5kaXNhYmxlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICF0aGlzLmNvbmZpZy5tb2JpbGUgJiYgdGhpcy51dGlsKCkuaXNNb2JpbGUobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgfTtcblxuICAgIHJldHVybiBXT1c7XG5cbiAgfSkoKTtcblxufSkuY2FsbCh0aGlzKTtcbiIsImltcG9ydCB7IFdPVyB9IGZyb20gJ3dvd2pzJ1xyXG5cclxuLy8gTU9CSUxFIE1FTlVcclxuY29uc3QgbWVudUJ0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubWFpbi1oZWFkZXJfX21lbnUtdG9nZ2xlJylcclxuY29uc3QgbWVudUl0ZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1haW4taGVhZGVyX19uYXYtaXRlbXMnKVxyXG5cclxuLy8gbWVudUJ0bnMuZm9yRWFjaCgoYnRuKSA9PiB7XHJcbi8vICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gbWVudUl0ZW1zLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpKVxyXG4vLyB9KVxyXG5cclxubWVudUl0ZW1zLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcclxuICBpZiAoZS50YXJnZXQudGFnTmFtZSA9PT0gJ0EnKSB7XHJcbiAgICBtZW51SXRlbXMuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJylcclxuICB9XHJcbn0pXHJcblxyXG4vLyBXT1dKU1xyXG5uZXcgV09XKCkuaW5pdCgpO1xyXG5cclxuLy8gT1VSIENMSUVOVFMgU0hPVyBJTkZPXHJcbmNvbnN0IGFib3V0VXNUZWFtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFib3V0LXVzX190ZWFtJylcclxuXHJcbmZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgZG9jdW1lbnQub25zY3JvbGwgPSBudWxsXHJcblxyXG4gIGNvbnN0IGNsaWVudHMgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmFib3V0LXVzX190ZWFtLXBlcnNvbicpXVxyXG5cclxuICBsZXQgY3VycmVudENsaWVudCA9IDBcclxuXHJcbiAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgaWYgKGN1cnJlbnRDbGllbnQgPT09IGNsaWVudHMubGVuZ3RoKSB7XHJcbiAgICAgIGNsaWVudHNbY3VycmVudENsaWVudCAtIDFdLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpXHJcbiAgICAgIGN1cnJlbnRDbGllbnQgPSAwXHJcbiAgICB9XHJcbiAgICBpZiAoY3VycmVudENsaWVudCAhPT0gMCkgY2xpZW50c1tjdXJyZW50Q2xpZW50IC0gMV0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJylcclxuICAgIGNsaWVudHNbY3VycmVudENsaWVudF0uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJylcclxuICAgIGN1cnJlbnRDbGllbnQgKz0gMVxyXG4gIH0sIDIwMDApXHJcbn1cclxuXHJcbmRvY3VtZW50Lm9uc2Nyb2xsID0gKCkgPT4ge1xyXG4gIGlmIChhYm91dFVzVGVhbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgLSB3aW5kb3cub3V0ZXJIZWlnaHQgPD0gMCkgaW5pdCgpXHJcbn1cclxuIl19
