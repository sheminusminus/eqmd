// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({19:[function(require,module,exports) {
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * what-input - A global utility for tracking the current input method (mouse, keyboard or touch).
 * @version v4.2.0
 * @link https://github.com/ten1seven/what-input
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && (typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object') module.exports = factory();else if (typeof define === 'function' && define.amd) define("whatInput", [], factory);else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') exports["whatInput"] = factory();else root["whatInput"] = factory();
})(this, function () {
	return (/******/function (modules) {
			// webpackBootstrap
			/******/ // The module cache
			/******/var installedModules = {};

			/******/ // The require function
			/******/function __webpack_require__(moduleId) {

				/******/ // Check if module is in cache
				/******/if (installedModules[moduleId])
					/******/return installedModules[moduleId].exports;

				/******/ // Create a new module (and put it into the cache)
				/******/var module = installedModules[moduleId] = {
					/******/exports: {},
					/******/id: moduleId,
					/******/loaded: false
					/******/ };

				/******/ // Execute the module function
				/******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

				/******/ // Flag the module as loaded
				/******/module.loaded = true;

				/******/ // Return the exports of the module
				/******/return module.exports;
				/******/
			}

			/******/ // expose the modules object (__webpack_modules__)
			/******/__webpack_require__.m = modules;

			/******/ // expose the module cache
			/******/__webpack_require__.c = installedModules;

			/******/ // __webpack_public_path__
			/******/__webpack_require__.p = "";

			/******/ // Load entry module and return exports
			/******/return __webpack_require__(0);
			/******/
		}(
		/************************************************************************/
		/******/[
		/* 0 */
		/***/function (module, exports) {

			'use strict';

			module.exports = function () {
				/*
     * variables
     */

				// last used input type
				var currentInput = 'initial';

				// last used input intent
				var currentIntent = null;

				// cache document.documentElement
				var doc = document.documentElement;

				// form input types
				var formInputs = ['input', 'select', 'textarea'];

				var functionList = [];

				// list of modifier keys commonly used with the mouse and
				// can be safely ignored to prevent false keyboard detection
				var ignoreMap = [16, // shift
				17, // control
				18, // alt
				91, // Windows key / left Apple cmd
				93 // Windows menu / right Apple cmd
				];

				// list of keys for which we change intent even for form inputs
				var changeIntentMap = [9 // tab
				];

				// mapping of events to input types
				var inputMap = {
					keydown: 'keyboard',
					mousedown: 'mouse',
					mousemove: 'mouse',
					MSPointerDown: 'pointer',
					MSPointerMove: 'pointer',
					pointerdown: 'pointer',
					pointermove: 'pointer',
					touchstart: 'touch'
				};

				// array of all used input types
				var inputTypes = [];

				// boolean: true if touch buffer is active
				var isBuffering = false;

				// boolean: true if the page is being scrolled
				var isScrolling = false;

				// store current mouse position
				var mousePos = {
					x: null,
					y: null
				};

				// map of IE 10 pointer events
				var pointerMap = {
					2: 'touch',
					3: 'touch', // treat pen like touch
					4: 'mouse'
				};

				var supportsPassive = false;

				try {
					var opts = Object.defineProperty({}, 'passive', {
						get: function get() {
							supportsPassive = true;
						}
					});

					window.addEventListener('test', null, opts);
				} catch (e) {}

				/*
     * set up
     */

				var setUp = function setUp() {
					// add correct mouse wheel event mapping to `inputMap`
					inputMap[detectWheel()] = 'mouse';

					addListeners();
					setInput();
				};

				/*
     * events
     */

				var addListeners = function addListeners() {
					// `pointermove`, `MSPointerMove`, `mousemove` and mouse wheel event binding
					// can only demonstrate potential, but not actual, interaction
					// and are treated separately

					// pointer events (mouse, pen, touch)
					if (window.PointerEvent) {
						doc.addEventListener('pointerdown', updateInput);
						doc.addEventListener('pointermove', setIntent);
					} else if (window.MSPointerEvent) {
						doc.addEventListener('MSPointerDown', updateInput);
						doc.addEventListener('MSPointerMove', setIntent);
					} else {
						// mouse events
						doc.addEventListener('mousedown', updateInput);
						doc.addEventListener('mousemove', setIntent);

						// touch events
						if ('ontouchstart' in window) {
							doc.addEventListener('touchstart', touchBuffer);
							doc.addEventListener('touchend', touchBuffer);
						}
					}

					// mouse wheel
					doc.addEventListener(detectWheel(), setIntent, supportsPassive ? { passive: true } : false);

					// keyboard events
					doc.addEventListener('keydown', updateInput);
				};

				// checks conditions before updating new input
				var updateInput = function updateInput(event) {
					// only execute if the touch buffer timer isn't running
					if (!isBuffering) {
						var eventKey = event.which;
						var value = inputMap[event.type];
						if (value === 'pointer') value = pointerType(event);

						if (currentInput !== value || currentIntent !== value) {
							var activeElem = document.activeElement;
							var activeInput = false;
							var notFormInput = activeElem && activeElem.nodeName && formInputs.indexOf(activeElem.nodeName.toLowerCase()) === -1;

							if (notFormInput || changeIntentMap.indexOf(eventKey) !== -1) {
								activeInput = true;
							}

							if (value === 'touch' ||
							// ignore mouse modifier keys
							value === 'mouse' ||
							// don't switch if the current element is a form input
							value === 'keyboard' && eventKey && activeInput && ignoreMap.indexOf(eventKey) === -1) {
								// set the current and catch-all variable
								currentInput = currentIntent = value;

								setInput();
							}
						}
					}
				};

				// updates the doc and `inputTypes` array with new input
				var setInput = function setInput() {
					doc.setAttribute('data-whatinput', currentInput);
					doc.setAttribute('data-whatintent', currentInput);

					if (inputTypes.indexOf(currentInput) === -1) {
						inputTypes.push(currentInput);
						doc.className += ' whatinput-types-' + currentInput;
					}

					fireFunctions('input');
				};

				// updates input intent for `mousemove` and `pointermove`
				var setIntent = function setIntent(event) {
					// test to see if `mousemove` happened relative to the screen
					// to detect scrolling versus mousemove
					if (mousePos['x'] !== event.screenX || mousePos['y'] !== event.screenY) {
						isScrolling = false;

						mousePos['x'] = event.screenX;
						mousePos['y'] = event.screenY;
					} else {
						isScrolling = true;
					}

					// only execute if the touch buffer timer isn't running
					// or scrolling isn't happening
					if (!isBuffering && !isScrolling) {
						var value = inputMap[event.type];
						if (value === 'pointer') value = pointerType(event);

						if (currentIntent !== value) {
							currentIntent = value;

							doc.setAttribute('data-whatintent', currentIntent);

							fireFunctions('intent');
						}
					}
				};

				// buffers touch events because they frequently also fire mouse events
				var touchBuffer = function touchBuffer(event) {
					if (event.type === 'touchstart') {
						isBuffering = false;

						// set the current input
						updateInput(event);
					} else {
						isBuffering = true;
					}
				};

				var fireFunctions = function fireFunctions(type) {
					for (var i = 0, len = functionList.length; i < len; i++) {
						if (functionList[i].type === type) {
							functionList[i].function.call(undefined, currentIntent);
						}
					}
				};

				/*
     * utilities
     */

				var pointerType = function pointerType(event) {
					if (typeof event.pointerType === 'number') {
						return pointerMap[event.pointerType];
					} else {
						// treat pen like touch
						return event.pointerType === 'pen' ? 'touch' : event.pointerType;
					}
				};

				// detect version of mouse wheel event to use
				// via https://developer.mozilla.org/en-US/docs/Web/Events/wheel
				var detectWheel = function detectWheel() {
					var wheelType = void 0;

					// Modern browsers support "wheel"
					if ('onwheel' in document.createElement('div')) {
						wheelType = 'wheel';
					} else {
						// Webkit and IE support at least "mousewheel"
						// or assume that remaining browsers are older Firefox
						wheelType = document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
					}

					return wheelType;
				};

				/*
     * init
     */

				// don't start script unless browser cuts the mustard
				// (also passes if polyfills are used)
				if ('addEventListener' in window && Array.prototype.indexOf) {
					setUp();
				}

				/*
     * api
     */

				return {
					// returns string: the current input type
					// opt: 'loose'|'strict'
					// 'strict' (default): returns the same value as the `data-whatinput` attribute
					// 'loose': includes `data-whatintent` value if it's more current than `data-whatinput`
					ask: function ask(opt) {
						return opt === 'loose' ? currentIntent : currentInput;
					},

					// returns array: all the detected input types
					types: function types() {
						return inputTypes;
					},

					// overwrites ignored keys with provided array
					ignoreKeys: function ignoreKeys(arr) {
						ignoreMap = arr;
					},

					// attach functions to input and intent "events"
					// funct: function to fire on change
					// eventType: 'input'|'intent'
					onChange: function onChange(funct, eventType) {
						functionList.push({
							function: funct,
							type: eventType
						});
					}
				};
			}();

			/***/
		}]
		/******/)
	);
});
;
},{}],46:[function(require,module,exports) {

var OVERLAY_ID = '__parcel__error__overlay__';

var global = (1, eval)('this');
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '59866' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';

  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},[46,19])
//# sourceMappingURL=/what-input.2e775e4b.map