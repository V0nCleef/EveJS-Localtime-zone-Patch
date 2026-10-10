"use strict";

const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const { isMainThread } = require("node:worker_threads");
const { KEY, supportsHandshake, createDelivery, installHandshake } = require("./lib/delivery");
const canonical = file => path.resolve(file).replace(/\\/g, "/").toLowerCase();

function resolveRoot(start = __dirname) {
  let directory = path.resolve(start);
  for (let depth = 0; depth < 10; depth++) {
    if (fs.existsSync(path.join(directory, "server/package.json"))) return directory;
    const parent = path.dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
  throw new Error("Install this mod in the EveJS mods directory");
}

function install(root = resolveRoot()) {
  if (!isMainThread || process.env.EVEJS_WALLET_AUTHORITY_OWNER === "1" ||
      /[\\/]server[\\/]src[\\/].*\.worker\.js$/i.test(process.argv[1] || "")) {
    return { active: false, reason: "worker" };
  }
  const key = Symbol.for(KEY);
  if (globalThis[key]) return globalThis[key];
  const version = JSON.parse(fs.readFileSync(path.join(root, "server/package.json"), "utf8")).version;
  if (version !== "0.12.9") throw new Error("This build supports EveJS 0.12.9 Native");
  const handshakeFile = path.join(root, "server/src/network/tcp/handshake.js");
  if (!supportsHandshake(fs.readFileSync(handshakeFile, "utf8"))) {
    throw new Error("Unsupported login builder; server and client clocks were not changed");
  }
  if (require.cache[require.resolve(handshakeFile)]) throw new Error("Load this mod before the EveJS login module");
  const state = { active: true, root, handshakeAttached: false, delivery: createDelivery(__dirname) };
  const originalLoad = Module._load;
  Module._load = function(request, parent, isMain) {
    const exports = originalLoad.apply(this, arguments);
    if (state.active && !state.handshakeAttached && /(?:^|[\\/])handshake(?:\.js)?$/.test(request) &&
        canonical(Module._resolveFilename(request, parent, isMain)) === canonical(handshakeFile)) {
      try {
        installHandshake(exports, {
          codec: require(path.join(root, "server/src/network/tcp/utils/marshal.js")),
          delivery: state.delivery, active: () => state.active,
        });
        state.handshakeAttached = true;
        console.log("[EveJS Localtime zone Patch] Client clock delivery attached (server time unchanged)");
      } catch (error) {
        state.active = false;
        console.error("[EveJS Localtime zone Patch] Inactive: " + error.message);
      }
    }
    return exports;
  };
  globalThis[key] = state;
  console.log("[EveJS Localtime zone Patch] v0.1.0 enabled; each client uses its own local timezone");
  return state;
}

if (require.main !== module) {
  try { install(); }
  catch (error) { console.error("[EveJS Localtime zone Patch] Inactive: " + error.message); }
}
module.exports = { install, resolveRoot };
