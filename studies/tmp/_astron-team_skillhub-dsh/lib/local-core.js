import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// ../../cli/node_modules/graceful-fs/polyfills.js
var require_polyfills = __commonJS((exports, module) => {
  var constants = __require("constants");
  var origCwd = process.cwd;
  var cwd = null;
  var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    if (!cwd)
      cwd = origCwd.call(process);
    return cwd;
  };
  try {
    process.cwd();
  } catch (er) {}
  if (typeof process.chdir === "function") {
    chdir = process.chdir;
    process.chdir = function(d) {
      cwd = null;
      chdir.call(process, d);
    };
    if (Object.setPrototypeOf)
      Object.setPrototypeOf(process.chdir, chdir);
  }
  var chdir;
  module.exports = patch;
  function patch(fs) {
    if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
      patchLchmod(fs);
    }
    if (!fs.lutimes) {
      patchLutimes(fs);
    }
    fs.chown = chownFix(fs.chown);
    fs.fchown = chownFix(fs.fchown);
    fs.lchown = chownFix(fs.lchown);
    fs.chmod = chmodFix(fs.chmod);
    fs.fchmod = chmodFix(fs.fchmod);
    fs.lchmod = chmodFix(fs.lchmod);
    fs.chownSync = chownFixSync(fs.chownSync);
    fs.fchownSync = chownFixSync(fs.fchownSync);
    fs.lchownSync = chownFixSync(fs.lchownSync);
    fs.chmodSync = chmodFixSync(fs.chmodSync);
    fs.fchmodSync = chmodFixSync(fs.fchmodSync);
    fs.lchmodSync = chmodFixSync(fs.lchmodSync);
    fs.stat = statFix(fs.stat);
    fs.fstat = statFix(fs.fstat);
    fs.lstat = statFix(fs.lstat);
    fs.statSync = statFixSync(fs.statSync);
    fs.fstatSync = statFixSync(fs.fstatSync);
    fs.lstatSync = statFixSync(fs.lstatSync);
    if (fs.chmod && !fs.lchmod) {
      fs.lchmod = function(path, mode, cb) {
        if (cb)
          process.nextTick(cb);
      };
      fs.lchmodSync = function() {};
    }
    if (fs.chown && !fs.lchown) {
      fs.lchown = function(path, uid, gid, cb) {
        if (cb)
          process.nextTick(cb);
      };
      fs.lchownSync = function() {};
    }
    if (platform === "win32") {
      fs.rename = typeof fs.rename !== "function" ? fs.rename : function(fs$rename) {
        function rename(from, to, cb) {
          var start = Date.now();
          var backoff = 0;
          fs$rename(from, to, function CB(er) {
            if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 60000) {
              setTimeout(function() {
                fs.stat(to, function(stater, st) {
                  if (stater && stater.code === "ENOENT")
                    fs$rename(from, to, CB);
                  else
                    cb(er);
                });
              }, backoff);
              if (backoff < 100)
                backoff += 10;
              return;
            }
            if (cb)
              cb(er);
          });
        }
        if (Object.setPrototypeOf)
          Object.setPrototypeOf(rename, fs$rename);
        return rename;
      }(fs.rename);
    }
    fs.read = typeof fs.read !== "function" ? fs.read : function(fs$read) {
      function read(fd, buffer, offset, length, position, callback_) {
        var callback;
        if (callback_ && typeof callback_ === "function") {
          var eagCounter = 0;
          callback = function(er, _, __) {
            if (er && er.code === "EAGAIN" && eagCounter < 10) {
              eagCounter++;
              return fs$read.call(fs, fd, buffer, offset, length, position, callback);
            }
            callback_.apply(this, arguments);
          };
        }
        return fs$read.call(fs, fd, buffer, offset, length, position, callback);
      }
      if (Object.setPrototypeOf)
        Object.setPrototypeOf(read, fs$read);
      return read;
    }(fs.read);
    fs.readSync = typeof fs.readSync !== "function" ? fs.readSync : function(fs$readSync) {
      return function(fd, buffer, offset, length, position) {
        var eagCounter = 0;
        while (true) {
          try {
            return fs$readSync.call(fs, fd, buffer, offset, length, position);
          } catch (er) {
            if (er.code === "EAGAIN" && eagCounter < 10) {
              eagCounter++;
              continue;
            }
            throw er;
          }
        }
      };
    }(fs.readSync);
    function patchLchmod(fs2) {
      fs2.lchmod = function(path, mode, callback) {
        fs2.open(path, constants.O_WRONLY | constants.O_SYMLINK, mode, function(err, fd) {
          if (err) {
            if (callback)
              callback(err);
            return;
          }
          fs2.fchmod(fd, mode, function(err2) {
            fs2.close(fd, function(err22) {
              if (callback)
                callback(err2 || err22);
            });
          });
        });
      };
      fs2.lchmodSync = function(path, mode) {
        var fd = fs2.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);
        var threw = true;
        var ret;
        try {
          ret = fs2.fchmodSync(fd, mode);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs2.closeSync(fd);
            } catch (er) {}
          } else {
            fs2.closeSync(fd);
          }
        }
        return ret;
      };
    }
    function patchLutimes(fs2) {
      if (constants.hasOwnProperty("O_SYMLINK") && fs2.futimes) {
        fs2.lutimes = function(path, at, mt, cb) {
          fs2.open(path, constants.O_SYMLINK, function(er, fd) {
            if (er) {
              if (cb)
                cb(er);
              return;
            }
            fs2.futimes(fd, at, mt, function(er2) {
              fs2.close(fd, function(er22) {
                if (cb)
                  cb(er2 || er22);
              });
            });
          });
        };
        fs2.lutimesSync = function(path, at, mt) {
          var fd = fs2.openSync(path, constants.O_SYMLINK);
          var ret;
          var threw = true;
          try {
            ret = fs2.futimesSync(fd, at, mt);
            threw = false;
          } finally {
            if (threw) {
              try {
                fs2.closeSync(fd);
              } catch (er) {}
            } else {
              fs2.closeSync(fd);
            }
          }
          return ret;
        };
      } else if (fs2.futimes) {
        fs2.lutimes = function(_a, _b, _c, cb) {
          if (cb)
            process.nextTick(cb);
        };
        fs2.lutimesSync = function() {};
      }
    }
    function chmodFix(orig) {
      if (!orig)
        return orig;
      return function(target, mode, cb) {
        return orig.call(fs, target, mode, function(er) {
          if (chownErOk(er))
            er = null;
          if (cb)
            cb.apply(this, arguments);
        });
      };
    }
    function chmodFixSync(orig) {
      if (!orig)
        return orig;
      return function(target, mode) {
        try {
          return orig.call(fs, target, mode);
        } catch (er) {
          if (!chownErOk(er))
            throw er;
        }
      };
    }
    function chownFix(orig) {
      if (!orig)
        return orig;
      return function(target, uid, gid, cb) {
        return orig.call(fs, target, uid, gid, function(er) {
          if (chownErOk(er))
            er = null;
          if (cb)
            cb.apply(this, arguments);
        });
      };
    }
    function chownFixSync(orig) {
      if (!orig)
        return orig;
      return function(target, uid, gid) {
        try {
          return orig.call(fs, target, uid, gid);
        } catch (er) {
          if (!chownErOk(er))
            throw er;
        }
      };
    }
    function statFix(orig) {
      if (!orig)
        return orig;
      return function(target, options, cb) {
        if (typeof options === "function") {
          cb = options;
          options = null;
        }
        function callback(er, stats) {
          if (stats) {
            if (stats.uid < 0)
              stats.uid += 4294967296;
            if (stats.gid < 0)
              stats.gid += 4294967296;
          }
          if (cb)
            cb.apply(this, arguments);
        }
        return options ? orig.call(fs, target, options, callback) : orig.call(fs, target, callback);
      };
    }
    function statFixSync(orig) {
      if (!orig)
        return orig;
      return function(target, options) {
        var stats = options ? orig.call(fs, target, options) : orig.call(fs, target);
        if (stats) {
          if (stats.uid < 0)
            stats.uid += 4294967296;
          if (stats.gid < 0)
            stats.gid += 4294967296;
        }
        return stats;
      };
    }
    function chownErOk(er) {
      if (!er)
        return true;
      if (er.code === "ENOSYS")
        return true;
      var nonroot = !process.getuid || process.getuid() !== 0;
      if (nonroot) {
        if (er.code === "EINVAL" || er.code === "EPERM")
          return true;
      }
      return false;
    }
  }
});

// ../../cli/node_modules/graceful-fs/legacy-streams.js
var require_legacy_streams = __commonJS((exports, module) => {
  var Stream = __require("stream").Stream;
  module.exports = legacy;
  function legacy(fs) {
    return {
      ReadStream,
      WriteStream
    };
    function ReadStream(path, options) {
      if (!(this instanceof ReadStream))
        return new ReadStream(path, options);
      Stream.call(this);
      var self = this;
      this.path = path;
      this.fd = null;
      this.readable = true;
      this.paused = false;
      this.flags = "r";
      this.mode = 438;
      this.bufferSize = 64 * 1024;
      options = options || {};
      var keys = Object.keys(options);
      for (var index = 0, length = keys.length;index < length; index++) {
        var key = keys[index];
        this[key] = options[key];
      }
      if (this.encoding)
        this.setEncoding(this.encoding);
      if (this.start !== undefined) {
        if (typeof this.start !== "number") {
          throw TypeError("start must be a Number");
        }
        if (this.end === undefined) {
          this.end = Infinity;
        } else if (typeof this.end !== "number") {
          throw TypeError("end must be a Number");
        }
        if (this.start > this.end) {
          throw new Error("start must be <= end");
        }
        this.pos = this.start;
      }
      if (this.fd !== null) {
        process.nextTick(function() {
          self._read();
        });
        return;
      }
      fs.open(this.path, this.flags, this.mode, function(err, fd) {
        if (err) {
          self.emit("error", err);
          self.readable = false;
          return;
        }
        self.fd = fd;
        self.emit("open", fd);
        self._read();
      });
    }
    function WriteStream(path, options) {
      if (!(this instanceof WriteStream))
        return new WriteStream(path, options);
      Stream.call(this);
      this.path = path;
      this.fd = null;
      this.writable = true;
      this.flags = "w";
      this.encoding = "binary";
      this.mode = 438;
      this.bytesWritten = 0;
      options = options || {};
      var keys = Object.keys(options);
      for (var index = 0, length = keys.length;index < length; index++) {
        var key = keys[index];
        this[key] = options[key];
      }
      if (this.start !== undefined) {
        if (typeof this.start !== "number") {
          throw TypeError("start must be a Number");
        }
        if (this.start < 0) {
          throw new Error("start must be >= zero");
        }
        this.pos = this.start;
      }
      this.busy = false;
      this._queue = [];
      if (this.fd === null) {
        this._open = fs.open;
        this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
        this.flush();
      }
    }
  }
});

// ../../cli/node_modules/graceful-fs/clone.js
var require_clone = __commonJS((exports, module) => {
  module.exports = clone;
  var getPrototypeOf = Object.getPrototypeOf || function(obj) {
    return obj.__proto__;
  };
  function clone(obj) {
    if (obj === null || typeof obj !== "object")
      return obj;
    if (obj instanceof Object)
      var copy = { __proto__: getPrototypeOf(obj) };
    else
      var copy = Object.create(null);
    Object.getOwnPropertyNames(obj).forEach(function(key) {
      Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
    });
    return copy;
  }
});

// ../../cli/node_modules/graceful-fs/graceful-fs.js
var require_graceful_fs = __commonJS((exports, module) => {
  var fs = __require("fs");
  var polyfills = require_polyfills();
  var legacy = require_legacy_streams();
  var clone = require_clone();
  var util3 = __require("util");
  var gracefulQueue;
  var previousSymbol;
  if (typeof Symbol === "function" && typeof Symbol.for === "function") {
    gracefulQueue = Symbol.for("graceful-fs.queue");
    previousSymbol = Symbol.for("graceful-fs.previous");
  } else {
    gracefulQueue = "___graceful-fs.queue";
    previousSymbol = "___graceful-fs.previous";
  }
  function noop() {}
  function publishQueue(context, queue2) {
    Object.defineProperty(context, gracefulQueue, {
      get: function() {
        return queue2;
      }
    });
  }
  var debug = noop;
  if (util3.debuglog)
    debug = util3.debuglog("gfs4");
  else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
    debug = function() {
      var m = util3.format.apply(util3, arguments);
      m = "GFS4: " + m.split(/\n/).join(`
GFS4: `);
      console.error(m);
    };
  if (!fs[gracefulQueue]) {
    queue = global[gracefulQueue] || [];
    publishQueue(fs, queue);
    fs.close = function(fs$close) {
      function close(fd, cb) {
        return fs$close.call(fs, fd, function(err) {
          if (!err) {
            resetQueue();
          }
          if (typeof cb === "function")
            cb.apply(this, arguments);
        });
      }
      Object.defineProperty(close, previousSymbol, {
        value: fs$close
      });
      return close;
    }(fs.close);
    fs.closeSync = function(fs$closeSync) {
      function closeSync(fd) {
        fs$closeSync.apply(fs, arguments);
        resetQueue();
      }
      Object.defineProperty(closeSync, previousSymbol, {
        value: fs$closeSync
      });
      return closeSync;
    }(fs.closeSync);
    if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
      process.on("exit", function() {
        debug(fs[gracefulQueue]);
        __require("assert").equal(fs[gracefulQueue].length, 0);
      });
    }
  }
  var queue;
  if (!global[gracefulQueue]) {
    publishQueue(global, fs[gracefulQueue]);
  }
  module.exports = patch(clone(fs));
  if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
    module.exports = patch(fs);
    fs.__patched = true;
  }
  function patch(fs2) {
    polyfills(fs2);
    fs2.gracefulify = patch;
    fs2.createReadStream = createReadStream;
    fs2.createWriteStream = createWriteStream;
    var fs$readFile = fs2.readFile;
    fs2.readFile = readFile;
    function readFile(path, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      return go$readFile(path, options, cb);
      function go$readFile(path2, options2, cb2, startTime) {
        return fs$readFile(path2, options2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$readFile, [path2, options2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$writeFile = fs2.writeFile;
    fs2.writeFile = writeFile;
    function writeFile(path, data, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      return go$writeFile(path, data, options, cb);
      function go$writeFile(path2, data2, options2, cb2, startTime) {
        return fs$writeFile(path2, data2, options2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$writeFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$appendFile = fs2.appendFile;
    if (fs$appendFile)
      fs2.appendFile = appendFile;
    function appendFile(path, data, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      return go$appendFile(path, data, options, cb);
      function go$appendFile(path2, data2, options2, cb2, startTime) {
        return fs$appendFile(path2, data2, options2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$appendFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$copyFile = fs2.copyFile;
    if (fs$copyFile)
      fs2.copyFile = copyFile;
    function copyFile(src, dest, flags, cb) {
      if (typeof flags === "function") {
        cb = flags;
        flags = 0;
      }
      return go$copyFile(src, dest, flags, cb);
      function go$copyFile(src2, dest2, flags2, cb2, startTime) {
        return fs$copyFile(src2, dest2, flags2, function(err) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    var fs$readdir = fs2.readdir;
    fs2.readdir = readdir;
    var noReaddirOptionVersions = /^v[0-5]\./;
    function readdir(path, options, cb) {
      if (typeof options === "function")
        cb = options, options = null;
      var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir2(path2, options2, cb2, startTime) {
        return fs$readdir(path2, fs$readdirCallback(path2, options2, cb2, startTime));
      } : function go$readdir2(path2, options2, cb2, startTime) {
        return fs$readdir(path2, options2, fs$readdirCallback(path2, options2, cb2, startTime));
      };
      return go$readdir(path, options, cb);
      function fs$readdirCallback(path2, options2, cb2, startTime) {
        return function(err, files) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([
              go$readdir,
              [path2, options2, cb2],
              err,
              startTime || Date.now(),
              Date.now()
            ]);
          else {
            if (files && files.sort)
              files.sort();
            if (typeof cb2 === "function")
              cb2.call(this, err, files);
          }
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var legStreams = legacy(fs2);
      ReadStream = legStreams.ReadStream;
      WriteStream = legStreams.WriteStream;
    }
    var fs$ReadStream = fs2.ReadStream;
    if (fs$ReadStream) {
      ReadStream.prototype = Object.create(fs$ReadStream.prototype);
      ReadStream.prototype.open = ReadStream$open;
    }
    var fs$WriteStream = fs2.WriteStream;
    if (fs$WriteStream) {
      WriteStream.prototype = Object.create(fs$WriteStream.prototype);
      WriteStream.prototype.open = WriteStream$open;
    }
    Object.defineProperty(fs2, "ReadStream", {
      get: function() {
        return ReadStream;
      },
      set: function(val) {
        ReadStream = val;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(fs2, "WriteStream", {
      get: function() {
        return WriteStream;
      },
      set: function(val) {
        WriteStream = val;
      },
      enumerable: true,
      configurable: true
    });
    var FileReadStream = ReadStream;
    Object.defineProperty(fs2, "FileReadStream", {
      get: function() {
        return FileReadStream;
      },
      set: function(val) {
        FileReadStream = val;
      },
      enumerable: true,
      configurable: true
    });
    var FileWriteStream = WriteStream;
    Object.defineProperty(fs2, "FileWriteStream", {
      get: function() {
        return FileWriteStream;
      },
      set: function(val) {
        FileWriteStream = val;
      },
      enumerable: true,
      configurable: true
    });
    function ReadStream(path, options) {
      if (this instanceof ReadStream)
        return fs$ReadStream.apply(this, arguments), this;
      else
        return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
    }
    function ReadStream$open() {
      var that = this;
      open(that.path, that.flags, that.mode, function(err, fd) {
        if (err) {
          if (that.autoClose)
            that.destroy();
          that.emit("error", err);
        } else {
          that.fd = fd;
          that.emit("open", fd);
          that.read();
        }
      });
    }
    function WriteStream(path, options) {
      if (this instanceof WriteStream)
        return fs$WriteStream.apply(this, arguments), this;
      else
        return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
    }
    function WriteStream$open() {
      var that = this;
      open(that.path, that.flags, that.mode, function(err, fd) {
        if (err) {
          that.destroy();
          that.emit("error", err);
        } else {
          that.fd = fd;
          that.emit("open", fd);
        }
      });
    }
    function createReadStream(path, options) {
      return new fs2.ReadStream(path, options);
    }
    function createWriteStream(path, options) {
      return new fs2.WriteStream(path, options);
    }
    var fs$open = fs2.open;
    fs2.open = open;
    function open(path, flags, mode, cb) {
      if (typeof mode === "function")
        cb = mode, mode = null;
      return go$open(path, flags, mode, cb);
      function go$open(path2, flags2, mode2, cb2, startTime) {
        return fs$open(path2, flags2, mode2, function(err, fd) {
          if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
            enqueue([go$open, [path2, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
          else {
            if (typeof cb2 === "function")
              cb2.apply(this, arguments);
          }
        });
      }
    }
    return fs2;
  }
  function enqueue(elem) {
    debug("ENQUEUE", elem[0].name, elem[1]);
    fs[gracefulQueue].push(elem);
    retry();
  }
  var retryTimer;
  function resetQueue() {
    var now = Date.now();
    for (var i = 0;i < fs[gracefulQueue].length; ++i) {
      if (fs[gracefulQueue][i].length > 2) {
        fs[gracefulQueue][i][3] = now;
        fs[gracefulQueue][i][4] = now;
      }
    }
    retry();
  }
  function retry() {
    clearTimeout(retryTimer);
    retryTimer = undefined;
    if (fs[gracefulQueue].length === 0)
      return;
    var elem = fs[gracefulQueue].shift();
    var fn = elem[0];
    var args = elem[1];
    var err = elem[2];
    var startTime = elem[3];
    var lastTime = elem[4];
    if (startTime === undefined) {
      debug("RETRY", fn.name, args);
      fn.apply(null, args);
    } else if (Date.now() - startTime >= 60000) {
      debug("TIMEOUT", fn.name, args);
      var cb = args.pop();
      if (typeof cb === "function")
        cb.call(null, err);
    } else {
      var sinceAttempt = Date.now() - lastTime;
      var sinceStart = Math.max(lastTime - startTime, 1);
      var desiredDelay = Math.min(sinceStart * 1.2, 100);
      if (sinceAttempt >= desiredDelay) {
        debug("RETRY", fn.name, args);
        fn.apply(null, args.concat([startTime]));
      } else {
        fs[gracefulQueue].push(elem);
      }
    }
    if (retryTimer === undefined) {
      retryTimer = setTimeout(retry, 0);
    }
  }
});

// ../../cli/node_modules/retry/lib/retry_operation.js
var require_retry_operation = __commonJS((exports, module) => {
  function RetryOperation(timeouts, options) {
    if (typeof options === "boolean") {
      options = { forever: options };
    }
    this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
    this._timeouts = timeouts;
    this._options = options || {};
    this._maxRetryTime = options && options.maxRetryTime || Infinity;
    this._fn = null;
    this._errors = [];
    this._attempts = 1;
    this._operationTimeout = null;
    this._operationTimeoutCb = null;
    this._timeout = null;
    this._operationStart = null;
    if (this._options.forever) {
      this._cachedTimeouts = this._timeouts.slice(0);
    }
  }
  module.exports = RetryOperation;
  RetryOperation.prototype.reset = function() {
    this._attempts = 1;
    this._timeouts = this._originalTimeouts;
  };
  RetryOperation.prototype.stop = function() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeouts = [];
    this._cachedTimeouts = null;
  };
  RetryOperation.prototype.retry = function(err) {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    if (!err) {
      return false;
    }
    var currentTime = new Date().getTime();
    if (err && currentTime - this._operationStart >= this._maxRetryTime) {
      this._errors.unshift(new Error("RetryOperation timeout occurred"));
      return false;
    }
    this._errors.push(err);
    var timeout = this._timeouts.shift();
    if (timeout === undefined) {
      if (this._cachedTimeouts) {
        this._errors.splice(this._errors.length - 1, this._errors.length);
        this._timeouts = this._cachedTimeouts.slice(0);
        timeout = this._timeouts.shift();
      } else {
        return false;
      }
    }
    var self = this;
    var timer = setTimeout(function() {
      self._attempts++;
      if (self._operationTimeoutCb) {
        self._timeout = setTimeout(function() {
          self._operationTimeoutCb(self._attempts);
        }, self._operationTimeout);
        if (self._options.unref) {
          self._timeout.unref();
        }
      }
      self._fn(self._attempts);
    }, timeout);
    if (this._options.unref) {
      timer.unref();
    }
    return true;
  };
  RetryOperation.prototype.attempt = function(fn, timeoutOps) {
    this._fn = fn;
    if (timeoutOps) {
      if (timeoutOps.timeout) {
        this._operationTimeout = timeoutOps.timeout;
      }
      if (timeoutOps.cb) {
        this._operationTimeoutCb = timeoutOps.cb;
      }
    }
    var self = this;
    if (this._operationTimeoutCb) {
      this._timeout = setTimeout(function() {
        self._operationTimeoutCb();
      }, self._operationTimeout);
    }
    this._operationStart = new Date().getTime();
    this._fn(this._attempts);
  };
  RetryOperation.prototype.try = function(fn) {
    console.log("Using RetryOperation.try() is deprecated");
    this.attempt(fn);
  };
  RetryOperation.prototype.start = function(fn) {
    console.log("Using RetryOperation.start() is deprecated");
    this.attempt(fn);
  };
  RetryOperation.prototype.start = RetryOperation.prototype.try;
  RetryOperation.prototype.errors = function() {
    return this._errors;
  };
  RetryOperation.prototype.attempts = function() {
    return this._attempts;
  };
  RetryOperation.prototype.mainError = function() {
    if (this._errors.length === 0) {
      return null;
    }
    var counts = {};
    var mainError = null;
    var mainErrorCount = 0;
    for (var i = 0;i < this._errors.length; i++) {
      var error = this._errors[i];
      var message = error.message;
      var count = (counts[message] || 0) + 1;
      counts[message] = count;
      if (count >= mainErrorCount) {
        mainError = error;
        mainErrorCount = count;
      }
    }
    return mainError;
  };
});

// ../../cli/node_modules/retry/lib/retry.js
var require_retry = __commonJS((exports) => {
  var RetryOperation = require_retry_operation();
  exports.operation = function(options) {
    var timeouts = exports.timeouts(options);
    return new RetryOperation(timeouts, {
      forever: options && options.forever,
      unref: options && options.unref,
      maxRetryTime: options && options.maxRetryTime
    });
  };
  exports.timeouts = function(options) {
    if (options instanceof Array) {
      return [].concat(options);
    }
    var opts = {
      retries: 10,
      factor: 2,
      minTimeout: 1 * 1000,
      maxTimeout: Infinity,
      randomize: false
    };
    for (var key in options) {
      opts[key] = options[key];
    }
    if (opts.minTimeout > opts.maxTimeout) {
      throw new Error("minTimeout is greater than maxTimeout");
    }
    var timeouts = [];
    for (var i = 0;i < opts.retries; i++) {
      timeouts.push(this.createTimeout(i, opts));
    }
    if (options && options.forever && !timeouts.length) {
      timeouts.push(this.createTimeout(i, opts));
    }
    timeouts.sort(function(a, b) {
      return a - b;
    });
    return timeouts;
  };
  exports.createTimeout = function(attempt, opts) {
    var random = opts.randomize ? Math.random() + 1 : 1;
    var timeout = Math.round(random * opts.minTimeout * Math.pow(opts.factor, attempt));
    timeout = Math.min(timeout, opts.maxTimeout);
    return timeout;
  };
  exports.wrap = function(obj, options, methods) {
    if (options instanceof Array) {
      methods = options;
      options = null;
    }
    if (!methods) {
      methods = [];
      for (var key in obj) {
        if (typeof obj[key] === "function") {
          methods.push(key);
        }
      }
    }
    for (var i = 0;i < methods.length; i++) {
      var method = methods[i];
      var original = obj[method];
      obj[method] = function retryWrapper(original2) {
        var op = exports.operation(options);
        var args = Array.prototype.slice.call(arguments, 1);
        var callback = args.pop();
        args.push(function(err) {
          if (op.retry(err)) {
            return;
          }
          if (err) {
            arguments[0] = op.mainError();
          }
          callback.apply(this, arguments);
        });
        op.attempt(function() {
          original2.apply(obj, args);
        });
      }.bind(obj, original);
      obj[method].options = options;
    }
  };
});

// ../../cli/node_modules/signal-exit/signals.js
var require_signals = __commonJS((exports, module) => {
  module.exports = [
    "SIGABRT",
    "SIGALRM",
    "SIGHUP",
    "SIGINT",
    "SIGTERM"
  ];
  if (process.platform !== "win32") {
    module.exports.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
  }
  if (process.platform === "linux") {
    module.exports.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
  }
});

// ../../cli/node_modules/signal-exit/index.js
var require_signal_exit = __commonJS((exports, module) => {
  var process2 = global.process;
  var processOk = function(process3) {
    return process3 && typeof process3 === "object" && typeof process3.removeListener === "function" && typeof process3.emit === "function" && typeof process3.reallyExit === "function" && typeof process3.listeners === "function" && typeof process3.kill === "function" && typeof process3.pid === "number" && typeof process3.on === "function";
  };
  if (!processOk(process2)) {
    module.exports = function() {
      return function() {};
    };
  } else {
    assert = __require("assert");
    signals = require_signals();
    isWin = /^win/i.test(process2.platform);
    EE = __require("events");
    if (typeof EE !== "function") {
      EE = EE.EventEmitter;
    }
    if (process2.__signal_exit_emitter__) {
      emitter = process2.__signal_exit_emitter__;
    } else {
      emitter = process2.__signal_exit_emitter__ = new EE;
      emitter.count = 0;
      emitter.emitted = {};
    }
    if (!emitter.infinite) {
      emitter.setMaxListeners(Infinity);
      emitter.infinite = true;
    }
    module.exports = function(cb, opts) {
      if (!processOk(global.process)) {
        return function() {};
      }
      assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
      if (loaded === false) {
        load();
      }
      var ev = "exit";
      if (opts && opts.alwaysLast) {
        ev = "afterexit";
      }
      var remove = function() {
        emitter.removeListener(ev, cb);
        if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
          unload();
        }
      };
      emitter.on(ev, cb);
      return remove;
    };
    unload = function unload2() {
      if (!loaded || !processOk(global.process)) {
        return;
      }
      loaded = false;
      signals.forEach(function(sig) {
        try {
          process2.removeListener(sig, sigListeners[sig]);
        } catch (er) {}
      });
      process2.emit = originalProcessEmit;
      process2.reallyExit = originalProcessReallyExit;
      emitter.count -= 1;
    };
    module.exports.unload = unload;
    emit = function emit2(event, code, signal) {
      if (emitter.emitted[event]) {
        return;
      }
      emitter.emitted[event] = true;
      emitter.emit(event, code, signal);
    };
    sigListeners = {};
    signals.forEach(function(sig) {
      sigListeners[sig] = function listener() {
        if (!processOk(global.process)) {
          return;
        }
        var listeners = process2.listeners(sig);
        if (listeners.length === emitter.count) {
          unload();
          emit("exit", null, sig);
          emit("afterexit", null, sig);
          if (isWin && sig === "SIGHUP") {
            sig = "SIGINT";
          }
          process2.kill(process2.pid, sig);
        }
      };
    });
    module.exports.signals = function() {
      return signals;
    };
    loaded = false;
    load = function load2() {
      if (loaded || !processOk(global.process)) {
        return;
      }
      loaded = true;
      emitter.count += 1;
      signals = signals.filter(function(sig) {
        try {
          process2.on(sig, sigListeners[sig]);
          return true;
        } catch (er) {
          return false;
        }
      });
      process2.emit = processEmit;
      process2.reallyExit = processReallyExit;
    };
    module.exports.load = load;
    originalProcessReallyExit = process2.reallyExit;
    processReallyExit = function processReallyExit2(code) {
      if (!processOk(global.process)) {
        return;
      }
      process2.exitCode = code || 0;
      emit("exit", process2.exitCode, null);
      emit("afterexit", process2.exitCode, null);
      originalProcessReallyExit.call(process2, process2.exitCode);
    };
    originalProcessEmit = process2.emit;
    processEmit = function processEmit2(ev, arg) {
      if (ev === "exit" && processOk(global.process)) {
        if (arg !== undefined) {
          process2.exitCode = arg;
        }
        var ret = originalProcessEmit.apply(this, arguments);
        emit("exit", process2.exitCode, null);
        emit("afterexit", process2.exitCode, null);
        return ret;
      } else {
        return originalProcessEmit.apply(this, arguments);
      }
    };
  }
  var assert;
  var signals;
  var isWin;
  var EE;
  var emitter;
  var unload;
  var emit;
  var sigListeners;
  var loaded;
  var load;
  var originalProcessReallyExit;
  var processReallyExit;
  var originalProcessEmit;
  var processEmit;
});

// ../../cli/node_modules/proper-lockfile/lib/mtime-precision.js
var require_mtime_precision = __commonJS((exports, module) => {
  var cacheSymbol = Symbol();
  function probe(file, fs, callback) {
    const cachedPrecision = fs[cacheSymbol];
    if (cachedPrecision) {
      return fs.stat(file, (err, stat) => {
        if (err) {
          return callback(err);
        }
        callback(null, stat.mtime, cachedPrecision);
      });
    }
    const mtime = new Date(Math.ceil(Date.now() / 1000) * 1000 + 5);
    fs.utimes(file, mtime, mtime, (err) => {
      if (err) {
        return callback(err);
      }
      fs.stat(file, (err2, stat) => {
        if (err2) {
          return callback(err2);
        }
        const precision = stat.mtime.getTime() % 1000 === 0 ? "s" : "ms";
        Object.defineProperty(fs, cacheSymbol, { value: precision });
        callback(null, stat.mtime, precision);
      });
    });
  }
  function getMtime(precision) {
    let now = Date.now();
    if (precision === "s") {
      now = Math.ceil(now / 1000) * 1000;
    }
    return new Date(now);
  }
  exports.probe = probe;
  exports.getMtime = getMtime;
});

// ../../cli/node_modules/proper-lockfile/lib/lockfile.js
var require_lockfile = __commonJS((exports, module) => {
  var path = __require("path");
  var fs = require_graceful_fs();
  var retry = require_retry();
  var onExit = require_signal_exit();
  var mtimePrecision = require_mtime_precision();
  var locks = {};
  function getLockFile(file, options) {
    return options.lockfilePath || `${file}.lock`;
  }
  function resolveCanonicalPath(file, options, callback) {
    if (!options.realpath) {
      return callback(null, path.resolve(file));
    }
    options.fs.realpath(file, callback);
  }
  function acquireLock(file, options, callback) {
    const lockfilePath = getLockFile(file, options);
    options.fs.mkdir(lockfilePath, (err) => {
      if (!err) {
        return mtimePrecision.probe(lockfilePath, options.fs, (err2, mtime, mtimePrecision2) => {
          if (err2) {
            options.fs.rmdir(lockfilePath, () => {});
            return callback(err2);
          }
          callback(null, mtime, mtimePrecision2);
        });
      }
      if (err.code !== "EEXIST") {
        return callback(err);
      }
      if (options.stale <= 0) {
        return callback(Object.assign(new Error("Lock file is already being held"), { code: "ELOCKED", file }));
      }
      options.fs.stat(lockfilePath, (err2, stat) => {
        if (err2) {
          if (err2.code === "ENOENT") {
            return acquireLock(file, { ...options, stale: 0 }, callback);
          }
          return callback(err2);
        }
        if (!isLockStale(stat, options)) {
          return callback(Object.assign(new Error("Lock file is already being held"), { code: "ELOCKED", file }));
        }
        removeLock(file, options, (err3) => {
          if (err3) {
            return callback(err3);
          }
          acquireLock(file, { ...options, stale: 0 }, callback);
        });
      });
    });
  }
  function isLockStale(stat, options) {
    return stat.mtime.getTime() < Date.now() - options.stale;
  }
  function removeLock(file, options, callback) {
    options.fs.rmdir(getLockFile(file, options), (err) => {
      if (err && err.code !== "ENOENT") {
        return callback(err);
      }
      callback();
    });
  }
  function updateLock(file, options) {
    const lock2 = locks[file];
    if (lock2.updateTimeout) {
      return;
    }
    lock2.updateDelay = lock2.updateDelay || options.update;
    lock2.updateTimeout = setTimeout(() => {
      lock2.updateTimeout = null;
      options.fs.stat(lock2.lockfilePath, (err, stat) => {
        const isOverThreshold = lock2.lastUpdate + options.stale < Date.now();
        if (err) {
          if (err.code === "ENOENT" || isOverThreshold) {
            return setLockAsCompromised(file, lock2, Object.assign(err, { code: "ECOMPROMISED" }));
          }
          lock2.updateDelay = 1000;
          return updateLock(file, options);
        }
        const isMtimeOurs = lock2.mtime.getTime() === stat.mtime.getTime();
        if (!isMtimeOurs) {
          return setLockAsCompromised(file, lock2, Object.assign(new Error("Unable to update lock within the stale threshold"), { code: "ECOMPROMISED" }));
        }
        const mtime = mtimePrecision.getMtime(lock2.mtimePrecision);
        options.fs.utimes(lock2.lockfilePath, mtime, mtime, (err2) => {
          const isOverThreshold2 = lock2.lastUpdate + options.stale < Date.now();
          if (lock2.released) {
            return;
          }
          if (err2) {
            if (err2.code === "ENOENT" || isOverThreshold2) {
              return setLockAsCompromised(file, lock2, Object.assign(err2, { code: "ECOMPROMISED" }));
            }
            lock2.updateDelay = 1000;
            return updateLock(file, options);
          }
          lock2.mtime = mtime;
          lock2.lastUpdate = Date.now();
          lock2.updateDelay = null;
          updateLock(file, options);
        });
      });
    }, lock2.updateDelay);
    if (lock2.updateTimeout.unref) {
      lock2.updateTimeout.unref();
    }
  }
  function setLockAsCompromised(file, lock2, err) {
    lock2.released = true;
    if (lock2.updateTimeout) {
      clearTimeout(lock2.updateTimeout);
    }
    if (locks[file] === lock2) {
      delete locks[file];
    }
    lock2.options.onCompromised(err);
  }
  function lock(file, options, callback) {
    options = {
      stale: 1e4,
      update: null,
      realpath: true,
      retries: 0,
      fs,
      onCompromised: (err) => {
        throw err;
      },
      ...options
    };
    options.retries = options.retries || 0;
    options.retries = typeof options.retries === "number" ? { retries: options.retries } : options.retries;
    options.stale = Math.max(options.stale || 0, 2000);
    options.update = options.update == null ? options.stale / 2 : options.update || 0;
    options.update = Math.max(Math.min(options.update, options.stale / 2), 1000);
    resolveCanonicalPath(file, options, (err, file2) => {
      if (err) {
        return callback(err);
      }
      const operation = retry.operation(options.retries);
      operation.attempt(() => {
        acquireLock(file2, options, (err2, mtime, mtimePrecision2) => {
          if (operation.retry(err2)) {
            return;
          }
          if (err2) {
            return callback(operation.mainError());
          }
          const lock2 = locks[file2] = {
            lockfilePath: getLockFile(file2, options),
            mtime,
            mtimePrecision: mtimePrecision2,
            options,
            lastUpdate: Date.now()
          };
          updateLock(file2, options);
          callback(null, (releasedCallback) => {
            if (lock2.released) {
              return releasedCallback && releasedCallback(Object.assign(new Error("Lock is already released"), { code: "ERELEASED" }));
            }
            unlock(file2, { ...options, realpath: false }, releasedCallback);
          });
        });
      });
    });
  }
  function unlock(file, options, callback) {
    options = {
      fs,
      realpath: true,
      ...options
    };
    resolveCanonicalPath(file, options, (err, file2) => {
      if (err) {
        return callback(err);
      }
      const lock2 = locks[file2];
      if (!lock2) {
        return callback(Object.assign(new Error("Lock is not acquired/owned by you"), { code: "ENOTACQUIRED" }));
      }
      lock2.updateTimeout && clearTimeout(lock2.updateTimeout);
      lock2.released = true;
      delete locks[file2];
      removeLock(file2, options, callback);
    });
  }
  function check(file, options, callback) {
    options = {
      stale: 1e4,
      realpath: true,
      fs,
      ...options
    };
    options.stale = Math.max(options.stale || 0, 2000);
    resolveCanonicalPath(file, options, (err, file2) => {
      if (err) {
        return callback(err);
      }
      options.fs.stat(getLockFile(file2, options), (err2, stat) => {
        if (err2) {
          return err2.code === "ENOENT" ? callback(null, false) : callback(err2);
        }
        return callback(null, !isLockStale(stat, options));
      });
    });
  }
  function getLocks() {
    return locks;
  }
  onExit(() => {
    for (const file in locks) {
      const options = locks[file].options;
      try {
        options.fs.rmdirSync(getLockFile(file, options));
      } catch (e) {}
    }
  });
  exports.lock = lock;
  exports.unlock = unlock;
  exports.check = check;
  exports.getLocks = getLocks;
});

// ../../cli/node_modules/proper-lockfile/lib/adapter.js
var require_adapter = __commonJS((exports, module) => {
  var fs = require_graceful_fs();
  function createSyncFs(fs2) {
    const methods = ["mkdir", "realpath", "stat", "rmdir", "utimes"];
    const newFs = { ...fs2 };
    methods.forEach((method) => {
      newFs[method] = (...args) => {
        const callback = args.pop();
        let ret;
        try {
          ret = fs2[`${method}Sync`](...args);
        } catch (err) {
          return callback(err);
        }
        callback(null, ret);
      };
    });
    return newFs;
  }
  function toPromise(method) {
    return (...args) => new Promise((resolve, reject) => {
      args.push((err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
      method(...args);
    });
  }
  function toSync(method) {
    return (...args) => {
      let err;
      let result;
      args.push((_err, _result) => {
        err = _err;
        result = _result;
      });
      method(...args);
      if (err) {
        throw err;
      }
      return result;
    };
  }
  function toSyncOptions(options) {
    options = { ...options };
    options.fs = createSyncFs(options.fs || fs);
    if (typeof options.retries === "number" && options.retries > 0 || options.retries && typeof options.retries.retries === "number" && options.retries.retries > 0) {
      throw Object.assign(new Error("Cannot use retries with the sync api"), { code: "ESYNC" });
    }
    return options;
  }
  module.exports = {
    toPromise,
    toSync,
    toSyncOptions
  };
});

// ../../cli/node_modules/proper-lockfile/index.js
var require_proper_lockfile = __commonJS((exports, module) => {
  var lockfile = require_lockfile();
  var { toPromise, toSync, toSyncOptions } = require_adapter();
  async function lock(file, options) {
    const release = await toPromise(lockfile.lock)(file, options);
    return toPromise(release);
  }
  function lockSync(file, options) {
    const release = toSync(lockfile.lock)(file, toSyncOptions(options));
    return toSync(release);
  }
  function unlock(file, options) {
    return toPromise(lockfile.unlock)(file, options);
  }
  function unlockSync(file, options) {
    return toSync(lockfile.unlock)(file, toSyncOptions(options));
  }
  function check(file, options) {
    return toPromise(lockfile.check)(file, options);
  }
  function checkSync(file, options) {
    return toSync(lockfile.check)(file, toSyncOptions(options));
  }
  module.exports = lock;
  module.exports.lock = lock;
  module.exports.unlock = unlock;
  module.exports.lockSync = lockSync;
  module.exports.unlockSync = unlockSync;
  module.exports.check = check;
  module.exports.checkSync = checkSync;
});

// ../../cli/node_modules/semver/internal/constants.js
var require_constants = __commonJS((exports, module) => {
  var SEMVER_SPEC_VERSION = "2.0.0";
  var MAX_LENGTH = 256;
  var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
  var MAX_SAFE_COMPONENT_LENGTH = 16;
  var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
  var RELEASE_TYPES = [
    "major",
    "premajor",
    "minor",
    "preminor",
    "patch",
    "prepatch",
    "prerelease"
  ];
  module.exports = {
    MAX_LENGTH,
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_BUILD_LENGTH,
    MAX_SAFE_INTEGER,
    RELEASE_TYPES,
    SEMVER_SPEC_VERSION,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  };
});

// ../../cli/node_modules/semver/internal/debug.js
var require_debug = __commonJS((exports, module) => {
  var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {};
  module.exports = debug;
});

// ../../cli/node_modules/semver/internal/re.js
var require_re = __commonJS((exports, module) => {
  var {
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_BUILD_LENGTH,
    MAX_LENGTH
  } = require_constants();
  var debug = require_debug();
  exports = module.exports = {};
  var re = exports.re = [];
  var safeRe = exports.safeRe = [];
  var src = exports.src = [];
  var safeSrc = exports.safeSrc = [];
  var t = exports.t = {};
  var R = 0;
  var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
  var safeRegexReplacements = [
    ["\\s", 1],
    ["\\d", MAX_LENGTH],
    [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
  ];
  var makeSafeRegex = (value) => {
    for (const [token, max2] of safeRegexReplacements) {
      value = value.split(`${token}*`).join(`${token}{0,${max2}}`).split(`${token}+`).join(`${token}{1,${max2}}`);
    }
    return value;
  };
  var createToken = (name, value, isGlobal) => {
    const safe = makeSafeRegex(value);
    const index = R++;
    debug(name, index, value);
    t[name] = index;
    src[index] = value;
    safeSrc[index] = safe;
    re[index] = new RegExp(value, isGlobal ? "g" : undefined);
    safeRe[index] = new RegExp(safe, isGlobal ? "g" : undefined);
  };
  createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
  createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
  createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
  createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})`);
  createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
  createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
  createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
  createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
  createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
  createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
  createToken("FULL", `^${src[t.FULLPLAIN]}$`);
  createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
  createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
  createToken("GTLT", "((?:<|>)?=?)");
  createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
  createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
  createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?` + `)?)?`);
  createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?` + `)?)?`);
  createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
  createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
  createToken("COERCEPLAIN", `${"(^|[^\\d])" + "(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
  createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
  createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?` + `(?:${src[t.BUILD]})?` + `(?:$|[^\\d])`);
  createToken("COERCERTL", src[t.COERCE], true);
  createToken("COERCERTLFULL", src[t.COERCEFULL], true);
  createToken("LONETILDE", "(?:~>?)");
  createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
  exports.tildeTrimReplace = "$1~";
  createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
  createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
  createToken("LONECARET", "(?:\\^)");
  createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
  exports.caretTrimReplace = "$1^";
  createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
  createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
  createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
  createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
  createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
  exports.comparatorTrimReplace = "$1$2$3";
  createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAIN]})` + `\\s*$`);
  createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAINLOOSE]})` + `\\s*$`);
  createToken("STAR", "(<|>)?=?\\s*\\*");
  createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
  createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
});

// ../../cli/node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS((exports, module) => {
  var looseOption = Object.freeze({ loose: true });
  var emptyOpts = Object.freeze({});
  var parseOptions = (options) => {
    if (!options) {
      return emptyOpts;
    }
    if (typeof options !== "object") {
      return looseOption;
    }
    return options;
  };
  module.exports = parseOptions;
});

// ../../cli/node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS((exports, module) => {
  var numeric = /^[0-9]+$/;
  var compareIdentifiers = (a, b) => {
    if (typeof a === "number" && typeof b === "number") {
      return a === b ? 0 : a < b ? -1 : 1;
    }
    const anum = numeric.test(a);
    const bnum = numeric.test(b);
    if (anum && bnum) {
      a = +a;
      b = +b;
    }
    return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
  };
  var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
  module.exports = {
    compareIdentifiers,
    rcompareIdentifiers
  };
});

// ../../cli/node_modules/semver/classes/semver.js
var require_semver = __commonJS((exports, module) => {
  var debug = require_debug();
  var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
  var { safeRe: re, t } = require_re();
  var parseOptions = require_parse_options();
  var { compareIdentifiers } = require_identifiers();

  class SemVer {
    constructor(version, options) {
      options = parseOptions(options);
      if (version instanceof SemVer) {
        if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
          return version;
        } else {
          version = version.version;
        }
      } else if (typeof version !== "string") {
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
      }
      if (version.length > MAX_LENGTH) {
        throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
      }
      debug("SemVer", version, options);
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
      if (!m) {
        throw new TypeError(`Invalid Version: ${version}`);
      }
      this.raw = version;
      this.major = +m[1];
      this.minor = +m[2];
      this.patch = +m[3];
      if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
        throw new TypeError("Invalid major version");
      }
      if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
        throw new TypeError("Invalid minor version");
      }
      if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
        throw new TypeError("Invalid patch version");
      }
      if (!m[4]) {
        this.prerelease = [];
      } else {
        this.prerelease = m[4].split(".").map((id) => {
          if (/^[0-9]+$/.test(id)) {
            const num = +id;
            if (num >= 0 && num < MAX_SAFE_INTEGER) {
              return num;
            }
          }
          return id;
        });
      }
      this.build = m[5] ? m[5].split(".") : [];
      this.format();
    }
    format() {
      this.version = `${this.major}.${this.minor}.${this.patch}`;
      if (this.prerelease.length) {
        this.version += `-${this.prerelease.join(".")}`;
      }
      return this.version;
    }
    toString() {
      return this.version;
    }
    compare(other) {
      debug("SemVer.compare", this.version, this.options, other);
      if (!(other instanceof SemVer)) {
        if (typeof other === "string" && other === this.version) {
          return 0;
        }
        other = new SemVer(other, this.options);
      }
      if (other.version === this.version) {
        return 0;
      }
      return this.compareMain(other) || this.comparePre(other);
    }
    compareMain(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      if (this.major < other.major) {
        return -1;
      }
      if (this.major > other.major) {
        return 1;
      }
      if (this.minor < other.minor) {
        return -1;
      }
      if (this.minor > other.minor) {
        return 1;
      }
      if (this.patch < other.patch) {
        return -1;
      }
      if (this.patch > other.patch) {
        return 1;
      }
      return 0;
    }
    comparePre(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      if (this.prerelease.length && !other.prerelease.length) {
        return -1;
      } else if (!this.prerelease.length && other.prerelease.length) {
        return 1;
      } else if (!this.prerelease.length && !other.prerelease.length) {
        return 0;
      }
      let i2 = 0;
      do {
        const a = this.prerelease[i2];
        const b = other.prerelease[i2];
        debug("prerelease compare", i2, a, b);
        if (a === undefined && b === undefined) {
          return 0;
        } else if (b === undefined) {
          return 1;
        } else if (a === undefined) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i2);
    }
    compareBuild(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      let i2 = 0;
      do {
        const a = this.build[i2];
        const b = other.build[i2];
        debug("build compare", i2, a, b);
        if (a === undefined && b === undefined) {
          return 0;
        } else if (b === undefined) {
          return 1;
        } else if (a === undefined) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i2);
    }
    inc(release, identifier, identifierBase) {
      if (release.startsWith("pre")) {
        if (!identifier && identifierBase === false) {
          throw new Error("invalid increment argument: identifier is empty");
        }
        if (identifier) {
          const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
          if (!match || match[1] !== identifier) {
            throw new Error(`invalid identifier: ${identifier}`);
          }
        }
      }
      switch (release) {
        case "premajor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor = 0;
          this.major++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "preminor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "prepatch":
          this.prerelease.length = 0;
          this.inc("patch", identifier, identifierBase);
          this.inc("pre", identifier, identifierBase);
          break;
        case "prerelease":
          if (this.prerelease.length === 0) {
            this.inc("patch", identifier, identifierBase);
          }
          this.inc("pre", identifier, identifierBase);
          break;
        case "release":
          if (this.prerelease.length === 0) {
            throw new Error(`version ${this.raw} is not a prerelease`);
          }
          this.prerelease.length = 0;
          break;
        case "major":
          if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
            this.major++;
          }
          this.minor = 0;
          this.patch = 0;
          this.prerelease = [];
          break;
        case "minor":
          if (this.patch !== 0 || this.prerelease.length === 0) {
            this.minor++;
          }
          this.patch = 0;
          this.prerelease = [];
          break;
        case "patch":
          if (this.prerelease.length === 0) {
            this.patch++;
          }
          this.prerelease = [];
          break;
        case "pre": {
          const base = Number(identifierBase) ? 1 : 0;
          if (this.prerelease.length === 0) {
            this.prerelease = [base];
          } else {
            let i2 = this.prerelease.length;
            while (--i2 >= 0) {
              if (typeof this.prerelease[i2] === "number") {
                this.prerelease[i2]++;
                i2 = -2;
              }
            }
            if (i2 === -1) {
              if (identifier === this.prerelease.join(".") && identifierBase === false) {
                throw new Error("invalid increment argument: identifier already exists");
              }
              this.prerelease.push(base);
            }
          }
          if (identifier) {
            let prerelease = [identifier, base];
            if (identifierBase === false) {
              prerelease = [identifier];
            }
            if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
              if (isNaN(this.prerelease[1])) {
                this.prerelease = prerelease;
              }
            } else {
              this.prerelease = prerelease;
            }
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${release}`);
      }
      this.raw = this.format();
      if (this.build.length) {
        this.raw += `+${this.build.join(".")}`;
      }
      return this;
    }
  }
  module.exports = SemVer;
});

// ../../cli/node_modules/semver/functions/parse.js
var require_parse = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var parse = (version, options, throwErrors = false) => {
    if (version instanceof SemVer) {
      return version;
    }
    try {
      return new SemVer(version, options);
    } catch (er) {
      if (!throwErrors) {
        return null;
      }
      throw er;
    }
  };
  module.exports = parse;
});

// ../../cli/node_modules/semver/functions/valid.js
var require_valid = __commonJS((exports, module) => {
  var parse = require_parse();
  var valid = (version, options) => {
    const v = parse(version, options);
    return v ? v.version : null;
  };
  module.exports = valid;
});

// ../../cli/node_modules/semver/functions/clean.js
var require_clean = __commonJS((exports, module) => {
  var parse = require_parse();
  var clean = (version, options) => {
    const s = parse(version.trim().replace(/^[=v]+/, ""), options);
    return s ? s.version : null;
  };
  module.exports = clean;
});

// ../../cli/node_modules/semver/functions/inc.js
var require_inc = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var inc = (version, release, options, identifier, identifierBase) => {
    if (typeof options === "string") {
      identifierBase = identifier;
      identifier = options;
      options = undefined;
    }
    try {
      return new SemVer(version instanceof SemVer ? version.version : version, options).inc(release, identifier, identifierBase).version;
    } catch (er) {
      return null;
    }
  };
  module.exports = inc;
});

// ../../cli/node_modules/semver/functions/diff.js
var require_diff = __commonJS((exports, module) => {
  var parse = require_parse();
  var diff = (version1, version2) => {
    const v1 = parse(version1, null, true);
    const v2 = parse(version2, null, true);
    const comparison = v1.compare(v2);
    if (comparison === 0) {
      return null;
    }
    const v1Higher = comparison > 0;
    const highVersion = v1Higher ? v1 : v2;
    const lowVersion = v1Higher ? v2 : v1;
    const highHasPre = !!highVersion.prerelease.length;
    const lowHasPre = !!lowVersion.prerelease.length;
    if (lowHasPre && !highHasPre) {
      if (!lowVersion.patch && !lowVersion.minor) {
        return "major";
      }
      if (lowVersion.compareMain(highVersion) === 0) {
        if (lowVersion.minor && !lowVersion.patch) {
          return "minor";
        }
        return "patch";
      }
    }
    const prefix = highHasPre ? "pre" : "";
    if (v1.major !== v2.major) {
      return prefix + "major";
    }
    if (v1.minor !== v2.minor) {
      return prefix + "minor";
    }
    if (v1.patch !== v2.patch) {
      return prefix + "patch";
    }
    return "prerelease";
  };
  module.exports = diff;
});

// ../../cli/node_modules/semver/functions/major.js
var require_major = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var major = (a, loose) => new SemVer(a, loose).major;
  module.exports = major;
});

// ../../cli/node_modules/semver/functions/minor.js
var require_minor = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var minor = (a, loose) => new SemVer(a, loose).minor;
  module.exports = minor;
});

// ../../cli/node_modules/semver/functions/patch.js
var require_patch = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var patch = (a, loose) => new SemVer(a, loose).patch;
  module.exports = patch;
});

// ../../cli/node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS((exports, module) => {
  var parse = require_parse();
  var prerelease = (version, options) => {
    const parsed = parse(version, options);
    return parsed && parsed.prerelease.length ? parsed.prerelease : null;
  };
  module.exports = prerelease;
});

// ../../cli/node_modules/semver/functions/compare.js
var require_compare = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
  module.exports = compare;
});

// ../../cli/node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS((exports, module) => {
  var compare = require_compare();
  var rcompare = (a, b, loose) => compare(b, a, loose);
  module.exports = rcompare;
});

// ../../cli/node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS((exports, module) => {
  var compare = require_compare();
  var compareLoose = (a, b) => compare(a, b, true);
  module.exports = compareLoose;
});

// ../../cli/node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var compareBuild = (a, b, loose) => {
    const versionA = new SemVer(a, loose);
    const versionB = new SemVer(b, loose);
    return versionA.compare(versionB) || versionA.compareBuild(versionB);
  };
  module.exports = compareBuild;
});

// ../../cli/node_modules/semver/functions/sort.js
var require_sort = __commonJS((exports, module) => {
  var compareBuild = require_compare_build();
  var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
  module.exports = sort;
});

// ../../cli/node_modules/semver/functions/rsort.js
var require_rsort = __commonJS((exports, module) => {
  var compareBuild = require_compare_build();
  var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
  module.exports = rsort;
});

// ../../cli/node_modules/semver/functions/gt.js
var require_gt = __commonJS((exports, module) => {
  var compare = require_compare();
  var gt = (a, b, loose) => compare(a, b, loose) > 0;
  module.exports = gt;
});

// ../../cli/node_modules/semver/functions/lt.js
var require_lt = __commonJS((exports, module) => {
  var compare = require_compare();
  var lt = (a, b, loose) => compare(a, b, loose) < 0;
  module.exports = lt;
});

// ../../cli/node_modules/semver/functions/eq.js
var require_eq = __commonJS((exports, module) => {
  var compare = require_compare();
  var eq = (a, b, loose) => compare(a, b, loose) === 0;
  module.exports = eq;
});

// ../../cli/node_modules/semver/functions/neq.js
var require_neq = __commonJS((exports, module) => {
  var compare = require_compare();
  var neq = (a, b, loose) => compare(a, b, loose) !== 0;
  module.exports = neq;
});

// ../../cli/node_modules/semver/functions/gte.js
var require_gte = __commonJS((exports, module) => {
  var compare = require_compare();
  var gte = (a, b, loose) => compare(a, b, loose) >= 0;
  module.exports = gte;
});

// ../../cli/node_modules/semver/functions/lte.js
var require_lte = __commonJS((exports, module) => {
  var compare = require_compare();
  var lte = (a, b, loose) => compare(a, b, loose) <= 0;
  module.exports = lte;
});

// ../../cli/node_modules/semver/functions/cmp.js
var require_cmp = __commonJS((exports, module) => {
  var eq = require_eq();
  var neq = require_neq();
  var gt = require_gt();
  var gte = require_gte();
  var lt = require_lt();
  var lte = require_lte();
  var cmp = (a, op, b, loose) => {
    switch (op) {
      case "===":
        if (typeof a === "object") {
          a = a.version;
        }
        if (typeof b === "object") {
          b = b.version;
        }
        return a === b;
      case "!==":
        if (typeof a === "object") {
          a = a.version;
        }
        if (typeof b === "object") {
          b = b.version;
        }
        return a !== b;
      case "":
      case "=":
      case "==":
        return eq(a, b, loose);
      case "!=":
        return neq(a, b, loose);
      case ">":
        return gt(a, b, loose);
      case ">=":
        return gte(a, b, loose);
      case "<":
        return lt(a, b, loose);
      case "<=":
        return lte(a, b, loose);
      default:
        throw new TypeError(`Invalid operator: ${op}`);
    }
  };
  module.exports = cmp;
});

// ../../cli/node_modules/semver/functions/coerce.js
var require_coerce = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var parse = require_parse();
  var { safeRe: re, t } = require_re();
  var coerce2 = (version, options) => {
    if (version instanceof SemVer) {
      return version;
    }
    if (typeof version === "number") {
      version = String(version);
    }
    if (typeof version !== "string") {
      return null;
    }
    options = options || {};
    let match = null;
    if (!options.rtl) {
      match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
    } else {
      const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
      let next;
      while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
        if (!match || next.index + next[0].length !== match.index + match[0].length) {
          match = next;
        }
        coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
      }
      coerceRtlRegex.lastIndex = -1;
    }
    if (match === null) {
      return null;
    }
    const major = match[2];
    const minor = match[3] || "0";
    const patch = match[4] || "0";
    const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
    const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
    return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
  };
  module.exports = coerce2;
});

// ../../cli/node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS((exports, module) => {
  class LRUCache {
    constructor() {
      this.max = 1000;
      this.map = new Map;
    }
    get(key) {
      const value = this.map.get(key);
      if (value === undefined) {
        return;
      } else {
        this.map.delete(key);
        this.map.set(key, value);
        return value;
      }
    }
    delete(key) {
      return this.map.delete(key);
    }
    set(key, value) {
      const deleted = this.delete(key);
      if (!deleted && value !== undefined) {
        if (this.map.size >= this.max) {
          const firstKey = this.map.keys().next().value;
          this.delete(firstKey);
        }
        this.map.set(key, value);
      }
      return this;
    }
  }
  module.exports = LRUCache;
});

// ../../cli/node_modules/semver/classes/range.js
var require_range = __commonJS((exports, module) => {
  var SPACE_CHARACTERS = /\s+/g;

  class Range {
    constructor(range, options) {
      options = parseOptions(options);
      if (range instanceof Range) {
        if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
          return range;
        } else {
          return new Range(range.raw, options);
        }
      }
      if (range instanceof Comparator) {
        this.raw = range.value;
        this.set = [[range]];
        this.formatted = undefined;
        return this;
      }
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
      this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
      if (!this.set.length) {
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      }
      if (this.set.length > 1) {
        const first = this.set[0];
        this.set = this.set.filter((c) => !isNullSet(c[0]));
        if (this.set.length === 0) {
          this.set = [first];
        } else if (this.set.length > 1) {
          for (const c of this.set) {
            if (c.length === 1 && isAny(c[0])) {
              this.set = [c];
              break;
            }
          }
        }
      }
      this.formatted = undefined;
    }
    get range() {
      if (this.formatted === undefined) {
        this.formatted = "";
        for (let i2 = 0;i2 < this.set.length; i2++) {
          if (i2 > 0) {
            this.formatted += "||";
          }
          const comps = this.set[i2];
          for (let k = 0;k < comps.length; k++) {
            if (k > 0) {
              this.formatted += " ";
            }
            this.formatted += comps[k].toString().trim();
          }
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(range) {
      const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
      const memoKey = memoOpts + ":" + range;
      const cached = cache.get(memoKey);
      if (cached) {
        return cached;
      }
      const loose = this.options.loose;
      const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
      range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
      debug("hyphen replace", range);
      range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
      debug("comparator trim", range);
      range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
      debug("tilde trim", range);
      range = range.replace(re[t.CARETTRIM], caretTrimReplace);
      debug("caret trim", range);
      let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
      if (loose) {
        rangeList = rangeList.filter((comp) => {
          debug("loose invalid filter", comp, this.options);
          return !!comp.match(re[t.COMPARATORLOOSE]);
        });
      }
      debug("range list", rangeList);
      const rangeMap = new Map;
      const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
      for (const comp of comparators) {
        if (isNullSet(comp)) {
          return [comp];
        }
        rangeMap.set(comp.value, comp);
      }
      if (rangeMap.size > 1 && rangeMap.has("")) {
        rangeMap.delete("");
      }
      const result = [...rangeMap.values()];
      cache.set(memoKey, result);
      return result;
    }
    intersects(range, options) {
      if (!(range instanceof Range)) {
        throw new TypeError("a Range is required");
      }
      return this.set.some((thisComparators) => {
        return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
          return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
            return rangeComparators.every((rangeComparator) => {
              return thisComparator.intersects(rangeComparator, options);
            });
          });
        });
      });
    }
    test(version) {
      if (!version) {
        return false;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer(version, this.options);
        } catch (er) {
          return false;
        }
      }
      for (let i2 = 0;i2 < this.set.length; i2++) {
        if (testSet(this.set[i2], version, this.options)) {
          return true;
        }
      }
      return false;
    }
  }
  module.exports = Range;
  var LRU = require_lrucache();
  var cache = new LRU;
  var parseOptions = require_parse_options();
  var Comparator = require_comparator();
  var debug = require_debug();
  var SemVer = require_semver();
  var {
    safeRe: re,
    t,
    comparatorTrimReplace,
    tildeTrimReplace,
    caretTrimReplace
  } = require_re();
  var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
  var isNullSet = (c) => c.value === "<0.0.0-0";
  var isAny = (c) => c.value === "";
  var isSatisfiable = (comparators, options) => {
    let result = true;
    const remainingComparators = comparators.slice();
    let testComparator = remainingComparators.pop();
    while (result && remainingComparators.length) {
      result = remainingComparators.every((otherComparator) => {
        return testComparator.intersects(otherComparator, options);
      });
      testComparator = remainingComparators.pop();
    }
    return result;
  };
  var parseComparator = (comp, options) => {
    comp = comp.replace(re[t.BUILD], "");
    debug("comp", comp, options);
    comp = replaceCarets(comp, options);
    debug("caret", comp);
    comp = replaceTildes(comp, options);
    debug("tildes", comp);
    comp = replaceXRanges(comp, options);
    debug("xrange", comp);
    comp = replaceStars(comp, options);
    debug("stars", comp);
    return comp;
  };
  var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
  var replaceTildes = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
  };
  var replaceTilde = (comp, options) => {
    const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
    return comp.replace(r, (_, M, m, p, pr) => {
      debug("tilde", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
      } else if (pr) {
        debug("replaceTilde pr", pr);
        ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
      }
      debug("tilde return", ret);
      return ret;
    });
  };
  var replaceCarets = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
  };
  var replaceCaret = (comp, options) => {
    debug("caret", comp, options);
    const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
    const z = options.includePrerelease ? "-0" : "";
    return comp.replace(r, (_, M, m, p, pr) => {
      debug("caret", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        if (M === "0") {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
        }
      } else if (pr) {
        debug("replaceCaret pr", pr);
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
        }
      } else {
        debug("no pr");
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
        }
      }
      debug("caret return", ret);
      return ret;
    });
  };
  var replaceXRanges = (comp, options) => {
    debug("replaceXRanges", comp, options);
    return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
  };
  var replaceXRange = (comp, options) => {
    comp = comp.trim();
    const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
    return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
      debug("xRange", comp, ret, gtlt, M, m, p, pr);
      const xM = isX(M);
      const xm = xM || isX(m);
      const xp = xm || isX(p);
      const anyX = xp;
      if (gtlt === "=" && anyX) {
        gtlt = "";
      }
      pr = options.includePrerelease ? "-0" : "";
      if (xM) {
        if (gtlt === ">" || gtlt === "<") {
          ret = "<0.0.0-0";
        } else {
          ret = "*";
        }
      } else if (gtlt && anyX) {
        if (xm) {
          m = 0;
        }
        p = 0;
        if (gtlt === ">") {
          gtlt = ">=";
          if (xm) {
            M = +M + 1;
            m = 0;
            p = 0;
          } else {
            m = +m + 1;
            p = 0;
          }
        } else if (gtlt === "<=") {
          gtlt = "<";
          if (xm) {
            M = +M + 1;
          } else {
            m = +m + 1;
          }
        }
        if (gtlt === "<") {
          pr = "-0";
        }
        ret = `${gtlt + M}.${m}.${p}${pr}`;
      } else if (xm) {
        ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
      } else if (xp) {
        ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
      }
      debug("xRange return", ret);
      return ret;
    });
  };
  var replaceStars = (comp, options) => {
    debug("replaceStars", comp, options);
    return comp.trim().replace(re[t.STAR], "");
  };
  var replaceGTE0 = (comp, options) => {
    debug("replaceGTE0", comp, options);
    return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
  };
  var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
    if (isX(fM)) {
      from = "";
    } else if (isX(fm)) {
      from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
    } else if (isX(fp)) {
      from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
    } else if (fpr) {
      from = `>=${from}`;
    } else {
      from = `>=${from}${incPr ? "-0" : ""}`;
    }
    if (isX(tM)) {
      to = "";
    } else if (isX(tm)) {
      to = `<${+tM + 1}.0.0-0`;
    } else if (isX(tp)) {
      to = `<${tM}.${+tm + 1}.0-0`;
    } else if (tpr) {
      to = `<=${tM}.${tm}.${tp}-${tpr}`;
    } else if (incPr) {
      to = `<${tM}.${tm}.${+tp + 1}-0`;
    } else {
      to = `<=${to}`;
    }
    return `${from} ${to}`.trim();
  };
  var testSet = (set, version, options) => {
    for (let i2 = 0;i2 < set.length; i2++) {
      if (!set[i2].test(version)) {
        return false;
      }
    }
    if (version.prerelease.length && !options.includePrerelease) {
      for (let i2 = 0;i2 < set.length; i2++) {
        debug(set[i2].semver);
        if (set[i2].semver === Comparator.ANY) {
          continue;
        }
        if (set[i2].semver.prerelease.length > 0) {
          const allowed = set[i2].semver;
          if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
            return true;
          }
        }
      }
      return false;
    }
    return true;
  };
});

// ../../cli/node_modules/semver/classes/comparator.js
var require_comparator = __commonJS((exports, module) => {
  var ANY = Symbol("SemVer ANY");

  class Comparator {
    static get ANY() {
      return ANY;
    }
    constructor(comp, options) {
      options = parseOptions(options);
      if (comp instanceof Comparator) {
        if (comp.loose === !!options.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      comp = comp.trim().split(/\s+/).join(" ");
      debug("comparator", comp, options);
      this.options = options;
      this.loose = !!options.loose;
      this.parse(comp);
      if (this.semver === ANY) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug("comp", this);
    }
    parse(comp) {
      const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
      const m = comp.match(r);
      if (!m) {
        throw new TypeError(`Invalid comparator: ${comp}`);
      }
      this.operator = m[1] !== undefined ? m[1] : "";
      if (this.operator === "=") {
        this.operator = "";
      }
      if (!m[2]) {
        this.semver = ANY;
      } else {
        this.semver = new SemVer(m[2], this.options.loose);
      }
    }
    toString() {
      return this.value;
    }
    test(version) {
      debug("Comparator.test", version, this.options.loose);
      if (this.semver === ANY || version === ANY) {
        return true;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer(version, this.options);
        } catch (er) {
          return false;
        }
      }
      return cmp(version, this.operator, this.semver, this.options);
    }
    intersects(comp, options) {
      if (!(comp instanceof Comparator)) {
        throw new TypeError("a Comparator is required");
      }
      if (this.operator === "") {
        if (this.value === "") {
          return true;
        }
        return new Range(comp.value, options).test(this.value);
      } else if (comp.operator === "") {
        if (comp.value === "") {
          return true;
        }
        return new Range(this.value, options).test(comp.semver);
      }
      options = parseOptions(options);
      if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
        return false;
      }
      if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
        return false;
      }
      if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
        return true;
      }
      if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
        return true;
      }
      if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
        return true;
      }
      if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
        return true;
      }
      if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
        return true;
      }
      return false;
    }
  }
  module.exports = Comparator;
  var parseOptions = require_parse_options();
  var { safeRe: re, t } = require_re();
  var cmp = require_cmp();
  var debug = require_debug();
  var SemVer = require_semver();
  var Range = require_range();
});

// ../../cli/node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS((exports, module) => {
  var Range = require_range();
  var satisfies = (version, range, options) => {
    try {
      range = new Range(range, options);
    } catch (er) {
      return false;
    }
    return range.test(version);
  };
  module.exports = satisfies;
});

// ../../cli/node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS((exports, module) => {
  var Range = require_range();
  var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
  module.exports = toComparators;
});

// ../../cli/node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var Range = require_range();
  var maxSatisfying = (versions, range, options) => {
    let max2 = null;
    let maxSV = null;
    let rangeObj = null;
    try {
      rangeObj = new Range(range, options);
    } catch (er) {
      return null;
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        if (!max2 || maxSV.compare(v) === -1) {
          max2 = v;
          maxSV = new SemVer(max2, options);
        }
      }
    });
    return max2;
  };
  module.exports = maxSatisfying;
});

// ../../cli/node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var Range = require_range();
  var minSatisfying = (versions, range, options) => {
    let min = null;
    let minSV = null;
    let rangeObj = null;
    try {
      rangeObj = new Range(range, options);
    } catch (er) {
      return null;
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        if (!min || minSV.compare(v) === 1) {
          min = v;
          minSV = new SemVer(min, options);
        }
      }
    });
    return min;
  };
  module.exports = minSatisfying;
});

// ../../cli/node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var Range = require_range();
  var gt = require_gt();
  var minVersion = (range, loose) => {
    range = new Range(range, loose);
    let minver = new SemVer("0.0.0");
    if (range.test(minver)) {
      return minver;
    }
    minver = new SemVer("0.0.0-0");
    if (range.test(minver)) {
      return minver;
    }
    minver = null;
    for (let i2 = 0;i2 < range.set.length; ++i2) {
      const comparators = range.set[i2];
      let setMin = null;
      comparators.forEach((comparator) => {
        const compver = new SemVer(comparator.semver.version);
        switch (comparator.operator) {
          case ">":
            if (compver.prerelease.length === 0) {
              compver.patch++;
            } else {
              compver.prerelease.push(0);
            }
            compver.raw = compver.format();
          case "":
          case ">=":
            if (!setMin || gt(compver, setMin)) {
              setMin = compver;
            }
            break;
          case "<":
          case "<=":
            break;
          default:
            throw new Error(`Unexpected operation: ${comparator.operator}`);
        }
      });
      if (setMin && (!minver || gt(minver, setMin))) {
        minver = setMin;
      }
    }
    if (minver && range.test(minver)) {
      return minver;
    }
    return null;
  };
  module.exports = minVersion;
});

// ../../cli/node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS((exports, module) => {
  var Range = require_range();
  var validRange = (range, options) => {
    try {
      return new Range(range, options).range || "*";
    } catch (er) {
      return null;
    }
  };
  module.exports = validRange;
});

// ../../cli/node_modules/semver/ranges/outside.js
var require_outside = __commonJS((exports, module) => {
  var SemVer = require_semver();
  var Comparator = require_comparator();
  var { ANY } = Comparator;
  var Range = require_range();
  var satisfies = require_satisfies();
  var gt = require_gt();
  var lt = require_lt();
  var lte = require_lte();
  var gte = require_gte();
  var outside = (version, range, hilo, options) => {
    version = new SemVer(version, options);
    range = new Range(range, options);
    let gtfn, ltefn, ltfn, comp, ecomp;
    switch (hilo) {
      case ">":
        gtfn = gt;
        ltefn = lte;
        ltfn = lt;
        comp = ">";
        ecomp = ">=";
        break;
      case "<":
        gtfn = lt;
        ltefn = gte;
        ltfn = gt;
        comp = "<";
        ecomp = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (satisfies(version, range, options)) {
      return false;
    }
    for (let i2 = 0;i2 < range.set.length; ++i2) {
      const comparators = range.set[i2];
      let high = null;
      let low = null;
      comparators.forEach((comparator) => {
        if (comparator.semver === ANY) {
          comparator = new Comparator(">=0.0.0");
        }
        high = high || comparator;
        low = low || comparator;
        if (gtfn(comparator.semver, high.semver, options)) {
          high = comparator;
        } else if (ltfn(comparator.semver, low.semver, options)) {
          low = comparator;
        }
      });
      if (high.operator === comp || high.operator === ecomp) {
        return false;
      }
      if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
        return false;
      } else if (low.operator === ecomp && ltfn(version, low.semver)) {
        return false;
      }
    }
    return true;
  };
  module.exports = outside;
});

// ../../cli/node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS((exports, module) => {
  var outside = require_outside();
  var gtr = (version, range, options) => outside(version, range, ">", options);
  module.exports = gtr;
});

// ../../cli/node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS((exports, module) => {
  var outside = require_outside();
  var ltr = (version, range, options) => outside(version, range, "<", options);
  module.exports = ltr;
});

// ../../cli/node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS((exports, module) => {
  var Range = require_range();
  var intersects = (r1, r2, options) => {
    r1 = new Range(r1, options);
    r2 = new Range(r2, options);
    return r1.intersects(r2, options);
  };
  module.exports = intersects;
});

// ../../cli/node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS((exports, module) => {
  var satisfies = require_satisfies();
  var compare = require_compare();
  module.exports = (versions, range, options) => {
    const set = [];
    let first = null;
    let prev = null;
    const v = versions.sort((a, b) => compare(a, b, options));
    for (const version of v) {
      const included = satisfies(version, range, options);
      if (included) {
        prev = version;
        if (!first) {
          first = version;
        }
      } else {
        if (prev) {
          set.push([first, prev]);
        }
        prev = null;
        first = null;
      }
    }
    if (first) {
      set.push([first, null]);
    }
    const ranges = [];
    for (const [min, max2] of set) {
      if (min === max2) {
        ranges.push(min);
      } else if (!max2 && min === v[0]) {
        ranges.push("*");
      } else if (!max2) {
        ranges.push(`>=${min}`);
      } else if (min === v[0]) {
        ranges.push(`<=${max2}`);
      } else {
        ranges.push(`${min} - ${max2}`);
      }
    }
    const simplified = ranges.join(" || ");
    const original = typeof range.raw === "string" ? range.raw : String(range);
    return simplified.length < original.length ? simplified : range;
  };
});

// ../../cli/node_modules/semver/ranges/subset.js
var require_subset = __commonJS((exports, module) => {
  var Range = require_range();
  var Comparator = require_comparator();
  var { ANY } = Comparator;
  var satisfies = require_satisfies();
  var compare = require_compare();
  var subset = (sub, dom, options = {}) => {
    if (sub === dom) {
      return true;
    }
    sub = new Range(sub, options);
    dom = new Range(dom, options);
    let sawNonNull = false;
    OUTER:
      for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
    return true;
  };
  var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
  var minimumVersion = [new Comparator(">=0.0.0")];
  var simpleSubset = (sub, dom, options) => {
    if (sub === dom) {
      return true;
    }
    if (sub.length === 1 && sub[0].semver === ANY) {
      if (dom.length === 1 && dom[0].semver === ANY) {
        return true;
      } else if (options.includePrerelease) {
        sub = minimumVersionWithPreRelease;
      } else {
        sub = minimumVersion;
      }
    }
    if (dom.length === 1 && dom[0].semver === ANY) {
      if (options.includePrerelease) {
        return true;
      } else {
        dom = minimumVersion;
      }
    }
    const eqSet = new Set;
    let gt, lt;
    for (const c of sub) {
      if (c.operator === ">" || c.operator === ">=") {
        gt = higherGT(gt, c, options);
      } else if (c.operator === "<" || c.operator === "<=") {
        lt = lowerLT(lt, c, options);
      } else {
        eqSet.add(c.semver);
      }
    }
    if (eqSet.size > 1) {
      return null;
    }
    let gtltComp;
    if (gt && lt) {
      gtltComp = compare(gt.semver, lt.semver, options);
      if (gtltComp > 0) {
        return null;
      } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
        return null;
      }
    }
    for (const eq of eqSet) {
      if (gt && !satisfies(eq, String(gt), options)) {
        return null;
      }
      if (lt && !satisfies(eq, String(lt), options)) {
        return null;
      }
      for (const c of dom) {
        if (!satisfies(eq, String(c), options)) {
          return false;
        }
      }
      return true;
    }
    let higher, lower;
    let hasDomLT, hasDomGT;
    let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
    let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
    if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
      needDomLTPre = false;
    }
    for (const c of dom) {
      hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
      hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
      if (gt) {
        if (needDomGTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
            needDomGTPre = false;
          }
        }
        if (c.operator === ">" || c.operator === ">=") {
          higher = higherGT(gt, c, options);
          if (higher === c && higher !== gt) {
            return false;
          }
        } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
          return false;
        }
      }
      if (lt) {
        if (needDomLTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
            needDomLTPre = false;
          }
        }
        if (c.operator === "<" || c.operator === "<=") {
          lower = lowerLT(lt, c, options);
          if (lower === c && lower !== lt) {
            return false;
          }
        } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
          return false;
        }
      }
      if (!c.operator && (lt || gt) && gtltComp !== 0) {
        return false;
      }
    }
    if (gt && hasDomLT && !lt && gtltComp !== 0) {
      return false;
    }
    if (lt && hasDomGT && !gt && gtltComp !== 0) {
      return false;
    }
    if (needDomGTPre || needDomLTPre) {
      return false;
    }
    return true;
  };
  var higherGT = (a, b, options) => {
    if (!a) {
      return b;
    }
    const comp = compare(a.semver, b.semver, options);
    return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
  };
  var lowerLT = (a, b, options) => {
    if (!a) {
      return b;
    }
    const comp = compare(a.semver, b.semver, options);
    return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
  };
  module.exports = subset;
});

// ../../cli/node_modules/semver/index.js
var require_semver2 = __commonJS((exports, module) => {
  var internalRe = require_re();
  var constants = require_constants();
  var SemVer = require_semver();
  var identifiers = require_identifiers();
  var parse = require_parse();
  var valid = require_valid();
  var clean = require_clean();
  var inc = require_inc();
  var diff = require_diff();
  var major = require_major();
  var minor = require_minor();
  var patch = require_patch();
  var prerelease = require_prerelease();
  var compare = require_compare();
  var rcompare = require_rcompare();
  var compareLoose = require_compare_loose();
  var compareBuild = require_compare_build();
  var sort = require_sort();
  var rsort = require_rsort();
  var gt = require_gt();
  var lt = require_lt();
  var eq = require_eq();
  var neq = require_neq();
  var gte = require_gte();
  var lte = require_lte();
  var cmp = require_cmp();
  var coerce2 = require_coerce();
  var Comparator = require_comparator();
  var Range = require_range();
  var satisfies = require_satisfies();
  var toComparators = require_to_comparators();
  var maxSatisfying = require_max_satisfying();
  var minSatisfying = require_min_satisfying();
  var minVersion = require_min_version();
  var validRange = require_valid2();
  var outside = require_outside();
  var gtr = require_gtr();
  var ltr = require_ltr();
  var intersects = require_intersects();
  var simplifyRange = require_simplify();
  var subset = require_subset();
  module.exports = {
    parse,
    valid,
    clean,
    inc,
    diff,
    major,
    minor,
    patch,
    prerelease,
    compare,
    rcompare,
    compareLoose,
    compareBuild,
    sort,
    rsort,
    gt,
    lt,
    eq,
    neq,
    gte,
    lte,
    cmp,
    coerce: coerce2,
    Comparator,
    Range,
    satisfies,
    toComparators,
    maxSatisfying,
    minSatisfying,
    minVersion,
    validRange,
    outside,
    gtr,
    ltr,
    intersects,
    simplifyRange,
    subset,
    SemVer,
    re: internalRe.re,
    src: internalRe.src,
    tokens: internalRe.t,
    SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: constants.RELEASE_TYPES,
    compareIdentifiers: identifiers.compareIdentifiers,
    rcompareIdentifiers: identifiers.rcompareIdentifiers
  };
});

// ../../cli/src/platform/paths.ts
import { isAbsolute, relative, sep } from "node:path";
function userStateDir(home = process.env.HOME || process.env.USERPROFILE || "") {
  if (!home) {
    throw new Error("Cannot resolve user home directory");
  }
  return `${home.replace(/\\/g, "/")}/.skillhub`;
}
function joinPath(...parts) {
  return parts.join("/").replace(/\/+/g, "/");
}
async function ensureDir(dir) {
  const { mkdir } = await import("node:fs/promises");
  await mkdir(dir, { recursive: true });
}
async function pathExists(path) {
  const { access } = await import("node:fs/promises");
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
async function canonicalizeExistingPath(path) {
  const { realpath } = await import("node:fs/promises");
  try {
    return await realpath(path);
  } catch {
    return path;
  }
}
function pathsOverlap(left, right) {
  const contains = (parent, child) => {
    const rel = relative(parent, child);
    return rel === "" || !isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`);
  };
  return contains(left, right) || contains(right, left);
}

// ../../cli/src/stores/inventory-store.ts
import { createHash as createHash2 } from "node:crypto";

// ../../cli/node_modules/zod/v3/external.js
var exports_external = {};
__export(exports_external, {
  void: () => voidType,
  util: () => util,
  unknown: () => unknownType,
  union: () => unionType,
  undefined: () => undefinedType,
  tuple: () => tupleType,
  transformer: () => effectsType,
  symbol: () => symbolType,
  string: () => stringType,
  strictObject: () => strictObjectType,
  setErrorMap: () => setErrorMap,
  set: () => setType,
  record: () => recordType,
  quotelessJson: () => quotelessJson,
  promise: () => promiseType,
  preprocess: () => preprocessType,
  pipeline: () => pipelineType,
  ostring: () => ostring,
  optional: () => optionalType,
  onumber: () => onumber,
  oboolean: () => oboolean,
  objectUtil: () => objectUtil,
  object: () => objectType,
  number: () => numberType,
  nullable: () => nullableType,
  null: () => nullType,
  never: () => neverType,
  nativeEnum: () => nativeEnumType,
  nan: () => nanType,
  map: () => mapType,
  makeIssue: () => makeIssue,
  literal: () => literalType,
  lazy: () => lazyType,
  late: () => late,
  isValid: () => isValid,
  isDirty: () => isDirty,
  isAsync: () => isAsync,
  isAborted: () => isAborted,
  intersection: () => intersectionType,
  instanceof: () => instanceOfType,
  getParsedType: () => getParsedType,
  getErrorMap: () => getErrorMap,
  function: () => functionType,
  enum: () => enumType,
  effect: () => effectsType,
  discriminatedUnion: () => discriminatedUnionType,
  defaultErrorMap: () => en_default,
  datetimeRegex: () => datetimeRegex,
  date: () => dateType,
  custom: () => custom,
  coerce: () => coerce,
  boolean: () => booleanType,
  bigint: () => bigIntType,
  array: () => arrayType,
  any: () => anyType,
  addIssueToContext: () => addIssueToContext,
  ZodVoid: () => ZodVoid,
  ZodUnknown: () => ZodUnknown,
  ZodUnion: () => ZodUnion,
  ZodUndefined: () => ZodUndefined,
  ZodType: () => ZodType,
  ZodTuple: () => ZodTuple,
  ZodTransformer: () => ZodEffects,
  ZodSymbol: () => ZodSymbol,
  ZodString: () => ZodString,
  ZodSet: () => ZodSet,
  ZodSchema: () => ZodType,
  ZodRecord: () => ZodRecord,
  ZodReadonly: () => ZodReadonly,
  ZodPromise: () => ZodPromise,
  ZodPipeline: () => ZodPipeline,
  ZodParsedType: () => ZodParsedType,
  ZodOptional: () => ZodOptional,
  ZodObject: () => ZodObject,
  ZodNumber: () => ZodNumber,
  ZodNullable: () => ZodNullable,
  ZodNull: () => ZodNull,
  ZodNever: () => ZodNever,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNaN: () => ZodNaN,
  ZodMap: () => ZodMap,
  ZodLiteral: () => ZodLiteral,
  ZodLazy: () => ZodLazy,
  ZodIssueCode: () => ZodIssueCode,
  ZodIntersection: () => ZodIntersection,
  ZodFunction: () => ZodFunction,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodError: () => ZodError,
  ZodEnum: () => ZodEnum,
  ZodEffects: () => ZodEffects,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodDefault: () => ZodDefault,
  ZodDate: () => ZodDate,
  ZodCatch: () => ZodCatch,
  ZodBranded: () => ZodBranded,
  ZodBoolean: () => ZodBoolean,
  ZodBigInt: () => ZodBigInt,
  ZodArray: () => ZodArray,
  ZodAny: () => ZodAny,
  Schema: () => ZodType,
  ParseStatus: () => ParseStatus,
  OK: () => OK,
  NEVER: () => NEVER,
  INVALID: () => INVALID,
  EMPTY_PATH: () => EMPTY_PATH,
  DIRTY: () => DIRTY,
  BRAND: () => BRAND
});

// ../../cli/node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {};
  function assertIs(_arg) {}
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error;
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// ../../cli/node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};

class ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
}
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// ../../cli/node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// ../../cli/node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
// ../../cli/node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== undefined) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      ctx.schemaErrorMap,
      overrideMap,
      overrideMap === en_default ? undefined : en_default
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}

class ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
}
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
// ../../cli/node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// ../../cli/node_modules/zod/v3/types.js
class ParseInputLazyPath {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
}
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}

class ZodType {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus,
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(undefined).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}

class ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus;
    let ctx = undefined;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
}
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}

class ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = undefined;
    const status = new ParseStatus;
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
}
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};

class ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = undefined;
    const status = new ParseStatus;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
}
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};

class ZodBoolean extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};

class ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus;
    let ctx = undefined;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
}
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};

class ZodSymbol extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};

class ZodUndefined extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};

class ZodNull extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};

class ZodAny extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};

class ZodUnknown extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};

class ZodNever extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
}
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};

class ZodVoid extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};

class ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : undefined,
          maximum: tooBig ? def.exactLength.value : undefined,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}

class ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {} else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== undefined ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  extend(augmentation) {
    return new ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  merge(merging) {
    const merged = new ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  catchall(index) {
    return new ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
}
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};

class ZodUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = undefined;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
}
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [undefined];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [undefined, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};

class ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  static create(discriminator, options, params) {
    const optionsMap = new Map;
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0;index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}

class ZodIntersection extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
}
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};

class ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new ZodTuple({
      ...this._def,
      rest
    });
  }
}
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};

class ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
}

class ZodMap extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = new Map;
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = new Map;
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
}
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};

class ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = new Set;
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};

class ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
}

class ZodLazy extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
}
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};

class ZodLiteral extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
}
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}

class ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
}
ZodEnum.create = createZodEnum;

class ZodNativeEnum extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
}
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};

class ZodPromise extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
}
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};

class ZodEffects extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
}
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
class ZodOptional extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(undefined);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};

class ZodNullable extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};

class ZodDefault extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};

class ZodCatch extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
}
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};

class ZodNaN extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
}
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");

class ZodBranded extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
}

class ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
}

class ZodReadonly extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: (arg) => ZodString.create({ ...arg, coerce: true }),
  number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
  boolean: (arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  }),
  bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
  date: (arg) => ZodDate.create({ ...arg, coerce: true })
};
var NEVER = INVALID;
// ../../cli/src/stores/inventory-store.ts
var import_proper_lockfile2 = __toESM(require_proper_lockfile(), 1);
import { isDeepStrictEqual } from "node:util";
import { lstat as lstat2, readFile, rename as rename2, rm, writeFile as writeFile2 } from "node:fs/promises";
import { dirname, isAbsolute as isAbsolute2, relative as relative2, resolve as resolve2 } from "node:path";

// ../../cli/src/services/skill-target-lock.ts
var import_proper_lockfile = __toESM(require_proper_lockfile(), 1);
import { createHash, randomUUID } from "node:crypto";
import { chmod, lstat, mkdir, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// ../../cli/src/shared/errors.ts
class CliError extends Error {
  exitCode;
  details;
  constructor(message, exitCode, details = {}) {
    super(message);
    this.exitCode = exitCode;
    this.details = details;
    this.name = "CliError";
  }
}

// ../../cli/src/shared/constants.ts
var EXIT = {
  generic: 1,
  auth: 2,
  network: 3,
  filesystem: 4,
  usage: 5,
  validation: 6
};

// ../../cli/src/services/skill-target-lock.ts
var ACQUISITION_GATE_MAX_POLL_MS = 100;
async function orderSkillTargetLocks(targets, slug) {
  const keyed = new Map;
  for (const target of targets) {
    const key = await skillTargetLockPath(target.rootDir, slug);
    if (!keyed.has(key))
      keyed.set(key, target);
  }
  return [...keyed].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0).map(([, target]) => target);
}
async function acquireSkillTargetLock(rootDir, slug) {
  const lockPath = await skillTargetLockPath(rootDir, slug);
  const acquisitionGatePath = `${lockPath}.acquire`;
  let releaseAcquisitionGate;
  try {
    releaseAcquisitionGate = await acquireAcquisitionGate(acquisitionGatePath);
  } catch (error) {
    if (hasErrorCode(error, "EEXIST"))
      throw targetBusyError(rootDir, slug);
    throw error;
  }
  let releaseTarget;
  try {
    releaseTarget = await acquireTargetLock(lockPath);
  } catch (operationError) {
    try {
      await releaseAcquisitionGate();
    } catch (cleanupError) {
      throw new AggregateError([operationError, cleanupError], "target lock acquisition and gate cleanup both failed");
    }
    if (hasErrorCode(operationError, "ELOCKED"))
      throw targetBusyError(rootDir, slug);
    throw operationError;
  }
  try {
    await releaseAcquisitionGate();
  } catch (gateCleanupError) {
    try {
      await releaseTarget();
    } catch (targetCleanupError) {
      throw new AggregateError([gateCleanupError, targetCleanupError], "target and acquisition gate cleanup both failed");
    }
    throw gateCleanupError;
  }
  return releaseTarget;
}
function acquireTargetLock(lockPath) {
  return import_proper_lockfile.lock(lockPath, {
    lockfilePath: lockPath,
    realpath: false,
    stale: 1e4,
    update: 3000,
    retries: 0
  });
}
async function acquireAcquisitionGate(gatePath, timeoutMs = Infinity) {
  if (!(timeoutMs >= 0))
    throw new Error("Invalid acquisition gate timeout");
  const deadline = Date.now() + timeoutMs;
  await ensureAcquisitionGateDirectory(gatePath);
  const contenderId = `${process.pid}-${randomUUID()}`;
  const choosingPath = join(gatePath, `choosing.${contenderId}`);
  let ticketPath = null;
  let ticket = null;
  await writeFile(choosingPath, "", { flag: "wx", mode: 384 });
  try {
    const { tickets } = await readGateState(gatePath, contenderId);
    ticket = Math.max(0, ...tickets.map((contender) => contender.ticket)) + 1;
    ticketPath = join(gatePath, `ticket.${ticket}.${contenderId}`);
    await rename(choosingPath, ticketPath);
    await waitForAcquisitionTurn(gatePath, { id: contenderId, ticket }, deadline);
  } catch (operationError) {
    const cleanupErrors = await removeContenderFiles(choosingPath, ...ticketPath === null ? [] : [ticketPath]);
    if (cleanupErrors.length > 0) {
      throw new AggregateError([operationError, ...cleanupErrors], "acquisition gate attempt and cleanup both failed");
    }
    throw operationError;
  }
  return async () => {
    try {
      await unlink(ticketPath);
    } catch (error) {
      if (hasErrorCode(error, "ENOENT"))
        throw compromisedGateError(ticketPath);
      throw error;
    }
  };
}
async function ensureAcquisitionGateDirectory(gatePath) {
  try {
    await mkdir(gatePath, { mode: 448 });
  } catch (error) {
    if (!hasErrorCode(error, "EEXIST"))
      throw error;
  }
  const details = await lstat(gatePath);
  if (!details.isDirectory() || details.isSymbolicLink()) {
    throw new Error(`unsafe SkillHub CLI acquisition gate directory: ${gatePath}`);
  }
}
async function readGateState(gatePath, contenderId) {
  const entries = await readdir(gatePath);
  const tickets = [];
  let hasLiveChoosing = false;
  for (const entry of entries) {
    const path = join(gatePath, entry);
    const ticketMatch = /^ticket\.(\d+)\.(\d+)-([^.]+)$/.exec(entry);
    if (ticketMatch) {
      const ticket = Number(ticketMatch[1]);
      const pid = Number(ticketMatch[2]);
      if (!isProcessAlive(pid)) {
        await unlinkIfPresent(path);
        continue;
      }
      if (!Number.isSafeInteger(ticket) || ticket < 1)
        throw compromisedGateError(path);
      tickets.push({ id: `${ticketMatch[2]}-${ticketMatch[3]}`, ticket });
      continue;
    }
    const choosingMatch = /^choosing\.(\d+)-([^.]+)$/.exec(entry);
    if (choosingMatch && `${choosingMatch[1]}-${choosingMatch[2]}` !== contenderId) {
      if (!isProcessAlive(Number(choosingMatch[1]))) {
        await unlinkIfPresent(path);
      } else {
        hasLiveChoosing = true;
      }
    }
  }
  return { tickets, hasLiveChoosing };
}
async function waitForAcquisitionTurn(gatePath, contender, deadline) {
  let delayMs = 5;
  for (;; ) {
    const state = await readGateState(gatePath, contender.id);
    const hasEarlierTicket = state.tickets.some((candidate) => compareContenders(candidate, contender) < 0);
    if (!state.hasLiveChoosing && !hasEarlierTicket)
      return;
    const remaining = deadline - Date.now();
    if (remaining <= 0)
      throw Object.assign(new Error("Lock acquisition gate is already being held"), { code: "ELOCKED" });
    await new Promise((resolve2) => setTimeout(resolve2, Math.min(delayMs, remaining)));
    delayMs = Math.min(delayMs * 2, ACQUISITION_GATE_MAX_POLL_MS);
  }
}
function compareContenders(left, right) {
  if (left.ticket !== right.ticket)
    return left.ticket < right.ticket ? -1 : 1;
  if (left.id === right.id)
    return 0;
  return left.id < right.id ? -1 : 1;
}
function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return !hasErrorCode(error, "ESRCH");
  }
}
async function removeContenderFiles(...paths) {
  const errors2 = [];
  for (const path of paths) {
    try {
      await unlink(path);
    } catch (error) {
      if (!hasErrorCode(error, "ENOENT"))
        errors2.push(error instanceof Error ? error : new Error(String(error)));
    }
  }
  return errors2;
}
async function unlinkIfPresent(path) {
  try {
    await unlink(path);
  } catch (error) {
    if (!hasErrorCode(error, "ENOENT"))
      throw error;
  }
}
function compromisedGateError(gatePath) {
  return Object.assign(new Error(`SkillHub CLI acquisition gate was replaced: ${gatePath}`), {
    code: "ECOMPROMISED"
  });
}
function hasErrorCode(error, code) {
  return error instanceof Error && "code" in error && error.code === code;
}
async function skillTargetLockPath(rootDir, slug) {
  const canonicalRoot = await canonicalizeExistingPath(resolve(rootDir));
  const target = resolve(canonicalRoot, slug);
  const digest = createHash("sha256").update(target).digest("hex");
  const uid = typeof process.getuid === "function" ? process.getuid() : "user";
  const lockDir = join(tmpdir(), `skillhub-cli-target-locks-${uid}`);
  await ensurePrivateLockDir(lockDir);
  return join(lockDir, `${digest}.lock`);
}
function assertPrivateLockDir(lockDir, details, currentUid) {
  if (!details.isDirectory() || details.isSymbolicLink()) {
    throw new Error(`unsafe SkillHub CLI lock directory: ${lockDir}`);
  }
  if (currentUid !== null && details.uid !== currentUid) {
    throw new Error(`SkillHub CLI lock directory is owned by another user: ${lockDir}`);
  }
}
async function ensurePrivateLockDir(lockDir) {
  try {
    await mkdir(lockDir, { mode: 448 });
  } catch (error) {
    if (!(error instanceof Error && ("code" in error) && error.code === "EEXIST"))
      throw error;
  }
  const details = await lstat(lockDir);
  const currentUid = typeof process.getuid === "function" ? process.getuid() : null;
  assertPrivateLockDir(lockDir, details, currentUid);
  if (process.platform !== "win32" && (details.mode & 63) !== 0) {
    await chmod(lockDir, 448);
  }
}
function targetBusyError(rootDir, slug) {
  return new CliError(`install target is busy: ${join(rootDir, slug)}`, EXIT.filesystem, {
    reason: "TARGET_BUSY",
    path: join(rootDir, slug),
    next: "wait for the other SkillHub CLI process to finish and retry"
  });
}

// ../../cli/src/stores/inventory-store.ts
function targetInstalledBy(item, target) {
  return target.installedBy ?? ["direct"];
}
function addDirectSource(item, target) {
  return {
    ...target,
    installedBy: Array.from(new Set([...targetInstalledBy(item, target), "direct"]))
  };
}
class InventoryCommitUnknownError extends Error {
  constructor(cause) {
    super("inventory commit outcome could not be verified", { cause });
    this.name = "InventoryCommitUnknownError";
  }
}
var text = exports_external.string().min(1);
var targetShape = { agent: text, rootDir: text, installDir: text, installedAt: text, installedBy: exports_external.array(text).optional() };
var identity = { registry: text, namespace: text, slug: text };
var suiteSchema = exports_external.object({ ...identity, version: text, fingerprint: text, members: exports_external.array(exports_external.object({
  namespace: text,
  slug: text,
  version: text,
  fingerprint: text,
  installDirs: exports_external.array(text)
}).strict()) }).strict();
var inventoryTargetSchema = exports_external.object({ ...targetShape, version: text, fingerprint: text.optional() }).strict();
var inventoryRecordSchema = exports_external.object({ ...identity, targets: exports_external.array(inventoryTargetSchema) }).strict();
var inventoryMemorySchema = exports_external.object({ items: exports_external.array(inventoryRecordSchema), suites: exports_external.array(suiteSchema).optional() }).strict();
var legacyInventorySchema = exports_external.object({
  items: exports_external.array(exports_external.object({
    ...identity,
    version: text,
    fingerprint: text.optional(),
    installedBy: exports_external.array(text).optional(),
    targets: exports_external.array(exports_external.object(targetShape).strict())
  }).strict()),
  suites: exports_external.array(suiteSchema).optional()
}).strict();
var inventoryDiskSchema = exports_external.object({
  schemaVersion: exports_external.literal(2),
  records: exports_external.array(inventoryRecordSchema),
  suites: exports_external.array(suiteSchema).optional()
}).strict();
function parseInventory(value) {
  if (typeof value !== "object" || value === null)
    throw new Error("Invalid inventory");
  if ("schemaVersion" in value) {
    const parsed = inventoryDiskSchema.parse(value);
    return { items: parsed.records, ...parsed.suites === undefined ? {} : { suites: parsed.suites } };
  }
  const legacy = legacyInventorySchema.parse(value);
  return {
    items: legacy.items.map((item) => ({
      registry: item.registry,
      namespace: item.namespace,
      slug: item.slug,
      targets: item.targets.map((target) => ({
        ...target,
        version: item.version,
        ...item.fingerprint === undefined ? {} : { fingerprint: item.fingerprint },
        installedBy: target.installedBy ?? item.installedBy ?? ["direct"]
      }))
    })),
    ...legacy.suites === undefined ? {} : { suites: legacy.suites }
  };
}
async function validateInventoryClaims(inventory) {
  const sources = new Set;
  const paths = new Set;
  for (const item of inventory.items) {
    const source = JSON.stringify([item.registry.replace(/\/+$/, ""), item.namespace, item.slug]);
    if (sources.has(source))
      throw new Error("Duplicate inventory source identity");
    sources.add(source);
    for (const target of item.targets) {
      if (!isAbsolute2(target.rootDir) || !isAbsolute2(target.installDir))
        throw new Error("Inventory target paths must be absolute");
      const rel = relative2(resolve2(target.rootDir), resolve2(target.installDir));
      if (!rel || rel === ".." || rel.startsWith("../") || rel.startsWith("..\\") || isAbsolute2(rel))
        throw new Error("Inventory target is outside its root");
      const canonical = await canonicalizeExistingPath(target.installDir);
      if ([...paths].some((path) => pathsOverlap(path, canonical)))
        throw new Error("Ambiguous inventory target ownership");
      paths.add(canonical);
    }
  }
}

class InventoryStore {
  path;
  constructor(home) {
    this.path = joinPath(userStateDir(home), "inventory.json");
  }
  async read() {
    try {
      return parseInventory(JSON.parse(await readFile(this.path, "utf-8")));
    } catch (error) {
      if (error.code === "ENOENT")
        return { items: [] };
      throw error;
    }
  }
  async write(inventory) {
    await this.writeAtomic(inventory);
  }
  async ensureWritable() {
    await ensureDir(dirname(this.path));
    const release = await this.acquireLock();
    try {
      await this.migrateUnderLock();
    } finally {
      await release();
    }
  }
  async diskVersion() {
    try {
      const value = JSON.parse(await readFile(this.path, "utf8"));
      parseInventory(value);
      return typeof value === "object" && value !== null && "schemaVersion" in value ? 2 : 1;
    } catch (error) {
      if (error.code === "ENOENT")
        return 2;
      throw error;
    }
  }
  async migrateUnderLock() {
    let raw;
    try {
      raw = await readFile(this.path);
    } catch (error) {
      if (error.code === "ENOENT")
        return;
      throw error;
    }
    const value = JSON.parse(raw.toString("utf8"));
    const inventory = parseInventory(value);
    await validateInventoryClaims(inventory);
    if (typeof value === "object" && value !== null && "schemaVersion" in value)
      return;
    const digest = createHash2("sha256").update(raw).digest("hex");
    const backup = joinPath(dirname(this.path), `inventory.v1.${digest}.backup.json`);
    try {
      await writeFile2(backup, raw, { flag: "wx", mode: 384 });
    } catch (error) {
      if (error.code !== "EEXIST")
        throw error;
    }
    const backupInfo = await lstat2(backup);
    if (!backupInfo.isFile() || backupInfo.isSymbolicLink())
      throw new Error("Unsafe inventory migration backup");
    if (!(await readFile(backup)).equals(raw))
      throw new Error("Inventory migration backup mismatch");
    try {
      await this.writeUnderLock(inventory);
    } catch (error) {
      try {
        if (await this.diskVersion() === 2 && isDeepStrictEqual(await this.read(), inventory))
          return;
      } catch {}
      throw error;
    }
  }
  async writeAtomic(inventory) {
    await ensureDir(dirname(this.path));
    let release = null;
    try {
      release = await this.acquireLock();
      await this.migrateUnderLock();
      await this.writeUnderLock(inventory);
    } finally {
      if (release)
        await release().catch(() => {});
    }
  }
  async withLockedSnapshot(inspect) {
    await ensureDir(dirname(this.path));
    const release = await this.acquireLock();
    try {
      return await inspect(await this.read());
    } finally {
      await release();
    }
  }
  async mutateAtomic(mutate, beforeCommit) {
    await ensureDir(dirname(this.path));
    let release = null;
    try {
      release = await this.acquireLock();
      await this.migrateUnderLock();
      const inventory = await this.read();
      const before = structuredClone(inventory);
      const result = mutate(inventory);
      if (beforeCommit)
        await beforeCommit(structuredClone(before), structuredClone(inventory));
      try {
        await this.writeUnderLock(inventory);
      } catch (writeError) {
        let actual;
        try {
          actual = await this.read();
        } catch (readError) {
          throw new InventoryCommitUnknownError(new AggregateError([writeError, readError]));
        }
        if (isDeepStrictEqual(actual, inventory))
          return result;
        if (!isDeepStrictEqual(actual, before))
          throw new InventoryCommitUnknownError(writeError);
        throw writeError;
      }
      return result;
    } finally {
      if (release)
        await release().catch(() => {});
    }
  }
  async writeUnderLock(inventory) {
    inventoryMemorySchema.parse(inventory);
    await validateInventoryClaims(inventory);
    const payload = JSON.stringify({ schemaVersion: 2, records: inventory.items, suites: inventory.suites }, null, 2);
    parseInventory(JSON.parse(payload));
    const tmpPath = `${this.path}.${process.pid}.${Date.now()}.tmp`;
    try {
      await writeFile2(tmpPath, payload);
      parseInventory(JSON.parse(await readFile(tmpPath, "utf-8")));
      await rename2(tmpPath, this.path);
    } finally {
      await rm(tmpPath, { force: true }).catch(() => {});
    }
  }
  async acquireLock() {
    const deadline = Date.now() + 1e4;
    const releaseGate = await acquireAcquisitionGate(`${this.path}.lock.acquire`, 1e4);
    let release;
    try {
      const remaining = deadline - Date.now();
      if (remaining <= 0)
        throw Object.assign(new Error("Inventory lock acquisition timed out"), { code: "ELOCKED" });
      release = await import_proper_lockfile2.lock(this.path, {
        lockfilePath: `${this.path}.lock`,
        realpath: false,
        stale: 30000,
        update: 1e4,
        retries: {
          retries: 10,
          maxRetryTime: remaining,
          factor: 2,
          minTimeout: 100,
          maxTimeout: 1000,
          randomize: true
        }
      });
    } catch (operationError) {
      try {
        await releaseGate();
      } catch (cleanupError) {
        throw new AggregateError([operationError, cleanupError], "inventory acquisition and gate cleanup both failed");
      }
      throw operationError;
    }
    try {
      await releaseGate();
    } catch (gateError) {
      try {
        await release();
      } catch (cleanupError) {
        throw new AggregateError([gateError, cleanupError], "inventory and gate cleanup both failed");
      }
      throw gateError;
    }
    return release;
  }
  async upsertTarget(registry, namespace, slug, version, target, fingerprint) {
    await this.mutateAtomic((inventory) => {
      const existing = inventory.items.find((i) => i.registry.replace(/\/+$/, "") === registry.replace(/\/+$/, "") && i.namespace === namespace && i.slug === slug);
      const item = existing ?? { registry, namespace, slug, targets: [] };
      if (!existing)
        inventory.items.push(item);
      const existingIdx = item.targets.findIndex((t) => t.installDir === target.installDir);
      const previous = existingIdx >= 0 ? item.targets[existingIdx] : { ...target, version, ...fingerprint === undefined ? {} : { fingerprint } };
      const next = addDirectSource(item, { ...target, version, ...fingerprint === undefined ? {} : { fingerprint }, installedBy: targetInstalledBy(item, previous) });
      if (existingIdx >= 0)
        item.targets[existingIdx] = next;
      else
        item.targets.push(next);
    });
  }
  async removeTarget(registry, namespace, slug, installDir) {
    return this.mutateAtomic((inventory) => {
      const item = inventory.items.find((i) => i.registry.replace(/\/+$/, "") === registry.replace(/\/+$/, "") && i.namespace === namespace && i.slug === slug);
      if (!item)
        return false;
      const idx = item.targets.findIndex((t) => t.installDir === installDir);
      if (idx < 0)
        return false;
      item.targets.splice(idx, 1);
      if (item.targets.length === 0)
        inventory.items = inventory.items.filter((i) => i !== item);
      return true;
    });
  }
  async removeTargetsByInstallDir(installDir) {
    return this.mutateAtomic((inventory) => {
      let removed = 0;
      for (const item of inventory.items) {
        const before = item.targets.length;
        item.targets = item.targets.filter((t) => t.installDir !== installDir);
        removed += before - item.targets.length;
      }
      inventory.items = inventory.items.filter((item) => item.targets.length > 0);
      return removed;
    });
  }
  async replaceTargetAtInstallDir(registry, namespace, slug, version, target, fingerprint) {
    await this.mutateAtomic((inventory) => {
      for (const item2 of inventory.items) {
        item2.targets = item2.targets.filter((existing) => existing.installDir !== target.installDir);
      }
      inventory.items = inventory.items.filter((item2) => item2.targets.length > 0);
      let item = inventory.items.find((candidate) => candidate.registry.replace(/\/+$/, "") === registry.replace(/\/+$/, "") && candidate.namespace === namespace && candidate.slug === slug);
      if (!item) {
        item = { registry, namespace, slug, targets: [] };
        inventory.items.push(item);
      }
      item.targets.push({ ...target, version, ...fingerprint === undefined ? {} : { fingerprint }, installedBy: ["direct"] });
    });
  }
  async replaceTargetsAtInstallDirs(registry, namespace, slug, version, targets, fingerprint, replacedInstallDirs = [], beforeCommit) {
    await this.mutateAtomic((inventory) => {
      const installDirs = new Set([
        ...targets.map((target) => target.installDir),
        ...replacedInstallDirs
      ]);
      for (const item2 of inventory.items) {
        item2.targets = item2.targets.filter((existing) => !installDirs.has(existing.installDir));
      }
      inventory.items = inventory.items.filter((item2) => item2.targets.length > 0);
      let item = inventory.items.find((candidate) => candidate.registry.replace(/\/+$/, "") === registry.replace(/\/+$/, "") && candidate.namespace === namespace && candidate.slug === slug);
      if (!item) {
        item = { registry, namespace, slug, targets: [] };
        inventory.items.push(item);
      }
      item.targets.push(...targets.map((target) => ({ ...target, version, ...fingerprint === undefined ? {} : { fingerprint }, installedBy: ["direct"] })));
    }, beforeCommit);
  }
}

// ../../cli/src/services/inventory-ownership.ts
async function assertDirectTargetOwnership(inventory, paths) {
  const selected = await Promise.all(paths.map(canonicalizeExistingPath));
  const overlaps = (path) => selected.some((target) => pathsOverlap(target, path));
  const fail = () => {
    throw new CliError("shared or Suite-owned target cannot be changed directly; use Suite management", EXIT.validation);
  };
  for (const item of inventory.items)
    for (const target of item.targets) {
      if (!overlaps(await canonicalizeExistingPath(target.installDir)))
        continue;
      const owners = targetInstalledBy(item, target);
      if (owners.length !== 1 || owners[0] !== "direct")
        fail();
    }
  for (const suite of inventory.suites ?? [])
    for (const member of suite.members) {
      for (const path of member.installDirs)
        if (overlaps(await canonicalizeExistingPath(path)))
          fail();
    }
}

// ../../cli/src/services/inventory-cas.ts
import { resolve as resolve3, relative as relative3 } from "node:path";
async function captureInstallInventory(inventory, identity2, canonicalDirs) {
  const records = [];
  for (const item of inventory.items) {
    const targets = await Promise.all(item.targets.map(async (target) => {
      const root = resolve3(target.rootDir);
      const canonicalRoot = await canonicalizeExistingPath(root);
      return {
        agent: target.agent,
        rootDir: canonicalRoot,
        installDir: resolve3(canonicalRoot, relative3(root, resolve3(target.installDir))),
        version: target.version,
        fingerprint: target.fingerprint ?? null,
        installedAt: target.installedAt,
        installedBy: [...new Set(targetInstalledBy(item, target))].sort()
      };
    }));
    const selected = targets.filter((target) => [...canonicalDirs].some((path) => pathsOverlap(path, target.installDir)));
    if (!selected.length)
      continue;
    records.push(JSON.stringify({
      registry: item.registry,
      namespace: item.namespace,
      slug: item.slug,
      targets: selected.map((target) => JSON.stringify(target)).sort()
    }));
  }
  const suites = [];
  for (const suite of inventory.suites ?? []) {
    const members = [];
    for (const member of suite.members) {
      const selected = [];
      for (const path of member.installDirs) {
        const canonical = await canonicalizeExistingPath(path);
        if ([...canonicalDirs].some((path2) => pathsOverlap(path2, canonical)))
          selected.push(canonical);
      }
      if (selected.length)
        members.push(JSON.stringify({ ...member, installDirs: selected.sort() }));
    }
    if (members.length)
      suites.push(JSON.stringify({
        registry: suite.registry,
        namespace: suite.namespace,
        slug: suite.slug,
        version: suite.version,
        fingerprint: suite.fingerprint,
        members: members.sort()
      }));
  }
  return JSON.stringify({ records: records.sort(), suites: suites.sort() });
}

// ../../cli/src/services/install-service.ts
import { randomUUID as randomUUID2 } from "node:crypto";
import { mkdir as mkdir3, rename as rename3, rm as rm2, writeFile as writeFile4 } from "node:fs/promises";
import { join as join5, relative as relative6, resolve as resolve5 } from "node:path";

// ../../cli/src/clients/skillhub-client.ts
class SkillHubClient {
  registry;
  token;
  fetchImpl;
  constructor(registry, token, fetchImpl = fetch) {
    this.registry = registry;
    this.token = token;
    this.fetchImpl = fetchImpl;
  }
  async whoami() {
    return this.getJson("/auth/whoami");
  }
  async requestDeviceCode() {
    return this.postPublicJson("/api/v1/auth/device/code");
  }
  async pollDeviceToken(deviceCode) {
    return this.postPublicJson("/api/v1/auth/device/token", { deviceCode });
  }
  async serverMetadata() {
    let response;
    try {
      response = await this.fetchImpl(`${this.registry}/.well-known/clawhub.json`);
    } catch {
      throw new CliError("registry unreachable", EXIT.network, { registry: this.registry, next: "check network or pass --registry" });
    }
    if (!response.ok)
      return {};
    let body;
    try {
      body = await response.json();
    } catch {
      return {};
    }
    return typeof body === "object" && body !== null ? body : {};
  }
  async suiteInstallPlan(namespace, slug, version, idempotencyKey) {
    const params = version ? `?version=${encodeURIComponent(version)}` : "";
    const url = `${this.registry}/api/v1/suites/${encodeURIComponent(namespace)}/${encodeURIComponent(slug)}/install-plan${params}`;
    for (let attempt = 0;attempt < 2; attempt += 1) {
      let response;
      try {
        response = await this.fetchImpl(url, {
          method: "POST",
          headers: { ...this.headers(), ...idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {} }
        });
      } catch {
        if (attempt === 0)
          continue;
        throw new CliError("registry unreachable", EXIT.network, { registry: this.registry, next: "check network or pass --registry" });
      }
      if (attempt === 0 && [502, 503, 504].includes(response.status))
        continue;
      try {
        return await this.handleJsonResponse(response);
      } catch (error) {
        if (attempt === 0 && !(error instanceof CliError))
          continue;
        throw error;
      }
    }
    throw new CliError("registry unreachable", EXIT.network, { registry: this.registry });
  }
  async suiteDetail(namespace, slug, version) {
    const params = version ? `?version=${encodeURIComponent(version)}` : "";
    let response;
    try {
      response = await this.fetchImpl(`${this.registry}/api/v1/suites/${encodeURIComponent(namespace)}/${encodeURIComponent(slug)}${params}`, { headers: this.headers() });
    } catch {
      throw new CliError("registry unreachable", EXIT.network, { registry: this.registry, next: "check network or pass --registry" });
    }
    if (response.status === 404) {
      const error = await this.createResponseError(response, "json");
      throw new CliError(error.message, error.exitCode, { ...error.details, status: 404 });
    }
    return this.handleJsonResponse(response);
  }
  async downloadFromUrl(downloadUrl) {
    let response;
    try {
      const relativeUrl = downloadUrl.startsWith("/api/") ? downloadUrl.slice(1) : downloadUrl;
      const registryBase = `${this.registry.replace(/\/+$/, "")}/`;
      response = await this.fetchImpl(new URL(relativeUrl, registryBase).toString(), { headers: this.headers() });
    } catch {
      throw new CliError("registry unreachable", EXIT.network, { registry: this.registry, next: "check network or pass --registry" });
    }
    if (!response.ok)
      throw await this.createResponseError(response, "download");
    return response;
  }
  async search(query, limit) {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    return this.getJson(`/skills/search?${params}`);
  }
  async resolve(namespace, slug, version) {
    const params = version ? `?version=${encodeURIComponent(version)}` : "";
    return this.getJson(`/skills/${namespace}/${slug}/resolve${params}`);
  }
  async listNamespaceSkills(namespace, cursor, limit = 100) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor)
      params.set("cursor", cursor);
    return this.getJson(`/namespaces/${encodeURIComponent(namespace)}/skills?${params}`);
  }
  async downloadUrl(namespace, slug, version) {
    if (version) {
      return `${this.registry}/api/cli/v1/skills/${namespace}/${slug}/versions/${version}/download`;
    }
    return `${this.registry}/api/cli/v1/skills/${namespace}/${slug}/download`;
  }
  async download(namespace, slug, version) {
    const url = await this.downloadUrl(namespace, slug, version);
    let response;
    try {
      response = await this.fetchImpl(url, { headers: this.headers() });
    } catch {
      throw new CliError("registry unreachable", EXIT.network, { registry: this.registry, next: "check network or pass --registry" });
    }
    if (!response.ok) {
      throw await this.createResponseError(response, "download");
    }
    return response;
  }
  async deleteRemote(namespace, slug) {
    return this.deleteJson(`/skills/${namespace}/${slug}`);
  }
  async publish(namespace, file, visibility, fileName = "skill.zip", rejectExistingVersion = false) {
    const formData = new FormData;
    formData.append("file", file, fileName);
    formData.append("visibility", visibility);
    if (rejectExistingVersion)
      formData.append("rejectExistingVersion", "true");
    let response;
    try {
      response = await this.fetchImpl(`${this.registry}/api/cli/v1/skills/${namespace}/publish`, {
        method: "POST",
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
        body: formData
      });
    } catch {
      throw new CliError("registry unreachable", EXIT.network, { registry: this.registry, next: "check network or pass --registry" });
    }
    return this.handleJsonResponse(response);
  }
  async validatePublish(namespace, file, visibility, fileName = "skill.zip", rejectExistingVersion = false) {
    const formData = new FormData;
    formData.append("file", file, fileName);
    formData.append("visibility", visibility);
    if (rejectExistingVersion)
      formData.append("rejectExistingVersion", "true");
    let response;
    try {
      response = await this.fetchImpl(`${this.registry}/api/cli/v1/skills/${namespace}/publish/validate`, {
        method: "POST",
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
        body: formData
      });
    } catch {
      throw new CliError("registry unreachable", EXIT.network, { registry: this.registry, next: "check network or pass --registry" });
    }
    return this.handleJsonResponse(response);
  }
  async submitReview(namespace, slug, version, targetVisibility) {
    let response;
    try {
      response = await this.fetchImpl(`${this.registry}/api/v1/skills/${encodeURIComponent(namespace)}/${encodeURIComponent(slug)}/submit-review`, {
        method: "POST",
        headers: { ...this.headers(), "Content-Type": "application/json" },
        body: JSON.stringify({ version, targetVisibility })
      });
    } catch {
      throw new CliError("registry unreachable", EXIT.network, { registry: this.registry, next: "check network or pass --registry" });
    }
    return this.handleJsonResponse(response);
  }
  async getJson(path) {
    let response;
    try {
      response = await this.fetchImpl(`${this.registry}/api/cli/v1${path}`, {
        headers: this.headers()
      });
    } catch (err) {
      throw new CliError("registry unreachable", EXIT.network, { registry: this.registry, next: "check network or pass --registry" });
    }
    return this.handleJsonResponse(response);
  }
  async postPublicJson(path, body) {
    let response;
    try {
      response = await this.fetchImpl(`${this.registry}${path}`, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : {},
        ...body ? { body: JSON.stringify(body) } : {}
      });
    } catch {
      throw new CliError("registry unreachable", EXIT.network, { registry: this.registry, next: "check network or pass --registry" });
    }
    return this.handleJsonResponse(response);
  }
  async handleJsonResponse(response) {
    if (!response.ok) {
      throw await this.createResponseError(response, "json");
    }
    const body = await response.json();
    return body.data;
  }
  async createResponseError(response, kind) {
    const publicFields = await this.readPublicErrorFields(response);
    const details = { registry: this.registry };
    if (publicFields.requestId) {
      details.requestId = publicFields.requestId;
    }
    let fallback;
    let exitCode = EXIT.generic;
    if (response.status === 401) {
      fallback = "authentication failed";
      exitCode = EXIT.auth;
      details.next = "run `skillhub login`";
    } else if (response.status === 403) {
      fallback = "access denied";
      exitCode = EXIT.auth;
    } else if (response.status === 404) {
      fallback = kind === "download" ? "skill or version not found" : "resource not found";
    } else if (response.status === 502 || response.status === 503 || response.status === 504) {
      fallback = kind === "download" ? `download failed with status ${response.status}` : `registry returned ${response.status}`;
      exitCode = EXIT.network;
    } else {
      fallback = kind === "download" ? `download failed with status ${response.status}` : `registry returned ${response.status}`;
    }
    return new CliError(publicFields.msg ?? fallback, exitCode, details);
  }
  async readPublicErrorFields(response) {
    let body;
    try {
      body = await response.json();
    } catch {
      return {};
    }
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return {};
    }
    const record = body;
    const msg = typeof record.msg === "string" ? record.msg.trim() : "";
    const requestId = typeof record.requestId === "string" ? record.requestId.trim() : "";
    return {
      ...msg ? { msg } : {},
      ...requestId ? { requestId } : {}
    };
  }
  headers() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
  async deleteJson(path) {
    let response;
    try {
      response = await this.fetchImpl(`${this.registry}/api/cli/v1${path}`, {
        method: "DELETE",
        headers: this.headers()
      });
    } catch {
      throw new CliError("registry unreachable", EXIT.network, { registry: this.registry, next: "check network or pass --registry" });
    }
    return this.handleJsonResponse(response);
  }
}

// ../../cli/src/platform/archive.ts
import { mkdir as mkdir2, readdir as readdir2, readFile as readFile2, writeFile as writeFile3 } from "node:fs/promises";
import { dirname as dirname2, isAbsolute as isAbsolute3, join as join2, relative as relative4, resolve as resolve4 } from "node:path";

// ../../cli/node_modules/fflate/esm/index.mjs
import { createRequire as createRequire2 } from "module";
var require2 = createRequire2("/");
var Worker;
try {
  Worker = require2("worker_threads").Worker;
} catch (e) {}
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0]);
var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i = 0;i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b[30]);
  for (var i = 1;i < 30; ++i) {
    for (var j = b[i];j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0;i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = function(cd, mb, r) {
  var s = cd.length;
  var i2 = 0;
  var l = new u16(mb);
  for (;i2 < s; ++i2) {
    if (cd[i2])
      ++l[cd[i2] - 1];
  }
  var le = new u16(mb);
  for (i2 = 1;i2 < mb; ++i2) {
    le[i2] = le[i2 - 1] + l[i2 - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i2 = 0;i2 < s; ++i2) {
      if (cd[i2]) {
        var sv = i2 << 4 | cd[i2];
        var r_1 = mb - cd[i2];
        var v = le[cd[i2] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1;v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i2 = 0;i2 < s; ++i2) {
      if (cd[i2]) {
        co[i2] = rev[le[cd[i2] - 1]++] >> 15 - cd[i2];
      }
    }
  }
  return co;
};
var flt = new u8(288);
for (i = 0;i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144;i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256;i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280;i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0;i < 32; ++i)
  fdt[i] = 5;
var i;
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i2 = 1;i2 < a.length; ++i2) {
    if (a[i2] > m)
      m = a[i2];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i2 = 0;i2 < hcLen; ++i2) {
          clt[clim[i2]] = bits(dat, pos + i2 * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i2 = 0;i2 < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i2++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i2 - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i2++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (;; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i2 = sym - 257, b = fleb[i2];
          add = bits(dat, pos, (1 << b) - 1) + fl[i2];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (;bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (;bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var et = /* @__PURE__ */ new u8(0);
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder;
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {}
var dutf8 = function(d) {
  for (var r = "", i2 = 0;; ) {
    var c = d[i2++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i2 + eb > d.length)
      return { s: r, r: slc(d, i2 - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i2++] & 63) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i2++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63);
  }
};
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i2 = 0;i2 < dat.length; i2 += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i2, i2 + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl, bs = b4(d, b + 20);
  var _a2 = z && bs == 4294967295 ? z64e(d, es) : [bs, b4(d, b + 24), b4(d, b + 42)], sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d, b + 10), sc, su, fn, es + b2(d, b + 30) + b2(d, b + 32), off];
};
var z64e = function(d, b) {
  for (;b2(d, b) != 1; b += 4 + b2(d, b + 2))
    ;
  return [b8(d, b + 12), b8(d, b + 4), b8(d, b + 20)];
};
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (;b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558)
      err(13);
  }
  var c = b2(data, e + 8);
  if (!c)
    return {};
  var o = b4(data, e + 16);
  var z = o == 4294967295 || c == 65535;
  if (z) {
    var ze = b4(data, e - 12);
    z = b4(data, ze) == 101075792;
    if (z) {
      c = b4(data, ze + 32);
      o = b4(data, ze + 48);
    }
  }
  var fltr = opts && opts.filter;
  for (var i2 = 0;i2 < c; ++i2) {
    var _a2 = zh(data, o, z), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
    o = no;
    if (!fltr || fltr({
      name: fn,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2)
        files[fn] = slc(data, b, b + sc);
      else if (c_2 == 8)
        files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}

// ../../cli/src/platform/download.ts
var MAX_PACKAGE_BYTES = 100 * 1024 * 1024;
async function readBoundedResponseBody(response, maxBytes = MAX_PACKAGE_BYTES) {
  const contentLength = response.headers.get("content-length");
  if (contentLength !== null) {
    const declaredLength = Number(contentLength);
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      throw new CliError("download exceeds maximum package size", EXIT.network, {
        contentLength: declaredLength,
        maxBytes
      });
    }
  }
  if (!response.body) {
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > maxBytes) {
      throw new CliError("download exceeds maximum package size", EXIT.network, {
        receivedBytes: buffer.byteLength,
        maxBytes
      });
    }
    return buffer;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let receivedBytes = 0;
  for (;; ) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    receivedBytes += value.byteLength;
    if (receivedBytes > maxBytes) {
      await reader.cancel();
      throw new CliError("download exceeds maximum package size", EXIT.network, {
        receivedBytes,
        maxBytes
      });
    }
    chunks.push(value);
  }
  const result = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result.buffer;
}

// ../../cli/src/platform/archive.ts
var MAX_ZIP_ENTRIES = 500;
var MAX_SINGLE_FILE_BYTES = 10 * 1024 * 1024;
var EOCD_SIGNATURE = 101010256;
var CENTRAL_DIRECTORY_SIGNATURE = 33639248;
var ZIP64_MARKER_16 = 65535;
var ZIP64_MARKER_32 = 4294967295;
async function extractZip(buffer, targetDir, options = {}) {
  await mkdir2(targetDir, { recursive: true });
  const archive = new Uint8Array(buffer);
  validateZipCentralDirectory(archive, options.rejectInternalMetadata ?? false);
  const files = unzipSync(archive);
  const entries = Object.entries(files).map(([name, data]) => ({
    name,
    data,
    filePath: safeJoin(targetDir, name)
  }));
  for (const { name, data, filePath } of entries) {
    if (isZipDirectory(name)) {
      await mkdir2(filePath, { recursive: true });
      continue;
    }
    await mkdir2(dirname2(filePath), { recursive: true });
    await writeFile3(filePath, data);
  }
}
function isZipDirectory(name) {
  return name.endsWith("/") || name.endsWith("\\");
}
function validateZipCentralDirectory(archive, rejectInternalMetadata) {
  const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);
  const eocdOffset = findEndOfCentralDirectory(view);
  if (eocdOffset < 0) {
    throw new Error("invalid zip central directory");
  }
  const diskNumber = view.getUint16(eocdOffset + 4, true);
  const centralDirectoryDisk = view.getUint16(eocdOffset + 6, true);
  const entriesOnDisk = view.getUint16(eocdOffset + 8, true);
  const totalEntries = view.getUint16(eocdOffset + 10, true);
  const centralDirectorySize = view.getUint32(eocdOffset + 12, true);
  const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);
  if (entriesOnDisk === ZIP64_MARKER_16 || totalEntries === ZIP64_MARKER_16 || centralDirectorySize === ZIP64_MARKER_32 || centralDirectoryOffset === ZIP64_MARKER_32) {
    throw new Error("zip64 archives are not supported");
  }
  if (diskNumber !== 0 || centralDirectoryDisk !== 0 || entriesOnDisk !== totalEntries) {
    throw new Error("multi-disk zip archives are not supported");
  }
  if (totalEntries > MAX_ZIP_ENTRIES) {
    throw new Error("zip entry count exceeds limit");
  }
  if (centralDirectoryOffset + centralDirectorySize > archive.byteLength) {
    throw new Error("invalid zip central directory");
  }
  const destinations = new Map;
  let offset = centralDirectoryOffset;
  let totalUncompressedSize = 0;
  const decoder = new TextDecoder;
  for (let i2 = 0;i2 < totalEntries; i2++) {
    if (offset + 46 > archive.byteLength || view.getUint32(offset, true) !== CENTRAL_DIRECTORY_SIGNATURE) {
      throw new Error("invalid zip central directory");
    }
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const nameStart = offset + 46;
    const nameEnd = nameStart + nameLength;
    const nextOffset = nameEnd + extraLength + commentLength;
    if (nameEnd > archive.byteLength || nextOffset > archive.byteLength) {
      throw new Error("invalid zip central directory");
    }
    const entryName = decoder.decode(archive.subarray(nameStart, nameEnd));
    const normalized = entryName.replaceAll("\\", "/").split("/").filter((part) => part !== "" && part !== ".");
    if (normalized.some((part) => part === ".." || (part.includes(":") || [...part].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) || /[ .]$/.test(part))) {
      throw new Error("unsafe zip entry path");
    }
    const destination = normalized.join("/").toLowerCase();
    const directory = isZipDirectory(entryName);
    if (rejectInternalMetadata && destination === ".skillhub/examples.json" && normalized.join("/") !== destination) {
      throw new Error("Ambiguous skill examples path casing");
    }
    if (rejectInternalMetadata && (!directory && destination === ".skillhub" || destination === ".skillhub/metadata.json" || destination.startsWith(".skillhub/metadata.json/"))) {
      throw new Error("Installer metadata cannot be supplied by a skill package");
    }
    if (destinations.has(destination) || [...destinations].some(([path, isDirectory]) => !isDirectory && destination.startsWith(path + "/") || !directory && path.startsWith(destination + "/"))) {
      throw new Error("conflicting zip entry destinations");
    }
    destinations.set(destination, directory);
    if (!entryName.endsWith("/") && uncompressedSize > MAX_SINGLE_FILE_BYTES) {
      throw new Error("zip entry size exceeds limit");
    }
    totalUncompressedSize += uncompressedSize;
    if (totalUncompressedSize > MAX_PACKAGE_BYTES) {
      throw new Error("zip total uncompressed size exceeds limit");
    }
    offset = nextOffset;
  }
}
function findEndOfCentralDirectory(view) {
  const minOffset = Math.max(0, view.byteLength - 65535 - 22);
  for (let offset = view.byteLength - 22;offset >= minOffset; offset--) {
    if (view.getUint32(offset, true) === EOCD_SIGNATURE) {
      return offset;
    }
  }
  return -1;
}
function safeJoin(targetDir, entryName) {
  if (isAbsolute3(entryName)) {
    throw new Error(`unsafe zip entry path: ${entryName}`);
  }
  const root = resolve4(targetDir);
  const target = resolve4(root, entryName.replaceAll("\\", "/"));
  const rel = relative4(root, target);
  if (rel === "" || rel.startsWith("..") || isAbsolute3(rel)) {
    throw new Error(`unsafe zip entry path: ${entryName}`);
  }
  return target;
}

// ../../cli/src/services/skill-fingerprint.ts
import { createHash as createHash3 } from "node:crypto";
import { readdir as readdir3, readFile as readFile3 } from "node:fs/promises";
import { join as join3, relative as relative5 } from "node:path";
async function snapshotSkillDirectory(skillDir) {
  const paths = await listSkillFiles(skillDir);
  const files = {};
  const aggregate = createHash3("sha256");
  for (const path of paths) {
    const content = await readFile3(join3(skillDir, path));
    const fileHash = createHash3("sha256").update(content).digest("hex");
    files[path] = fileHash;
    aggregate.update(`${path}:${fileHash}
`, "utf8");
  }
  return { fingerprint: `sha256:${aggregate.digest("hex")}`, files };
}
function diffSkillFiles(baseline, current) {
  if (!baseline)
    return [];
  const paths = new Set([...Object.keys(baseline), ...Object.keys(current)]);
  return [...paths].filter((path) => baseline[path] !== current[path]).sort((left, right) => left.localeCompare(right));
}
async function listSkillFiles(root) {
  const files = [];
  async function walk(current) {
    const entries = await readdir3(current, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = join3(current, entry.name);
      if (relative5(root, absolute).split("\\").join("/") === ".skillhub/metadata.json")
        continue;
      if (entry.isDirectory()) {
        await walk(absolute);
      } else if (entry.isFile()) {
        files.push(relative5(root, absolute).split("\\").join("/"));
      }
    }
  }
  await walk(root);
  return files.sort();
}

// ../../cli/src/services/installed-skill-metadata.ts
import { readFile as readFile4 } from "node:fs/promises";
import { join as join4 } from "node:path";
async function readInstalledSkillMetadata(skillDir) {
  const metadataPath = join4(skillDir, ".skillhub", "metadata.json");
  if (!await pathExists(metadataPath))
    return { status: "missing" };
  try {
    const value = JSON.parse(await readFile4(metadataPath, "utf-8"));
    if (!isRecord(value))
      return { status: "invalid", reason: "metadata root must be an object" };
    for (const field of ["registry", "namespace", "slug", "version"]) {
      if (typeof value[field] !== "string" || value[field].length === 0) {
        return { status: "invalid", reason: `metadata field "${field}" must be a non-empty string` };
      }
    }
    if (value.source !== undefined && value.source !== "skillhub") {
      return { status: "invalid", reason: 'metadata field "source" must be "skillhub"' };
    }
    if (value.schemaVersion !== undefined && value.schemaVersion !== 1) {
      return { status: "invalid", reason: "metadata schema version is not supported" };
    }
    if (value.versionId !== undefined && (!Number.isInteger(value.versionId) || value.versionId <= 0)) {
      return { status: "invalid", reason: 'metadata field "versionId" must be a positive integer' };
    }
    if (value.fingerprint !== undefined && typeof value.fingerprint !== "string") {
      return { status: "invalid", reason: 'metadata field "fingerprint" must be a string' };
    }
    if (value.files !== undefined && !isStringRecord(value.files)) {
      return { status: "invalid", reason: 'metadata field "files" must map paths to hashes' };
    }
    return { status: "valid", metadata: value };
  } catch {
    return { status: "invalid", reason: "metadata is not valid JSON" };
  }
}
function sameInstalledSkillSource(left, right) {
  return normalizeRegistry(left.registry) === normalizeRegistry(right.registry) && left.namespace === right.namespace && left.slug === right.slug;
}
function normalizeRegistry(registry) {
  return registry.replace(/\/+$/, "");
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isStringRecord(value) {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "string");
}

// ../../cli/src/services/install-service.ts
async function preflightInstallTargets(targets, identity2, force, inventory) {
  const seenSkillDirs = new Set;
  const preparedTargets = [];
  for (const target of targets) {
    const rootDir = resolve5(target.rootDir);
    const canonicalRootDir = await canonicalizeExistingPath(rootDir);
    const canonicalSkillDir = join5(canonicalRootDir, identity2.slug);
    await assertDirectTargetOwnership(inventory, [canonicalSkillDir]);
    if ([...seenSkillDirs].some((path) => pathsOverlap(path, canonicalSkillDir))) {
      throw new CliError(`multiple install targets resolve to ${canonicalSkillDir}`, EXIT.usage, {
        path: canonicalSkillDir,
        next: "select only one target for this directory"
      });
    }
    seenSkillDirs.add(canonicalSkillDir);
    for (const item of inventory.items)
      for (const claimed of item.targets) {
        const canonicalClaim = await canonicalInventoryInstallDir(claimed);
        if (canonicalClaim !== canonicalSkillDir && pathsOverlap(canonicalClaim, canonicalSkillDir)) {
          throw new CliError("install target overlaps another managed installation", EXIT.validation);
        }
      }
    const resolvedTarget = { ...target, rootDir };
    const skillDir = join5(rootDir, identity2.slug);
    const exists = await pathExists(skillDir);
    if (exists && !force) {
      throw new CliError(`skill already installed at ${skillDir}`, EXIT.filesystem, {
        path: skillDir,
        next: "pass --force to replace a same-source installation"
      });
    }
    if (exists) {
      await assertReplaceableInstallation(skillDir, skillDir, canonicalSkillDir, identity2, inventory);
    }
    preparedTargets.push({ target: resolvedTarget, skillDir, canonicalSkillDir });
  }
  return preparedTargets;
}
async function installSkill(options) {
  const store = options.inventoryStore ?? new InventoryStore(options.home);
  await store.ensureWritable();
  const expectedItem = options.expectedInventoryItem === undefined ? undefined : structuredClone(options.expectedInventoryItem);
  const inventory = await store.read();
  const identity2 = { registry: options.registry, namespace: options.namespace, slug: options.slug };
  const preparedTargets = await preflightInstallTargets(options.targets, {
    registry: options.registry,
    namespace: options.namespace,
    slug: options.slug
  }, options.force, inventory);
  const canonicalDirs = new Set(preparedTargets.map((target) => target.canonicalSkillDir));
  if (expectedItem !== undefined) {
    if (expectedItem && !sameInstalledSkillSource(expectedItem, identity2))
      throw inventoryChangedError();
    const expected = await captureInstallInventory({ items: expectedItem ? [expectedItem] : [] }, identity2, canonicalDirs);
    if (await captureInstallInventory(inventory, identity2, canonicalDirs) !== expected)
      throw inventoryChangedError();
  }
  const baseline = await captureInstallInventory(inventory, identity2, canonicalDirs);
  const assertInventoryCurrent = async (current) => {
    if (await captureInstallInventory(current, identity2, canonicalDirs) !== baseline)
      throw inventoryChangedError();
  };
  await options.transactionObserver?.beforeTargetMutation?.([...canonicalDirs]);
  const client = options.client ?? new SkillHubClient(options.registry, options.token);
  const resolved = options.resolved ?? await client.resolve(options.namespace, options.slug, options.version);
  const response = resolved.downloadUrl ? await client.downloadFromUrl(resolved.downloadUrl) : await client.download(options.namespace, options.slug, resolved.version);
  const buffer = await readBoundedResponseBody(response);
  const staged = [];
  let preserveStaging = false;
  try {
    for (const { target, skillDir, canonicalSkillDir } of preparedTargets) {
      await options.authorizeTargetMutation?.([target.rootDir], "staging");
      const tempDir = join5(target.rootDir, `.${options.slug}.install-${randomUUID2()}`);
      await options.transactionObserver?.beforeStaging?.({ canonicalSkillDir, rootDir: target.rootDir, stagingDir: tempDir });
      await mkdir3(target.rootDir, { recursive: true });
      await mkdir3(tempDir, { mode: 448 });
      try {
        await options.authorizeTargetMutation?.([tempDir], "staging");
        await extractZip(buffer, tempDir, { rejectInternalMetadata: true });
        const installedAt = new Date().toISOString();
        const snapshot = await snapshotSkillDirectory(tempDir);
        if (snapshot.fingerprint !== resolved.fingerprint) {
          throw new CliError("downloaded skill fingerprint does not match the resolved release", EXIT.validation, {
            coordinate: `@${options.namespace}/${options.slug}`,
            expectedFingerprint: resolved.fingerprint,
            actualFingerprint: snapshot.fingerprint,
            next: "retry the install after the registry release has been verified"
          });
        }
        await options.validateStagedSkill?.(tempDir);
        const metaDir = join5(tempDir, ".skillhub");
        await options.authorizeTargetMutation?.([metaDir], "staging");
        await mkdir3(metaDir, { recursive: true });
        await writeFile4(join5(metaDir, "metadata.json"), JSON.stringify({
          schemaVersion: 1,
          registry: options.registry,
          namespace: options.namespace,
          slug: options.slug,
          version: resolved.version,
          versionId: resolved.versionId,
          fingerprint: resolved.fingerprint,
          files: snapshot.files,
          source: "skillhub",
          agent: target.agent,
          installedAt
        }, null, 2));
        staged.push({ target, skillDir, canonicalSkillDir, tempDir, installedAt, backupDir: null, movedIntoPlace: false });
      } catch (error) {
        try {
          await options.authorizeTargetMutation?.([tempDir], "cleanup");
          await rm2(tempDir, { recursive: true, force: true });
        } catch {}
        throw error;
      }
    }
    const releases = [];
    const warnings = [];
    const transactionWarnings = [];
    const observer = options.transactionObserver;
    const warn = (warning) => {
      transactionWarnings.push(warning);
      warnings.push(`${warning.stage}${warning.path ? ` at ${warning.path}` : ""}: ${warning.message}`);
    };
    let inventoryCommitted = false;
    const acquireTargetLock2 = options.acquireTargetLock ?? acquireSkillTargetLock;
    try {
      for (const target of await orderSkillTargetLocks(staged.map((item) => item.target), options.slug)) {
        releases.push(await acquireTargetLock2(target.rootDir, options.slug));
      }
      await observer?.beforeTargetMutation?.(staged.map((item) => item.canonicalSkillDir));
      const lockedInventory = await store.read();
      if (!options.force) {
        for (const item of staged) {
          if (await pathExists(item.skillDir)) {
            throw new CliError(`skill already installed at ${item.skillDir}`, EXIT.filesystem, {
              path: item.skillDir,
              next: "pass --force to overwrite"
            });
          }
        }
      }
      await assertInventoryCurrent(lockedInventory);
      if (observer?.beforePreparation) {
        await store.withLockedSnapshot(async (current) => {
          await assertInventoryCurrent(current);
          await observer.beforePreparation({
            before: structuredClone(current),
            release: {
              registry: options.registry,
              namespace: options.namespace,
              slug: options.slug,
              version: resolved.version,
              fingerprint: resolved.fingerprint
            },
            targets: staged.map((item) => ({
              agent: item.target.agent,
              canonicalSkillDir: item.canonicalSkillDir,
              skillDir: item.skillDir,
              stagingDir: item.tempDir,
              installedAt: item.installedAt
            }))
          });
        });
      }
      for (const [index, item] of staged.entries()) {
        const targetExists = await pathExists(item.skillDir);
        if (!targetExists && options.requireExistingTargets) {
          throw new CliError(`installed target disappeared before upgrade commit: ${item.skillDir}`, EXIT.validation, {
            path: item.skillDir,
            next: "reinstall the Skill explicitly before upgrading it"
          });
        }
        if (targetExists) {
          if (!options.force) {
            throw new CliError(`skill already installed at ${item.skillDir}`, EXIT.filesystem, {
              path: item.skillDir,
              next: "pass --force to overwrite"
            });
          }
          const backupDir = `${item.skillDir}.skillhub-backup-${randomUUID2()}`;
          const move2 = {
            phase: "backup",
            index,
            agent: item.target.agent,
            canonicalSkillDir: item.canonicalSkillDir,
            stagingDir: item.tempDir,
            backupDir,
            from: item.skillDir,
            to: backupDir
          };
          await observer?.beforeMove?.({ ...move2 });
          await options.authorizeTargetMutation?.([move2.from, move2.to], "replace");
          await rename3(item.skillDir, backupDir);
          item.backupDir = backupDir;
          await observer?.afterMove?.({ ...move2 });
          await assertReplaceableInstallation(item.backupDir, item.skillDir, item.canonicalSkillDir, {
            registry: options.registry,
            namespace: options.namespace,
            slug: options.slug
          }, lockedInventory);
          const expectedFiles = options.expectedTargetFiles?.[item.skillDir];
          if (expectedFiles && !options.allowTargetDrift) {
            const currentSnapshot = await snapshotSkillDirectory(item.backupDir);
            const changedFiles = diffSkillFiles(expectedFiles, currentSnapshot.files);
            if (changedFiles.length > 0) {
              throw new CliError(`local changes detected after upgrade planning at ${item.skillDir}`, EXIT.validation, {
                path: item.skillDir,
                changedFiles,
                next: "review the local changes and retry with --force only if replacement is intended"
              });
            }
          }
        }
        const move = {
          phase: "install",
          index,
          agent: item.target.agent,
          canonicalSkillDir: item.canonicalSkillDir,
          stagingDir: item.tempDir,
          backupDir: item.backupDir,
          from: item.tempDir,
          to: item.skillDir
        };
        await observer?.beforeMove?.({ ...move });
        await options.authorizeTargetMutation?.([move.from, move.to], "replace");
        await rename3(item.tempDir, item.skillDir);
        item.movedIntoPlace = true;
        await observer?.afterMove?.({ ...move });
      }
      {
        const replacedInstallDirs = await findEquivalentInventoryInstallDirs(lockedInventory, new Set(staged.map((item) => item.canonicalSkillDir)));
        await store.replaceTargetsAtInstallDirs(options.registry, options.namespace, options.slug, resolved.version, staged.map((item) => ({
          agent: item.target.agent,
          rootDir: item.target.rootDir,
          installDir: item.skillDir,
          installedAt: item.installedAt
        })), resolved.fingerprint, replacedInstallDirs, async (before, after) => {
          await assertInventoryCurrent(before);
          await observer?.beforeInventoryCommit?.({ before, after });
        });
        inventoryCommitted = true;
      }
      try {
        await observer?.afterInventoryCommit?.();
      } catch (error) {
        warn({ stage: "afterInventoryCommit", message: describeError(error) });
      }
      for (const item of staged) {
        if (!item.backupDir)
          continue;
        const path = item.backupDir;
        let cleanupError;
        try {
          await options.authorizeTargetMutation?.([path], "cleanup");
          await rm2(path, { recursive: true, force: true });
          item.backupDir = null;
        } catch (error) {
          cleanupError = describeError(error);
          warn({ stage: "backupCleanup", path, message: cleanupError });
        }
        try {
          await observer?.cleanupResult?.({
            path,
            removed: cleanupError === undefined,
            ...cleanupError === undefined ? {} : { error: cleanupError }
          });
        } catch (error) {
          warn({ stage: "cleanupResult", path, message: describeError(error) });
        }
      }
    } catch (error) {
      if (error instanceof InventoryCommitUnknownError) {
        preserveStaging = true;
        throw new CliError("installation commit outcome is unknown; files retained for recovery", EXIT.filesystem, {
          reason: "INSTALL_COMMIT_UNKNOWN",
          recovery: "unknown",
          targets: staged.map((item) => item.skillDir),
          retainedBackups: staged.flatMap((item) => item.backupDir ? [item.backupDir] : []),
          stagingPaths: staged.map((item) => item.tempDir),
          next: "verify the inventory and retained directories before retrying"
        });
      }
      if (inventoryCommitted) {
        warn({ stage: "afterInventoryCommit", message: describeError(error) });
      } else {
        const rollbackFailures = [];
        for (const item of [...staged].reverse()) {
          if (item.movedIntoPlace) {
            try {
              await options.authorizeTargetMutation?.([item.skillDir], "rollback");
              await rm2(item.skillDir, { recursive: true, force: true });
              item.movedIntoPlace = false;
            } catch (rollbackError) {
              rollbackFailures.push({
                operation: "remove replacement",
                path: item.skillDir,
                error: describeError(rollbackError)
              });
            }
          }
          if (item.backupDir) {
            const backupDir = item.backupDir;
            try {
              await options.authorizeTargetMutation?.([backupDir, item.skillDir], "rollback");
              await rename3(backupDir, item.skillDir);
              item.backupDir = null;
            } catch (rollbackError) {
              rollbackFailures.push({
                operation: "restore backup",
                path: backupDir,
                error: describeError(rollbackError)
              });
            }
          }
        }
        if (rollbackFailures.length > 0) {
          throw new CliError("installation failed and rollback was incomplete", EXIT.filesystem, {
            originalError: describeError(error),
            rollbackFailures,
            retainedBackups: staged.flatMap((item) => item.backupDir ? [item.backupDir] : []),
            next: "restore the retained backup directories before retrying"
          });
        }
        throw error;
      }
    } finally {
      for (const release of releases.reverse()) {
        try {
          await release();
        } catch (error) {
          warnings.push(`target lock cleanup failed: ${describeError(error)}`);
        }
      }
    }
    return {
      installed: staged.map((item) => ({ agent: item.target.agent, dir: item.skillDir })),
      warnings,
      transactionWarnings
    };
  } finally {
    for (const item of staged) {
      if (!preserveStaging && !item.movedIntoPlace) {
        try {
          await options.authorizeTargetMutation?.([item.tempDir], "cleanup");
          await rm2(item.tempDir, { recursive: true, force: true });
        } catch {}
      }
    }
  }
}
function inventoryChangedError() {
  return new CliError("installed skill records changed before commit", EXIT.validation, {
    next: "reload the installed skill and create a new plan before retrying"
  });
}
function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}
async function assertReplaceableInstallation(metadataDir, inventoryInstallDir, canonicalInstallDir, identity2, inventory) {
  const metadataResult = await readInstalledSkillMetadata(metadataDir);
  if (metadataResult.status !== "valid") {
    throw new CliError(`cannot verify SkillHub ownership of ${inventoryInstallDir}`, EXIT.filesystem, {
      path: inventoryInstallDir,
      reason: metadataResult.status === "missing" ? "installation metadata is missing" : metadataResult.reason,
      next: "move or remove the existing directory before installing"
    });
  }
  const inventoryOwners = [];
  for (const item of inventory.items) {
    for (const target of item.targets) {
      if (await canonicalInventoryInstallDir(target) === canonicalInstallDir) {
        inventoryOwners.push(item);
        break;
      }
    }
  }
  if (!sameInstalledSkillSource(metadataResult.metadata, identity2) || inventoryOwners.some((owner) => !sameInstalledSkillSource(owner, identity2))) {
    throw new CliError(`source conflict at ${inventoryInstallDir}`, EXIT.filesystem, {
      path: inventoryInstallDir,
      expected: identity2,
      actual: {
        registry: metadataResult.metadata.registry,
        namespace: metadataResult.metadata.namespace,
        slug: metadataResult.metadata.slug
      },
      next: "choose another target directory or remove the conflicting skill explicitly"
    });
  }
}
async function findEquivalentInventoryInstallDirs(inventory, canonicalInstallDirs) {
  const matches = [];
  for (const item of inventory.items) {
    for (const target of item.targets) {
      if (canonicalInstallDirs.has(await canonicalInventoryInstallDir(target))) {
        matches.push(target.installDir);
      }
    }
  }
  return matches;
}
async function canonicalInventoryInstallDir(target) {
  const resolvedRoot = resolve5(target.rootDir);
  const canonicalRoot = await canonicalizeExistingPath(resolvedRoot);
  return resolve5(canonicalRoot, relative6(resolvedRoot, resolve5(target.installDir)));
}
// ../../cli/src/services/upgrade-service.ts
import { isAbsolute as isAbsolute4, relative as relative7, resolve as resolve6 } from "node:path";

// ../../cli/src/shared/skill-name-parser.ts
function invalidCoordinate(skillName) {
  return new CliError(`invalid skill coordinate "${skillName}"`, EXIT.usage);
}
function parseSeparatedCoordinate(skillName, separatorIndex, separatorLength, namespaceStart = 0) {
  const namespace = skillName.slice(namespaceStart, separatorIndex);
  const slug = skillName.slice(separatorIndex + separatorLength);
  if (!namespace || !slug || slug.includes("/")) {
    throw invalidCoordinate(skillName);
  }
  return { namespace, slug };
}
function parseCoordinate(skillName) {
  if (!skillName) {
    throw invalidCoordinate(skillName);
  }
  const slashIndex = skillName.indexOf("/");
  if (skillName.startsWith("@")) {
    if (slashIndex < 0) {
      throw invalidCoordinate(skillName);
    }
    return parseSeparatedCoordinate(skillName, slashIndex, 1, 1);
  }
  const doubleDashIndex = skillName.indexOf("--");
  if (slashIndex >= 0 && (doubleDashIndex < 0 || slashIndex < doubleDashIndex)) {
    return parseSeparatedCoordinate(skillName, slashIndex, 1);
  }
  if (doubleDashIndex >= 0) {
    return parseSeparatedCoordinate(skillName, doubleDashIndex, 2);
  }
  return { slug: skillName };
}
function parseSkillName(skillName, defaultNamespace = "global") {
  const parsed = parseCoordinate(skillName);
  return {
    namespace: parsed.namespace ?? defaultNamespace,
    slug: parsed.slug
  };
}
function hasExplicitNamespace(skillName) {
  return parseCoordinate(skillName).namespace !== undefined;
}
function resolveSkillName(skillName, explicitNamespace) {
  const parsed = parseCoordinate(skillName);
  if (parsed.namespace !== undefined && explicitNamespace !== undefined && parsed.namespace !== explicitNamespace) {
    throw new CliError(`skill coordinate namespace "${parsed.namespace}" conflicts with --namespace "${explicitNamespace}"`, EXIT.usage);
  }
  return {
    namespace: parsed.namespace ?? explicitNamespace ?? "global",
    slug: parsed.slug
  };
}

// ../../cli/src/services/skill-version-order.ts
var import_semver = __toESM(require_semver2(), 1);
function compareSkillVersions(installedVersion, remoteVersion) {
  if (installedVersion === remoteVersion)
    return "same";
  if (!import_semver.valid(installedVersion) || !import_semver.valid(remoteVersion))
    return "unknown";
  const order = import_semver.compare(remoteVersion, installedVersion);
  if (order === 0)
    return "same";
  return order > 0 ? "remote-newer" : "remote-older";
}

// ../../cli/src/services/upgrade-service.ts
var MAX_UPGRADE_SELECTION = 50;
async function planSkillUpgrades(options) {
  if (options.coordinates.length === 0) {
    throw new CliError("provide at least one installed skill coordinate", EXIT.usage);
  }
  if (options.coordinates.length > MAX_UPGRADE_SELECTION) {
    throw new CliError(`upgrade accepts at most ${MAX_UPGRADE_SELECTION} coordinates`, EXIT.usage);
  }
  const store = new InventoryStore(options.home);
  const inventory = await store.read();
  const selected = selectInventoryItems(inventory.items, options);
  const items = [];
  for (const selection of selected.flatMap((group) => group.targets.map((target) => ({ item: { ...group.item, targets: [target] }, targets: [target] })))) {
    const coordinate = `@${selection.item.namespace}/${selection.item.slug}`;
    const base = {
      coordinate,
      registry: selection.item.registry,
      currentVersion: selection.targets[0].version,
      changedFiles: [],
      targets: selection.targets.map((target) => ({ agent: target.agent, dir: target.installDir })),
      inventoryItem: selection.item,
      selectedTargets: selection.targets,
      expectedTargetFiles: {},
      allowTargetDrift: options.force
    };
    let resolved;
    try {
      await assertDirectTargetOwnership(inventory, selection.targets.map((target) => target.installDir));
      const token = await options.tokenForRegistry(selection.item.registry);
      resolved = await new SkillHubClient(selection.item.registry, token).resolve(selection.item.namespace, selection.item.slug);
    } catch (error) {
      items.push({
        ...base,
        action: "blocked",
        reason: error instanceof Error ? error.message : "remote version unavailable"
      });
      continue;
    }
    if (resolved.namespace !== selection.item.namespace || resolved.slug !== selection.item.slug) {
      items.push({
        ...base,
        remoteVersion: resolved.version,
        action: "blocked",
        reason: "registry resolved a different skill identity"
      });
      continue;
    }
    const inspection = await inspectTargets(selection.item, selection.targets);
    const hardConflict = inspection.hardConflicts[0];
    if (hardConflict) {
      items.push({
        ...base,
        remoteVersion: resolved.version,
        action: "blocked",
        reason: hardConflict,
        changedFiles: inspection.changedFiles,
        expectedTargetFiles: inspection.currentFiles,
        resolved
      });
      continue;
    }
    if (inspection.changedFiles.length > 0 && !options.force) {
      items.push({
        ...base,
        remoteVersion: resolved.version,
        action: "blocked",
        reason: "local changes detected; pass --force to replace same-source files",
        changedFiles: inspection.changedFiles,
        expectedTargetFiles: inspection.currentFiles,
        resolved
      });
      continue;
    }
    if (inspection.baselineMissing && !options.force) {
      items.push({
        ...base,
        remoteVersion: resolved.version,
        action: "blocked",
        reason: "installed metadata has no file baseline; pass --force to migrate this same-source installation",
        expectedTargetFiles: inspection.currentFiles,
        resolved
      });
      continue;
    }
    const versionOrder = compareSkillVersions(selection.targets[0].version, resolved.version);
    if (versionOrder === "remote-older") {
      items.push({
        ...base,
        remoteVersion: resolved.version,
        action: "blocked",
        reason: "remote version is older than the installed version; local files were kept",
        changedFiles: inspection.changedFiles,
        expectedTargetFiles: inspection.currentFiles,
        resolved
      });
      continue;
    }
    if (versionOrder === "unknown") {
      items.push({
        ...base,
        remoteVersion: resolved.version,
        action: "blocked",
        reason: "cannot determine version order; use explicit install after verifying the release",
        changedFiles: inspection.changedFiles,
        expectedTargetFiles: inspection.currentFiles,
        resolved
      });
      continue;
    }
    const unchanged = versionOrder === "same" && selection.targets[0].fingerprint === resolved.fingerprint && inspection.metadataCurrent;
    if (versionOrder === "same" && !unchanged) {
      items.push({
        ...base,
        remoteVersion: resolved.version,
        action: "blocked",
        reason: "remote content changed without a newer version; use explicit install after verifying the release",
        changedFiles: inspection.changedFiles,
        expectedTargetFiles: inspection.currentFiles,
        resolved
      });
      continue;
    }
    items.push({
      ...base,
      remoteVersion: resolved.version,
      action: unchanged ? "unchanged" : "upgrade",
      changedFiles: inspection.changedFiles,
      expectedTargetFiles: inspection.currentFiles,
      resolved
    });
  }
  return {
    items,
    blocked: items.filter((item) => item.action === "blocked").length,
    upgrades: items.filter((item) => item.action === "upgrade").length,
    unchanged: items.filter((item) => item.action === "unchanged").length
  };
}
async function executeSkillUpgradePlan(plan, options) {
  if (plan.blocked > 0) {
    throw new CliError("upgrade plan contains blocked skills", EXIT.validation);
  }
  const items = [];
  let stopped = false;
  for (const item of plan.items) {
    if (item.action === "unchanged") {
      items.push({ coordinate: item.coordinate, action: "unchanged" });
      continue;
    }
    if (item.action !== "upgrade" || !item.resolved)
      continue;
    if (stopped) {
      items.push({ coordinate: item.coordinate, action: "not-attempted" });
      continue;
    }
    try {
      const token = await options.tokenForRegistry(item.registry);
      const installed = await (options.installSkillFn ?? installSkill)({
        registry: item.registry,
        token,
        namespace: item.inventoryItem.namespace,
        slug: item.inventoryItem.slug,
        resolved: item.resolved,
        targets: item.selectedTargets.map((target) => ({
          agent: target.agent,
          rootDir: target.rootDir,
          scope: "project",
          source: "explicit"
        })),
        force: true,
        home: options.home,
        expectedTargetFiles: item.expectedTargetFiles,
        allowTargetDrift: item.allowTargetDrift,
        requireExistingTargets: true,
        expectedInventoryItem: item.inventoryItem
      });
      items.push({
        coordinate: item.coordinate,
        action: "upgraded",
        ...installed.warnings?.length ? { warnings: installed.warnings } : {}
      });
    } catch (error) {
      items.push({
        coordinate: item.coordinate,
        action: "failed",
        reason: error instanceof Error ? error.message : "unexpected upgrade failure",
        ...error instanceof CliError ? { exitCode: error.exitCode } : {}
      });
      stopped = true;
    }
  }
  return {
    items,
    upgraded: items.filter((item) => item.action === "upgraded").length,
    unchanged: items.filter((item) => item.action === "unchanged").length,
    failed: items.filter((item) => item.action === "failed").length,
    notAttempted: items.filter((item) => item.action === "not-attempted").length
  };
}
function selectInventoryItems(items, options) {
  const selected = new Map;
  for (const coordinate of options.coordinates) {
    const explicitNamespace = hasExplicitNamespace(coordinate);
    const parsed = explicitNamespace ? resolveSkillName(coordinate, options.namespace) : parseSkillName(coordinate);
    const namespace = explicitNamespace ? parsed.namespace : options.namespace;
    const matches = items.flatMap((item) => {
      if (item.slug !== parsed.slug)
        return [];
      if (namespace && item.namespace !== namespace)
        return [];
      if (options.registry && normalizeRegistry2(item.registry) !== normalizeRegistry2(options.registry))
        return [];
      const targets = item.targets.filter((target) => matchesTargetFilters(target, options.agents, options.dir));
      return targets.length > 0 ? [{ item, targets }] : [];
    });
    if (matches.length === 0) {
      throw new CliError(`skill "${coordinate}" is not installed`, EXIT.usage, {
        next: `use skillhub install ${coordinate}`
      });
    }
    if (matches.length > 1) {
      throw new CliError(`installed skill "${coordinate}" is ambiguous`, EXIT.usage, {
        matches: matches.map((match2) => `${match2.item.registry} @${match2.item.namespace}/${match2.item.slug}`),
        next: "use a full coordinate and --registry to select one installation source"
      });
    }
    const match = matches[0];
    const key = `${normalizeRegistry2(match.item.registry)}\x00${match.item.namespace}\x00${match.item.slug}`;
    selected.set(key, match);
  }
  if (selected.size > MAX_UPGRADE_SELECTION) {
    throw new CliError(`upgrade resolves to at most ${MAX_UPGRADE_SELECTION} skills`, EXIT.usage);
  }
  return [...selected.values()];
}
async function inspectTargets(item, targets) {
  const hardConflicts = [];
  const changedFiles = new Set;
  let baselineMissing = false;
  let metadataCurrent = true;
  const currentFiles = {};
  for (const target of targets) {
    if (!isAbsolute4(target.rootDir) || !isAbsolute4(target.installDir)) {
      hardConflicts.push(`legacy relative target path is unsafe to upgrade: ${target.installDir}`);
      continue;
    }
    const installDir = await canonicalizeExistingPath(target.installDir);
    if (!await pathExists(installDir)) {
      hardConflicts.push(`installed target is missing: ${target.installDir}`);
      continue;
    }
    const result = await readInstalledSkillMetadata(installDir);
    if (result.status !== "valid") {
      hardConflicts.push(`metadata-invalid at ${target.installDir}: ${result.status === "missing" ? "missing" : result.reason}`);
      continue;
    }
    if (!sameInstalledSkillSource(result.metadata, item)) {
      hardConflicts.push(`source-conflict at ${target.installDir}`);
      continue;
    }
    if (!result.metadata.files) {
      baselineMissing = true;
    } else {
      const snapshot = await snapshotSkillDirectory(installDir);
      currentFiles[target.installDir] = snapshot.files;
      for (const path of diffSkillFiles(result.metadata.files, snapshot.files)) {
        changedFiles.add(`${target.installDir}:${path}`);
      }
    }
    if (result.metadata.version !== target.version || result.metadata.fingerprint !== target.fingerprint) {
      metadataCurrent = false;
    }
  }
  return {
    hardConflicts,
    changedFiles: [...changedFiles].sort(),
    baselineMissing,
    metadataCurrent,
    currentFiles
  };
}
function matchesTargetFilters(target, agents, dir) {
  if (agents?.length && !agents.includes(target.agent))
    return false;
  if (!dir)
    return true;
  const filterPath = resolve6(dir);
  const installPath = resolve6(target.installDir);
  const rootPath = resolve6(target.rootDir);
  return isSameOrWithin(filterPath, installPath) || isSameOrWithin(filterPath, rootPath);
}
function isSameOrWithin(parent, candidate) {
  const rel = relative7(parent, candidate);
  return rel === "" || !rel.startsWith("..") && !rel.startsWith("/") && !rel.startsWith("\\");
}
function normalizeRegistry2(registry) {
  return registry.replace(/\/+$/, "");
}
// ../../cli/src/integrations/operation-store.ts
import { createHash as createHash4, randomUUID as randomUUID3 } from "node:crypto";
import { constants } from "node:fs";
import { chmod as chmod2, lstat as lstat3, mkdir as mkdir4, open, readdir as readdir4, realpath, rename as rename4, rm as rm3 } from "node:fs/promises";
import { basename, dirname as dirname4, isAbsolute as isAbsolute6, join as join7 } from "node:path";

// ../../cli/src/integrations/transaction-journal.ts
var text2 = exports_external.string().min(1).max(2048);
var source = text2.refine((value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password && !url.search && !url.hash;
  } catch {
    return false;
  }
}, "Expected a credential-free registry identity");
var inventory = exports_external.union([inventoryMemorySchema, legacyInventorySchema.transform((value) => parseInventory(value))]).transform((value) => value).refine((value) => [...value.items, ...value.suites ?? []].every((item) => source.safeParse(item.registry).success), "Unsafe snapshot source");
var item = exports_external.union([inventoryRecordSchema, legacyInventorySchema.shape.items.element.transform((value) => parseInventory({ items: [value] }).items[0])]).transform((value) => value).refine((value) => source.safeParse(value.registry).success, "Unsafe snapshot source");
var move = exports_external.object({
  phase: exports_external.enum(["backup", "install"]),
  index: exports_external.number().int().nonnegative(),
  agent: text2,
  canonicalSkillDir: text2,
  stagingDir: text2,
  backupDir: text2.nullable(),
  from: text2,
  to: text2
}).strict();
var commit = exports_external.object({ before: inventory, after: inventory }).strict();
var inventorySnapshotSchema = inventory;
var inventoryItemSchema = item;
var cleanup = exports_external.object({ path: text2, removed: exports_external.boolean(), error: text2.optional() }).strict();
var staging = exports_external.object({ canonicalSkillDir: text2, rootDir: text2, stagingDir: text2 }).strict();
var preparation = exports_external.object({
  before: inventory,
  release: exports_external.object({ registry: source, namespace: text2, slug: text2, version: text2, fingerprint: text2 }).strict(),
  targets: exports_external.array(exports_external.object({ agent: text2, canonicalSkillDir: text2, skillDir: text2, stagingDir: text2, installedAt: text2 }).strict()).min(1).max(100)
}).strict();
var recoveryAction = exports_external.object({
  kind: exports_external.enum(["return-staging", "restore-backup", "remove-staging"]),
  index: exports_external.number().int().nonnegative(),
  from: text2,
  to: text2.nullable()
}).strict();
var transactionEvent = exports_external.discriminatedUnion("type", [
  exports_external.object({ type: exports_external.literal("beforeStaging"), staging }).strict(),
  exports_external.object({ type: exports_external.literal("beforePreparation"), preparation }).strict(),
  exports_external.object({ type: exports_external.literal("beforeMove"), move }).strict(),
  exports_external.object({ type: exports_external.literal("afterMove"), move }).strict(),
  exports_external.object({ type: exports_external.literal("beforeInventoryCommit"), commit }).strict(),
  exports_external.object({ type: exports_external.literal("afterInventoryCommit") }).strict(),
  exports_external.object({ type: exports_external.literal("cleanupResult"), cleanup }).strict()
]);
var transactionState = exports_external.object({
  staging: exports_external.array(staging).max(100).optional(),
  preparation: preparation.optional(),
  recoveryActions: exports_external.array(exports_external.object({ action: recoveryAction, completed: exports_external.boolean() }).strict()).max(300).optional(),
  moves: exports_external.array(exports_external.object({ move, completed: exports_external.boolean() }).strict()).max(200),
  inventoryCommit: commit.extend({ committed: exports_external.boolean() }).optional(),
  cleanup: exports_external.array(cleanup).max(100)
}).strict();
async function createInstallTransactionObserver(store, operationId, ownerId) {
  const initial = await store.get(operationId, ownerId);
  if (!initial?.operation.targetPaths || !["install", "upgrade"].includes(initial.operation.kind) || initial.operation.status.phase !== "staging") {
    throw new Error("Installation journal requires an owned operation in staging");
  }
  let revision = initial.revision;
  let prepared = false;
  const append = async (event) => {
    const current = await store.recordTransaction(operationId, ownerId, revision, event);
    revision = current.revision;
  };
  return {
    beforeTargetMutation: (targets) => store.assertTargetsAvailable(targets, { operationId, ownerId }),
    beforeStaging: (staging2) => append({ type: "beforeStaging", staging: staging2 }),
    beforePreparation: async (preparation2) => {
      await append({ type: "beforePreparation", preparation: preparation2 });
      prepared = true;
    },
    beforeMove: (move2) => {
      if (!prepared)
        throw new Error("Installation preparation must be persisted before moving files");
      return append({ type: "beforeMove", move: move2 });
    },
    afterMove: (move2) => append({ type: "afterMove", move: move2 }),
    beforeInventoryCommit: (commit2) => append({ type: "beforeInventoryCommit", commit: commit2 }),
    afterInventoryCommit: () => append({ type: "afterInventoryCommit" }),
    cleanupResult: (cleanup2) => append({ type: "cleanupResult", cleanup: cleanup2 })
  };
}

// ../../cli/src/integrations/removal-journal.ts
import { dirname as dirname3, isAbsolute as isAbsolute5, join as join6, resolve as resolve7 } from "node:path";
import { isDeepStrictEqual as isDeepStrictEqual2 } from "node:util";
var path = exports_external.string().min(1).max(2048).refine((value) => isAbsolute5(value) && resolve7(value) === value);
var intent = exports_external.object({
  inventoryItem: inventoryItemSchema,
  target: exports_external.object({ root: path, path, scope: exports_external.enum(["user", "project"]) }).strict(),
  quarantine: path.nullable(),
  files: exports_external.record(exports_external.string(), exports_external.string()).nullable()
}).strict();
var commit2 = exports_external.object({ before: inventorySnapshotSchema, after: inventorySnapshotSchema }).strict();
var removalJournal = exports_external.object({
  intent,
  isolated: exports_external.boolean(),
  inventoryCommit: commit2.extend({ committed: exports_external.boolean() }).optional(),
  cleanup: exports_external.object({ removed: exports_external.boolean() }).strict().optional(),
  restore: exports_external.object({ completed: exports_external.boolean() }).strict().optional()
}).strict();
var removalEvent = exports_external.discriminatedUnion("type", [
  exports_external.object({ type: exports_external.literal("intent"), intent }).strict(),
  exports_external.object({ type: exports_external.literal("isolated") }).strict(),
  exports_external.object({ type: exports_external.literal("beforeCommit"), commit: commit2 }).strict(),
  exports_external.object({ type: exports_external.literal("committed") }).strict(),
  exports_external.object({ type: exports_external.literal("cleanup"), removed: exports_external.boolean() }).strict(),
  exports_external.object({ type: exports_external.literal("restore"), completed: exports_external.boolean() }).strict()
]);
function applyRemovalEvent(record, event) {
  const fail = () => {
    throw new Error("Invalid removal journal transition");
  };
  const operation = record.operation;
  if (!["uninstall", "remove-stale-record"].includes(operation.kind) || !["revalidating", "committing", "recovering"].includes(operation.status.phase) && !(operation.status.phase === "completed" && event.type === "cleanup"))
    fail();
  if (event.type === "intent") {
    const value = event.intent;
    const item2 = value.inventoryItem;
    const targets = item2.targets.filter((target) => target.installDir === value.target.path);
    if (record.removal || operation.status.phase !== "revalidating" || !isDeepStrictEqual2(operation.targetPaths, [value.target.path]) || !sameInstalledSkillSource(item2, { registry: operation.context.sourceIdentity, namespace: operation.namespace, slug: operation.slug }) || targets[0]?.version !== operation.version || !targets[0]?.fingerprint || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(item2.slug) || join6(value.target.root, item2.slug) !== value.target.path || targets.length !== 1 || targets[0].agent !== "dsh" || targets[0].rootDir !== value.target.root || !isDeepStrictEqual2(targetInstalledBy(item2, targets[0]), ["direct"]))
      fail();
    if (operation.kind === "uninstall") {
      if (value.quarantine !== join6(dirname3(value.target.root), ".skillhub-trash", record.operationId) || value.files === null || !Object.hasOwn(value.files, "SKILL.md"))
        fail();
    } else if (value.quarantine !== null || value.files !== null)
      fail();
    return { intent: value, isolated: false };
  }
  const state = record.removal && structuredClone(record.removal);
  if (!state)
    return fail();
  switch (event.type) {
    case "isolated":
      if (operation.kind !== "uninstall" || state.isolated || state.inventoryCommit || state.restore)
        fail();
      state.isolated = true;
      break;
    case "beforeCommit": {
      if (state.inventoryCommit || state.restore || operation.kind === "uninstall" && !state.isolated)
        fail();
      const before = event.commit.before;
      const expected = structuredClone(before);
      const matches = expected.items.filter((item3) => sameInstalledSkillSource(item3, state.intent.inventoryItem));
      if (!isDeepStrictEqual2(matches.map((item3) => ({ ...item3, targets: item3.targets.filter((target) => target.installDir === state.intent.target.path) })), [{ ...state.intent.inventoryItem, targets: state.intent.inventoryItem.targets.filter((target) => target.installDir === state.intent.target.path) }]))
        fail();
      const item2 = matches[0];
      item2.targets = item2.targets.filter((target) => target.installDir !== state.intent.target.path);
      if (!item2.targets.length)
        expected.items = expected.items.filter((entry) => entry !== item2);
      if (!isDeepStrictEqual2(expected, event.commit.after))
        fail();
      state.inventoryCommit = { ...event.commit, committed: false };
      break;
    }
    case "committed":
      if (!state.inventoryCommit || state.restore)
        return fail();
      state.inventoryCommit.committed = true;
      break;
    case "cleanup":
      if (operation.kind !== "uninstall" || !state.inventoryCommit?.committed || state.restore)
        fail();
      state.cleanup = { removed: event.removed };
      break;
    case "restore":
      if (operation.kind !== "uninstall" || state.inventoryCommit?.committed || operation.status.phase !== "recovering" || event.completed && !state.restore || state.restore?.completed)
        fail();
      state.restore = { completed: event.completed };
      break;
  }
  return state;
}

// ../../cli/src/integrations/operation-store.ts
var id = exports_external.string().uuid();
var text3 = exports_external.string().min(1).max(2048);
var phase = exports_external.enum(["accepted", "staging", "revalidating", "committing", "recovering", "completed", "failed", "recovery-required", "unknown"]);
var context = exports_external.object({
  hostInstanceId: id,
  hostLabel: text3,
  sourceIdentity: text3,
  sourceLabel: text3,
  sourceRevision: text3,
  initiatedFrom: exports_external.enum(["plaza", "conversation"]),
  createdAt: exports_external.string().datetime(),
  updatedAt: exports_external.string().datetime()
}).strict();
var input = exports_external.object({
  kind: exports_external.enum(["install", "upgrade", "uninstall", "remove-stale-record"]),
  namespace: text3,
  slug: text3,
  version: text3,
  targetLabel: text3,
  targetPaths: exports_external.array(text3.refine(isAbsolute6, "Expected a trusted canonical target path")).min(1).max(100).optional(),
  context: context.omit({ hostInstanceId: true, createdAt: true, updatedAt: true })
}).strict();
var status = exports_external.object({
  phase,
  files: exports_external.enum(["pending", "installed", "already-installed", "upgraded", "removed", "stale-record-removed", "failed", "unknown"]),
  discovery: exports_external.enum(["unconfirmed", "confirmed", "failed"]),
  warnings: exports_external.array(text3).max(100),
  recovery: exports_external.enum(["not-needed", "restored", "incomplete", "unknown"])
}).strict();
var existingInstallation = exports_external.object({
  fingerprint: text3,
  versionId: exports_external.number().int().positive(),
  inventoryDigest: exports_external.string().regex(/^[a-f0-9]{64}$/)
}).strict();
var record = exports_external.object({
  schemaVersion: exports_external.union([exports_external.literal(1), exports_external.literal(2)]),
  operationId: id,
  ownerId: text3,
  requestKey: id,
  requestDigest: exports_external.string().regex(/^[a-f0-9]{64}$/),
  revision: exports_external.number().int().nonnegative(),
  operation: input.omit({ context: true }).extend({ context, status }),
  transaction: transactionState.optional(),
  removal: removalJournal.optional(),
  existingInstallation: existingInstallation.optional()
}).strict();

class OperationStoreError extends Error {
  code;
  constructor(code) {
    super(code);
    this.code = code;
  }
}
function operationRequestDigest(parameters) {
  const entries = Object.entries(parameters).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  if (entries.some(([, value]) => value !== null && !["string", "number", "boolean"].includes(typeof value) || typeof value === "number" && !Number.isFinite(value)))
    throw new Error("Invalid request parameters");
  return createHash4("sha256").update(JSON.stringify(entries)).digest("hex");
}

class OperationStore {
  root;
  hostInstanceId;
  constructor(root, hostInstanceId) {
    this.root = root;
    this.hostInstanceId = hostInstanceId;
  }
  static async open(root) {
    if (!isAbsolute6(root))
      throw new Error("Operation state requires a trusted absolute directory");
    await mkdir4(root, { recursive: true, mode: 448 });
    const info = await lstat3(root);
    if (!info.isDirectory() || info.isSymbolicLink() || process.getuid && info.uid !== process.getuid())
      throw new Error("Unsafe operation state directory");
    if (process.platform !== "win32")
      await chmod2(root, 448);
    const pending = new OperationStore(root, "");
    return pending.locked(async () => {
      const path2 = join7(root, "host.json");
      const saved = await readJson(path2);
      const hostInstanceId = saved === undefined ? randomUUID3() : exports_external.object({ hostInstanceId: id }).strict().parse(saved).hostInstanceId;
      if (saved === undefined)
        await atomicWrite(path2, { hostInstanceId });
      return new OperationStore(root, hostInstanceId);
    });
  }
  async accept(request, validateNew) {
    this.validateRequest(request);
    const existing = await this.locked(() => this.findRequest(request));
    if (existing || request.mode === "retry")
      return existing;
    const accepted = input.parse(await validateNew());
    const source2 = new URL(accepted.context.sourceIdentity);
    if (!["http:", "https:"].includes(source2.protocol) || source2.username || source2.password || source2.search || source2.hash)
      throw new Error("Unsafe source identity");
    return this.locked(async () => {
      const duplicate = await this.findRequest(request);
      if (duplicate)
        return duplicate;
      const now = new Date().toISOString();
      const value = {
        schemaVersion: 2,
        operationId: randomUUID3(),
        ownerId: request.ownerId,
        requestKey: request.requestKey,
        requestDigest: request.requestDigest,
        revision: 0,
        operation: {
          ...accepted,
          context: { ...accepted.context, hostInstanceId: this.hostInstanceId, createdAt: now, updatedAt: now },
          status: { phase: "accepted", files: "pending", discovery: "unconfirmed", recovery: "not-needed", warnings: [] }
        }
      };
      await writeOperationRecord(this.path(value.operationId), record.parse(value));
      return value;
    });
  }
  async get(operationId, ownerId) {
    const value = await this.read(operationId);
    return value?.ownerId === ownerId ? value : undefined;
  }
  async listForRecovery() {
    return this.locked(async () => (await this.readAll()).filter((value) => needsRecovery(value) || needsCleanupVerification(value)));
  }
  async assertTargetsAvailable(targets, currentOperation) {
    await this.locked(async () => {
      const current = await this.get(currentOperation.operationId, currentOperation.ownerId);
      if (!current?.operation.targetPaths || !["staging", "revalidating"].includes(current.operation.status.phase) || targets.length !== current.operation.targetPaths.length || targets.some((path2) => !current.operation.targetPaths.includes(path2))) {
        throw new OperationStoreError("INVALID_TRANSITION");
      }
      const canonicalTargets = await Promise.all(targets.map(canonicalOperationTarget));
      for (const pending of await this.readAll()) {
        if (pending.operationId === current.operationId || !needsRecovery(pending))
          continue;
        const status2 = pending.operation.status;
        const mayHaveChangedFiles = !!pending.transaction?.moves.length || !!pending.removal?.intent.quarantine || ["committing", "recovering", "recovery-required", "unknown"].includes(status2.phase) || ["incomplete", "unknown"].includes(status2.recovery);
        if (!mayHaveChangedFiles)
          continue;
        const bound = pending.operation.targetPaths ?? pending.transaction?.moves.map((entry) => entry.move.canonicalSkillDir);
        if (!bound?.length)
          throw new OperationStoreError("TARGET_RECOVERY_REQUIRED");
        for (const path2 of bound) {
          const canonical = await canonicalOperationTarget(path2);
          if (canonicalTargets.some((target) => pathsOverlap(target, canonical)))
            throw new OperationStoreError("TARGET_RECOVERY_REQUIRED");
        }
      }
    });
  }
  async update(operationId, ownerId, revision, next) {
    const parsed = status.parse(next);
    return this.locked(async () => {
      const current = await this.get(operationId, ownerId);
      if (!current)
        throw new OperationStoreError("CORRUPT_RECORD");
      if (current.revision !== revision)
        throw new OperationStoreError("REVISION_CONFLICT");
      assertTransition(current, parsed);
      const value = { ...current, revision: revision + 1, operation: {
        ...current.operation,
        context: { ...current.operation.context, updatedAt: new Date().toISOString() },
        status: parsed
      } };
      await writeOperationRecord(this.path(operationId), value);
      return value;
    });
  }
  async completeExistingInstallation(operationId, ownerId, revision, snapshot) {
    const parsed = existingInstallation.parse(snapshot);
    return this.locked(async () => {
      const current = await this.get(operationId, ownerId);
      if (!current)
        throw new OperationStoreError("CORRUPT_RECORD");
      if (current.revision !== revision)
        throw new OperationStoreError("REVISION_CONFLICT");
      if (current.operation.kind !== "install" || current.operation.status.phase !== "revalidating" || current.operation.status.files !== "pending" || current.operation.status.recovery !== "not-needed" || current.transaction || current.removal || current.existingInstallation || current.operation.targetPaths?.length !== 1)
        throw new OperationStoreError("INVALID_TRANSITION");
      const next = {
        ...current.operation.status,
        phase: "completed",
        files: "already-installed",
        recovery: "not-needed"
      };
      assertTransition(current, next);
      const value = {
        ...current,
        revision: revision + 1,
        existingInstallation: parsed,
        operation: {
          ...current.operation,
          status: next,
          context: { ...current.operation.context, updatedAt: new Date().toISOString() }
        }
      };
      await writeOperationRecord(this.path(operationId), record.parse(value));
      return value;
    });
  }
  async recordTransaction(operationId, ownerId, revision, event) {
    const parsed = transactionEvent.parse(event);
    return this.locked(async () => {
      const current = await this.get(operationId, ownerId);
      if (!current)
        throw new OperationStoreError("CORRUPT_RECORD");
      if (current.revision !== revision)
        throw new OperationStoreError("REVISION_CONFLICT");
      if (!["install", "upgrade"].includes(current.operation.kind) || !["staging", "revalidating", "committing"].includes(current.operation.status.phase))
        throw new OperationStoreError("INVALID_TRANSITION");
      const transaction = current.transaction ?? { moves: [], cleanup: [] };
      let nextPhase = current.operation.status.phase;
      switch (parsed.type) {
        case "beforeStaging": {
          const stage = parsed.staging;
          const suffix = basename(stage.stagingDir).slice(`.${current.operation.slug}.install-`.length);
          if (current.operation.status.phase !== "staging" || transaction.preparation || transaction.moves.length || !current.operation.targetPaths?.includes(stage.canonicalSkillDir) || !isAbsolute6(stage.rootDir) || dirname4(stage.stagingDir) !== stage.rootDir || !basename(stage.stagingDir).startsWith(`.${current.operation.slug}.install-`) || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(suffix) || join7(await canonicalizeExistingPath(stage.rootDir), current.operation.slug) !== stage.canonicalSkillDir || transaction.staging?.some((entry) => entry.canonicalSkillDir === stage.canonicalSkillDir || entry.stagingDir === stage.stagingDir)) {
            throw new OperationStoreError("INVALID_TRANSITION");
          }
          transaction.staging ??= [];
          transaction.staging.push(stage);
          break;
        }
        case "beforePreparation": {
          const { release, targets } = parsed.preparation;
          const bound = current.operation.targetPaths;
          if (transaction.preparation || transaction.moves.length || transaction.inventoryCommit || !bound || release.registry !== current.operation.context.sourceIdentity || release.namespace !== current.operation.namespace || release.slug !== current.operation.slug || release.version !== current.operation.version || targets.length !== bound.length || new Set(targets.map((target) => target.canonicalSkillDir)).size !== targets.length || targets.some((target) => !bound.includes(target.canonicalSkillDir)) || transaction.staging && (transaction.staging.length !== targets.length || targets.some((target) => !transaction.staging.some((stage) => stage.canonicalSkillDir === target.canonicalSkillDir && stage.stagingDir === target.stagingDir))))
            throw new OperationStoreError("INVALID_TRANSITION");
          transaction.preparation = parsed.preparation;
          nextPhase = "revalidating";
          break;
        }
        case "beforeMove": {
          if (!current.operation.targetPaths?.includes(parsed.move.canonicalSkillDir) || transaction.inventoryCommit || transaction.moves.some((entry) => entry.move.index === parsed.move.index && entry.move.phase === parsed.move.phase))
            throw new OperationStoreError("INVALID_TRANSITION");
          if (transaction.preparation) {
            const target = transaction.preparation.targets[parsed.move.index];
            if (!target || target.canonicalSkillDir !== parsed.move.canonicalSkillDir || target.agent !== parsed.move.agent || target.stagingDir !== parsed.move.stagingDir || (parsed.move.phase === "backup" ? parsed.move.from !== target.skillDir : parsed.move.to !== target.skillDir)) {
              throw new OperationStoreError("INVALID_TRANSITION");
            }
          }
          transaction.moves.push({ move: parsed.move, completed: false });
          nextPhase = "revalidating";
          break;
        }
        case "afterMove": {
          const entry = transaction.moves.find((entry2) => JSON.stringify(entry2.move) === JSON.stringify(parsed.move));
          if (!entry || transaction.inventoryCommit)
            throw new OperationStoreError("INVALID_TRANSITION");
          entry.completed = true;
          break;
        }
        case "beforeInventoryCommit": {
          if (transaction.inventoryCommit || !transaction.moves.length || transaction.moves.some((entry) => !entry.completed))
            throw new OperationStoreError("INVALID_TRANSITION");
          if (transaction.preparation?.targets.some((target) => !transaction.moves.some((entry) => entry.move.phase === "install" && entry.move.canonicalSkillDir === target.canonicalSkillDir && entry.completed)))
            throw new OperationStoreError("INVALID_TRANSITION");
          transaction.inventoryCommit = { ...parsed.commit, committed: false };
          nextPhase = "committing";
          break;
        }
        case "afterInventoryCommit": {
          if (!transaction.inventoryCommit)
            throw new OperationStoreError("INVALID_TRANSITION");
          transaction.inventoryCommit.committed = true;
          break;
        }
        case "cleanupResult": {
          if (!transaction.inventoryCommit?.committed || !transaction.moves.some((entry) => entry.move.phase === "backup" && entry.move.to === parsed.cleanup.path))
            throw new OperationStoreError("INVALID_TRANSITION");
          transaction.cleanup.push(parsed.cleanup);
          break;
        }
      }
      const value = {
        ...current,
        revision: revision + 1,
        transaction,
        operation: {
          ...current.operation,
          status: { ...current.operation.status, phase: nextPhase },
          context: { ...current.operation.context, updatedAt: new Date().toISOString() }
        }
      };
      await writeOperationRecord(this.path(operationId), record.parse(value));
      return value;
    });
  }
  async confirmCommittedInstallation(operationId, ownerId, revision) {
    return this.locked(async () => {
      const current = await this.get(operationId, ownerId);
      if (!current)
        throw new OperationStoreError("CORRUPT_RECORD");
      if (current.revision !== revision)
        throw new OperationStoreError("REVISION_CONFLICT");
      const transaction = current.transaction;
      const targets = current.operation.targetPaths;
      if (!["install", "upgrade"].includes(current.operation.kind) || !transaction?.inventoryCommit || !targets?.length || !["committing", "recovering", "recovery-required", "unknown", "completed"].includes(current.operation.status.phase) || targets.some((path2) => transaction.moves.filter((entry) => entry.move.phase === "install" && entry.move.canonicalSkillDir === path2 && entry.completed).length !== 1))
        throw new OperationStoreError("INVALID_TRANSITION");
      const files = current.operation.kind === "install" ? "installed" : "upgraded";
      if (current.operation.status.phase === "completed" && current.operation.status.files !== files)
        throw new OperationStoreError("INVALID_TRANSITION");
      if (current.operation.status.phase === "completed" && transaction.inventoryCommit.committed)
        return current;
      transaction.inventoryCommit.committed = true;
      const warnings = [...current.operation.status.warnings];
      if (needsCleanupVerification(current) && !warnings.includes("Backup cleanup requires verification.")) {
        warnings.push("Backup cleanup requires verification.");
      }
      const value = {
        ...current,
        revision: revision + 1,
        transaction,
        operation: {
          ...current.operation,
          context: { ...current.operation.context, updatedAt: new Date().toISOString() },
          status: { ...current.operation.status, phase: "completed", files, recovery: "not-needed", warnings }
        }
      };
      await writeOperationRecord(this.path(operationId), record.parse(value));
      return value;
    });
  }
  async recordRecoveredCleanup(operationId, ownerId, revision, cleanup2) {
    const event = transactionEvent.parse({ type: "cleanupResult", cleanup: cleanup2 });
    if (event.type !== "cleanupResult")
      throw new OperationStoreError("INVALID_TRANSITION");
    return this.locked(async () => {
      const current = await this.get(operationId, ownerId);
      if (!current)
        throw new OperationStoreError("CORRUPT_RECORD");
      if (current.revision !== revision)
        throw new OperationStoreError("REVISION_CONFLICT");
      const transaction = current.transaction;
      if (!["install", "upgrade"].includes(current.operation.kind) || current.operation.status.phase !== "completed" || !transaction?.inventoryCommit?.committed || !transaction.moves.some((entry) => entry.move.phase === "backup" && entry.move.to === event.cleanup.path)) {
        throw new OperationStoreError("INVALID_TRANSITION");
      }
      transaction.cleanup = [...transaction.cleanup.filter((entry) => entry.path !== event.cleanup.path), event.cleanup];
      const warning = "Backup cleanup requires verification.";
      const warnings = current.operation.status.warnings.filter((value2) => value2 !== warning);
      if (needsCleanupVerification(current))
        warnings.push(warning);
      const value = {
        ...current,
        revision: revision + 1,
        transaction,
        operation: {
          ...current.operation,
          status: { ...current.operation.status, warnings },
          context: { ...current.operation.context, updatedAt: new Date().toISOString() }
        }
      };
      await writeOperationRecord(this.path(operationId), record.parse(value));
      return value;
    });
  }
  async recordRecoveryAction(operationId, ownerId, revision, action, completed) {
    const parsed = recoveryAction.parse(action);
    return this.locked(async () => {
      const current = await this.get(operationId, ownerId);
      if (!current)
        throw new OperationStoreError("CORRUPT_RECORD");
      if (current.revision !== revision)
        throw new OperationStoreError("REVISION_CONFLICT");
      const transaction = current.transaction;
      const target = transaction?.preparation?.targets[parsed.index];
      if (current.operation.status.phase !== "recovering" || !transaction || !target || transaction.inventoryCommit?.committed) {
        throw new OperationStoreError("INVALID_TRANSITION");
      }
      const stage = target.stagingDir;
      const skill = target.skillDir;
      const backup = transaction.moves.find((entry) => entry.move.phase === "backup" && entry.move.index === parsed.index)?.move.to;
      if (parsed.kind === "return-staging" ? parsed.from !== skill || parsed.to !== stage : parsed.kind === "restore-backup" ? parsed.from !== backup || parsed.to !== skill : parsed.from !== stage || parsed.to !== null)
        throw new OperationStoreError("INVALID_TRANSITION");
      const actions = transaction.recoveryActions ?? [];
      const existing = actions.find((entry) => JSON.stringify(entry.action) === JSON.stringify(parsed));
      if (completed && !existing || !completed && existing?.completed)
        throw new OperationStoreError("INVALID_TRANSITION");
      if (existing)
        existing.completed = completed;
      else
        actions.push({ action: parsed, completed: false });
      transaction.recoveryActions = actions;
      const value = {
        ...current,
        transaction,
        revision: revision + 1,
        operation: { ...current.operation, context: { ...current.operation.context, updatedAt: new Date().toISOString() } }
      };
      await writeOperationRecord(this.path(operationId), record.parse(value));
      return value;
    });
  }
  async recordRemoval(operationId, ownerId, revision, event) {
    const parsed = removalEvent.parse(event);
    return this.locked(async () => {
      const current = await this.get(operationId, ownerId);
      if (!current)
        throw new OperationStoreError("CORRUPT_RECORD");
      if (current.revision !== revision)
        throw new OperationStoreError("REVISION_CONFLICT");
      let removal;
      try {
        removal = applyRemovalEvent(current, parsed);
      } catch {
        throw new OperationStoreError("INVALID_TRANSITION");
      }
      const value = {
        ...current,
        removal,
        revision: revision + 1,
        operation: {
          ...current.operation,
          status: {
            ...current.operation.status,
            phase: parsed.type === "beforeCommit" ? "committing" : current.operation.status.phase
          },
          context: { ...current.operation.context, updatedAt: new Date().toISOString() }
        }
      };
      await writeOperationRecord(this.path(operationId), record.parse(value));
      return value;
    });
  }
  validateRequest(request) {
    if (request.hostInstanceId !== this.hostInstanceId)
      throw new OperationStoreError("HOST_MISMATCH");
    text3.parse(request.ownerId);
    id.parse(request.requestKey);
    record.shape.requestDigest.parse(request.requestDigest);
    exports_external.enum(["new", "retry"]).parse(request.mode);
  }
  path(operationId) {
    return join7(this.root, `${id.parse(operationId)}.json`);
  }
  async read(operationId) {
    const json = await readJson(this.path(operationId));
    if (json === undefined)
      return;
    const parsed = record.safeParse(json);
    if (!parsed.success || parsed.data.operationId !== operationId || parsed.data.operation.context.hostInstanceId !== this.hostInstanceId)
      throw new OperationStoreError("CORRUPT_RECORD");
    return parsed.data;
  }
  async findRequest(request) {
    let match;
    for (const stored of await this.readAll()) {
      if (!stored || stored.ownerId !== request.ownerId || stored.requestKey !== request.requestKey)
        continue;
      if (match)
        throw new OperationStoreError("CORRUPT_RECORD");
      if (stored.requestDigest !== request.requestDigest)
        throw new OperationStoreError("REQUEST_KEY_CONFLICT");
      match = stored;
    }
    return match;
  }
  async readAll() {
    const values = [];
    for (const name of (await readdir4(this.root)).sort()) {
      if (name === "host.json" || !name.endsWith(".json"))
        continue;
      const value = await this.read(name.slice(0, -5));
      if (!value)
        throw new OperationStoreError("CORRUPT_RECORD");
      values.push(value);
    }
    return values;
  }
  async locked(run) {
    let release;
    const deadline = Date.now() + 1e4;
    while (!release) {
      try {
        release = await acquireSkillTargetLock(this.root, "operation-journal");
      } catch (error) {
        if (!(error instanceof CliError) || error.details.reason !== "TARGET_BUSY" || Date.now() >= deadline)
          throw error;
        await new Promise((resolve8) => setTimeout(resolve8, 20));
      }
    }
    try {
      return await run();
    } finally {
      await release();
    }
  }
}
function needsRecovery(value) {
  const { phase: phase2, recovery } = value.operation.status;
  return !["completed", "failed"].includes(phase2) || ["incomplete", "unknown"].includes(recovery) || phase2 === "failed" && !!value.transaction?.moves.length && recovery !== "restored" || phase2 === "failed" && !!value.removal?.intent.quarantine && recovery !== "restored";
}
function needsCleanupVerification(value) {
  if (value.removal?.inventoryCommit?.committed && value.removal.intent.quarantine !== null && value.removal.cleanup?.removed !== true)
    return true;
  const transaction = value.transaction;
  if (!transaction)
    return false;
  const acknowledged = new Map(transaction.cleanup.map((entry) => [entry.path, entry.removed]));
  if ([...acknowledged.values()].some((removed) => !removed))
    return true;
  if (!transaction.inventoryCommit?.committed)
    return false;
  return transaction.moves.some((entry) => entry.move.phase === "backup" && acknowledged.get(entry.move.to) !== true);
}
function assertTransition(current, next) {
  const prior = current.operation.status;
  const allowed = {
    accepted: ["staging", "revalidating", "completed", "failed", "recovering", "unknown"],
    staging: ["revalidating", "failed", "recovering", "recovery-required", "unknown"],
    revalidating: ["committing", "completed", "failed", "recovering", "recovery-required", "unknown"],
    committing: ["completed", "failed", "recovering", "recovery-required", "unknown"],
    recovering: ["completed", "failed", "recovery-required", "unknown"],
    "recovery-required": ["recovering"],
    unknown: ["recovering"],
    completed: [],
    failed: []
  };
  if (next.phase !== prior.phase && !allowed[prior.phase].includes(next.phase))
    throw new OperationStoreError("INVALID_TRANSITION");
  if (["completed", "failed"].includes(prior.phase) && (next.files !== prior.files || next.recovery !== prior.recovery))
    throw new OperationStoreError("INVALID_TRANSITION");
  if (next.phase === "completed") {
    if (["uninstall", "remove-stale-record"].includes(current.operation.kind) && !current.removal?.inventoryCommit?.committed)
      throw new OperationStoreError("INVALID_TRANSITION");
    const outcomes = {
      install: ["installed", "already-installed"],
      upgrade: ["upgraded", "already-installed"],
      uninstall: ["removed"],
      "remove-stale-record": ["stale-record-removed"]
    };
    if (!outcomes[current.operation.kind].includes(next.files) || !["not-needed", "restored"].includes(next.recovery))
      throw new OperationStoreError("INVALID_TRANSITION");
    if (["accepted", "revalidating"].includes(prior.phase) && next.files !== "already-installed")
      throw new OperationStoreError("INVALID_TRANSITION");
  }
}
async function readJson(path2) {
  let file;
  try {
    file = await open(path2, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch (error) {
    if (error.code === "ENOENT")
      return;
    throw error;
  }
  try {
    const info = await file.stat();
    if (!info.isFile() || info.size > 1024 * 1024)
      throw new OperationStoreError("CORRUPT_RECORD");
    return JSON.parse(await file.readFile("utf8"));
  } finally {
    await file.close();
  }
}
async function atomicWrite(path2, value) {
  const temporary = `${path2}.${randomUUID3()}.tmp`;
  try {
    const payload = JSON.stringify(value);
    if (Buffer.byteLength(payload) > 1024 * 1024)
      throw new OperationStoreError("CORRUPT_RECORD");
    const file = await open(temporary, "wx", 384);
    try {
      await file.writeFile(payload);
      await file.sync();
    } finally {
      await file.close();
    }
    await rename4(temporary, path2);
    if (process.platform !== "win32") {
      const directory = await open(dirname4(path2), "r");
      try {
        await directory.sync();
      } finally {
        await directory.close();
      }
    }
  } finally {
    await rm3(temporary, { force: true });
  }
}
async function writeOperationRecord(path2, value) {
  if (value.schemaVersion !== 1)
    return atomicWrite(path2, value);
  const previous = await readJson(path2);
  if (!previous || previous.schemaVersion !== 1)
    throw new Error("Legacy operation evidence missing");
  const preserved = structuredClone(value);
  if (preserved.transaction && previous.transaction) {
    if (preserved.transaction.preparation && previous.transaction.preparation) {
      preserved.transaction.preparation.before = previous.transaction.preparation.before;
    }
    if (preserved.transaction.inventoryCommit && previous.transaction.inventoryCommit) {
      preserved.transaction.inventoryCommit.before = previous.transaction.inventoryCommit.before;
      preserved.transaction.inventoryCommit.after = previous.transaction.inventoryCommit.after;
    }
  }
  if (preserved.removal && previous.removal) {
    preserved.removal.intent = previous.removal.intent;
    if (preserved.removal.inventoryCommit && previous.removal.inventoryCommit) {
      preserved.removal.inventoryCommit.before = previous.removal.inventoryCommit.before;
      preserved.removal.inventoryCommit.after = previous.removal.inventoryCommit.after;
    }
  }
  await atomicWrite(path2, preserved);
}
async function canonicalOperationTarget(path2) {
  try {
    return await realpath(path2);
  } catch (error) {
    if (error.code !== "ENOENT")
      throw error;
    const parent = dirname4(path2);
    if (parent === path2)
      throw error;
    return join7(await canonicalOperationTarget(parent), basename(path2));
  }
}
// ../../cli/src/integrations/install-recovery.ts
import { lstat as lstat6, realpath as realpath4, rm as rm5 } from "node:fs/promises";
import { basename as basename4, dirname as dirname7, isAbsolute as isAbsolute9, resolve as resolve10 } from "node:path";
import { isDeepStrictEqual as isDeepStrictEqual4 } from "node:util";

// ../../cli/src/integrations/recovery-files.ts
import { lstat as lstat4, readdir as readdir5, realpath as realpath2 } from "node:fs/promises";
import { basename as basename2, dirname as dirname5, isAbsolute as isAbsolute7, join as join8, relative as relative8, resolve as resolve8 } from "node:path";
async function verifiedBackupPath(record2, move2) {
  const root = dirname5(move2.canonicalSkillDir);
  const name = basename2(move2.to);
  const suffix = name.slice(`${record2.operation.slug}.skillhub-backup-`.length);
  if (!record2.operation.targetPaths?.includes(move2.canonicalSkillDir) || move2.backupDir !== move2.to || !isAbsolute7(move2.to) || resolve8(move2.to) !== move2.to || !isAbsolute7(move2.from) || basename2(move2.from) !== record2.operation.slug || dirname5(move2.from) !== dirname5(move2.to) || !name.startsWith(`${record2.operation.slug}.skillhub-backup-`) || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(suffix) || await realpath2(dirname5(move2.to)) !== root)
    throw new Error("Backup path does not match the recorded target");
  return join8(root, name);
}
async function assertOwnedRegularTree(path2) {
  const authoredMetadataPaths = [];
  await inspectTree(path2, path2, authoredMetadataPaths);
  if (!authoredMetadataPaths.length)
    return;
  const metadata = await readInstalledSkillMetadata(path2);
  const files = metadata.status === "valid" ? metadata.metadata.files : undefined;
  if (authoredMetadataPaths.some((entry) => !files || !(entry in files))) {
    throw new Error("Untracked recovery metadata content");
  }
}
async function inspectTree(path2, root, authoredMetadataPaths) {
  const info = await lstat4(path2);
  if (info.isSymbolicLink() || !info.isDirectory() && !info.isFile() || process.getuid && info.uid !== process.getuid())
    throw new Error("Unsafe recovery path");
  const local = relative8(root, path2).split("\\").join("/");
  if (!info.isDirectory()) {
    if (local.split("/").includes(".skillhub") && local !== ".skillhub/metadata.json")
      authoredMetadataPaths.push(local);
    return;
  }
  const names = await readdir5(path2);
  if (!names.length && local.split("/").includes(".skillhub") && local !== ".skillhub") {
    throw new Error("Untracked recovery metadata content");
  }
  for (const name of names)
    await inspectTree(join8(path2, name), root, authoredMetadataPaths);
}

// ../../cli/src/integrations/install-rollback.ts
import { lstat as lstat5, realpath as realpath3, rename as rename5, rm as rm4 } from "node:fs/promises";
import { basename as basename3, dirname as dirname6, isAbsolute as isAbsolute8, join as join9, resolve as resolve9 } from "node:path";
import { isDeepStrictEqual as isDeepStrictEqual3 } from "node:util";
async function restoreBeforeCommit(options, initial) {
  let current = initial;
  const result = (outcome, reason) => ({ operationId: current.operationId, revision: current.revision, outcome, reason });
  if (!current.transaction?.preparation || current.transaction.inventoryCommit?.committed || current.operation.status.phase === "completed") {
    return result("unknown", "rollback-baseline-unavailable");
  }
  if (current.operation.status.phase === "failed")
    return current.operation.status.recovery === "restored" ? result("restored", "previously-restored") : result("unknown", "terminal-operation-not-restored");
  try {
    const actions = await planRestore(current);
    const { operationId, ownerId } = current;
    current = await options.operations.update(operationId, ownerId, current.revision, { ...current.operation.status, phase: "recovering", files: "unknown", recovery: "incomplete" });
    for (const action of actions) {
      current = await options.operations.recordRecoveryAction(operationId, ownerId, current.revision, action, false);
      await options.authorizeMutation?.(action.to === null ? [action.from] : [action.from, action.to], "rollback");
      const remaining = await planRestore(current);
      if (!remaining.some((candidate) => isDeepStrictEqual3(candidate, action)))
        throw new Error("Recovery action no longer matches disk state");
      if ((await options.operations.get(operationId, ownerId))?.revision !== current.revision)
        throw new Error("Operation changed before recovery mutation");
      if (action.kind === "remove-staging")
        await rm4(action.from, { recursive: true });
      else {
        if (await exists(action.to))
          throw new Error("Recovery destination is occupied");
        await rename5(action.from, action.to);
      }
      current = await options.operations.recordRecoveryAction(operationId, ownerId, current.revision, action, true);
    }
    if ((await planRestore(current)).length)
      throw new Error("Recovery still has pending filesystem changes");
    const preparation2 = current.transaction.preparation;
    const paths = new Set(current.operation.targetPaths);
    if (await captureInstallInventory(await options.inventory.read(), preparation2.release, paths) !== await captureInstallInventory(preparation2.before, preparation2.release, paths))
      throw new Error("Inventory changed during recovery");
    current = await options.operations.update(operationId, ownerId, current.revision, { ...current.operation.status, phase: "failed", files: "failed", recovery: "restored" });
    return result("restored", "original-targets-restored");
  } catch {
    try {
      if (current.operation.status.phase !== "recovering")
        current = await options.operations.update(current.operationId, current.ownerId, current.revision, { ...current.operation.status, phase: "recovering", files: "unknown", recovery: "incomplete" });
      current = await options.operations.update(current.operationId, current.ownerId, current.revision, { ...current.operation.status, phase: "recovery-required", files: "unknown", recovery: "incomplete" });
    } catch {}
    return result("unknown", "rollback-requires-verification");
  }
}
function validStagingSuffix(record2, target, path2) {
  const suffix = basename3(path2).slice(`.${record2.operation.slug}.install-`.length);
  if (!record2.transaction?.staging)
    return /^[a-zA-Z0-9]{6}$/.test(suffix);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(suffix) && record2.transaction.staging.some((intent2) => intent2.canonicalSkillDir === target && intent2.stagingDir === path2);
}
async function planRestore(record2) {
  const preparation2 = record2.transaction.preparation;
  const actions = [];
  if (preparation2.targets.length !== record2.operation.targetPaths?.length || new Set(preparation2.targets.map((target) => target.canonicalSkillDir)).size !== preparation2.targets.length)
    throw new Error("Invalid preparation targets");
  for (const [index, target] of preparation2.targets.entries()) {
    const root = dirname6(target.canonicalSkillDir);
    if (!record2.operation.targetPaths.includes(target.canonicalSkillDir) || await realpath3(root) !== root || !isAbsolute8(target.skillDir) || resolve9(target.skillDir) !== target.skillDir || basename3(target.skillDir) !== record2.operation.slug || await realpath3(dirname6(target.skillDir)) !== root || !isAbsolute8(target.stagingDir) || resolve9(target.stagingDir) !== target.stagingDir || dirname6(target.stagingDir) !== dirname6(target.skillDir) || !basename3(target.stagingDir).startsWith(`.${record2.operation.slug}.install-`) || !validStagingSuffix(record2, target.canonicalSkillDir, target.stagingDir))
      throw new Error("Unsafe preparation path");
    const original = await oldMetadata(record2, target.canonicalSkillDir);
    const fresh = { ...preparation2.release, agent: target.agent, installedAt: target.installedAt };
    const backupMoves = record2.transaction.moves.filter((entry) => entry.move.phase === "backup" && entry.move.index === index);
    if (backupMoves.length > 1)
      throw new Error("Ambiguous backup");
    const backup = backupMoves[0] ? await verifiedBackupPath(record2, backupMoves[0].move) : null;
    const backupExists = backup !== null && await exists(backup);
    if (backupExists) {
      if (!original)
        throw new Error("Backup has no old identity");
      await assertContent(backup, original);
    }
    const stageExists = await exists(target.stagingDir);
    if (stageExists)
      await assertContent(target.stagingDir, fresh);
    const targetExists = await exists(target.skillDir);
    let targetIsOld = false;
    let targetIsFresh = false;
    if (targetExists) {
      if (original)
        targetIsOld = await matchesContent(target.skillDir, original);
      targetIsFresh = await matchesContent(target.skillDir, fresh);
      if (targetIsOld === targetIsFresh)
        throw new Error("Target identity is unknown or ambiguous");
    }
    if (targetIsFresh) {
      if (stageExists || original && !backupExists)
        throw new Error("Cannot return replacement to staging");
      actions.push({ kind: "return-staging", index, from: target.skillDir, to: target.stagingDir });
    }
    if (original && !targetIsOld) {
      if (!backupExists)
        throw new Error("Original content cannot be recovered");
      actions.push({ kind: "restore-backup", index, from: backupMoves[0].move.to, to: target.skillDir });
    } else if (backupExists)
      throw new Error("Both original and backup exist");
    if (stageExists || targetIsFresh)
      actions.push({ kind: "remove-staging", index, from: target.stagingDir, to: null });
  }
  return actions;
}
async function oldMetadata(record2, path2) {
  const preparation2 = record2.transaction.preparation;
  const owners = [];
  for (const item2 of preparation2.before.items) {
    for (const target of item2.targets) {
      const canonical = join9(await realpath3(dirname6(target.installDir)), basename3(target.installDir));
      if (canonical !== path2)
        continue;
      if (!sameInstalledSkillSource(item2, preparation2.release) || !target.fingerprint || !isDeepStrictEqual3(targetInstalledBy(item2, target), ["direct"]))
        throw new Error("Old target is shared or belongs to another source");
      owners.push({ ...item2, version: target.version, fingerprint: target.fingerprint, agent: target.agent, installedAt: target.installedAt });
    }
  }
  if (owners.length > 1)
    throw new Error("Multiple records own the old target");
  return owners[0];
}
async function exists(path2) {
  try {
    await lstat5(path2);
    return true;
  } catch (error) {
    if (error.code === "ENOENT")
      return false;
    throw error;
  }
}
async function matchesContent(path2, expected) {
  try {
    await assertContent(path2, expected);
    return true;
  } catch {
    return false;
  }
}
async function assertContent(path2, expected) {
  await assertOwnedRegularTree(path2);
  const read = await readInstalledSkillMetadata(path2);
  if (read.status !== "valid")
    throw new Error("Recovery metadata is unavailable");
  const value = read.metadata;
  if (!sameInstalledSkillSource(value, expected) || value.source !== "skillhub" || value.version !== expected.version || value.fingerprint !== expected.fingerprint || value.agent !== expected.agent || value.installedAt !== expected.installedAt)
    throw new Error("Recovery identity changed");
  const snapshot = await snapshotSkillDirectory(path2);
  if (snapshot.fingerprint !== expected.fingerprint || !isDeepStrictEqual3(snapshot.files, value.files))
    throw new Error("Recovery content changed");
}

// ../../cli/src/integrations/install-recovery.ts
function inspectInstallRecovery(options) {
  return inspectInstallation(options, "inspect");
}
function reconcileCommittedInstallation(options) {
  return inspectInstallation(options, "confirm");
}
function cleanupCommittedInstallation(options) {
  return inspectInstallation(options, "cleanup");
}
function recoverInstallation(options) {
  return inspectInstallation(options, "recover");
}
function settleUnpreparedInstallationFailure(options) {
  return inspectInstallation(options, "settle-failure");
}
async function inspectInstallation(options, mode) {
  const { operations, operationId, ownerId, inventory: inventory2, trustedTargetPaths } = options;
  const initial = await operations.get(operationId, ownerId);
  if (!initial || !["install", "upgrade"].includes(initial.operation.kind))
    throw new Error("Expected an owned installation operation");
  const result = (outcome, reason, revision = initial.revision) => ({ operationId, revision, outcome, reason });
  if (initial.schemaVersion === 1 && await inventory2.diskVersion() === 2)
    return result("unknown", "legacy-journal-needs-v1-inventory");
  const bound = initial.operation.targetPaths;
  const unstarted = !initial.transaction && !initial.existingInstallation && !initial.removal && ["accepted", "staging"].includes(initial.operation.status.phase) && initial.operation.status.files === "pending" && initial.operation.status.recovery === "not-needed";
  const earlyStaging = isEarlyStaging(initial) || mode === "recover" && unstarted || mode === "settle-failure" && !initial.transaction;
  if (mode === "settle-failure" && (!earlyStaging || !["staging", "revalidating"].includes(initial.operation.status.phase)))
    return result("unknown", "not-unprepared-failure");
  if (!bound?.length || new Set(bound).size !== bound.length || bound.length !== trustedTargetPaths.length || bound.some((path2) => !trustedTargetPaths.includes(path2)))
    return result("unknown", "target-binding-mismatch");
  for (const path2 of bound) {
    if (!isAbsolute9(path2) || resolve10(path2) !== path2 || basename4(path2) !== initial.operation.slug)
      return result("unknown", "invalid-target-path");
    try {
      if (earlyStaging ? !await hasCanonicalAncestor(dirname7(path2)) : await realpath4(dirname7(path2)) !== dirname7(path2))
        return result("unknown", "target-root-changed");
    } catch {
      return result("unknown", "target-root-unavailable");
    }
  }
  const releases = [];
  let operationError;
  try {
    for (const target of await orderSkillTargetLocks(bound.map((path2) => ({ rootDir: dirname7(path2) })), initial.operation.slug)) {
      releases.push(await acquireSkillTargetLock(target.rootDir, initial.operation.slug));
    }
    const current = await operations.get(operationId, ownerId);
    if (!current || current.revision !== initial.revision)
      return result("unknown", "operation-changed");
    if (mode === "recover" && unstarted) {
      const saved = await operations.update(operationId, ownerId, current.revision, { ...current.operation.status, phase: "failed", files: "failed", recovery: "not-needed" });
      return result("restored", "installation-not-started", saved.revision);
    }
    const commit3 = current.transaction?.inventoryCommit;
    const preparation2 = current.transaction?.preparation;
    if (earlyStaging && (mode === "recover" || mode === "settle-failure"))
      return recoverEmptyStaging(options, current, mode === "settle-failure");
    if (!commit3 && (mode !== "recover" || !preparation2))
      return result("unknown", "no-inventory-snapshot");
    const identity2 = { registry: current.operation.context.sourceIdentity, namespace: current.operation.namespace, slug: current.operation.slug };
    const paths = new Set(bound);
    try {
      return await inventory2.withLockedSnapshot(async (actualInventory) => {
        const actual = await captureInstallInventory(actualInventory, identity2, paths);
        if (mode === "recover" && preparation2 && actual === await captureInstallInventory(preparation2.before, identity2, paths)) {
          if (commit3 && actual === await captureInstallInventory(commit3.after, identity2, paths))
            return result("unknown", "indistinguishable-inventory-snapshots");
          return restoreBeforeCommit(options, current);
        }
        if (!commit3)
          return result("unknown", "inventory-conflict");
        const before = await captureInstallInventory(commit3.before, identity2, paths);
        const after = await captureInstallInventory(commit3.after, identity2, paths);
        if (before === after)
          return result("unknown", "indistinguishable-inventory-snapshots");
        if (actual === before)
          return result("inventory-before", "inventory-matches-before");
        if (actual !== after)
          return result("unknown", "inventory-conflict");
        const matches = commit3.after.items.filter((item3) => sameInstalledSkillSource(item3, identity2));
        if (matches.length !== 1) {
          return result("unknown", "invalid-committed-identity");
        }
        const item2 = matches[0];
        for (const path2 of bound) {
          if (await realpath4(dirname7(path2)) !== dirname7(path2))
            return result("unknown", "target-root-changed");
          await assertOwnedRegularTree(path2);
          const targets = [];
          for (const target2 of item2.targets) {
            if (bound.includes(target2.installDir) && await realpath4(target2.installDir) === path2)
              targets.push(target2);
          }
          if (targets.length !== 1 || targets[0].version !== current.operation.version || !targets[0].fingerprint)
            return result("unknown", "inventory-target-mismatch");
          const target = targets[0];
          const read = await readInstalledSkillMetadata(path2);
          if (read.status !== "valid")
            return result("unknown", "metadata-unavailable");
          const metadata = read.metadata;
          if (!sameInstalledSkillSource(metadata, identity2) || metadata.version !== target.version || metadata.fingerprint !== target.fingerprint || metadata.agent !== target.agent || metadata.installedAt !== target.installedAt || metadata.source !== "skillhub") {
            return result("unknown", "metadata-conflict");
          }
          const snapshot = await snapshotSkillDirectory(path2);
          if (snapshot.fingerprint !== target.fingerprint || !isDeepStrictEqual4(snapshot.files, metadata.files)) {
            return result("unknown", "installed-content-changed");
          }
        }
        if (await captureInstallInventory(await inventory2.read(), identity2, paths) !== actual || (await operations.get(operationId, ownerId))?.revision !== current.revision)
          return result("unknown", "state-changed-during-inspection");
        if (mode !== "inspect") {
          try {
            const saved = await operations.confirmCommittedInstallation(operationId, ownerId, current.revision);
            if (mode === "cleanup" || mode === "recover") {
              const cleaned = await cleanupBackups(options, saved);
              return { ...result("committed", "committed-outcome-persisted", cleaned.revision), cleanup: cleaned.results };
            }
            return result("committed", "committed-outcome-persisted", saved.revision);
          } catch {
            return result("unknown", "commit-confirmation-not-persisted");
          }
        }
        return result("committed", "inventory-and-all-targets-match");
      });
    } catch {
      return result("unknown", "state-unreadable-or-unsafe");
    }
  } catch (error) {
    operationError = error;
    throw error;
  } finally {
    await releaseLocks(releases, operationError);
  }
}
function isEarlyStaging(record2) {
  const transaction = record2.transaction;
  return !!transaction?.staging?.length && !transaction.preparation && !transaction.inventoryCommit && !transaction.moves.length && !transaction.recoveryActions?.length && !transaction.cleanup.length;
}
async function hasCanonicalAncestor(path2) {
  try {
    await lstat6(path2);
  } catch (error) {
    if (error.code !== "ENOENT" || dirname7(path2) === path2)
      throw error;
    return hasCanonicalAncestor(dirname7(path2));
  }
  return await realpath4(path2) === path2;
}
async function recoverEmptyStaging(options, initial, settleFailure = false) {
  let current = initial;
  const result = (outcome, reason) => ({ operationId: current.operationId, revision: current.revision, outcome, reason });
  if (current.operation.status.phase === "failed")
    return current.operation.status.recovery === "restored" ? result("restored", "previously-restored") : result("unknown", "terminal-operation-not-restored");
  try {
    for (const intent2 of current.transaction?.staging ?? []) {
      const root = dirname7(intent2.canonicalSkillDir);
      const prefix = `.${current.operation.slug}.install-`;
      if (!current.operation.targetPaths.includes(intent2.canonicalSkillDir) || intent2.rootDir !== root || dirname7(intent2.stagingDir) !== root || !basename4(intent2.stagingDir).startsWith(prefix) || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(basename4(intent2.stagingDir).slice(prefix.length)) || !await hasCanonicalAncestor(root))
        return result("unknown", "staging-binding-mismatch");
      try {
        await lstat6(intent2.stagingDir);
        return result("unknown", "unprepared-staging-remains");
      } catch (error) {
        if (error.code !== "ENOENT")
          throw error;
      }
    }
    if (settleFailure) {
      current = await options.operations.update(current.operationId, current.ownerId, current.revision, { ...current.operation.status, phase: "failed", files: "failed", recovery: "not-needed" });
      return result("restored", "staging-absent-no-target-moves");
    }
    current = await options.operations.update(current.operationId, current.ownerId, current.revision, { ...current.operation.status, phase: "recovering", files: "unknown", recovery: "incomplete" });
    current = await options.operations.update(current.operationId, current.ownerId, current.revision, { ...current.operation.status, phase: "failed", files: "failed", recovery: "restored" });
    return result("restored", "staging-absent-no-target-moves");
  } catch {
    return result("unknown", "early-staging-recovery-unverified");
  }
}
async function cleanupBackups(options, current) {
  let revision = current.revision;
  const results = [];
  const acknowledged = new Map(current.transaction.cleanup.map((entry) => [entry.path, entry.removed]));
  for (const entry of current.transaction.moves.filter((entry2) => entry2.move.phase === "backup")) {
    if (acknowledged.get(entry.move.to) === true)
      continue;
    let cleanup2;
    try {
      const path2 = await verifiedBackupPath(current, entry.move);
      let exists2 = true;
      try {
        await lstat6(path2);
      } catch (error) {
        if (error.code === "ENOENT")
          exists2 = false;
        else
          throw error;
      }
      if (exists2) {
        await options.authorizeMutation?.([path2], "cleanup");
        if (await verifiedBackupPath(current, entry.move) !== path2)
          throw new Error("Backup path changed");
        await assertBackupContent(current, entry.move, path2);
        if ((await options.operations.get(current.operationId, current.ownerId))?.revision !== revision)
          throw new Error("Operation changed before backup cleanup");
        await rm5(path2, { recursive: true });
      }
      cleanup2 = { path: entry.move.to, removed: true };
    } catch (error) {
      cleanup2 = { path: entry.move.to, removed: false, error: error instanceof Error ? error.message.slice(0, 2048) : "Backup cleanup could not be verified" };
    }
    try {
      const saved = await options.operations.recordRecoveredCleanup(current.operationId, current.ownerId, revision, cleanup2);
      revision = saved.revision;
      results.push({ ...cleanup2, recorded: true });
    } catch {
      results.push({ ...cleanup2, recorded: false });
      break;
    }
  }
  return { revision, results };
}
async function assertBackupContent(record2, move2, path2) {
  await assertOwnedRegularTree(path2);
  const identity2 = { registry: record2.operation.context.sourceIdentity, namespace: record2.operation.namespace, slug: record2.operation.slug };
  const items = record2.transaction.inventoryCommit.before.items.filter((item3) => sameInstalledSkillSource(item3, identity2));
  if (items.length !== 1)
    throw new Error("Backup baseline is unavailable");
  const item2 = items[0];
  const targets = [];
  for (const target2 of item2.targets) {
    if (await realpath4(target2.installDir) === move2.canonicalSkillDir)
      targets.push(target2);
  }
  if (targets.length !== 1)
    throw new Error("Backup target baseline does not match");
  const target = targets[0];
  const sources = targetInstalledBy(item2, target);
  if (sources.length !== 1 || sources[0] !== "direct")
    throw new Error("Backup has shared ownership");
  const read = await readInstalledSkillMetadata(path2);
  if (read.status !== "valid")
    throw new Error("Backup metadata is unavailable");
  const metadata = read.metadata;
  if (!sameInstalledSkillSource(metadata, identity2) || metadata.version !== target.version || metadata.fingerprint !== target.fingerprint || metadata.installedAt !== target.installedAt || metadata.agent !== target.agent || metadata.source !== "skillhub")
    throw new Error("Backup metadata does not match its baseline");
  const snapshot = await snapshotSkillDirectory(path2);
  if (snapshot.fingerprint !== target.fingerprint || !isDeepStrictEqual4(snapshot.files, metadata.files))
    throw new Error("Backup content was modified");
}
async function releaseLocks(releases, operationError) {
  const failures = [];
  for (const release of releases.reverse()) {
    try {
      await release();
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length)
    throw new AggregateError(operationError ? [operationError, ...failures] : failures, "Recovery inspection lock release failed");
}
// ../../cli/src/services/skill-examples.ts
import { createHash as createHash5 } from "node:crypto";
import { constants as constants2 } from "node:fs";
import { lstat as lstat7, open as open2 } from "node:fs/promises";
import { join as join10 } from "node:path";
var MAX_EXAMPLES_BYTES = 65536;
var localePattern = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
var nonWhitespace = /[^\u0009-\u000D\u0020\u0085\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/u;
function parseSkillExamples(bytes) {
  if (bytes.byteLength > MAX_EXAMPLES_BYTES)
    return { state: "invalid" };
  try {
    const text4 = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes).replace(/^\uFEFF/, "");
    const value = JSON.parse(text4);
    if (!record2(value) || !exactKeys(value, ["schemaVersion", "defaultLocale", "examples"]) || value.schemaVersion !== 1 || typeof value.defaultLocale !== "string" || !localePattern.test(value.defaultLocale) || !record2(value.examples))
      return { state: "invalid" };
    const languages = Object.keys(value.examples);
    if (languages.length < 1 || languages.length > 10)
      return { state: "invalid" };
    const normalized = new Set;
    const items = Object.create(null);
    for (const locale of languages) {
      const entries = value.examples[locale];
      if (!localePattern.test(locale) || normalized.has(locale.toLowerCase()) || !Array.isArray(entries) || entries.length > 20)
        return { state: "invalid" };
      normalized.add(locale.toLowerCase());
      const ids = new Set;
      const cases = [];
      for (const entry of entries) {
        if (!record2(entry) || !exactKeys(entry, ["id", "title", "prompt"]) || typeof entry.id !== "string" || entry.id.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id) || ids.has(entry.id) || !textWithin(entry.title, 80) || !textWithin(entry.prompt, 4000))
          return { state: "invalid" };
        ids.add(entry.id);
        cases.push({ id: entry.id, title: entry.title, prompt: entry.prompt });
      }
      items[locale] = cases;
    }
    if (!normalized.has(value.defaultLocale.toLowerCase()))
      return { state: "invalid" };
    return { state: "ready", digest: createHash5("sha256").update(bytes).digest("hex"), defaultLocale: value.defaultLocale, items };
  } catch {
    return { state: "invalid" };
  }
}
async function readSkillExamples(directory) {
  try {
    const parent = await lstat7(join10(directory, ".skillhub"));
    if (!parent.isDirectory() || parent.isSymbolicLink())
      return { state: "unavailable", retryable: false };
    const path2 = join10(directory, ".skillhub", "examples.json");
    const info = await lstat7(path2);
    if (!info.isFile() || info.isSymbolicLink())
      return { state: "unavailable", retryable: false };
    const file = await open2(path2, constants2.O_RDONLY | (constants2.O_NOFOLLOW ?? 0) | (constants2.O_NONBLOCK ?? 0));
    try {
      if (!(await file.stat()).isFile())
        return { state: "unavailable", retryable: false };
      const bytes = new Uint8Array(MAX_EXAMPLES_BYTES + 1);
      let size = 0;
      while (size < bytes.length) {
        const { bytesRead } = await file.read(bytes, size, bytes.length - size, size);
        if (!bytesRead)
          break;
        size += bytesRead;
      }
      return parseSkillExamples(bytes.subarray(0, size));
    } finally {
      await file.close();
    }
  } catch (error) {
    return error.code === "ENOENT" ? { state: "none" } : { state: "unavailable", retryable: true };
  }
}
function record2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function exactKeys(value, keys) {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}
function textWithin(value, maximum) {
  return typeof value === "string" && [...value].length <= maximum && nonWhitespace.test(value);
}

// ../../cli/src/integrations/install-discovery.ts
import { isDeepStrictEqual as isDeepStrictEqual6 } from "node:util";

// ../../cli/src/integrations/native-installed.ts
import { createHash as createHash6 } from "node:crypto";
import { lstat as lstat8 } from "node:fs/promises";
import { join as join11 } from "node:path";
import { isDeepStrictEqual as isDeepStrictEqual5 } from "node:util";
async function confirmExistingNativeInstall(operations, inventory2, request) {
  const target = join11(request.root, request.slug);
  const release = await acquireSkillTargetLock(request.root, request.slug);
  try {
    await request.authorize([request.root, target], "staging");
    await operations.assertTargetsAvailable([target], request);
    try {
      await lstat8(target);
    } catch (error) {
      if (error.code === "ENOENT")
        return;
      throw error;
    }
    return await inventory2.withLockedSnapshot(async (current) => {
      const snapshot = await verifyExistingInstallation(current, request);
      await request.validateStaged(target);
      const record3 = await operations.get(request.operationId, request.ownerId);
      if (!record3 || record3.operation.status.phase !== "staging")
        throw new Error("Installation claim changed");
      const checked = await operations.update(record3.operationId, record3.ownerId, record3.revision, { ...record3.operation.status, phase: "revalidating" });
      if (!isDeepStrictEqual5(snapshot, await verifyExistingInstallation(await inventory2.read(), request)))
        throw new Error("Existing installation changed during validation");
      const completed = await operations.completeExistingInstallation(checked.operationId, checked.ownerId, checked.revision, snapshot);
      return { operationId: completed.operationId, revision: completed.revision, outcome: "committed", reason: "already-installed" };
    });
  } finally {
    await release();
  }
}
async function verifyExistingInstallation(current, request) {
  const target = join11(request.root, request.slug);
  if (await canonicalizeExistingPath(request.root) !== request.root)
    throw new Error("Installation root changed");
  await assertOwnedRegularTree(target);
  const owners = [];
  for (const item2 of current.items) {
    for (const entry of item2.targets) {
      if (await canonicalizeExistingPath(entry.installDir) === target)
        owners.push({ item: item2, entry });
    }
  }
  const owner = owners[0];
  if (owners.length !== 1 || !owner || !sameInstalledSkillSource(owner.item, request) || owner.entry.version !== request.version || owner.entry.fingerprint !== request.fingerprint || owner.entry.agent !== "dsh" || !targetInstalledBy(owner.item, owner.entry).includes("direct") || await canonicalizeExistingPath(owner.entry.rootDir) !== request.root)
    throw new Error("Existing installation conflicts with the requested skill");
  const metadata = await readInstalledSkillMetadata(target);
  if (metadata.status !== "valid" || !sameInstalledSkillSource(metadata.metadata, request) || metadata.metadata.version !== request.version || metadata.metadata.versionId !== request.versionId || metadata.metadata.fingerprint !== request.fingerprint || metadata.metadata.agent !== "dsh" || metadata.metadata.installedAt !== owner.entry.installedAt || metadata.metadata.source !== "skillhub")
    throw new Error("Existing installation metadata does not match");
  const snapshot = await snapshotSkillDirectory(target);
  if (snapshot.fingerprint !== request.fingerprint || !isDeepStrictEqual5(snapshot.files, metadata.metadata.files))
    throw new Error("Existing installation has local changes");
  return {
    fingerprint: request.fingerprint,
    versionId: request.versionId,
    inventoryDigest: createHash6("sha256").update(await captureInstallInventory(current, request, new Set([target]))).digest("hex")
  };
}

// ../../cli/src/integrations/install-discovery.ts
import { dirname as dirname8, isAbsolute as isAbsolute10, join as join12, resolve as resolve11 } from "node:path";
async function observeInstallationDiscovery(options) {
  const { operations, inventory: inventory2, operationId, ownerId } = options;
  const record3 = await operations.get(operationId, ownerId);
  if (!record3 || !["install", "upgrade"].includes(record3.operation.kind) || record3.operation.status.phase !== "completed" || !["installed", "already-installed", "upgraded"].includes(record3.operation.status.files))
    return false;
  const paths = [...record3.operation.targetPaths ?? []];
  const roots = [...options.trustedRoots];
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(record3.operation.slug) || !paths.length || new Set(paths).size !== paths.length || paths.some((path2) => !roots.some((root) => isAbsolute10(root) && resolve11(root) === root && join12(root, record3.operation.slug) === path2)))
    return false;
  const inspection = { operations, inventory: inventory2, operationId, ownerId, trustedTargetPaths: paths };
  try {
    if (record3.operation.status.files === "already-installed") {
      const baseline = record3.existingInstallation;
      if (!baseline || record3.transaction || record3.operation.kind !== "install" || paths.length !== 1)
        return false;
      const verify = async () => {
        const release = await acquireSkillTargetLock(dirname8(paths[0]), record3.operation.slug);
        try {
          return await inventory2.withLockedSnapshot(async (current) => {
            const actual = await verifyExistingInstallation(current, {
              root: dirname8(paths[0]),
              registry: record3.operation.context.sourceIdentity,
              namespace: record3.operation.namespace,
              slug: record3.operation.slug,
              version: record3.operation.version,
              fingerprint: baseline.fingerprint,
              versionId: baseline.versionId
            });
            return isDeepStrictEqual6(actual, baseline) && (await operations.get(operationId, ownerId))?.revision === record3.revision;
          });
        } finally {
          await release();
        }
      };
      return await verify() && await options.observe(paths) && await verify();
    }
    const before = await inspectInstallRecovery(inspection);
    if (before.outcome !== "committed" || before.revision !== record3.revision)
      return false;
    if (!await options.observe(paths))
      return false;
    const after = await inspectInstallRecovery(inspection);
    return after.outcome === "committed" && after.revision === record3.revision;
  } catch {
    return false;
  }
}

// ../../cli/src/integrations/installed-projection.ts
import { createHash as createHash7 } from "node:crypto";
import { lstat as lstat9, realpath as realpath5 } from "node:fs/promises";
import { isAbsolute as isAbsolute11, join as join13, resolve as resolve12 } from "node:path";
var text4 = exports_external.string().min(1);
var itemSchema = exports_external.object({ registry: text4, namespace: text4, slug: text4, targets: exports_external.array(exports_external.object({
  version: text4,
  fingerprint: exports_external.string().optional(),
  installedBy: exports_external.array(text4).optional(),
  agent: text4,
  rootDir: text4,
  installDir: text4,
  installedAt: text4
})) });
async function readInstalledProjection(inventory2, registry, targets) {
  const result = { items: [], complete: true, issues: [] };
  const issue = (code) => {
    result.complete = false;
    if (!result.issues.includes(code))
      result.issues.push(code);
  };
  let records;
  try {
    const raw = await inventory2.read();
    const parsed = exports_external.object({ items: exports_external.array(exports_external.unknown()) }).parse(raw);
    records = parsed.items;
  } catch {
    issue("inventory-unreadable");
    return result;
  }
  const roots = targets.map((target) => {
    if (!isAbsolute11(target.root))
      throw new Error("Installed projection requires absolute Host roots");
    return { ...target, root: resolve12(target.root) };
  });
  const seen = new Map;
  for (const record3 of records) {
    const parsed = itemSchema.safeParse(record3);
    if (!parsed.success) {
      issue("invalid-record");
      continue;
    }
    const item2 = parsed.data;
    if (!sameInstalledSkillSource(item2, { registry, namespace: item2.namespace, slug: item2.slug }))
      continue;
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(item2.slug)) {
      issue("invalid-record");
      continue;
    }
    for (const entry of item2.targets) {
      if (entry.agent !== "dsh" || !isAbsolute11(entry.rootDir))
        continue;
      for (const target of roots.filter((target2) => target2.root === resolve12(entry.rootDir))) {
        const path2 = join13(target.root, item2.slug);
        const projected = {
          scope: target.scope,
          namespace: item2.namespace,
          slug: item2.slug,
          version: entry.version,
          ...entry.fingerprint ? { fingerprint: entry.fingerprint } : {},
          targetPath: path2,
          state: "present",
          recordRevision: createHash7("sha256").update(JSON.stringify([
            item2.registry.replace(/\/+$/, ""),
            item2.namespace,
            item2.slug,
            entry.agent,
            entry.rootDir,
            entry.installDir,
            entry.version,
            entry.fingerprint ?? null,
            entry.installedAt,
            [...new Set(entry.installedBy ?? ["direct"])].sort()
          ])).digest("hex")
        };
        const key = JSON.stringify([target.scope, path2, item2.namespace, item2.slug]);
        const previous = seen.get(key);
        if (previous) {
          previous.state = "mismatch";
          issue("invalid-record");
          continue;
        }
        seen.set(key, projected);
        result.items.push(projected);
        if (!isAbsolute11(entry.installDir) || resolve12(entry.installDir) !== path2) {
          projected.state = "mismatch";
          issue("invalid-record");
          continue;
        }
        try {
          if (await realpath5(target.root) !== target.root)
            throw new Error("Root changed");
          let directory;
          try {
            directory = await lstat9(path2);
          } catch (error) {
            if (error.code === "ENOENT") {
              projected.state = "missing";
              continue;
            }
            throw error;
          }
          if (!directory.isDirectory() || await realpath5(path2) !== path2) {
            projected.state = "mismatch";
            issue("invalid-record");
            continue;
          }
          for (const [file, kind] of [[join13(path2, ".skillhub"), "directory"], [join13(path2, ".skillhub/metadata.json"), "file"], [join13(path2, "SKILL.md"), "file"]]) {
            const stat = await lstat9(file);
            if (kind === "directory" ? !stat.isDirectory() : !stat.isFile())
              throw new Error("Unexpected local file type");
          }
          const metadata = await readInstalledSkillMetadata(path2);
          if (metadata.status !== "valid") {
            projected.state = "metadata-invalid";
            issue("target-unreadable");
            continue;
          }
          const local = metadata.metadata;
          if (!sameInstalledSkillSource(local, item2) || local.version !== entry.version || local.agent !== "dsh" || local.installedAt !== entry.installedAt || local.fingerprint !== entry.fingerprint) {
            projected.state = "mismatch";
            issue("invalid-record");
          }
          if (await realpath5(path2) !== path2)
            throw new Error("Target changed");
        } catch {
          projected.state = "unreadable";
          issue("target-unreadable");
        }
      }
    }
  }
  return result;
}

// ../../cli/src/integrations/update-assessment.ts
function assessSkillUpdate(installed, candidate) {
  const base = { currentVersion: installed.version, candidateVersion: candidate.version };
  const order = compareSkillVersions(installed.version, candidate.version);
  if (order === "remote-older" || order === "unknown") {
    return { ...base, state: "blocked", reason: order === "unknown" ? "unknown-order" : "remote-older" };
  }
  if (!installed.fingerprint || !candidate.fingerprint)
    return { ...base, state: "blocked", reason: "missing-fingerprint" };
  if (order === "remote-newer")
    return { ...base, state: "upgradable", reason: "newer-version" };
  return installed.fingerprint === candidate.fingerprint ? { ...base, state: "current", reason: "same-content" } : { ...base, state: "blocked", reason: "same-version-content-changed" };
}

// ../../cli/src/integrations/upgrade-baseline.ts
import { realpath as realpath6 } from "node:fs/promises";
import { isAbsolute as isAbsolute12, join as join14, resolve as resolve13 } from "node:path";
import { isDeepStrictEqual as isDeepStrictEqual7 } from "node:util";
async function inspectUpgradeBaseline(store, selected, approvedRoots) {
  const inventory2 = structuredClone(await store.read());
  const matches = inventory2.items.filter((item3) => sameInstalledSkillSource(item3, selected));
  const whole = matches[0];
  const item2 = whole && { ...whole, targets: whole.targets.filter((target) => approvedRoots.some((root) => root.root === target.rootDir)) };
  if (matches.length !== 1 || !item2 || item2.targets.some((target) => target.version !== selected.version) || !item2.targets.length || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(item2.slug))
    return { status: "blocked", reason: "record-changed" };
  const targets = [];
  const paths = new Set;
  for (const target of item2.targets) {
    const roots = approvedRoots.filter((root2) => isAbsolute12(root2.root) && root2.root === resolve13(root2.root) && root2.root === target.rootDir);
    const root = roots[0];
    if (target.agent !== "dsh" || !root || !isAbsolute12(target.installDir) || target.installDir !== join14(root.root, item2.slug))
      return { status: "blocked", reason: "target-outside-context" };
    if (roots.length !== 1 || paths.has(target.installDir))
      return { status: "blocked", reason: "target-alias" };
    const owners = targetInstalledBy(item2, target);
    if (owners.length !== 1 || owners[0] !== "direct")
      return { status: "blocked", reason: "shared-target" };
    paths.add(target.installDir);
  }
  for (const other of inventory2.items) {
    for (const target of other.targets) {
      if (other === whole && item2.targets.includes(target))
        continue;
      const canonical = await canonicalizeExistingPath(target.installDir);
      if ([...paths].some((path2) => pathsOverlap(path2, canonical)))
        return { status: "blocked", reason: "shared-target" };
    }
  }
  for (const suite of inventory2.suites ?? []) {
    for (const member of suite.members) {
      for (const path2 of member.installDirs) {
        const canonical = await canonicalizeExistingPath(path2);
        if ([...paths].some((selected2) => pathsOverlap(selected2, canonical)))
          return { status: "blocked", reason: "shared-target" };
      }
    }
  }
  for (const target of item2.targets) {
    try {
      if (await realpath6(target.rootDir) !== target.rootDir || await realpath6(target.installDir) !== target.installDir) {
        return { status: "blocked", reason: "target-alias" };
      }
      await assertOwnedRegularTree(target.installDir);
      const read = await readInstalledSkillMetadata(target.installDir);
      if (read.status !== "valid")
        return { status: "blocked", reason: "metadata-invalid" };
      const metadata = read.metadata;
      if (!metadata.files || !target.fingerprint || !sameInstalledSkillSource(metadata, item2) || metadata.version !== target.version || metadata.fingerprint !== target.fingerprint || metadata.agent !== "dsh" || metadata.installedAt !== target.installedAt) {
        return { status: "blocked", reason: "metadata-invalid" };
      }
      const snapshot = await snapshotSkillDirectory(target.installDir);
      if (snapshot.fingerprint !== target.fingerprint || !isDeepStrictEqual7(snapshot.files, metadata.files)) {
        return { status: "blocked", reason: "local-changes" };
      }
      targets.push({
        scope: approvedRoots.find((root) => root.root === target.rootDir).scope,
        root: target.rootDir,
        path: target.installDir,
        metadata,
        files: snapshot.files
      });
    } catch {
      return { status: "blocked", reason: "target-unavailable" };
    }
  }
  if (await captureInstallInventory(await store.read(), selected, paths) !== await captureInstallInventory(inventory2, selected, paths))
    return { status: "blocked", reason: "record-changed" };
  return { status: "ready", inventoryItem: item2, targets };
}

// ../../cli/src/integrations/removal-baseline.ts
import { lstat as lstat10 } from "node:fs/promises";
import { isAbsolute as isAbsolute13, join as join15, resolve as resolve14 } from "node:path";
import { isDeepStrictEqual as isDeepStrictEqual8 } from "node:util";
async function inspectRemovalBaseline(store, selected, target) {
  if (!isAbsolute13(target.root) || resolve14(target.root) !== target.root || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(selected.slug))
    return { status: "blocked", reason: "target-outside-context" };
  const inventory2 = structuredClone(await store.read());
  const matches = inventory2.items.filter((item3) => sameInstalledSkillSource(item3, selected));
  const item2 = matches[0];
  if (matches.length !== 1 || !item2)
    return { status: "blocked", reason: "record-changed" };
  const path2 = join15(target.root, selected.slug);
  const entries = item2.targets.filter((entry2) => entry2.installDir === path2);
  const entry = entries[0];
  if (entries.length !== 1 || !entry || entry.version !== selected.version || entry.agent !== "dsh" || entry.rootDir !== target.root) {
    return { status: "blocked", reason: "target-outside-context" };
  }
  const owners = targetInstalledBy(item2, entry);
  if (owners.length !== 1 || owners[0] !== "direct")
    return { status: "blocked", reason: "shared-target" };
  if (!entry.fingerprint)
    return { status: "blocked", reason: "metadata-invalid" };
  for (const suite of inventory2.suites ?? [])
    for (const member of suite.members) {
      for (const claimed of member.installDirs)
        if (pathsOverlap(await canonicalizeExistingPath(claimed), path2))
          return { status: "blocked", reason: "shared-target" };
    }
  try {
    if (await canonicalizeExistingPath(target.root) !== target.root)
      return { status: "blocked", reason: "target-alias" };
    if (!(await lstat10(target.root)).isDirectory())
      return { status: "blocked", reason: "target-unavailable" };
    for (const other of inventory2.items) {
      for (const otherTarget of other.targets) {
        if (other === item2 && otherTarget === entry)
          continue;
        if (pathsOverlap(await canonicalizeExistingPath(otherTarget.installDir), path2))
          return { status: "blocked", reason: "shared-target" };
      }
    }
  } catch {
    return { status: "blocked", reason: "target-unavailable" };
  }
  let missing = false;
  try {
    await lstat10(path2);
  } catch (error) {
    if (error.code !== "ENOENT")
      return { status: "blocked", reason: "target-unavailable" };
    missing = true;
  }
  let result;
  if (missing) {
    result = { status: "ready", kind: "remove-stale-record", inventoryItem: { ...item2, targets: [entry] }, target: { ...target, path: path2 } };
  } else {
    const inspected = await inspectUpgradeBaseline({ read: async () => ({
      ...inventory2,
      items: inventory2.items.map((record3) => record3 === item2 ? { ...record3, targets: [entry] } : record3)
    }) }, selected, [target]);
    if (inspected.status === "blocked")
      return inspected;
    result = { status: "ready", kind: "uninstall", inventoryItem: { ...item2, targets: [entry] }, target: inspected.targets[0] };
  }
  const latest = await store.read();
  const current = latest.items.filter((record3) => sameInstalledSkillSource(record3, selected));
  if (!isDeepStrictEqual8(current.map((record3) => ({ ...record3, targets: record3.targets.filter((value) => value.installDir === path2) })), [{ ...item2, targets: [entry] }]))
    return { status: "blocked", reason: "record-changed" };
  for (const record3 of latest.items) {
    for (const targetEntry of record3.targets) {
      if (sameInstalledSkillSource(record3, selected) && targetEntry.installDir === path2)
        continue;
      if (pathsOverlap(await canonicalizeExistingPath(targetEntry.installDir), path2))
        return { status: "blocked", reason: "shared-target" };
    }
  }
  if (missing) {
    try {
      await lstat10(path2);
      return { status: "blocked", reason: "record-changed" };
    } catch (error) {
      if (error.code !== "ENOENT")
        return { status: "blocked", reason: "target-unavailable" };
    }
  }
  return result;
}

// ../../cli/src/integrations/operation-projection.ts
function projectOperation(record3) {
  const { operation, transaction, removal } = record3;
  const before = removal?.intent.inventoryItem ?? (transaction?.preparation?.before ?? transaction?.inventoryCommit?.before)?.items.find((item2) => item2.registry === operation.context.sourceIdentity && item2.namespace === operation.namespace && item2.slug === operation.slug);
  const beforeVersion = operation.targetPaths?.length && operation.targetPaths.every((path2) => before?.targets.some((target) => target.installDir === path2)) && new Set(before?.targets.filter((target) => operation.targetPaths.includes(target.installDir)).map((target) => target.version)).size === 1 ? before?.targets.find((target) => operation.targetPaths.includes(target.installDir))?.version ?? null : null;
  const completed = operation.status.phase === "completed";
  const files = operation.status.files;
  const outcome = completed && ["installed", "already-installed", "upgraded", "removed", "stale-record-removed"].includes(files) ? files === "already-installed" ? "installed" : files : operation.status.phase === "failed" && operation.status.recovery === "restored" ? "restored" : "unknown";
  return {
    operationId: record3.operationId,
    revision: record3.revision,
    kind: operation.kind,
    namespace: operation.namespace,
    slug: operation.slug,
    version: operation.version,
    targetLabel: operation.targetLabel,
    context: { ...operation.context },
    phase: operation.status.phase,
    files,
    discovery: operation.status.discovery,
    recovery: operation.status.recovery,
    warningCount: operation.status.warnings.length,
    resultDetails: {
      beforeVersion: completed && files === "already-installed" ? operation.version : beforeVersion,
      afterVersion: completed && ["installed", "already-installed", "upgraded"].includes(files) ? operation.version : null,
      targets: (operation.targetPaths ?? []).map((_, index, targets) => ({
        label: targets.length === 1 ? operation.targetLabel : `目标 ${index + 1}（确认计划顺序）`,
        outcome
      })),
      warnings: operation.status.warnings.map((warning) => warning === "Backup cleanup requires verification." ? "backup-cleanup" : warning === "Removal quarantine cleanup requires verification." ? "removal-cleanup" : "verification-required")
    }
  };
}

// ../../cli/src/integrations/native-install.ts
import { isAbsolute as isAbsolute14, join as join16 } from "node:path";
async function executeNativeInstall(operations, inventory2, request) {
  request = { ...request };
  const record3 = await operations.get(request.operationId, request.ownerId);
  if (!record3 || record3.operation.kind !== "install" || record3.operation.status.phase !== "accepted")
    throw new Error("Installation is not owned and accepted");
  const operation = record3.operation;
  if (!isAbsolute14(request.root) || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(request.slug) || operation.context.sourceIdentity !== request.registry || operation.namespace !== request.namespace || operation.slug !== request.slug || operation.version !== request.version || !request.fingerprint || !Number.isInteger(request.versionId) || request.versionId <= 0)
    throw new Error("Installation snapshot changed");
  const root = request.root;
  const target = join16(root, request.slug);
  if (operation.targetPaths?.length !== 1 || operation.targetPaths[0] !== target)
    throw new Error("Installation target changed");
  await operations.update(record3.operationId, record3.ownerId, record3.revision, { ...operation.status, phase: "staging" });
  let coreStarted = false;
  try {
    if (await canonicalizeExistingPath(root) !== root)
      throw new Error("Installation target changed");
    await request.authorize([root, target], "staging");
    const existing = await confirmExistingNativeInstall(operations, inventory2, request);
    if (existing)
      return existing;
    const client = new SkillHubClient(request.registry);
    const resolved = await client.resolve(request.namespace, request.slug, request.version);
    if (resolved.namespace !== request.namespace || resolved.slug !== request.slug || resolved.version !== request.version || resolved.versionId !== request.versionId || resolved.fingerprint !== request.fingerprint)
      throw new Error("Installation release changed");
    const observer = await createInstallTransactionObserver(operations, record3.operationId, record3.ownerId);
    coreStarted = true;
    await installSkill({
      registry: request.registry,
      namespace: request.namespace,
      slug: request.slug,
      version: request.version,
      resolved,
      client,
      force: false,
      inventoryStore: inventory2,
      targets: [{ agent: "dsh", rootDir: root, scope: request.scope, source: "explicit" }],
      transactionObserver: observer,
      authorizeTargetMutation: request.authorize,
      validateStagedSkill: request.validateStaged
    });
    const result = await reconcileCommittedInstallation({
      operations,
      inventory: inventory2,
      operationId: record3.operationId,
      ownerId: record3.ownerId,
      trustedTargetPaths: [target]
    });
    return { operationId: result.operationId, revision: result.revision, outcome: result.outcome, reason: result.reason };
  } catch (error) {
    if (coreStarted) {
      try {
        await settleUnpreparedInstallationFailure({
          operations,
          inventory: inventory2,
          operationId: record3.operationId,
          ownerId: record3.ownerId,
          trustedTargetPaths: [target]
        });
      } catch {}
    }
    const current = await operations.get(record3.operationId, record3.ownerId);
    if (current && ["staging", "revalidating", "committing"].includes(current.operation.status.phase)) {
      await operations.update(current.operationId, current.ownerId, current.revision, {
        ...current.operation.status,
        phase: coreStarted ? "recovery-required" : "failed",
        files: coreStarted ? "unknown" : "failed",
        recovery: coreStarted ? "unknown" : "not-needed"
      });
    }
    throw error;
  }
}

// ../../cli/src/integrations/native-upgrade.ts
import { isDeepStrictEqual as isDeepStrictEqual9 } from "node:util";
async function executeNativeUpgrade(operations, inventory2, input2) {
  const request = { ...input2, baseline: structuredClone(input2.baseline) };
  const { baseline } = request;
  const record3 = await operations.get(request.operationId, request.ownerId);
  if (!record3 || record3.operation.kind !== "upgrade" || record3.operation.status.phase !== "accepted")
    throw new Error("Upgrade is not owned and accepted");
  const operation = record3.operation;
  const paths = baseline.targets.map((target) => target.path);
  if (!paths.length || !isDeepStrictEqual9([...paths].sort(), [...operation.targetPaths ?? []].sort()) || operation.context.sourceIdentity !== request.registry || operation.namespace !== request.namespace || operation.slug !== request.slug || operation.version !== request.version || !sameInstalledSkillSource(baseline.inventoryItem, request) || !Number.isInteger(request.versionId) || request.versionId <= 0 || baseline.inventoryItem.targets.some((target) => assessSkillUpdate(target, request).state !== "upgradable"))
    throw new Error("Upgrade snapshot changed");
  await operations.update(record3.operationId, record3.ownerId, record3.revision, { ...operation.status, phase: "staging" });
  let coreStarted = false;
  const verifyBaseline = async () => {
    for (const target of baseline.targets)
      await request.authorize([target.root, target.path], "staging");
    await operations.assertTargetsAvailable(paths, request);
    const current = await inspectUpgradeBaseline(inventory2, { ...baseline.inventoryItem, version: baseline.inventoryItem.targets[0].version }, baseline.targets);
    if (!isDeepStrictEqual9(current, baseline))
      throw new Error("Upgrade baseline changed");
  };
  try {
    await verifyBaseline();
    const client = new SkillHubClient(request.registry);
    const resolved = await client.resolve(request.namespace, request.slug, request.version);
    if (resolved.namespace !== request.namespace || resolved.slug !== request.slug || resolved.version !== request.version || resolved.versionId !== request.versionId || resolved.fingerprint !== request.fingerprint)
      throw new Error("Upgrade release changed");
    const journal = await createInstallTransactionObserver(operations, record3.operationId, record3.ownerId);
    coreStarted = true;
    await installSkill({
      registry: request.registry,
      namespace: request.namespace,
      slug: request.slug,
      version: request.version,
      resolved,
      client,
      force: true,
      allowTargetDrift: false,
      requireExistingTargets: true,
      inventoryStore: inventory2,
      expectedInventoryItem: baseline.inventoryItem,
      expectedTargetFiles: Object.fromEntries(baseline.targets.map((target) => [target.path, target.files])),
      targets: baseline.targets.map((target) => ({ agent: "dsh", rootDir: target.root, scope: target.scope, source: "explicit" })),
      authorizeTargetMutation: request.authorize,
      validateStagedSkill: request.validateStaged,
      transactionObserver: {
        ...journal,
        beforeTargetMutation: async (targets) => {
          await journal.beforeTargetMutation?.(targets);
          await verifyBaseline();
        },
        afterMove: async (move2) => {
          await journal.afterMove?.(move2);
          if (move2.phase !== "backup")
            return;
          const expected = baseline.targets.find((target) => target.path === move2.canonicalSkillDir);
          await assertOwnedRegularTree(move2.to);
          const metadata = await readInstalledSkillMetadata(move2.to);
          if (!expected || metadata.status !== "valid" || !isDeepStrictEqual9(metadata.metadata, expected.metadata)) {
            throw new Error("Upgrade metadata changed");
          }
        }
      }
    });
    const result = await reconcileCommittedInstallation({
      operations,
      inventory: inventory2,
      operationId: record3.operationId,
      ownerId: record3.ownerId,
      trustedTargetPaths: paths
    });
    return { operationId: result.operationId, revision: result.revision, outcome: result.outcome, reason: result.reason };
  } catch (error) {
    if (coreStarted) {
      try {
        await settleUnpreparedInstallationFailure({
          operations,
          inventory: inventory2,
          operationId: record3.operationId,
          ownerId: record3.ownerId,
          trustedTargetPaths: paths
        });
      } catch {}
    }
    const current = await operations.get(record3.operationId, record3.ownerId);
    if (current && ["staging", "revalidating", "committing"].includes(current.operation.status.phase)) {
      await operations.update(current.operationId, current.ownerId, current.revision, {
        ...current.operation.status,
        phase: coreStarted ? "recovery-required" : "failed",
        files: coreStarted ? "unknown" : "failed",
        recovery: coreStarted ? "unknown" : "not-needed"
      });
    }
    throw error;
  }
}

// ../../cli/src/integrations/native-removal.ts
import { lstat as lstat11, mkdir as mkdir5, realpath as realpath7, rename as rename6, rm as rm6 } from "node:fs/promises";
import { dirname as dirname9, join as join17 } from "node:path";
import { isDeepStrictEqual as isDeepStrictEqual11 } from "node:util";

// ../../cli/src/integrations/removal-inventory.ts
import { isDeepStrictEqual as isDeepStrictEqual10 } from "node:util";
async function commitRemovalInventory(store, baseline, beforeCommit) {
  const expected = structuredClone(baseline.inventoryItem);
  const path2 = baseline.target.path;
  const target = expected.targets.filter((entry) => entry.installDir === path2);
  if (target.length !== 1 || target[0].agent !== "dsh" || target[0].rootDir !== baseline.target.root || !isDeepStrictEqual10(targetInstalledBy(expected, target[0]), ["direct"])) {
    throw new Error("Removal target is not exclusively owned");
  }
  const paths = new Set([path2]);
  const expectedState = await captureInstallInventory({ items: [expected] }, expected, paths);
  await store.mutateAtomic((inventory2) => {
    const matches = inventory2.items.filter((item3) => sameInstalledSkillSource(item3, expected));
    if (!isDeepStrictEqual10(matches.map((item3) => ({ ...item3, targets: item3.targets.filter((target2) => target2.installDir === path2) })), [expected]))
      throw new Error("Removal inventory changed");
    const item2 = matches[0];
    item2.targets = item2.targets.filter((entry) => entry.installDir !== path2);
    if (!item2.targets.length)
      inventory2.items = inventory2.items.filter((entry) => entry !== item2);
  }, async (before, after) => {
    if (await captureInstallInventory(before, expected, paths) !== expectedState) {
      throw new Error("Removal target ownership changed");
    }
    await beforeCommit(before, after);
  });
}

// ../../cli/src/integrations/native-removal.ts
async function executeNativeRemoval(operations, inventory2, input2) {
  const baseline = structuredClone(input2.baseline);
  const { target, inventoryItem: item2 } = baseline;
  const releaseTarget = item2.targets.find((entry) => entry.installDir === target.path);
  if (!releaseTarget)
    throw new Error("Removal target missing");
  await inventory2.ensureWritable();
  let record3 = await operations.get(input2.operationId, input2.ownerId);
  if (!record3 || record3.operation.status.phase !== "accepted" || record3.operation.kind !== baseline.kind || !isDeepStrictEqual11(record3.operation.targetPaths, [target.path]) || !sameInstalledSkillSource(item2, {
    registry: record3.operation.context.sourceIdentity,
    namespace: record3.operation.namespace,
    slug: record3.operation.slug
  }) || releaseTarget.version !== record3.operation.version)
    throw new Error("Removal is not owned and accepted");
  record3 = await operations.update(record3.operationId, record3.ownerId, record3.revision, { ...record3.operation.status, phase: "revalidating" });
  const authorize = (paths, phase2) => input2.authorize(paths, phase2, input2.operationId);
  const append = async (event) => {
    record3 = await operations.recordRemoval(record3.operationId, record3.ownerId, record3.revision, event);
  };
  let release;
  let intentWritten = false;
  try {
    await authorize([target.root, target.path], "staging");
    release = await acquireSkillTargetLock(target.root, item2.slug);
    await operations.assertTargetsAvailable([target.path], input2);
    if (!isDeepStrictEqual11(await inspectRemovalBaseline(inventory2, { ...item2, version: releaseTarget.version }, target), baseline))
      throw new Error("Removal baseline changed");
    const quarantine = baseline.kind === "uninstall" ? join17(dirname9(target.root), ".skillhub-trash", record3.operationId) : null;
    const verifyRoots = async () => {
      if (await realpath7(target.root) !== target.root || !(await lstat11(target.root)).isDirectory())
        throw new Error("Removal root changed");
      if (quarantine && (await realpath7(dirname9(quarantine)) !== dirname9(quarantine) || !(await lstat11(dirname9(quarantine))).isDirectory()))
        throw new Error("Quarantine root changed");
    };
    const verifyQuarantine = async () => {
      if (!quarantine || baseline.kind !== "uninstall")
        return;
      await assertOwnedRegularTree(quarantine);
      const metadata = await readInstalledSkillMetadata(quarantine);
      const snapshot = await snapshotSkillDirectory(quarantine);
      if (metadata.status !== "valid" || !isDeepStrictEqual11(metadata.metadata, baseline.target.metadata) || snapshot.fingerprint !== releaseTarget.fingerprint || !isDeepStrictEqual11(snapshot.files, baseline.target.files)) {
        throw new Error("Isolated removal files changed");
      }
    };
    if (quarantine) {
      await authorize([target.root, target.path, dirname9(quarantine), quarantine], "staging");
      await mkdir5(dirname9(quarantine), { mode: 448 }).catch((error) => {
        if (error.code !== "EEXIST")
          throw error;
      });
      await verifyRoots();
      const directory = await lstat11(dirname9(quarantine));
      if (!directory.isDirectory() || directory.isSymbolicLink() || process.getuid && directory.uid !== process.getuid() || process.platform !== "win32" && (directory.mode & 63) !== 0 || directory.dev !== (await lstat11(target.path)).dev)
        throw new Error("Unsafe quarantine directory");
      await assertMissing(quarantine);
    }
    intentWritten = true;
    await append({ type: "intent", intent: {
      inventoryItem: item2,
      target: { root: target.root, path: target.path, scope: target.scope },
      quarantine,
      files: baseline.kind === "uninstall" ? baseline.target.files : null
    } });
    if (quarantine) {
      await authorize([target.path, quarantine], "replace");
      await verifyRoots();
      if (!isDeepStrictEqual11(await inspectRemovalBaseline(inventory2, { ...item2, version: releaseTarget.version }, target), baseline))
        throw new Error("Removal baseline changed");
      await assertMissing(quarantine);
      await rename6(target.path, quarantine);
      await append({ type: "isolated" });
      await verifyQuarantine();
    }
    await commitRemovalInventory(inventory2, baseline, async (before, after) => {
      await authorize([target.root, target.path, ...quarantine ? [quarantine] : []], "replace");
      await verifyRoots();
      await assertMissing(target.path);
      await verifyQuarantine();
      await append({ type: "beforeCommit", commit: { before, after } });
    });
    await append({ type: "committed" });
    let cleanupFailed = false;
    if (quarantine) {
      try {
        await authorize([quarantine], "cleanup");
        await verifyRoots();
        await verifyQuarantine();
        await rm6(quarantine, { recursive: true });
        await append({ type: "cleanup", removed: true });
      } catch {
        cleanupFailed = true;
        await append({ type: "cleanup", removed: false });
      }
    }
    record3 = await operations.update(record3.operationId, record3.ownerId, record3.revision, {
      ...record3.operation.status,
      phase: "completed",
      files: baseline.kind === "uninstall" ? "removed" : "stale-record-removed",
      recovery: "not-needed",
      warnings: cleanupFailed ? ["Removal quarantine cleanup requires verification."] : []
    });
    return {
      operationId: record3.operationId,
      revision: record3.revision,
      outcome: "committed",
      reason: cleanupFailed ? "cleanup-required" : baseline.kind
    };
  } catch (error) {
    const current = await operations.get(input2.operationId, input2.ownerId);
    if (current && ["revalidating", "committing"].includes(current.operation.status.phase)) {
      await operations.update(current.operationId, current.ownerId, current.revision, {
        ...current.operation.status,
        phase: intentWritten ? "recovery-required" : "failed",
        files: intentWritten ? "unknown" : "failed",
        recovery: intentWritten ? "unknown" : "not-needed"
      });
    }
    throw error;
  } finally {
    await release?.();
  }
}
async function assertMissing(path2) {
  try {
    await lstat11(path2);
  } catch (error) {
    if (error.code === "ENOENT")
      return;
    throw error;
  }
  throw new Error("Removal path is occupied");
}

// ../../cli/src/integrations/removal-recovery.ts
import { lstat as lstat12, realpath as realpath8, rename as rename7, rm as rm7 } from "node:fs/promises";
import { dirname as dirname10 } from "node:path";
import { isDeepStrictEqual as isDeepStrictEqual12 } from "node:util";
async function recoverRemoval(options) {
  const { operations, inventory: inventory2, operationId, ownerId } = options;
  let record3 = await operations.get(operationId, ownerId);
  if (!record3 || !["uninstall", "remove-stale-record"].includes(record3.operation.kind) || typeof options.authorizeMutation !== "function")
    throw new Error("Expected an owned removal with Host authorization");
  const result = (outcome, reason) => ({ operationId, revision: record3.revision, outcome, reason });
  if (record3.schemaVersion === 1 && await inventory2.diskVersion() === 2)
    return result("unknown", "legacy-journal-needs-v1-inventory");
  if (!isDeepStrictEqual12(record3.operation.targetPaths, [...options.trustedTargetPaths]) || options.trustedTargetPaths.length !== 1)
    return result("unknown", "target-binding-mismatch");
  const append = async (event) => {
    record3 = await operations.recordRemoval(operationId, ownerId, record3.revision, event);
  };
  const update = async (status2) => {
    record3 = await operations.update(operationId, ownerId, record3.revision, status2);
  };
  let release;
  try {
    const journal = record3.removal;
    if (!journal) {
      if (record3.operation.status.phase === "completed")
        return result("unknown", "missing-removal-intent");
      if (record3.operation.status.phase !== "failed") {
        if (["unknown", "recovery-required"].includes(record3.operation.status.phase)) {
          await update({ ...record3.operation.status, phase: "recovering" });
        }
        await update({ ...record3.operation.status, phase: "failed", files: "failed", recovery: "not-needed" });
      }
      return result("restored", "no-removal-intent");
    }
    const intent2 = journal.intent;
    applyRemovalEvent({
      ...record3,
      removal: undefined,
      operation: { ...record3.operation, status: { ...record3.operation.status, phase: "revalidating" } }
    }, { type: "intent", intent: intent2 });
    if (journal.inventoryCommit) {
      applyRemovalEvent({
        ...record3,
        removal: { intent: intent2, isolated: journal.isolated },
        operation: { ...record3.operation, status: { ...record3.operation.status, phase: "recovering" } }
      }, { type: "beforeCommit", commit: journal.inventoryCommit });
    }
    const { target, quarantine, inventoryItem: item2 } = intent2;
    const verifyRoots = async () => {
      if (await realpath8(target.root) !== target.root || !(await lstat12(target.root)).isDirectory())
        throw new Error("Target root changed");
      if (quarantine && (await realpath8(dirname10(quarantine)) !== dirname10(quarantine) || !(await lstat12(dirname10(quarantine))).isDirectory()))
        throw new Error("Quarantine root changed");
    };
    await verifyRoots();
    release = await acquireSkillTargetLock(target.root, item2.slug);
    const locked = await operations.get(operationId, ownerId);
    if (!locked || locked.revision !== record3.revision)
      return result("unknown", "operation-changed");
    if (!["completed", "failed", "recovering"].includes(record3.operation.status.phase)) {
      await update({ ...record3.operation.status, phase: "recovering" });
    }
    return await inventory2.withLockedSnapshot(async (actualInventory) => {
      const paths = new Set([target.path]);
      const actual = await captureInstallInventory(actualInventory, item2, paths);
      const before = await captureInstallInventory({ items: [item2] }, item2, paths);
      const commit3 = journal.inventoryCommit;
      const after = commit3 ? await captureInstallInventory(commit3.after, item2, paths) : null;
      if (after === before)
        throw new Error("Indistinguishable removal snapshots");
      const verifyFiles = async (path2) => {
        await assertOwnedRegularTree(path2);
        const metadata = await readInstalledSkillMetadata(path2);
        const snapshot = await snapshotSkillDirectory(path2);
        const expected = item2.targets.find((entry) => entry.installDir === target.path);
        if (metadata.status !== "valid" || !sameInstalledSkillSource(metadata.metadata, item2) || metadata.metadata.version !== expected.version || metadata.metadata.fingerprint !== expected.fingerprint || metadata.metadata.agent !== "dsh" || metadata.metadata.installedAt !== expected.installedAt || !isDeepStrictEqual12(metadata.metadata.files, intent2.files) || !isDeepStrictEqual12(snapshot.files, intent2.files) || snapshot.fingerprint !== expected.fingerprint) {
          throw new Error("Removal files changed");
        }
      };
      if (after !== null && actual === after) {
        if (record3.operation.status.phase === "failed" || journal.restore)
          throw new Error("Conflicting removal outcome");
        if (await exists2(target.path))
          throw new Error("Removed target reappeared");
        if (!commit3.committed)
          await append({ type: "committed" });
        let cleanupFailed = false;
        if (quarantine) {
          try {
            if (await exists2(quarantine)) {
              await options.authorizeMutation([quarantine], "cleanup");
              await verifyRoots();
              await verifyFiles(quarantine);
              await rm7(quarantine, { recursive: true });
            }
            await append({ type: "cleanup", removed: true });
          } catch {
            cleanupFailed = true;
            record3 = await operations.get(operationId, ownerId);
            await append({ type: "cleanup", removed: false });
          }
        }
        await update({
          ...record3.operation.status,
          phase: "completed",
          files: record3.operation.kind === "uninstall" ? "removed" : "stale-record-removed",
          recovery: "not-needed",
          warnings: cleanupFailed ? ["Removal quarantine cleanup requires verification."] : []
        });
        return result("committed", cleanupFailed ? "cleanup-required" : "removal-verified");
      }
      if (actual !== before || commit3?.committed || record3.operation.status.phase === "completed") {
        throw new Error("Removal inventory conflict");
      }
      if (quarantine) {
        const present = await exists2(target.path);
        const isolated = await exists2(quarantine);
        if (present === isolated)
          throw new Error("Ambiguous removal directories");
        if (isolated) {
          if (record3.operation.status.phase === "failed")
            throw new Error("Restored target missing");
          await options.authorizeMutation([quarantine, target.path], "rollback");
          await verifyRoots();
          await verifyFiles(quarantine);
          if (await exists2(target.path))
            throw new Error("Restore target occupied");
          await append({ type: "restore", completed: false });
          await rename7(quarantine, target.path);
          await append({ type: "restore", completed: true });
        }
        await verifyFiles(target.path);
      } else if (await exists2(target.path))
        throw new Error("Stale target reappeared");
      await update({ ...record3.operation.status, phase: "failed", files: "failed", recovery: quarantine ? "restored" : "not-needed" });
      return result("restored", quarantine ? "original-target-verified" : "stale-record-retained");
    });
  } catch {
    const current = await operations.get(operationId, ownerId);
    if (current) {
      record3 = current;
      if (!["completed", "failed", "recovery-required"].includes(current.operation.status.phase)) {
        if (current.operation.status.phase !== "recovering")
          await update({ ...current.operation.status, phase: "recovering" });
        await update({ ...record3.operation.status, phase: "recovery-required", files: "unknown", recovery: "incomplete" });
      }
    }
    return result("unknown", "removal-requires-verification");
  } finally {
    await release?.();
  }
}
async function exists2(path2) {
  try {
    await lstat12(path2);
    return true;
  } catch (error) {
    if (error.code === "ENOENT")
      return false;
    throw error;
  }
}

// ../../cli/src/integrations/native-runtime.ts
async function openNativeRuntime(options) {
  const operations = await OperationStore.open(options.stateDirectory);
  const inventory2 = new InventoryStore(options.inventoryHome);
  const ensureCompatible = async () => {
    if ((await operations.listForRecovery()).some((record3) => record3.schemaVersion === 1)) {
      throw new OperationStoreError("TARGET_RECOVERY_REQUIRED");
    }
    await inventory2.ensureWritable();
  };
  return {
    hostInstanceId: operations.hostInstanceId,
    readSkillExamples,
    observeInstallation: (operationId, ownerId, trustedRoots, observe) => observeInstallationDiscovery({
      operations,
      inventory: inventory2,
      operationId,
      ownerId,
      trustedRoots,
      observe
    }),
    findPlanOperation: async (request) => {
      let conflict;
      for (const kind of ["upgrade", "removal"]) {
        try {
          const result = await operations.accept({
            hostInstanceId: request.hostInstanceId,
            ownerId: request.ownerId,
            requestKey: request.requestKey,
            mode: "retry",
            requestDigest: operationRequestDigest({ ...request.parameters, kind })
          }, async () => {
            throw new Error("Plan lookup cannot accept new work");
          });
          if (result) {
            if (kind === "upgrade" ? result.operation.kind !== "upgrade" : !["uninstall", "remove-stale-record"].includes(result.operation.kind))
              throw new Error("Plan operation kind mismatch");
            return projectOperation(result);
          }
        } catch (error) {
          if (!(error instanceof OperationStoreError) || error.code !== "REQUEST_KEY_CONFLICT")
            throw error;
          conflict = error;
        }
      }
      if (conflict)
        throw conflict;
      return;
    },
    executeRemoval: async (request) => {
      await ensureCompatible();
      const snapshot = { ...request, baseline: structuredClone(request.baseline) };
      return withOperationLease(operations, snapshot.operationId, snapshot.ownerId, () => executeNativeRemoval(operations, inventory2, snapshot));
    },
    acceptRemoval: async (request, validateNew) => {
      const result = await operations.accept({
        hostInstanceId: request.hostInstanceId,
        ownerId: request.ownerId,
        requestKey: request.requestKey,
        mode: request.mode,
        requestDigest: operationRequestDigest({ ...request.parameters, kind: "removal" })
      }, async () => {
        const input2 = await validateNew();
        if (!["uninstall", "remove-stale-record"].includes(input2.kind))
          throw new Error("Expected removal acceptance");
        return input2;
      });
      return result ? projectOperation(result) : undefined;
    },
    inspectRemoval: (selected, target) => inspectRemovalBaseline(inventory2, { ...selected }, { ...target }),
    executeUpgrade: async (request) => {
      await ensureCompatible();
      const snapshot = { ...request, baseline: structuredClone(request.baseline) };
      return withOperationLease(operations, snapshot.operationId, snapshot.ownerId, () => executeNativeUpgrade(operations, inventory2, snapshot));
    },
    acceptUpgrade: async (request, validateNew) => {
      const result = await operations.accept({
        hostInstanceId: request.hostInstanceId,
        ownerId: request.ownerId,
        requestKey: request.requestKey,
        mode: request.mode,
        requestDigest: operationRequestDigest({ ...request.parameters, kind: "upgrade" })
      }, async () => ({ ...await validateNew(), kind: "upgrade" }));
      return result ? projectOperation(result) : undefined;
    },
    assessUpdate: assessSkillUpdate,
    inspectUpgrade: (selected, targets) => inspectUpgradeBaseline(inventory2, { ...selected }, targets.map((target) => ({ ...target }))),
    listInstalled: (registry, targets) => readInstalledProjection(inventory2, registry, targets.map((target) => ({ ...target }))),
    executeInstall: async (request) => {
      await ensureCompatible();
      const snapshot = { ...request };
      return withOperationLease(operations, snapshot.operationId, snapshot.ownerId, () => executeNativeInstall(operations, inventory2, snapshot));
    },
    acceptInstall: async (request, validateNew) => {
      const result = await operations.accept({
        hostInstanceId: request.hostInstanceId,
        ownerId: request.ownerId,
        requestKey: request.requestKey,
        mode: request.mode,
        requestDigest: operationRequestDigest(request.parameters)
      }, async () => ({ ...await validateNew(), kind: "install" }));
      return result ? projectOperation(result) : undefined;
    },
    getOperation: async (operationId, ownerId) => {
      const result = await operations.get(operationId, ownerId);
      return result ? projectOperation(result) : undefined;
    },
    listPending: async () => (await operations.listForRecovery()).map((record3) => ({
      operationId: record3.operationId,
      ownerId: record3.ownerId,
      kind: record3.operation.kind,
      namespace: record3.operation.namespace,
      slug: record3.operation.slug,
      targetPaths: [...record3.operation.targetPaths ?? []]
    })),
    recover: async (operationId, ownerId, trustedTargetPaths, authorize) => {
      if (typeof authorize !== "function")
        throw new Error("Native recovery requires Host authorization");
      const paths = [...trustedTargetPaths];
      const result = await withOperationLease(operations, operationId, ownerId, async () => {
        const record3 = await operations.get(operationId, ownerId);
        const input2 = { operations, inventory: inventory2, operationId, ownerId, trustedTargetPaths: paths, authorizeMutation: authorize };
        return record3 && ["uninstall", "remove-stale-record"].includes(record3.operation.kind) ? recoverRemoval(input2) : recoverInstallation(input2);
      });
      return { operationId: result.operationId, revision: result.revision, outcome: result.outcome, reason: result.reason };
    }
  };
}
async function withOperationLease(operations, operationId, ownerId, run) {
  if (!await operations.get(operationId, ownerId))
    throw new Error("Operation is not owned");
  const release = await acquireSkillTargetLock(operations.root, `execution-${operationId}`);
  let result;
  try {
    result = await run();
  } catch (failure) {
    try {
      await release();
    } catch (error) {
      throw new AggregateError([failure, error], "Native operation and lease release failed");
    }
    throw failure;
  }
  await release();
  return result;
}
export {
  snapshotSkillDirectory,
  recoverInstallation,
  reconcileCommittedInstallation,
  readSkillExamples,
  readInstalledProjection,
  planSkillUpgrades,
  parseSkillExamples,
  orderSkillTargetLocks,
  operationRequestDigest,
  openNativeRuntime,
  installSkill,
  inspectUpgradeBaseline,
  inspectRemovalBaseline,
  inspectInstallRecovery,
  executeSkillUpgradePlan,
  createInstallTransactionObserver,
  cleanupCommittedInstallation,
  assessSkillUpdate,
  acquireSkillTargetLock,
  OperationStoreError,
  OperationStore,
  InventoryStore,
  InventoryCommitUnknownError
};
