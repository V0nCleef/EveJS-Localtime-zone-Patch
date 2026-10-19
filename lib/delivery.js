"use strict";

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const crypto = require("node:crypto");
const KEY = "evejs.localtime-zone-patch.v1";
const HANDSHAKE_BASELINE = "4fc3c37ec83c443c1497a3daba57d7157d05bbe55af3be2d5545b6162398ebc9";
// Exact reviewed source, normalized only for Windows line endings. Version
// 261018.1 changes client IDs and transport-close encoding outside our seam.
const HANDSHAKE_BASELINES = Object.freeze({
  "0.12.9": HANDSHAKE_BASELINE,
  "261018.1": "c84cffe20c00cf075a97daa31ca53c435af4f14c814e46d828760dbbb55fb566",
});

function supportsHandshake(source) {
  const digest = crypto.createHash("sha256").update(String(source).replace(/\r\n/g, "\n")).digest("hex");
  // Manifest versions describe tested builds. Runtime attachment depends on
  // the reviewed source contract, so a version change alone is not a blocker.
  return Object.values(HANDSHAKE_BASELINES).includes(digest);
}

function createDelivery(modRoot) {
  const source = ["# coding: utf-8", "localtime.py", "companion.py"].map(name =>
    name.endsWith(".py") ? fs.readFileSync(path.join(modRoot, "client", name), "utf8") : name).join("\n");
  if (Buffer.byteLength(source, "utf8") > 64 * 1024) throw new Error("Clock companion exceeds its payload bound");
  const encoded = zlib.deflateSync(Buffer.from(source, "utf8"), { level: 9 }).toString("base64");
  const execute = `try:\n eval(compile(__import__('zlib').decompress(__import__('base64').b64decode('${encoded}')), '<evejs-localtime-zone>', 'exec'), {'__builtins__': __builtins__, '_lt_context': _lt_context})\nexcept Exception:\n print('EVEJS_LOCALTIME:CLIENT_FAILED')\n`;
  const expression = `eval(compile(${JSON.stringify(execute)}, '<evejs-localtime-delivery>', 'exec'), {'__builtins__': __builtins__, '_lt_context': globals()})`;
  return {
    compose(original) {
      if (!Buffer.isBuffer(original) || original.length < 5 || original[0] !== 0x74 ||
          original.readUInt32LE(1) !== original.length - 5) throw new Error("Unsupported login expression envelope");
      const previous = original.subarray(5).toString("latin1");
      // Execute all existing login work first and preserve its exact result.
      const bytes = Buffer.from(`(lambda _lt_result: (${expression}, _lt_result)[1])(${previous})`, "latin1");
      if (bytes.length > 1024 * 1024) throw new Error("Combined login expression exceeds one MiB");
      const header = Buffer.alloc(5);
      header[0] = 0x74;
      header.writeUInt32LE(bytes.length, 1);
      return Buffer.concat([header, bytes]);
    },
  };
}

function installHandshake(Service, { codec, delivery, active = () => true }) {
  const installed = Symbol.for(KEY + ".handshake");
  const delivered = Symbol.for(KEY + ".delivered");
  if (Service.prototype[installed]) return;
  if (typeof Service.prototype._sendPacket !== "function") throw new Error("Login send hook changed");
  const previous = Service.prototype._sendPacket;
  // Wrap the existing sender after compilation. Other mods' exact-source
  // checks still see their original source, and encryption remains native.
  Service.prototype._sendPacket = function(packet) {
    if (active() && !this[delivered] && Number(this.userId) > 0 && Buffer.isBuffer(packet) &&
        packet.length >= 5 && packet.length <= 1024 * 1024 && packet.readUInt32LE(0) === packet.length - 4) {
      try {
        const value = codec.marshalDecodeExact(packet.subarray(4));
        if (Array.isArray(value) && value.length === 4 && codec.strVal(value[0]) === "" &&
            Array.isArray(value[1]) && value[1].length === 2 && Buffer.isBuffer(value[1][0]) && value[1][1] === false &&
            value[2]?.type === "dict" && codec.strVal(codec.dictGet(value[3], "challenge_responsehash")) === "55087") {
          const before = codec.marshalEncode(value[1][0]);
          const after = codec.marshalEncode(delivery.compose(value[1][0]));
          if (before[0] !== codec.MARSHAL_HEADER || after[0] !== codec.MARSHAL_HEADER) throw new Error("Native codec header changed");
          // Splice only the encoded login expression. Preserve all surrounding
          // bytes rather than re-encoding session, timing or authentication data.
          const oldValue = before.subarray(5), newValue = after.subarray(5);
          const at = packet.indexOf(oldValue, 9);
          if (at < 0 || packet.indexOf(oldValue, at + oldValue.length) >= 0) throw new Error("Login function is not uniquely encoded");
          packet = codec.wrapPacket(Buffer.concat([packet.subarray(4, at), newValue, packet.subarray(at + oldValue.length)]));
          this[delivered] = true;
        }
      } catch (error) {
        console.error("[EveJS Localtime zone Patch] Delivery failed; original login preserved: " + error.message);
      }
    }
    return previous.call(this, packet);
  };
  Object.defineProperty(Service.prototype, installed, { value: true });
}

module.exports = { KEY, HANDSHAKE_BASELINE, HANDSHAKE_BASELINES, supportsHandshake, createDelivery, installHandshake };
