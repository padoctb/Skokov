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

// MOBILE MENU
var menuBtns = document.querySelectorAll('.main-header__menu-toggle');
var menuItems = document.querySelector('.main-header__nav-items');
menuBtns.forEach(function (btn) {
  btn.addEventListener('click', function () {
    return menuItems.classList.toggle('active');
  });
});
menuItems.addEventListener('click', function (e) {
  if (e.target.tagName === 'A') {
    menuItems.classList.remove('active');
  }
}); // WOWJS

new _wowjs.WOW().init();

},{"wowjs":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvd293anMvZGlzdC93b3cuanMiLCJzcmMvanMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDamdCQTs7QUFFQTtBQUNBLElBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQiwyQkFBMUIsQ0FBakI7QUFDQSxJQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1Qix5QkFBdkIsQ0FBbEI7QUFFQSxRQUFRLENBQUMsT0FBVCxDQUFpQixVQUFDLEdBQUQsRUFBUztBQUN4QixFQUFBLEdBQUcsQ0FBQyxnQkFBSixDQUFxQixPQUFyQixFQUE4QjtBQUFBLFdBQU0sU0FBUyxDQUFDLFNBQVYsQ0FBb0IsTUFBcEIsQ0FBMkIsUUFBM0IsQ0FBTjtBQUFBLEdBQTlCO0FBQ0QsQ0FGRDtBQUlBLFNBQVMsQ0FBQyxnQkFBVixDQUEyQixPQUEzQixFQUFvQyxVQUFDLENBQUQsRUFBTztBQUN6QyxNQUFJLENBQUMsQ0FBQyxNQUFGLENBQVMsT0FBVCxLQUFxQixHQUF6QixFQUE4QjtBQUM1QixJQUFBLFNBQVMsQ0FBQyxTQUFWLENBQW9CLE1BQXBCLENBQTJCLFFBQTNCO0FBQ0Q7QUFDRixDQUpELEUsQ0FNQTs7QUFDQSxJQUFJLFVBQUosR0FBVSxJQUFWIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgTXV0YXRpb25PYnNlcnZlciwgVXRpbCwgV2Vha01hcCwgZ2V0Q29tcHV0ZWRTdHlsZSwgZ2V0Q29tcHV0ZWRTdHlsZVJYLFxuICAgIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9LFxuICAgIGluZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuICBVdGlsID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIFV0aWwoKSB7fVxuXG4gICAgVXRpbC5wcm90b3R5cGUuZXh0ZW5kID0gZnVuY3Rpb24oY3VzdG9tLCBkZWZhdWx0cykge1xuICAgICAgdmFyIGtleSwgdmFsdWU7XG4gICAgICBmb3IgKGtleSBpbiBkZWZhdWx0cykge1xuICAgICAgICB2YWx1ZSA9IGRlZmF1bHRzW2tleV07XG4gICAgICAgIGlmIChjdXN0b21ba2V5XSA9PSBudWxsKSB7XG4gICAgICAgICAgY3VzdG9tW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGN1c3RvbTtcbiAgICB9O1xuXG4gICAgVXRpbC5wcm90b3R5cGUuaXNNb2JpbGUgPSBmdW5jdGlvbihhZ2VudCkge1xuICAgICAgcmV0dXJuIC9BbmRyb2lkfHdlYk9TfGlQaG9uZXxpUGFkfGlQb2R8QmxhY2tCZXJyeXxJRU1vYmlsZXxPcGVyYSBNaW5pL2kudGVzdChhZ2VudCk7XG4gICAgfTtcblxuICAgIFV0aWwucHJvdG90eXBlLmNyZWF0ZUV2ZW50ID0gZnVuY3Rpb24oZXZlbnQsIGJ1YmJsZSwgY2FuY2VsLCBkZXRhaWwpIHtcbiAgICAgIHZhciBjdXN0b21FdmVudDtcbiAgICAgIGlmIChidWJibGUgPT0gbnVsbCkge1xuICAgICAgICBidWJibGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChjYW5jZWwgPT0gbnVsbCkge1xuICAgICAgICBjYW5jZWwgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChkZXRhaWwgPT0gbnVsbCkge1xuICAgICAgICBkZXRhaWwgPSBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50ICE9IG51bGwpIHtcbiAgICAgICAgY3VzdG9tRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgICAgICAgY3VzdG9tRXZlbnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50LCBidWJibGUsIGNhbmNlbCwgZGV0YWlsKTtcbiAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QgIT0gbnVsbCkge1xuICAgICAgICBjdXN0b21FdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gICAgICAgIGN1c3RvbUV2ZW50LmV2ZW50VHlwZSA9IGV2ZW50O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VzdG9tRXZlbnQuZXZlbnROYW1lID0gZXZlbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gY3VzdG9tRXZlbnQ7XG4gICAgfTtcblxuICAgIFV0aWwucHJvdG90eXBlLmVtaXRFdmVudCA9IGZ1bmN0aW9uKGVsZW0sIGV2ZW50KSB7XG4gICAgICBpZiAoZWxlbS5kaXNwYXRjaEV2ZW50ICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0uZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICB9IGVsc2UgaWYgKGV2ZW50IGluIChlbGVtICE9IG51bGwpKSB7XG4gICAgICAgIHJldHVybiBlbGVtW2V2ZW50XSgpO1xuICAgICAgfSBlbHNlIGlmICgoXCJvblwiICsgZXZlbnQpIGluIChlbGVtICE9IG51bGwpKSB7XG4gICAgICAgIHJldHVybiBlbGVtW1wib25cIiArIGV2ZW50XSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBVdGlsLnByb3RvdHlwZS5hZGRFdmVudCA9IGZ1bmN0aW9uKGVsZW0sIGV2ZW50LCBmbikge1xuICAgICAgaWYgKGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBlbGVtLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGZuLCBmYWxzZSk7XG4gICAgICB9IGVsc2UgaWYgKGVsZW0uYXR0YWNoRXZlbnQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZWxlbS5hdHRhY2hFdmVudChcIm9uXCIgKyBldmVudCwgZm4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGVsZW1bZXZlbnRdID0gZm47XG4gICAgICB9XG4gICAgfTtcblxuICAgIFV0aWwucHJvdG90eXBlLnJlbW92ZUV2ZW50ID0gZnVuY3Rpb24oZWxlbSwgZXZlbnQsIGZuKSB7XG4gICAgICBpZiAoZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgZm4sIGZhbHNlKTtcbiAgICAgIH0gZWxzZSBpZiAoZWxlbS5kZXRhY2hFdmVudCAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBlbGVtLmRldGFjaEV2ZW50KFwib25cIiArIGV2ZW50LCBmbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZGVsZXRlIGVsZW1bZXZlbnRdO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBVdGlsLnByb3RvdHlwZS5pbm5lckhlaWdodCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCdpbm5lckhlaWdodCcgaW4gd2luZG93KSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIFV0aWw7XG5cbiAgfSkoKTtcblxuICBXZWFrTWFwID0gdGhpcy5XZWFrTWFwIHx8IHRoaXMuTW96V2Vha01hcCB8fCAoV2Vha01hcCA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBXZWFrTWFwKCkge1xuICAgICAgdGhpcy5rZXlzID0gW107XG4gICAgICB0aGlzLnZhbHVlcyA9IFtdO1xuICAgIH1cblxuICAgIFdlYWtNYXAucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgdmFyIGksIGl0ZW0sIGosIGxlbiwgcmVmO1xuICAgICAgcmVmID0gdGhpcy5rZXlzO1xuICAgICAgZm9yIChpID0gaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGkgPSArK2opIHtcbiAgICAgICAgaXRlbSA9IHJlZltpXTtcbiAgICAgICAgaWYgKGl0ZW0gPT09IGtleSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlc1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBXZWFrTWFwLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICB2YXIgaSwgaXRlbSwgaiwgbGVuLCByZWY7XG4gICAgICByZWYgPSB0aGlzLmtleXM7XG4gICAgICBmb3IgKGkgPSBqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaSA9ICsraikge1xuICAgICAgICBpdGVtID0gcmVmW2ldO1xuICAgICAgICBpZiAoaXRlbSA9PT0ga2V5KSB7XG4gICAgICAgICAgdGhpcy52YWx1ZXNbaV0gPSB2YWx1ZTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMua2V5cy5wdXNoKGtleSk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBXZWFrTWFwO1xuXG4gIH0pKCkpO1xuXG4gIE11dGF0aW9uT2JzZXJ2ZXIgPSB0aGlzLk11dGF0aW9uT2JzZXJ2ZXIgfHwgdGhpcy5XZWJraXRNdXRhdGlvbk9ic2VydmVyIHx8IHRoaXMuTW96TXV0YXRpb25PYnNlcnZlciB8fCAoTXV0YXRpb25PYnNlcnZlciA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBNdXRhdGlvbk9ic2VydmVyKCkge1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmIGNvbnNvbGUgIT09IG51bGwpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdNdXRhdGlvbk9ic2VydmVyIGlzIG5vdCBzdXBwb3J0ZWQgYnkgeW91ciBicm93c2VyLicpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmIGNvbnNvbGUgIT09IG51bGwpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdXT1cuanMgY2Fubm90IGRldGVjdCBkb20gbXV0YXRpb25zLCBwbGVhc2UgY2FsbCAuc3luYygpIGFmdGVyIGxvYWRpbmcgbmV3IGNvbnRlbnQuJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgTXV0YXRpb25PYnNlcnZlci5ub3RTdXBwb3J0ZWQgPSB0cnVlO1xuXG4gICAgTXV0YXRpb25PYnNlcnZlci5wcm90b3R5cGUub2JzZXJ2ZSA9IGZ1bmN0aW9uKCkge307XG5cbiAgICByZXR1cm4gTXV0YXRpb25PYnNlcnZlcjtcblxuICB9KSgpKTtcblxuICBnZXRDb21wdXRlZFN0eWxlID0gdGhpcy5nZXRDb21wdXRlZFN0eWxlIHx8IGZ1bmN0aW9uKGVsLCBwc2V1ZG8pIHtcbiAgICB0aGlzLmdldFByb3BlcnR5VmFsdWUgPSBmdW5jdGlvbihwcm9wKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKHByb3AgPT09ICdmbG9hdCcpIHtcbiAgICAgICAgcHJvcCA9ICdzdHlsZUZsb2F0JztcbiAgICAgIH1cbiAgICAgIGlmIChnZXRDb21wdXRlZFN0eWxlUlgudGVzdChwcm9wKSkge1xuICAgICAgICBwcm9wLnJlcGxhY2UoZ2V0Q29tcHV0ZWRTdHlsZVJYLCBmdW5jdGlvbihfLCBfY2hhcikge1xuICAgICAgICAgIHJldHVybiBfY2hhci50b1VwcGVyQ2FzZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAoKHJlZiA9IGVsLmN1cnJlbnRTdHlsZSkgIT0gbnVsbCA/IHJlZltwcm9wXSA6IHZvaWQgMCkgfHwgbnVsbDtcbiAgICB9O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGdldENvbXB1dGVkU3R5bGVSWCA9IC8oXFwtKFthLXpdKXsxfSkvZztcblxuICB0aGlzLldPVyA9IChmdW5jdGlvbigpIHtcbiAgICBXT1cucHJvdG90eXBlLmRlZmF1bHRzID0ge1xuICAgICAgYm94Q2xhc3M6ICd3b3cnLFxuICAgICAgYW5pbWF0ZUNsYXNzOiAnYW5pbWF0ZWQnLFxuICAgICAgb2Zmc2V0OiAwLFxuICAgICAgbW9iaWxlOiB0cnVlLFxuICAgICAgbGl2ZTogdHJ1ZSxcbiAgICAgIGNhbGxiYWNrOiBudWxsLFxuICAgICAgc2Nyb2xsQ29udGFpbmVyOiBudWxsXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIFdPVyhvcHRpb25zKSB7XG4gICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2Nyb2xsQ2FsbGJhY2sgPSBiaW5kKHRoaXMuc2Nyb2xsQ2FsbGJhY2ssIHRoaXMpO1xuICAgICAgdGhpcy5zY3JvbGxIYW5kbGVyID0gYmluZCh0aGlzLnNjcm9sbEhhbmRsZXIsIHRoaXMpO1xuICAgICAgdGhpcy5yZXNldEFuaW1hdGlvbiA9IGJpbmQodGhpcy5yZXNldEFuaW1hdGlvbiwgdGhpcyk7XG4gICAgICB0aGlzLnN0YXJ0ID0gYmluZCh0aGlzLnN0YXJ0LCB0aGlzKTtcbiAgICAgIHRoaXMuc2Nyb2xsZWQgPSB0cnVlO1xuICAgICAgdGhpcy5jb25maWcgPSB0aGlzLnV0aWwoKS5leHRlbmQob3B0aW9ucywgdGhpcy5kZWZhdWx0cyk7XG4gICAgICBpZiAob3B0aW9ucy5zY3JvbGxDb250YWluZXIgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmNvbmZpZy5zY3JvbGxDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG9wdGlvbnMuc2Nyb2xsQ29udGFpbmVyKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYW5pbWF0aW9uTmFtZUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbiAgICAgIHRoaXMud293RXZlbnQgPSB0aGlzLnV0aWwoKS5jcmVhdGVFdmVudCh0aGlzLmNvbmZpZy5ib3hDbGFzcyk7XG4gICAgfVxuXG4gICAgV09XLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgdGhpcy5lbGVtZW50ID0gd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgIGlmICgocmVmID0gZG9jdW1lbnQucmVhZHlTdGF0ZSkgPT09IFwiaW50ZXJhY3RpdmVcIiB8fCByZWYgPT09IFwiY29tcGxldGVcIikge1xuICAgICAgICB0aGlzLnN0YXJ0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnV0aWwoKS5hZGRFdmVudChkb2N1bWVudCwgJ0RPTUNvbnRlbnRMb2FkZWQnLCB0aGlzLnN0YXJ0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaGVkID0gW107XG4gICAgfTtcblxuICAgIFdPVy5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBib3gsIGosIGxlbiwgcmVmO1xuICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG4gICAgICB0aGlzLmJveGVzID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaiwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgICAgIHJlZiA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLlwiICsgdGhpcy5jb25maWcuYm94Q2xhc3MpO1xuICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICAgIGJveCA9IHJlZltqXTtcbiAgICAgICAgICByZXN1bHRzLnB1c2goYm94KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH0pLmNhbGwodGhpcyk7XG4gICAgICB0aGlzLmFsbCA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGosIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgICAgICByZWYgPSB0aGlzLmJveGVzO1xuICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICAgIGJveCA9IHJlZltqXTtcbiAgICAgICAgICByZXN1bHRzLnB1c2goYm94KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH0pLmNhbGwodGhpcyk7XG4gICAgICBpZiAodGhpcy5ib3hlcy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQoKSkge1xuICAgICAgICAgIHRoaXMucmVzZXRTdHlsZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlZiA9IHRoaXMuYm94ZXM7XG4gICAgICAgICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBib3ggPSByZWZbal07XG4gICAgICAgICAgICB0aGlzLmFwcGx5U3R5bGUoYm94LCB0cnVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5kaXNhYmxlZCgpKSB7XG4gICAgICAgIHRoaXMudXRpbCgpLmFkZEV2ZW50KHRoaXMuY29uZmlnLnNjcm9sbENvbnRhaW5lciB8fCB3aW5kb3csICdzY3JvbGwnLCB0aGlzLnNjcm9sbEhhbmRsZXIpO1xuICAgICAgICB0aGlzLnV0aWwoKS5hZGRFdmVudCh3aW5kb3csICdyZXNpemUnLCB0aGlzLnNjcm9sbEhhbmRsZXIpO1xuICAgICAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwodGhpcy5zY3JvbGxDYWxsYmFjaywgNTApO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuY29uZmlnLmxpdmUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBNdXRhdGlvbk9ic2VydmVyKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbihyZWNvcmRzKSB7XG4gICAgICAgICAgICB2YXIgaywgbGVuMSwgbm9kZSwgcmVjb3JkLCByZXN1bHRzO1xuICAgICAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgZm9yIChrID0gMCwgbGVuMSA9IHJlY29yZHMubGVuZ3RoOyBrIDwgbGVuMTsgaysrKSB7XG4gICAgICAgICAgICAgIHJlY29yZCA9IHJlY29yZHNba107XG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaCgoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGwsIGxlbjIsIHJlZjEsIHJlc3VsdHMxO1xuICAgICAgICAgICAgICAgIHJlZjEgPSByZWNvcmQuYWRkZWROb2RlcyB8fCBbXTtcbiAgICAgICAgICAgICAgICByZXN1bHRzMSA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobCA9IDAsIGxlbjIgPSByZWYxLmxlbmd0aDsgbCA8IGxlbjI7IGwrKykge1xuICAgICAgICAgICAgICAgICAgbm9kZSA9IHJlZjFbbF07XG4gICAgICAgICAgICAgICAgICByZXN1bHRzMS5wdXNoKHRoaXMuZG9TeW5jKG5vZGUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHMxO1xuICAgICAgICAgICAgICB9KS5jYWxsKF90aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICB9O1xuICAgICAgICB9KSh0aGlzKSkub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgIHN1YnRyZWU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIFdPVy5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMudXRpbCgpLnJlbW92ZUV2ZW50KHRoaXMuY29uZmlnLnNjcm9sbENvbnRhaW5lciB8fCB3aW5kb3csICdzY3JvbGwnLCB0aGlzLnNjcm9sbEhhbmRsZXIpO1xuICAgICAgdGhpcy51dGlsKCkucmVtb3ZlRXZlbnQod2luZG93LCAncmVzaXplJywgdGhpcy5zY3JvbGxIYW5kbGVyKTtcbiAgICAgIGlmICh0aGlzLmludGVydmFsICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIFdPVy5wcm90b3R5cGUuc3luYyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIGlmIChNdXRhdGlvbk9ic2VydmVyLm5vdFN1cHBvcnRlZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kb1N5bmModGhpcy5lbGVtZW50KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgV09XLnByb3RvdHlwZS5kb1N5bmMgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgYm94LCBqLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICAgIGlmIChlbGVtZW50ID09IG51bGwpIHtcbiAgICAgICAgZWxlbWVudCA9IHRoaXMuZWxlbWVudDtcbiAgICAgIH1cbiAgICAgIGlmIChlbGVtZW50Lm5vZGVUeXBlICE9PSAxKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGUgfHwgZWxlbWVudDtcbiAgICAgIHJlZiA9IGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5cIiArIHRoaXMuY29uZmlnLmJveENsYXNzKTtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICBib3ggPSByZWZbal07XG4gICAgICAgIGlmIChpbmRleE9mLmNhbGwodGhpcy5hbGwsIGJveCkgPCAwKSB7XG4gICAgICAgICAgdGhpcy5ib3hlcy5wdXNoKGJveCk7XG4gICAgICAgICAgdGhpcy5hbGwucHVzaChib3gpO1xuICAgICAgICAgIGlmICh0aGlzLnN0b3BwZWQgfHwgdGhpcy5kaXNhYmxlZCgpKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0U3R5bGUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hcHBseVN0eWxlKGJveCwgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnNjcm9sbGVkID0gdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG5cbiAgICBXT1cucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbihib3gpIHtcbiAgICAgIHRoaXMuYXBwbHlTdHlsZShib3gpO1xuICAgICAgYm94LmNsYXNzTmFtZSA9IGJveC5jbGFzc05hbWUgKyBcIiBcIiArIHRoaXMuY29uZmlnLmFuaW1hdGVDbGFzcztcbiAgICAgIGlmICh0aGlzLmNvbmZpZy5jYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuY29uZmlnLmNhbGxiYWNrKGJveCk7XG4gICAgICB9XG4gICAgICB0aGlzLnV0aWwoKS5lbWl0RXZlbnQoYm94LCB0aGlzLndvd0V2ZW50KTtcbiAgICAgIHRoaXMudXRpbCgpLmFkZEV2ZW50KGJveCwgJ2FuaW1hdGlvbmVuZCcsIHRoaXMucmVzZXRBbmltYXRpb24pO1xuICAgICAgdGhpcy51dGlsKCkuYWRkRXZlbnQoYm94LCAnb2FuaW1hdGlvbmVuZCcsIHRoaXMucmVzZXRBbmltYXRpb24pO1xuICAgICAgdGhpcy51dGlsKCkuYWRkRXZlbnQoYm94LCAnd2Via2l0QW5pbWF0aW9uRW5kJywgdGhpcy5yZXNldEFuaW1hdGlvbik7XG4gICAgICB0aGlzLnV0aWwoKS5hZGRFdmVudChib3gsICdNU0FuaW1hdGlvbkVuZCcsIHRoaXMucmVzZXRBbmltYXRpb24pO1xuICAgICAgcmV0dXJuIGJveDtcbiAgICB9O1xuXG4gICAgV09XLnByb3RvdHlwZS5hcHBseVN0eWxlID0gZnVuY3Rpb24oYm94LCBoaWRkZW4pIHtcbiAgICAgIHZhciBkZWxheSwgZHVyYXRpb24sIGl0ZXJhdGlvbjtcbiAgICAgIGR1cmF0aW9uID0gYm94LmdldEF0dHJpYnV0ZSgnZGF0YS13b3ctZHVyYXRpb24nKTtcbiAgICAgIGRlbGF5ID0gYm94LmdldEF0dHJpYnV0ZSgnZGF0YS13b3ctZGVsYXknKTtcbiAgICAgIGl0ZXJhdGlvbiA9IGJveC5nZXRBdHRyaWJ1dGUoJ2RhdGEtd293LWl0ZXJhdGlvbicpO1xuICAgICAgcmV0dXJuIHRoaXMuYW5pbWF0ZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5jdXN0b21TdHlsZShib3gsIGhpZGRlbiwgZHVyYXRpb24sIGRlbGF5LCBpdGVyYXRpb24pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH07XG5cbiAgICBXT1cucHJvdG90eXBlLmFuaW1hdGUgPSAoZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoJ3JlcXVlc3RBbmltYXRpb25GcmFtZScgaW4gd2luZG93KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pKCk7XG5cbiAgICBXT1cucHJvdG90eXBlLnJlc2V0U3R5bGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBib3gsIGosIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgICAgcmVmID0gdGhpcy5ib3hlcztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICBib3ggPSByZWZbal07XG4gICAgICAgIHJlc3VsdHMucHVzaChib3guc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuXG4gICAgV09XLnByb3RvdHlwZS5yZXNldEFuaW1hdGlvbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgdGFyZ2V0O1xuICAgICAgaWYgKGV2ZW50LnR5cGUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdhbmltYXRpb25lbmQnKSA+PSAwKSB7XG4gICAgICAgIHRhcmdldCA9IGV2ZW50LnRhcmdldCB8fCBldmVudC5zcmNFbGVtZW50O1xuICAgICAgICByZXR1cm4gdGFyZ2V0LmNsYXNzTmFtZSA9IHRhcmdldC5jbGFzc05hbWUucmVwbGFjZSh0aGlzLmNvbmZpZy5hbmltYXRlQ2xhc3MsICcnKS50cmltKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIFdPVy5wcm90b3R5cGUuY3VzdG9tU3R5bGUgPSBmdW5jdGlvbihib3gsIGhpZGRlbiwgZHVyYXRpb24sIGRlbGF5LCBpdGVyYXRpb24pIHtcbiAgICAgIGlmIChoaWRkZW4pIHtcbiAgICAgICAgdGhpcy5jYWNoZUFuaW1hdGlvbk5hbWUoYm94KTtcbiAgICAgIH1cbiAgICAgIGJveC5zdHlsZS52aXNpYmlsaXR5ID0gaGlkZGVuID8gJ2hpZGRlbicgOiAndmlzaWJsZSc7XG4gICAgICBpZiAoZHVyYXRpb24pIHtcbiAgICAgICAgdGhpcy52ZW5kb3JTZXQoYm94LnN0eWxlLCB7XG4gICAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246IGR1cmF0aW9uXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGRlbGF5KSB7XG4gICAgICAgIHRoaXMudmVuZG9yU2V0KGJveC5zdHlsZSwge1xuICAgICAgICAgIGFuaW1hdGlvbkRlbGF5OiBkZWxheVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVyYXRpb24pIHtcbiAgICAgICAgdGhpcy52ZW5kb3JTZXQoYm94LnN0eWxlLCB7XG4gICAgICAgICAgYW5pbWF0aW9uSXRlcmF0aW9uQ291bnQ6IGl0ZXJhdGlvblxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMudmVuZG9yU2V0KGJveC5zdHlsZSwge1xuICAgICAgICBhbmltYXRpb25OYW1lOiBoaWRkZW4gPyAnbm9uZScgOiB0aGlzLmNhY2hlZEFuaW1hdGlvbk5hbWUoYm94KVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gYm94O1xuICAgIH07XG5cbiAgICBXT1cucHJvdG90eXBlLnZlbmRvcnMgPSBbXCJtb3pcIiwgXCJ3ZWJraXRcIl07XG5cbiAgICBXT1cucHJvdG90eXBlLnZlbmRvclNldCA9IGZ1bmN0aW9uKGVsZW0sIHByb3BlcnRpZXMpIHtcbiAgICAgIHZhciBuYW1lLCByZXN1bHRzLCB2YWx1ZSwgdmVuZG9yO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChuYW1lIGluIHByb3BlcnRpZXMpIHtcbiAgICAgICAgdmFsdWUgPSBwcm9wZXJ0aWVzW25hbWVdO1xuICAgICAgICBlbGVtW1wiXCIgKyBuYW1lXSA9IHZhbHVlO1xuICAgICAgICByZXN1bHRzLnB1c2goKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBqLCBsZW4sIHJlZiwgcmVzdWx0czE7XG4gICAgICAgICAgcmVmID0gdGhpcy52ZW5kb3JzO1xuICAgICAgICAgIHJlc3VsdHMxID0gW107XG4gICAgICAgICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICB2ZW5kb3IgPSByZWZbal07XG4gICAgICAgICAgICByZXN1bHRzMS5wdXNoKGVsZW1bXCJcIiArIHZlbmRvciArIChuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpKSArIChuYW1lLnN1YnN0cigxKSldID0gdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0czE7XG4gICAgICAgIH0pLmNhbGwodGhpcykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcblxuICAgIFdPVy5wcm90b3R5cGUudmVuZG9yQ1NTID0gZnVuY3Rpb24oZWxlbSwgcHJvcGVydHkpIHtcbiAgICAgIHZhciBqLCBsZW4sIHJlZiwgcmVzdWx0LCBzdHlsZSwgdmVuZG9yO1xuICAgICAgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW0pO1xuICAgICAgcmVzdWx0ID0gc3R5bGUuZ2V0UHJvcGVydHlDU1NWYWx1ZShwcm9wZXJ0eSk7XG4gICAgICByZWYgPSB0aGlzLnZlbmRvcnM7XG4gICAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgdmVuZG9yID0gcmVmW2pdO1xuICAgICAgICByZXN1bHQgPSByZXN1bHQgfHwgc3R5bGUuZ2V0UHJvcGVydHlDU1NWYWx1ZShcIi1cIiArIHZlbmRvciArIFwiLVwiICsgcHJvcGVydHkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgV09XLnByb3RvdHlwZS5hbmltYXRpb25OYW1lID0gZnVuY3Rpb24oYm94KSB7XG4gICAgICB2YXIgYW5pbWF0aW9uTmFtZSwgZXJyb3I7XG4gICAgICB0cnkge1xuICAgICAgICBhbmltYXRpb25OYW1lID0gdGhpcy52ZW5kb3JDU1MoYm94LCAnYW5pbWF0aW9uLW5hbWUnKS5jc3NUZXh0O1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgYW5pbWF0aW9uTmFtZSA9IGdldENvbXB1dGVkU3R5bGUoYm94KS5nZXRQcm9wZXJ0eVZhbHVlKCdhbmltYXRpb24tbmFtZScpO1xuICAgICAgfVxuICAgICAgaWYgKGFuaW1hdGlvbk5hbWUgPT09ICdub25lJykge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYW5pbWF0aW9uTmFtZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgV09XLnByb3RvdHlwZS5jYWNoZUFuaW1hdGlvbk5hbWUgPSBmdW5jdGlvbihib3gpIHtcbiAgICAgIHJldHVybiB0aGlzLmFuaW1hdGlvbk5hbWVDYWNoZS5zZXQoYm94LCB0aGlzLmFuaW1hdGlvbk5hbWUoYm94KSk7XG4gICAgfTtcblxuICAgIFdPVy5wcm90b3R5cGUuY2FjaGVkQW5pbWF0aW9uTmFtZSA9IGZ1bmN0aW9uKGJveCkge1xuICAgICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9uTmFtZUNhY2hlLmdldChib3gpO1xuICAgIH07XG5cbiAgICBXT1cucHJvdG90eXBlLnNjcm9sbEhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnNjcm9sbGVkID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgV09XLnByb3RvdHlwZS5zY3JvbGxDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGJveDtcbiAgICAgIGlmICh0aGlzLnNjcm9sbGVkKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ib3hlcyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgaiwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgICAgICAgcmVmID0gdGhpcy5ib3hlcztcbiAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBib3ggPSByZWZbal07XG4gICAgICAgICAgICBpZiAoIShib3gpKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuaXNWaXNpYmxlKGJveCkpIHtcbiAgICAgICAgICAgICAgdGhpcy5zaG93KGJveCk7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGJveCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9KS5jYWxsKHRoaXMpO1xuICAgICAgICBpZiAoISh0aGlzLmJveGVzLmxlbmd0aCB8fCB0aGlzLmNvbmZpZy5saXZlKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBXT1cucHJvdG90eXBlLm9mZnNldFRvcCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHZhciB0b3A7XG4gICAgICB3aGlsZSAoZWxlbWVudC5vZmZzZXRUb3AgPT09IHZvaWQgMCkge1xuICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgICAgdG9wID0gZWxlbWVudC5vZmZzZXRUb3A7XG4gICAgICB3aGlsZSAoZWxlbWVudCA9IGVsZW1lbnQub2Zmc2V0UGFyZW50KSB7XG4gICAgICAgIHRvcCArPSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0b3A7XG4gICAgfTtcblxuICAgIFdPVy5wcm90b3R5cGUuaXNWaXNpYmxlID0gZnVuY3Rpb24oYm94KSB7XG4gICAgICB2YXIgYm90dG9tLCBvZmZzZXQsIHRvcCwgdmlld0JvdHRvbSwgdmlld1RvcDtcbiAgICAgIG9mZnNldCA9IGJveC5nZXRBdHRyaWJ1dGUoJ2RhdGEtd293LW9mZnNldCcpIHx8IHRoaXMuY29uZmlnLm9mZnNldDtcbiAgICAgIHZpZXdUb3AgPSAodGhpcy5jb25maWcuc2Nyb2xsQ29udGFpbmVyICYmIHRoaXMuY29uZmlnLnNjcm9sbENvbnRhaW5lci5zY3JvbGxUb3ApIHx8IHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgICAgIHZpZXdCb3R0b20gPSB2aWV3VG9wICsgTWF0aC5taW4odGhpcy5lbGVtZW50LmNsaWVudEhlaWdodCwgdGhpcy51dGlsKCkuaW5uZXJIZWlnaHQoKSkgLSBvZmZzZXQ7XG4gICAgICB0b3AgPSB0aGlzLm9mZnNldFRvcChib3gpO1xuICAgICAgYm90dG9tID0gdG9wICsgYm94LmNsaWVudEhlaWdodDtcbiAgICAgIHJldHVybiB0b3AgPD0gdmlld0JvdHRvbSAmJiBib3R0b20gPj0gdmlld1RvcDtcbiAgICB9O1xuXG4gICAgV09XLnByb3RvdHlwZS51dGlsID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdXRpbCAhPSBudWxsID8gdGhpcy5fdXRpbCA6IHRoaXMuX3V0aWwgPSBuZXcgVXRpbCgpO1xuICAgIH07XG5cbiAgICBXT1cucHJvdG90eXBlLmRpc2FibGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gIXRoaXMuY29uZmlnLm1vYmlsZSAmJiB0aGlzLnV0aWwoKS5pc01vYmlsZShuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFdPVztcblxuICB9KSgpO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiaW1wb3J0IHsgV09XIH0gZnJvbSAnd293anMnXHJcblxyXG4vLyBNT0JJTEUgTUVOVVxyXG5jb25zdCBtZW51QnRucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tYWluLWhlYWRlcl9fbWVudS10b2dnbGUnKVxyXG5jb25zdCBtZW51SXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpbi1oZWFkZXJfX25hdi1pdGVtcycpXHJcblxyXG5tZW51QnRucy5mb3JFYWNoKChidG4pID0+IHtcclxuICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBtZW51SXRlbXMuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJykpXHJcbn0pXHJcblxyXG5tZW51SXRlbXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xyXG4gIGlmIChlLnRhcmdldC50YWdOYW1lID09PSAnQScpIHtcclxuICAgIG1lbnVJdGVtcy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKVxyXG4gIH1cclxufSlcclxuXHJcbi8vIFdPV0pTXHJcbm5ldyBXT1coKS5pbml0KCk7XHJcbiJdfQ==
