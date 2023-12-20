/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/_alert.js":
/*!**************************!*\
  !*** ./src/js/_alert.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   alertsShow: () => (/* binding */ alertsShow),
/* harmony export */   alertsShowWaitHide: () => (/* binding */ alertsShowWaitHide)
/* harmony export */ });
/* harmony import */ var _debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_debug */ "./src/js/_debug.js");
/* harmony import */ var _form_lock__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_form-lock */ "./src/js/_form-lock.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_util */ "./src/js/_util.js");




/**
 * Show alerts in a form.
 * 
 * @param {object} form The target form.
 * @param {array} alerts Alert objects to be displayed.
 */
const alertsShow = async (form, alerts) => {
  const output = form.querySelector('.bigup__alert_output');
  if (!output) return;

  // Show.
  if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log(`${(0,_debug__WEBPACK_IMPORTED_MODULE_0__.stopwatch)()} |START| alertsShowWaitHide | ${alerts[0]}`);
  (0,_form_lock__WEBPACK_IMPORTED_MODULE_1__.formLock)(form, true);
  output.style.display = 'flex';
  await transition(output, 'opacity', '0');
  await (0,_util__WEBPACK_IMPORTED_MODULE_2__.removeChildren)(output);
  await popoutsIntoDom(output, alerts);
  await transition(output, 'opacity', '1');
  return 'alert alertsShow complete';
};

/**
 * Show, wait then hide alerts in a form.
 * 
 * @param {object} form The target form.
 * @param {array} alerts Alert objects to be displayed.
 * @param {int} wait Time to wait.
 */
const alertsShowWaitHide = async (form, alerts, wait) => {
  const output = form.querySelector('.bigup__alert_output');
  if (!output) return;

  // Show.
  if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log(`${(0,_debug__WEBPACK_IMPORTED_MODULE_0__.stopwatch)()} |START| alertsShowWaitHide | ${alerts[0]}`);
  (0,_form_lock__WEBPACK_IMPORTED_MODULE_1__.formLock)(form, true);
  output.style.display = 'flex';
  await transition(output, 'opacity', '0');
  await (0,_util__WEBPACK_IMPORTED_MODULE_2__.removeChildren)(output);
  await popoutsIntoDom(output, alerts);
  await transition(output, 'opacity', '1');
  // Wait.
  await pause(wait);
  // Hide.
  await transition(output, 'opacity', '0');
  await (0,_util__WEBPACK_IMPORTED_MODULE_2__.removeChildren)(output);
  output.style.display = 'none';
  (0,_form_lock__WEBPACK_IMPORTED_MODULE_1__.formLock)(form, false);
  if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log(`${(0,_debug__WEBPACK_IMPORTED_MODULE_0__.stopwatch)()} | END | alertsShowWaitHide | ${alerts[0]}`);
  return 'alert alertsShowWaitHide complete';
};

/**
 * Pause with promise.
 * 
 * @param {integer} milliseconds Duration to pause.
 * 
 */
function pause(milliseconds) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('Pause completed successfully.');
    }, milliseconds);
  });
}

/**
 * Check if passed variable is iterable.
 * 
 */
function isIterable(object) {
  // Check for null and undefined.
  if (object === null || object === undefined) {
    return false;
  }
  return typeof object[Symbol.iterator] === 'function';
}

/**
 * Create an array of popout message elements and insert into dom.
 * 
 * @param {object} parentElement The parent node to append to.
 * @param {array}  alerts An array of alerts as objects.
 * 
 */
function popoutsIntoDom(output, alerts) {
  const classBlock = 'bigup__alert',
    classModifier = {
      'danger': '-danger',
      'success': '-success',
      'info': '-info',
      'warning': '-warning'
    };
  if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log(`${(0,_debug__WEBPACK_IMPORTED_MODULE_0__.stopwatch)()} |START| popoutsIntoDom | ${alerts[0]}`);
  return new Promise((resolve, reject) => {
    try {
      if (!output || output.nodeType !== Node.ELEMENT_NODE) {
        throw new TypeError(`output must be an element node.`);
      } else if (!isIterable(alerts)) {
        throw new TypeError(`'alerts' must be non-string iterable. ${typeof alerts} found.`);
      }
      let popouts = [];
      alerts.forEach(alert => {
        let p = document.createElement('p');
        p.innerText = (0,_util__WEBPACK_IMPORTED_MODULE_2__.makeHumanReadable)(alert.text);
        const classNames = [classBlock, classBlock + classModifier[alert.type]];
        classNames.forEach(className => p.classList.add(className));
        output.appendChild(p);
        popouts.push(p);
      });
      resolve(popouts);
    } catch (error) {
      reject(error);
    } finally {
      if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log(`${(0,_debug__WEBPACK_IMPORTED_MODULE_0__.stopwatch)()} | END | popoutsIntoDom | ${alerts[0]}`);
    }
  });
}

/**
 * Transition a single element node with a callback on completion.
 *
 * No animation is performed here, this function expects a transition
 * duration to be set in CSS, otherwise the promise will not resolve as
 * no 'transitionend' event will be fired.
 * 
 * Built in event listener was failing due to browser not initialising the
 * new dom node in time for the new event listener. This problem wouldn't
 * exist if the nodes weren't being created/removed on the fly.
 * 
 * @param {object} node Element bound using bind() by caller.
 * @param {string} property The css property to transition.
 * @param {string} value The css value to transition to.
 * @return {Promise} A promise that resolves when the transition is complete.
 * 
 */
function transitionToResolve(property, value) {
  return new Promise((resolve, reject) => {
    try {
      if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log(`${(0,_debug__WEBPACK_IMPORTED_MODULE_0__.stopwatch)()} |START| transition | ${this.classList} : ${property} : ${value}`);
      this.style[property] = value;

      // Custom event listener to resolve the promise.
      let transitionComplete = setInterval(() => {
        let style = getComputedStyle(this);
        if (style.opacity === value) {
          clearInterval(transitionComplete);
          if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log(`${(0,_debug__WEBPACK_IMPORTED_MODULE_0__.stopwatch)()} | END | transition | ${this.classList} : ${property} : ${value}`);
          resolve('Transition complete.');
        }
      }, 10);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Transition node(s) in parallel with resolved promise on completion.
 * Accepts a single node or an array of nodes to provide a common interface
 * for all element transitions.
 * 
 * Expects a transition duration to be set in CSS.
 * 
 * @param {array}  elements An array of elements.
 * @param {string} property The css property to transition.
 * @param {string} value The css value to transition to.
 * @return {Promise} A promise that resolves when all transitions are complete.
 * 
 */
async function transition(elements, property, value) {
  if (!isIterable(elements)) elements = [elements];
  if (isIterable(elements) && elements.every(element => {
    return element.nodeType === 1;
  })) {
    // we have an array of element nodes.
    const promises = elements.map(node => transitionToResolve.bind(node)(property, value));
    let result = await Promise.all(promises);
    return result;
  } else {
    throw new TypeError('elements must be a non-string iterable. ' + typeof elements + ' found.');
  }
}


/***/ }),

/***/ "./src/js/_debug.js":
/*!**************************!*\
  !*** ./src/js/_debug.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debug: () => (/* binding */ debug),
/* harmony export */   start: () => (/* binding */ start),
/* harmony export */   stopwatch: () => (/* binding */ stopwatch)
/* harmony export */ });
/**
 * Set 'debug = true' and output will be sent to the console.
 */
let debug = false;

/**
 * Holds the start time of the script.
 */
let startTime = '';

/**
 * Set the start time of the script.
 */
const start = () => startTime = Date.now();

/**
 * Get timestamps.
 * 
 * @return milliseconds since function call.
 */
const stopwatch = () => {
  let elapsed = Date.now() - startTime;
  return elapsed.toString().padStart(5, '0');
};


/***/ }),

/***/ "./src/js/_fetch.js":
/*!**************************!*\
  !*** ./src/js/_fetch.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fetchHttpRequest: () => (/* binding */ fetchHttpRequest)
/* harmony export */ });
/* harmony import */ var _debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_debug */ "./src/js/_debug.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_util */ "./src/js/_util.js");



/**
 * Perform a Fetch request with timeout and json response.
 * 
 * Timeouts:
 *     6s for webserver to SMTP server.
 *     8s for SMTP send response to webserver.
 *     14s for front end as fallback in lieu of server response.
 * 
 * controller - abort controller to abort fetch request.
 * abort - abort wrapped in a timer.
 * signal: controller.signal - attach timeout to fetch request.
 * clearTimeout( timeoutId ) - cancel the timer on response.
 * 
 * @param {string} url      The WP plugin REST endpoint url.
 * @param {object} options  An object of fetch API options.
 * @return {object}         An object of message strings and ok flag.
 * 
 */
async function fetchHttpRequest(url, options) {
  try {
    if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log(`${(0,_debug__WEBPACK_IMPORTED_MODULE_0__.stopwatch)()} |START| Fetch request`);
    const controller = new AbortController();
    const abort = setTimeout(() => controller.abort(), 14000);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(abort);
    const result = await response.json();
    result.ok = response.ok;
    if (typeof result.output === 'string') result.output = [result.output];
    if (!result.ok) throw result;
    return result;
  } catch (error) {
    if (!error.output) {
      // error is not a server response, so display a generic error.
      error.output = ['Failed to establish a connection to the server.'];
      error.ok = false;
      console.error(error);
    }
    for (const message in error.output) {
      console.error((0,_util__WEBPACK_IMPORTED_MODULE_1__.makeHumanReadable)(error.output[message]));
    }
    return error;
  } finally {
    if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log(`${(0,_debug__WEBPACK_IMPORTED_MODULE_0__.stopwatch)()} | END | Fetch request`);
  }
}


/***/ }),

/***/ "./src/js/_form-lock.js":
/*!******************************!*\
  !*** ./src/js/_form-lock.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formLock: () => (/* binding */ formLock)
/* harmony export */ });
/* harmony import */ var _debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_debug */ "./src/js/_debug.js");


/**
 * Lock/unlock a form from user input.
 * 
 * @param {object} form The target form.
 * @param {bool} shouldLock Whether the form should be locked.
 */
function formLock(form, shouldLock) {
  const inputs = form.querySelectorAll(':is( input, textarea )'),
    button = form.querySelector('.bigup__form_submit');
  if (shouldLock) {
    if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log(`${(0,_debug__WEBPACK_IMPORTED_MODULE_0__.stopwatch)()} |START| formLock | Locked`);
    form.classList.add('bigup__form-locked');
    inputs.forEach(input => {
      input.disabled = true;
    });
    button.disabled = true;
  } else {
    form.classList.remove('bigup__form-locked');
    inputs.forEach(input => {
      input.disabled = false;
    });
    button.disabled = false;
    if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log(`${(0,_debug__WEBPACK_IMPORTED_MODULE_0__.stopwatch)()} | END | formLock | Unlocked`);
  }
}


/***/ }),

/***/ "./src/js/_submit-test.js":
/*!********************************!*\
  !*** ./src/js/_submit-test.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   submitTest: () => (/* binding */ submitTest),
/* harmony export */   wpLocalized: () => (/* binding */ wpLocalized)
/* harmony export */ });
/* harmony import */ var _debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_debug */ "./src/js/_debug.js");
/* harmony import */ var _fetch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_fetch */ "./src/js/_fetch.js");
/* harmony import */ var _alert__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_alert */ "./src/js/_alert.js");




/**
 * Perform a test submission in the admin area.
 */

/**
 * Grab WP localize vars.
 * 
 * wp_localize_bigup_forms_vars.rest_url
 * wp_localize_bigup_forms_vars.rest_nonce
 * 
 */
const wpLocalized = bigupContactFormWpInlinedAdmin;

/**
 * Test values to pass in fetch request.
 * 
 * Backend controller expects values for 'email', 'name' and 'message'.
 */
const testValues = {
  'email': 'test@email.test',
  'name': 'Test Email',
  'message': 'This is a test message. If you receive this, your email settings are OK! 🥳'
};

/**
 * Handle the submitted form.
 * 
 * Perform a test email send and display user feedback as popout alerts.
 * 
 * @param {SubmitEvent} event
 * 
 */
async function submitTest(event) {
  event.preventDefault();
  if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) (0,_debug__WEBPACK_IMPORTED_MODULE_0__.start)();
  if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log('Time | Start/Finish | Function | Target');
  if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log((0,_debug__WEBPACK_IMPORTED_MODULE_0__.stopwatch)() + ' |START| handleSubmit');
  const form = event.currentTarget.closest('form');

  // Set test values in formData.
  const formData = new FormData();
  for (const prop in testValues) {
    formData.append(prop, testValues[prop]);
  }

  // Fetch params.
  const url = wpLocalized.rest_url;
  const fetchOptions = {
    method: "POST",
    headers: {
      "X-WP-Nonce": wpLocalized.rest_nonce,
      "Accept": "application/json"
    },
    body: formData
  };
  try {
    // Display pre-fetch alerts in parrallel with fetch.
    const preFetchAlerts = [{
      'text': 'Connecting...',
      'type': 'info'
    }];
    let [result] = await Promise.all([(0,_fetch__WEBPACK_IMPORTED_MODULE_1__.fetchHttpRequest)(url, fetchOptions), (0,_alert__WEBPACK_IMPORTED_MODULE_2__.alertsShow)(form, preFetchAlerts)]);

    // Display post-fetch alerts.
    const postFetchAlerts = [];
    result.output.forEach(message => postFetchAlerts.push({
      'text': message,
      'type': result.ok ? 'success' : 'danger'
    }));
    (0,_alert__WEBPACK_IMPORTED_MODULE_2__.alertsShowWaitHide)(form, postFetchAlerts, 5000);
  } catch (error) {
    console.error(error);
  } finally {
    if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log((0,_debug__WEBPACK_IMPORTED_MODULE_0__.stopwatch)() + ' | END | handleSubmit');
  }
}


/***/ }),

/***/ "./src/js/_util.js":
/*!*************************!*\
  !*** ./src/js/_util.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   makeHumanReadable: () => (/* binding */ makeHumanReadable),
/* harmony export */   removeChildren: () => (/* binding */ removeChildren)
/* harmony export */ });
/* harmony import */ var _debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_debug */ "./src/js/_debug.js");


/**
 * Remove all child nodes from a dom node.
 * 
 * @param {object} parent The dom node to remove all child nodes from.
 * 
 */
function removeChildren(parent) {
  if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log(`${(0,_debug__WEBPACK_IMPORTED_MODULE_0__.stopwatch)()} |START| removeChildren | ${parent.classList}`);
  return new Promise((resolve, reject) => {
    try {
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
      resolve('Child nodes removed successfully.');
    } catch (error) {
      reject(error);
    } finally {
      if (_debug__WEBPACK_IMPORTED_MODULE_0__.debug) console.log(`${(0,_debug__WEBPACK_IMPORTED_MODULE_0__.stopwatch)()} | END | removeChildren | ${parent.classList}`);
    }
  });
}

/**
 * Clean strings for human output.
 * 
 * This function uses regex patterns to clean strings in 3 stages:
 * 
 * 1) Remove all html tags not inside brackets ()
 *      (?<!\([^)]*?) - do not match if preceeded by a '('
 *      <[^>]*?> - match all <>
 * 2) Remove anything that is not:
 *      (\([^\)]*?\)) - content enclosed in ()
 *      ' '   - spaces
 *      \p{L} - letters
 *      \p{N} - numbers
 *      \p{M} - marks (accents etc)
 *      \p{P} - punctuation
 * 3) Trim and replace multiple spaces with a single space.
 * 
 * @link https://www.regular-expressions.info/unicode.html#category
 * @param {string} string The dirty string.
 * @returns The cleaned string.
 * 
 */
function makeHumanReadable(string) {
  if (typeof string !== 'string') {
    console.error(`makeHumanReadable expects a string, but ${typeof string} received.`, string);
    return 'error getting message';
  }
  const tags = /(?<!\([^)]*?)<[^>]*?>/g;
  const humanReadable = /(\([^\)]*?\))|[ \p{L}\p{N}\p{M}\p{P}]/ug;
  const badWhitespaces = /^\s*|\s(?=\s)|\s*$/g;
  let notags = string.replace(tags, '');
  let notagsHuman = notags.match(humanReadable).join('');
  let notagsHumanClean = notagsHuman.replace(badWhitespaces, '');
  return notagsHumanClean;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!******************************!*\
  !*** ./src/js/view-admin.js ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _submit_test__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_submit-test */ "./src/js/_submit-test.js");


/**
 * Admin client view.
 */

/**
 * Prepare the admin SMTP test button.
 * 
 */
function init() {
  const button = document.querySelector('.bigup__smtpTest_button');
  if (!button) return;

  /*
   * Will need to change submit function to handle submit from button, otherwise backend form will have mutiple handlers.
   */
  button.addEventListener('click', _submit_test__WEBPACK_IMPORTED_MODULE_0__.submitTest);

  // Enable the submit button now js is ready (disabled by default).
  if (_submit_test__WEBPACK_IMPORTED_MODULE_0__.wpLocalized.settings_ok) {
    button.disabled = false;
  }
}

// Initialise view on 'doc ready'.
let docReady = setInterval(() => {
  if (document.readyState === 'complete') {
    clearInterval(docReady);
    init();
  }
}, 250);
})();

/******/ })()
;
//# sourceMappingURL=bigup-forms-admin.js.map