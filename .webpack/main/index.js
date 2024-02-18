/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/electron-squirrel-startup/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/index.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var path = __webpack_require__(/*! path */ "path");
var spawn = (__webpack_require__(/*! child_process */ "child_process").spawn);
var debug = __webpack_require__(/*! debug */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/index.js")('electron-squirrel-startup');
var app = (__webpack_require__(/*! electron */ "electron").app);

var run = function(args, done) {
  var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
  debug('Spawning `%s` with args `%s`', updateExe, args);
  spawn(updateExe, args, {
    detached: true
  }).on('close', done);
};

var check = function() {
  if (process.platform === 'win32') {
    var cmd = process.argv[1];
    debug('processing squirrel command `%s`', cmd);
    var target = path.basename(process.execPath);

    if (cmd === '--squirrel-install' || cmd === '--squirrel-updated') {
      run(['--createShortcut=' + target + ''], app.quit);
      return true;
    }
    if (cmd === '--squirrel-uninstall') {
      run(['--removeShortcut=' + target + ''], app.quit);
      return true;
    }
    if (cmd === '--squirrel-obsolete') {
      app.quit();
      return true;
    }
  }
  return false;
};

module.exports = check();


/***/ }),

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/browser.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/browser.js ***!
  \**********************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(/*! ./debug */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js");
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}


/***/ }),

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js":
/*!********************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js ***!
  \********************************************************************************/
/***/ ((module, exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(/*! ms */ "./node_modules/electron-squirrel-startup/node_modules/ms/index.js");

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ }),

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/index.js":
/*!********************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/index.js ***!
  \********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

if (typeof process !== 'undefined' && process.type === 'renderer') {
  module.exports = __webpack_require__(/*! ./browser.js */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/browser.js");
} else {
  module.exports = __webpack_require__(/*! ./node.js */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/node.js");
}


/***/ }),

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/node.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/node.js ***!
  \*******************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

var tty = __webpack_require__(/*! tty */ "tty");
var util = __webpack_require__(/*! util */ "util");

/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(/*! ./debug */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js");
exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // camel-case
  var prop = key
    .substring(6)
    .toLowerCase()
    .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });

  // coerce string value into JS value
  var val = process.env[key];
  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
  else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
  else if (val === 'null') val = null;
  else val = Number(val);

  obj[prop] = val;
  return obj;
}, {});

/**
 * The file descriptor to write the `debug()` calls to.
 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
 *
 *   $ DEBUG_FD=3 node script.js 3>debug.log
 */

var fd = parseInt(process.env.DEBUG_FD, 10) || 2;

if (1 !== fd && 2 !== fd) {
  util.deprecate(function(){}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')()
}

var stream = 1 === fd ? process.stdout :
             2 === fd ? process.stderr :
             createWritableStdioStream(fd);

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts
    ? Boolean(exports.inspectOpts.colors)
    : tty.isatty(fd);
}

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

exports.formatters.o = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts)
    .split('\n').map(function(str) {
      return str.trim()
    }).join(' ');
};

/**
 * Map %o to `util.inspect()`, allowing multiple lines if needed.
 */

exports.formatters.O = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var name = this.namespace;
  var useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
  } else {
    args[0] = new Date().toUTCString()
      + ' ' + name + ' ' + args[0];
  }
}

/**
 * Invokes `util.format()` with the specified arguments and writes to `stream`.
 */

function log() {
  return stream.write(util.format.apply(util, arguments) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  if (null == namespaces) {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  } else {
    process.env.DEBUG = namespaces;
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  return process.env.DEBUG;
}

/**
 * Copied from `node/src/node.js`.
 *
 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
 */

function createWritableStdioStream (fd) {
  var stream;
  var tty_wrap = process.binding('tty_wrap');

  // Note stream._type is used for test-module-load-list.js

  switch (tty_wrap.guessHandleType(fd)) {
    case 'TTY':
      stream = new tty.WriteStream(fd);
      stream._type = 'tty';

      // Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    case 'FILE':
      var fs = __webpack_require__(/*! fs */ "fs");
      stream = new fs.SyncWriteStream(fd, { autoClose: false });
      stream._type = 'fs';
      break;

    case 'PIPE':
    case 'TCP':
      var net = __webpack_require__(/*! net */ "net");
      stream = new net.Socket({
        fd: fd,
        readable: false,
        writable: true
      });

      // FIXME Should probably have an option in net.Socket to create a
      // stream from an existing fd which is writable only. But for now
      // we'll just add this hack and set the `readable` member to false.
      // Test: ./node test/fixtures/echo.js < /etc/passwd
      stream.readable = false;
      stream.read = null;
      stream._type = 'pipe';

      // FIXME Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    default:
      // Probably an error on in uv_guess_handle()
      throw new Error('Implement me. Unknown stream file type!');
  }

  // For supporting legacy API we put the FD here.
  stream.fd = fd;

  stream._isStdio = true;

  return stream;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init (debug) {
  debug.inspectOpts = {};

  var keys = Object.keys(exports.inspectOpts);
  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());


/***/ }),

/***/ "./node_modules/electron-squirrel-startup/node_modules/ms/index.js":
/*!*************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/ms/index.js ***!
  \*************************************************************************/
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const electron_1 = __webpack_require__(/*! electron */ "electron");
const icons_json_1 = __importDefault(__webpack_require__(/*! ./icons.json */ "./src/icons.json"));
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (__webpack_require__(/*! electron-squirrel-startup */ "./node_modules/electron-squirrel-startup/index.js")) {
    electron_1.app.quit();
}
let contextMenu;
let tray;
const createWindow = () => {
    // Create the browser window.
    const mainWindow = new electron_1.BrowserWindow({
        height: 79,
        width: 370,
        webPreferences: {
            preload: 'D:\\GitHub\\SFMSBellSchedOverlay\\.webpack\\renderer\\main_window\\preload.js'
        },
        alwaysOnTop: true,
        title: "SFMS Bell Schedule",
        show: false,
        autoHideMenuBar: true,
        titleBarStyle: "hidden",
        focusable: false,
        maximizable: false,
        closable: true,
        minimizable: false,
        hasShadow: false,
        maxHeight: 79,
        minHeight: 79,
        minWidth: 370
    });
    // and load the index.html of the app.
    mainWindow.loadURL('http://localhost:3000/main_window');
    // Set the opacity of the app.
    mainWindow.setOpacity(0.7);
    // Open the DevTools.
    // Comment in a prod release.
    mainWindow.webContents.openDevTools();
    mainWindow.once('ready-to-show', () => {
        mainWindow.showInactive();
    });
    let theme = "light";
    if (electron_1.nativeTheme.shouldUseDarkColors) {
        theme = "dark";
    }
    // @ts-ignore
    const updateIcon = electron_1.nativeImage.createFromDataURL(icons_json_1.default[theme].updateIcon);
    // @ts-ignore
    const reopenIcon = electron_1.nativeImage.createFromDataURL(icons_json_1.default[theme].reopenIcon);
    // @ts-ignore
    const openInBrowserIcon = electron_1.nativeImage.createFromDataURL(icons_json_1.default[theme].openInBrowserIcon);
    // @ts-ignore
    const bugReportIcon = electron_1.nativeImage.createFromDataURL(icons_json_1.default[theme].bugReportIcon);
    // @ts-ignore
    const closeIcon = electron_1.nativeImage.createFromDataURL(icons_json_1.default[theme].closeIcon);
    // @ts-ignore
    const infoIcon = electron_1.nativeImage.createFromDataURL(icons_json_1.default[theme].infoIcon);
    // disable right click menu on move region
    const WM_INITMENU = 0x0116;
    mainWindow.hookWindowMessage(WM_INITMENU, () => {
        mainWindow.setEnabled(false);
        mainWindow.setEnabled(true);
    });
    const icon = electron_1.nativeImage.createFromDataURL(icons_json_1.default.appIcon);
    tray = new electron_1.Tray(icon);
    contextMenu = electron_1.Menu.buildFromTemplate([
        { label: "SFMS Bell Schedule", type: "normal", enabled: false, id: "title", icon: infoIcon },
        { type: "separator" },
        { label: 'Reopen Window', type: 'normal', click: () => { mainWindow.close(); tray.destroy(); createWindow(); }, id: "reopenWindowButton", icon: reopenIcon },
        { label: 'Open SFMS Bell Schedule Website', type: 'normal', click: () => { siteOpen(); }, id: 'siteButton', icon: openInBrowserIcon },
        { label: 'Quit', type: 'normal', click: () => { electron_1.app.quit(); }, id: "quitButton", icon: closeIcon }
    ]);
    tray.setToolTip('SFMS Bell Schedule');
    tray.setContextMenu(contextMenu);
};
const siteOpen = () => {
    electron_1.shell.openExternal("https://sanford.croomssched.tech/");
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on('ready', createWindow);
electron_1.app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("electron");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "tty":
/*!**********************!*\
  !*** external "tty" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tty");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "./src/icons.json":
/*!************************!*\
  !*** ./src/icons.json ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"appIcon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAClklEQVR4nMWSW0iTcRjGB8Gchy+18pA5im4sIrqObqKb7HBRV0GSWRhBRJBEmjnSTZub06E76DZnngsyd1DnIStNKMlRUOnmt2/79u3gpo5C3edV9MS+C6esi+564IX34s/vfZ73/fN4PB5PotAI5Wq9ydj9gtV3PWerFSprlVhWwPsXSRQaof5Z/xrNBBBlNxGNbsLjZdCoNa6XPZYIt789NRctPmlfP7IDIFfpTF/nHaC9Pvz4uYbllQiGbeP47nDhclkT+LfHkHRrGIIbZhzrcSBPNI6Uoj73FkBr7GVdNIM2Qwdq6qSQKZRg/EEw/iVUN2rBLx1CUukwBDdNyBe/QeadAaRe7cUWoMXQxVK0D7QvAOvIKGwTk4jFoWgGVXI1iIfTIMrfg3gwBeL+JIh74yDujsYBT+Qt1ln7FzgpGqTby1Ws//DpMy5VqpDX7kOujkG21ot9ahp7mj3IaHLHAVViWYG0uW19ZtaObw6Sq5mPcxDJVChst6PQFILJFUWWmsaj6Qgq3kWQrqDigJhi274i1kHUoEGlXMVNNkwv4Jw5jLOvQhgko9jb4kHFVATlb1dByF07ATEd7l/CRWsQFyxB5Hf4Ufp6FSd6Ajje6UeJbZmzfqbPj9M9PqTVk4mAQ71LsNCbsHhYLvev30DJ2Aqu25a5PkPpxoBjAy8XNpDydDERcLA7CGFnAAeMfuzXM8hp9SJLQ3PWM5VupDdSnPVUKYnk2r8AhJ0BmD0szBSLnDaGm1o8Esa1oTDXEw0upNaTSK5bRJLYmQjI7/DjvCWMwsEQd7JY7qPtDAp0XhSZQ0iTkZx1gcQJfrUjEZBn8Llz9QyyW7fdW+nGbgWFNJkLKVISglon+DUO7BLNx7/yf9cf8qDY9/Tih8AAAAAASUVORK5CYII=","dark":{"updateIcon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAFyWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDEgNzkuMTQ2Mjg5OSwgMjAyMy8wNi8yNS0yMDowMTo1NSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjAgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNC0wMS0xOFQxMDoyNzozOC0wNTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjQtMDEtMThUMTA6Mjk6MTctMDU6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDEtMThUMTA6Mjk6MTctMDU6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmFlZjhiYjQ2LTU1OTktY2U0My05MjI4LTg1YWUyNTM4ZTFhZSIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmFmZmQwZDM1LWI2MjktODM0YS1hZTYzLWU2MTRiMTQ0ZWY4MCIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRjNTE1NTIxLWY2MTYtYmY0YS1iMDE5LTY2NmRlZDJkZDhlNCI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZGM1MTU1MjEtZjYxNi1iZjRhLWIwMTktNjY2ZGVkMmRkOGU0IiBzdEV2dDp3aGVuPSIyMDI0LTAxLTE4VDEwOjI3OjM4LTA1OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjUuMCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmFlZjhiYjQ2LTU1OTktY2U0My05MjI4LTg1YWUyNTM4ZTFhZSIgc3RFdnQ6d2hlbj0iMjAyNC0wMS0xOFQxMDoyOToxNy0wNTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI1LjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PmniiYkAAAGESURBVEiJ1ZU9SFxBFIU/xcLVRoIpJI0IImwnwVKjTSoLsbexsBVBrF+ppUgQK1OnMG06EyFiERFF/ClEKxvBQrEQlnwWTrE7vH1vVlDwwOVx5925596ZOTNtKq+J9lfN/hYEHS3EdgIDwCNwkTxLLbM19dhGXKtbalYXl0U+amEHVeAXUAFWgCPgMHQyGmwJGAEWgC+tdPAxVLqjfijoblw9VG/U7WANMc02+QfwHRgDbuvGvwWrxzywA4znJcpbomWgH5jM+VeN/O3Iv0ohmALWgYe8iiJMRP7vMoIKMAScJCTPTRgj3oPB8N1PJChFTFAL3/9N4v/wvJlZMkN0rDrD8fxacDSzEBOLqiuMN8TnJThWF0vUnUeSqbspBKtBOEUCi6+G4UA4m0KAehpUnHJX9ah76rnam0rQHyraVLsLkn9Wf6p36mheTFFln9QD9VJdUifVvkA+o26EIv6p083ypCzBinpmI+7Vv+pc2fw2TX6TKzwLsUa60lsieBHe/6P/BKb11ez7sxBRAAAAAElFTkSuQmCC","reopenIcon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAFyWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDEgNzkuMTQ2Mjg5OSwgMjAyMy8wNi8yNS0yMDowMTo1NSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjAgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNC0wMS0xOFQxMDoxMzoxNS0wNTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjQtMDEtMThUMTA6MTU6NTYtMDU6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDEtMThUMTA6MTU6NTYtMDU6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjMzMmQwNTkyLTM2Y2UtNDk0Ny04NjhlLWM5NDY0MWZmM2Y2YyIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjIwMDgxZDkwLTk2ODEtNmQ0Yi1iNGU0LTlkOGQ4NjI0ZTBlMSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmYwMWEzY2QwLThhNGItNzk0Zi1hODJhLWIyZmY0MzFkNTc0NyI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZjAxYTNjZDAtOGE0Yi03OTRmLWE4MmEtYjJmZjQzMWQ1NzQ3IiBzdEV2dDp3aGVuPSIyMDI0LTAxLTE4VDEwOjEzOjE1LTA1OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjUuMCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjMzMmQwNTkyLTM2Y2UtNDk0Ny04NjhlLWM5NDY0MWZmM2Y2YyIgc3RFdnQ6d2hlbj0iMjAyNC0wMS0xOFQxMDoxNTo1Ni0wNTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI1LjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnvwVBUAAAEdSURBVEiJ3ZWxTgJBFEXPGmqMiRQmFhRWFCb+wVTUUPALJH6CHS1fQY/RHptdWxM7oIHCnsJPuBbOkFmc3UWHjYGb3MzbN7P35c3bm00kUSfOalU/iQKNQM5Eama5J0k+U8Uj9TV9cXMAcQfjdP9lBkmkZs5Yx/+Z1lVg4YLQDGKRm+FfOzDAxMZd4AFI7do9RAGANjAGZsAd8GrXGfC8PRUw2q67QzTKu97fu7K5+yIn71OgVeRcy4HNN0ND7gDLiuvZUG7IR2ANXPszyCwXfLsxxFFFYR+fQDPRz1+mKXkp8+JRScEO8Abc7HPfRZxKmhfszSVNJBHq4DeYAufAO/AC3AJ94ALoAR8xHTgObTeStJL0JOnS7cd2UIkvKDAPBCORmK0AAAAASUVORK5CYII=","openInBrowserIcon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAFyWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDEgNzkuMTQ2Mjg5OSwgMjAyMy8wNi8yNS0yMDowMTo1NSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjAgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNC0wMS0xOFQxMDoxMjo1NC0wNTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjQtMDEtMThUMTA6MTU6MDUtMDU6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDEtMThUMTA6MTU6MDUtMDU6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjkwMjg4OTg3LTg0NGMtYTg0OS1hNWY5LWE5MjRkOGEwNjkwOCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjUwZTBjYmVlLTY5NDEtMDM0MC1iYjk4LTZjOTU1N2FkNWMxNiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjk2YWZjN2RjLWE3Y2QtNzI0OS04NTFmLTA4NzdiZWY3OWYxZCI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6OTZhZmM3ZGMtYTdjZC03MjQ5LTg1MWYtMDg3N2JlZjc5ZjFkIiBzdEV2dDp3aGVuPSIyMDI0LTAxLTE4VDEwOjEyOjU0LTA1OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjUuMCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjkwMjg4OTg3LTg0NGMtYTg0OS1hNWY5LWE5MjRkOGEwNjkwOCIgc3RFdnQ6d2hlbj0iMjAyNC0wMS0xOFQxMDoxNTowNS0wNTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI1LjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PjmXPk8AAAC0SURBVEiJ1ZXtCYYwDITjiyt0Cd8l6hIO6RK6hC7hEPFPg/VspFbrx8GBBnKP2BgLZqac+mVNvwNQKnWbmNdvKsyM7jhdHeZhuD0RLrJ+5mNnUCTmbWb++2P6OkDlnAVQEVHrHA2JBUi4KBoSAzBe+OQsEHMFQEIbr9YATJX2oaFquB8DtaAeG9NDo7jXg6+odx6gru0m3D3SvzRy+J9sveuB9MM0RPQHwPrJFMBlet0uOqwZC33PSpMCWssAAAAASUVORK5CYII=","bugReportIcon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAFyWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDEgNzkuMTQ2Mjg5OSwgMjAyMy8wNi8yNS0yMDowMTo1NSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjAgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNC0wMS0xOFQxMDoxMjoxNS0wNTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjQtMDEtMThUMTA6MTQ6MzMtMDU6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDEtMThUMTA6MTQ6MzMtMDU6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjM4N2EwODk5LWExNTktMzI0ZC05MjllLWIzMDA5YzhhMDNiOCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmRiYWIyNGZjLTM0ZjEtZDA0YS05NzhmLTZmYzg2Njg3YjNjNiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmM1N2ZjZDI5LTUwMGYtMDM0YS05YmU2LTNlN2VlNTcyMWVhMCI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YzU3ZmNkMjktNTAwZi0wMzRhLTliZTYtM2U3ZWU1NzIxZWEwIiBzdEV2dDp3aGVuPSIyMDI0LTAxLTE4VDEwOjEyOjE1LTA1OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjUuMCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjM4N2EwODk5LWExNTktMzI0ZC05MjllLWIzMDA5YzhhMDNiOCIgc3RFdnQ6d2hlbj0iMjAyNC0wMS0xOFQxMDoxNDozMy0wNTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI1LjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pm5+Ne4AAAGESURBVEiJ5ZW9L0NhFMZ/RbjaGjCUVKjGICHxV1gMEoPFoJPEisHeWCRitIl/w8bMIoREUpQgsWhSGvH5GHoaX/e+/ZDG4EnenHvf+5znnHOfN/eGJFFPNNRV/V8UaAJOgJTPs2ng1DhOARdegG1gA+gBboFXIAakgXXjBCJUwSnygAwQ/7Z/BSSBJ1dyuVfUC+wDjcA40Emx+wmgGTjwKfwFfhMkgTWgxa6jwAhw6VN8D8gDZ8AjMAtky00QMvGoiSz4iANcAItAHxCxiUI/WJKC1piKSNj9vKQtW3O2N2Cc0SAdlwftFm8shj898yxeW+wIVPGpmpS0KenIuvMcU3rGObScRCUTlDyoFlV7MGXdtTo8CBtnshYP8hZjFv086LZ4F6ji8GDXuks5ppwxzk4tHtxTPOurQMKH1w8sA+dAgRo8QFJcUlZSQVJa0qCkIUlLkh4kZSR1uTTKFUBSm6QVSTl9IGd7kXL5lXxNS2gAhoFn4Bh4qySpmgI14c9/mb/GO2LBAqxV/eLPAAAAAElFTkSuQmCC","closeIcon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAFyWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDEgNzkuMTQ2Mjg5OSwgMjAyMy8wNi8yNS0yMDowMTo1NSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjAgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNC0wMS0xOFQxMDoxMTo1NC0wNTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjQtMDEtMThUMTA6MTM6NDQtMDU6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDEtMThUMTA6MTM6NDQtMDU6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmY4Y2M5MmYzLWU5NjctZmQ0OC04YjNiLTU5YjJjOTM5MzAyNCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjY2YzM1NGNlLTMxZjAtMTg0YS1iMmE3LWNhNjM2NTFiZjVkNyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjVlYWEzY2U4LWJjZDItMDc0Yy1hZjFlLThkMDAxN2I1NjFiNyI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NWVhYTNjZTgtYmNkMi0wNzRjLWFmMWUtOGQwMDE3YjU2MWI3IiBzdEV2dDp3aGVuPSIyMDI0LTAxLTE4VDEwOjExOjU0LTA1OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjUuMCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmY4Y2M5MmYzLWU5NjctZmQ0OC04YjNiLTU5YjJjOTM5MzAyNCIgc3RFdnQ6d2hlbj0iMjAyNC0wMS0xOFQxMDoxMzo0NC0wNTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI1LjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PoIlwvgAAAB9SURBVEiJ7ZVRCoAgEESzk83N8ubTRwUSuzpbLEQo+OXse6siFpJL5lhT6VPwVoAAx8+StCZ4jOqst7OeWVjrSmFPMsyo3VkApYGhwANJcFVwB8rwiKCVyHCS+e/gE0e0ZV5yDyRJnsLljFeIwDlfEkR3YBZEs4WcX+bfBTtePY3HRd7JswAAAABJRU5ErkJggg==","infoIcon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAFyWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDEgNzkuMTQ2Mjg5OSwgMjAyMy8wNi8yNS0yMDowMTo1NSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjAgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNC0wMS0xOFQxMDoyODo0Ny0wNTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjQtMDEtMThUMTA6MzA6NDUtMDU6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDEtMThUMTA6MzA6NDUtMDU6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjY1ZDE4YjA0LTA2NTItMTU0ZS1hNjZhLWY5ZmI5ZmEyYzk2NCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjdlYTMwMzVjLWY1N2ItMmY0OS1hOGI4LWJkZTU0YzQ4NmYxOCIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmM3Mjg3MjM5LWQ2YTMtOTE0YS05MTgxLTI0NmYxMjcwNTE1YiI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YzcyODcyMzktZDZhMy05MTRhLTkxODEtMjQ2ZjEyNzA1MTViIiBzdEV2dDp3aGVuPSIyMDI0LTAxLTE4VDEwOjI4OjQ3LTA1OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjUuMCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjY1ZDE4YjA0LTA2NTItMTU0ZS1hNjZhLWY5ZmI5ZmEyYzk2NCIgc3RFdnQ6d2hlbj0iMjAyNC0wMS0xOFQxMDozMDo0NS0wNTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI1LjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PggWeLcAAAFwSURBVEiJtZaxSgNBEIa/qM8gWFkcJGChTSQ2gSsFXyH2eQvPh7Cw8Q1SBtLZBrTJdRFSi3ZpUhl+i53oeu5uLgn5YViY2flnbmZnuIYk9omDvbJvESAzqY2jGncK4By4Ak5M9w6MgdLscUiKSUdSKWkh6VFST9KpSc90C7vTifHEyAs5TCTliSRyuyPzqRUgSzmsSSir2hqBZzoEDoHr2p10GAFL4CbVg0LSXFIrkumzScjWMt87X199RW1gAEwjWd4nvmBqvpepL/iQ1N+g9lXpG0ewyc1Yozx5MInZVw+kGSrR0s6vRBnOEjbfd8X1Z1XMcBPaXUOSQtc4ZqEA4MZ/1wBjX1ENUAK3QL4FeW6+pa8MDVoJCLgIkBSV08cEaOAW4y8CL6Gzw6r4t/TWOYwSU72a3lEqoVRWmaSh3Pg/2RBlJn3Tze1OdHZCPQjVvY1bAcem+wRegNdIP35QJ4CPpp1vdR02DbAx9v5X8Q2wJeCEp4O3FAAAAABJRU5ErkJggg=="},"light":{"updateIcon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAchJREFUSEvN1cvrTVEUB/DPb+QxYqDEREoKKZl5RYqBRCZKGUiZYGCuMBEykSQG4h8wMpAJZWJCkddEzOSRkUdKsZf20f3t9tn33MEtq06nu9fZ67u+a33XujOmbDNTju+/ApiL5fiJN0OZD2FwGduweiToezzCs3R2Op+X77/HLYBVuIt56Tmfgz1FMNmcn4O4jxO4loEimX/WB7AIH/EQe/GlpyRbcQlL8HwSgMjqHQ4Vga/k30fzOwDCjieG+/Agl7PJ4Bz2Yw2+FQABHNaV4Xfhv1kmVSvRa9zAhUpZSoCOQfdpMJhlJUA09Dt2484AgJ7W9Dd5LUIp0bSQYmklg4kBQpovsBgfKrdD66eSvM8kX6f7JkhZotD4D+zEvZ6bfSDzsyhmxaw1OfQcarjYSK0GEmc7UmIbRu/VAGJwDmBlY8AixuhqWIcnOJwV2JyDcL7CJ2wZ20UW5JWyEBvxeRyD8C/D21yqY5WB62Ksx8m0UrZjV14tzTkYdS7NsxAZXsXLNB+PMScvuk04ks/O4naN7ZB1HZt0T+5JF+Nr3q630sxcb5VxCEB3P6Z8RSrJr8xmQHva/weDAoz7aBIG42JV/VMH+AMQS04ZnqyLxgAAAABJRU5ErkJggg==","reopenIcon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAARdJREFUSEvt1L8uREEUx/HPPoEoSPQqROMFSETrT6IWDYlCqcVTeAcKvYaaaEQ0FCoF3oF7bu7K2Ny7uWt2IxGnmWQyc75zfuc3p2PE0Rlxfn8TsJgp21V6v1eiSwwDsNSFpIBIHIBhRADKSn4FkOusD/St4B8QEk3iranJuRJ9c2Gdi9oAwtJb2MYKFqr1AreItYwcwCGucYAzPGAGmzjHxjAA3V+fPnQKL9jDyU8rmCgSvCZif/m+2osqTjFWB5itys0dGY9YHXTYHRfUo5bk6M9+nWP6TdN0FAeoCRbNDsB0G0s2PTg0jkRzNQfucRM2zgFE3rKRiffnsY5xrOE5FxCQHSxX/n8q/H+HXbz3/oOWvRvs2CfqAzuhQrDqEwAAAABJRU5ErkJggg==","openInBrowserIcon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAANdJREFUSEvtldENwjAMRK9DdAlYApZgCeZhCZaAJWCJDgE6KYeMSdrIIepP/dWmzT3bsZ0BnW3orI/VAIdgZHe/LxfBDUAL4GghHkBhAlqMgE8kqwGih/8CUBXBBlg85FKKdqm8noUyazoDil+T8AlADhIGWHE5n4OEAKNpvimpc43GktQa30MAbmR3nwFckrCev8ZCC0Bp0RjxwvoejuDvgH2hSuYiYCE8lkaF8u3HtfrCA5gSa2yw2XGtny2AXtlKsYKsJkYrq7pwWu6Cn73RqVntRHfAG0OAQRkO/7/LAAAAAElFTkSuQmCC","bugReportIcon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAbxJREFUSEvd1U+ITlEYBvDfoPxplJIsppQ/KTVlwUpWlBqNrTAlMqNZjy2RjZXsLESNQslupilhayVlpSaKGlNjYyYRxt/z1rm6Xff7ujfNgrO53e+893ne8zzveb4eS7x6lhjf/0+wAtO4iJsVOY+n9wvYjm+dpG4i0Q2cxDm8S8/v2JhJY2+4m49NCFbhJfoqQLPYgsW/IdiER1iL03iMkG0PrmEe+xBktavuBNHVVazMHfZiZ5LiTQUhyJ/hPV7hC0bxulxXR7AV1xHAu7P+4x0aHMkneYIPOJXJfpd38+AgptL0bM5djeFQ/nICV7ANL3AAD+ua6EYwlABuYQ0+pVE8i/0Z5EGS8FLe+4gjuNuUoPAgNN6B1fjcQaKYsCB/nuSZaetBzHobgrdtPTiG2yWJ6jwI+UKiw7jXVKKibhCTJZPrPIiJi0s4gPtNCQoP1ucxPVGTQwVWeUwjRlrdgwAJsrgPu6oXKJ/saemi/WzrQRBE/kQ8bEhxcTkl5x0sTwl7FGdyROxNnc+1iYpqbeTQ+dzdury5gEjS+D1M7riapGnx8TL042v+j/jRDbjYa0PQBO+Pmn+f4BfoVFsZOpWB5gAAAABJRU5ErkJggg==","closeIcon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAJlJREFUSEvtVEEKgDAMy36mL1Nfpk/TIIMh2kRY8eJuY2nSpKMFyack8+MXkAlHEQ0ANslwAh6xTwIsWAEsR/UsRPg+ARjvGooc1MJIRGLUL4oIJDmdKwFi7ogsclfgKsI7M3fmYzmoM65d826Rv3HQukgRaDPvHhHzpkAbS7chp35Tp0uJ+XRVpC47c4lqmLMqNEuA+AVkfDsFny4ZPotPEgAAAABJRU5ErkJggg==","infoIcon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAcBJREFUSEu1lc0rRWEQxn83fwNiQxE7Nr4WFAsRVmzZKFGKbGyxtVCUImXDlhUiC4qFrw07otgQ/gZx5jbndu8xcxyn7lun7rnvvO/zzDMzz8lQ5JUp8v38F6BGCT0lJZYEYB5oANqACr34DbgA7oJ32XdXHEArsAHUAlvAmT5yWYc+I8AjMAZcWigegLCaU4bTwKlDsRNY1gwXrGwsANFZWJkHHKCQkGRbUB8LYB8oCTTuTVpIjTsEvoD+/HNRAGEyA7QA9wbAif7XZezVA1fAkmafDYkC7AEfwGiM5rLl1WQTKAMGwvNRgHct7to/5QnDJ5R9uQVQp7L8KlQe2Kr+nnQIhA0icj1EJQo3q4EX54K4GsiRKuBZZyfbTVGJXoHZIGA7JcAwsAhUejXYBT6B8ZQA60BpMKCDHoC0qWTQ53RKnEQy1QeaQc6frEETA/sGGo0swoOWwd2q5GKMuWUBiMmJU6axCnHcAtP7y+yOADE7a6qFpbSjmF2PRyjOrqVtV4B2YEdt4Fhz71Y7GQLOgamoyXlFtppH9G4CmtUGJEbs5DqwhJvgJfUHxwKTaZeVndIkK8knM8k9bkzRAX4Aap5SGZZ68IQAAAAASUVORK5CYII="}}');

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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map