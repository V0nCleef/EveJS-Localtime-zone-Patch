"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const crypto = require("node:crypto");
const root = process.env.EVEJS_TEST_ROOT;
if (!root) throw Error("Set EVEJS_TEST_ROOT to an inspected EveJS 261028.1 source root; these tests isolate all account/config dependencies.");
const scratch = process.env.EVEJS_TEST_SCRATCH;
if (!scratch) throw Error("Set EVEJS_TEST_SCRATCH to a disposable directory inside your test project.");
fs.mkdirSync(scratch, {recursive: true});
const mod = path.resolve(__dirname, "..");
const { supportsHandshake, createDelivery, installHandshake } = require(path.join(mod, "lib/delivery"));
const codec = require(path.join(root, "server/src/network/tcp/utils/marshal.js"));
const source = fs.readFileSync(path.join(root, "server/src/network/tcp/handshake.js"), "utf8");
const envelope = expression => {
  const text = Buffer.from(expression, "latin1"), header = Buffer.alloc(5);
  header[0] = 0x74; header.writeUInt32LE(text.length, 1);
  return Buffer.concat([header, text]);
};
const original = envelope("42");
const packetFor = value => codec.wrapPacket(codec.marshalEncode([
  "", [value, false], {type: "dict", entries: [["server-time", 123456789n]]},
  {type: "dict", entries: [["challenge_responsehash", "55087"], ["session-timestamp", 987654321n]]},
]));
const decoded = packet => codec.marshalDecodeExact(packet.subarray(4));
const delivery = createDelivery(mod);

test("reviewed native builder accepts line endings and rejects drift", () => {
  assert.equal(supportsHandshake(source), true);
  assert.equal(supportsHandshake(source.replace(/\r?\n/g, "\r\n")), true);
  assert.equal(supportsHandshake(source.replace('function buildTidiSignedFunc(', 'function changedBuilder(')), false);
  assert.throws(() => delivery.compose(Buffer.from('bad')), /envelope/);
  assert.throws(() => delivery.compose(envelope('x'.repeat(1024 * 1024))), /one MiB/);
});

test("real native codec: only login expression changes; timestamps and send behavior stay exact", () => {
  class Service { _sendPacket(packet) { this.packet = packet; return "native-result"; } }
  installHandshake(Service, {codec, delivery});
  const service = new Service(); service.userId = 1;
  const packet = packetFor(original);
  assert.equal(service._sendPacket(packet), "native-result");
  assert.notEqual(service.packet, packet);
  const before = decoded(packet), after = decoded(service.packet);
  assert.ok(after[1][0].toString('latin1').includes('evejs-localtime-delivery'));
  after[1][0] = before[1][0];
  assert.deepEqual(after, before);
  const encodedOld = codec.marshalEncode(original).subarray(5);
  const encodedNew = codec.marshalEncode(decoded(service.packet)[1][0]).subarray(5);
  const oldAt = packet.indexOf(encodedOld, 9), newAt = service.packet.indexOf(encodedNew, 9);
  assert.deepEqual(service.packet.subarray(4, newAt), packet.subarray(4, oldAt));
  assert.deepEqual(service.packet.subarray(newAt + encodedNew.length), packet.subarray(oldAt + encodedOld.length));
  service._sendPacket(packet);
  assert.equal(service.packet, packet);
});

test("delivery failures, non-login packets and unauthenticated handshakes preserve original bytes", () => {
  class Service { _sendPacket(packet) { this.packet = packet; } }
  installHandshake(Service, {codec, delivery: {compose() {throw Error('fixture failure');}}});
  const service = new Service(); service.userId = 1;
  for (const packet of [Buffer.from('random'), codec.wrapPacket(codec.marshalEncode([1, 2, 3])), packetFor(original)]) {
    service._sendPacket(packet);
    assert.equal(service.packet, packet);
  }
  class Unauthenticated { _sendPacket(packet) {this.packet = packet;} }
  installHandshake(Unauthenticated, {codec, delivery});
  const preAuth = new Unauthenticated(), packet = packetFor(original);
  preAuth._sendPacket(packet);
  assert.equal(preAuth.packet, packet);
});

test("installed Asteroid Erosion and NPC Buyers compose in either hook order", () => {
  const others = [
    [path.join(root, 'mods/AsteroidErosion-0.2.0'), 'lib/delivery.js', 'asteroid-erosion-delivery'],
    [path.join(root, 'mods/NPC-Market-Buyers-0.1.17'), 'lib/loginDelivery.js', 'npc-market-delivery'],
  ];
  for (const reverse of [false, true]) {
    class Service { _sendPacket(packet) {this.packet = packet;} }
    const hooks = [() => installHandshake(Service, {codec, delivery})];
    for (const [otherRoot, file] of others) {
      const api = require(path.join(otherRoot, file));
      const configFile = path.join(otherRoot, 'config.json');
      const config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf8')) : {};
      hooks.push(() => api.installHandshake(Service, {codec, root, delivery: api.createDelivery(otherRoot, config)}));
    }
    if (reverse) hooks.reverse();
    hooks.forEach(hook => hook());
    const service = new Service(); service.userId = 1;
    const packet = packetFor(original);
    service._sendPacket(packet);
    const value = decoded(service.packet), text = value[1][0].toString('latin1');
    for (const marker of ['evejs-localtime-delivery', ...others.map(item => item[2])]) assert.ok(text.includes(marker), marker);
    assert.equal(codec.dictGet(value[2], 'server-time').toString(), '123456789');
  }
});

test("AutoMining expression and original result are retained in both composition orders", () => {
  const otherRoot = path.join(root, 'mods/AutoMining-1.2.0');
  const auto = require(path.join(otherRoot, 'lib/loginDelivery.js')).createDelivery(otherRoot);
  for (const value of [delivery.compose(auto.compose(original)), auto.compose(delivery.compose(original))]) {
    const text = value.subarray(5).toString('latin1');
    assert.equal(value.readUInt32LE(1), value.length - 5);
    assert.ok(text.includes('automining-delivery'));
    assert.ok(text.includes('evejs-localtime-delivery'));
    assert.ok(text.endsWith('(42))'));
  }
});

test("loader accepts advisory future versions with reviewed source, rejects drift and retains native encryption", () => {
  const fixture = fs.mkdtempSync(path.join(scratch, 'localtime-native-'));
  const target = path.join(fixture, 'server/src/network/tcp/handshake.js');
  const codecFile = path.join(fixture, 'server/src/network/tcp/utils/marshal.js');
  fs.mkdirSync(path.dirname(codecFile), {recursive: true});
  fs.writeFileSync(path.join(fixture, 'server/package.json'), JSON.stringify({version: '991231.99'}));
  fs.writeFileSync(target, source);
  fs.writeFileSync(codecFile, 'module.exports = require(' + JSON.stringify(path.join(root, 'server/src/network/tcp/utils/marshal.js')) + ');');
  const oldCompile = Module.prototype._compile, oldLoad = Module._load;
  const key = Symbol.for('evejs.localtime-zone-patch.v1');
  try {
    const loader = require(path.join(mod, 'loader.js'));
    fs.writeFileSync(target, source + '\n// Changed login source must still be rejected.\n');
    assert.throws(() => loader.install(fixture), /Unsupported login builder/);
    assert.equal(globalThis[key], undefined);
    fs.writeFileSync(target, source);
    Module.prototype._compile = function(content, filename) {
      if (filename === target) {
        // Evaluate the actual shipped handshake class while isolating its
        // account/config dependencies; never load a live database or service.
        this.require = name => {
          if (['path', 'crypto'].includes(name)) return require(name);
          if (/utils[\\/]marshal$/.test(name)) return codec;
          if (/accountRoleProfiles$/.test(name)) return {roleToString: () => '0', DEFAULT_CHAT_ROLE: 0};
          return {};
        };
      }
      return oldCompile.call(this, content, filename);
    };
    const state = loader.install(fixture);
    const Native = require(target);
    assert.equal(state.handshakeAttached, true);
    assert.equal(loader.install(fixture), state);
    const session = Object.create(Native.prototype);
    const writes = [];
    session.userId = 1;
    session.socket = {write: packet => writes.push(packet)};
    session.encrypted = true; session.sessionKey = 'fixture'; session.sessionIV = 'fixture';
    let encryptInput;
    session._encrypt = payload => {encryptInput = payload; return Buffer.concat([Buffer.from([0xaa]), payload]);};
    const originalBuilder = Native._testing.buildTidiSignedFunc(1);
    assert.ok(originalBuilder.toString('latin1').includes('TIDI_HANDLER:OK'));
    session._sendPacket(packetFor(originalBuilder));
    assert.ok(decoded(codec.wrapPacket(encryptInput))[1][0].toString('latin1').includes('evejs-localtime-delivery'));
    assert.equal(writes[0].readUInt32LE(0), writes[0].length - 4);
    assert.equal(writes[0][4], 0xaa);
  } finally {
    if (globalThis[key]) globalThis[key].active = false;
    delete globalThis[key];
    Module._load = oldLoad;
    Module.prototype._compile = oldCompile;
  }
});

test("261028.1 native authentication retains UTC, IDs, encryption and all four companions plus shared menu", () => {
  const autoRoot = path.join(root, 'mods/AutoMining-1.2.0');
  const auto = require(path.join(autoRoot, 'lib/loginDelivery.js'));
  const asteroidRoot = path.join(root, 'mods/AsteroidErosion-0.2.0');
  const asteroid = require(path.join(asteroidRoot, 'lib/delivery.js'));
  const buyersRoot = path.join(root, 'mods/NPC-Market-Buyers-0.1.17');
  const buyers = require(path.join(buyersRoot, 'lib/loginDelivery.js'));
  const asteroidConfig = JSON.parse(fs.readFileSync(path.join(asteroidRoot, 'config.json'), 'utf8'));
  const menuBase = path.join(root, '.evejs-launcher/shared-menu');
  const menuFiles = fs.readdirSync(menuBase).map(name => path.join(menuBase, name, 'loader.cjs')).filter(fs.existsSync);
  assert.equal(menuFiles.length, 1, 'Use the exact current Launcher menu plan');
  const originalCompile = Module.prototype._compile;
  const autoStateKey = Symbol.for('evejs.automining.loader.v1');
  const savedAuto = globalThis[autoStateKey];
  const account = {id: 42, passwordhash: 'ff', role: 0, chatRole: 0, banned: false};
  const logger = new Proxy({}, {get: (_, name) => name === 'isVerboseDebugEnabled' ? () => false : () => {}});
  let attemptedWrites = 0;
  try {
    assert.equal(auto.supportsSource(source), true);
    for (const reverse of [false, true]) {
      globalThis[autoStateKey] = {delivery: auto.createDelivery(autoRoot, {token: 'isolated-composition-test'})};
      const native = new Module(path.join(__dirname, 'isolated-native-handshake.js'), module);
      native.filename = path.join(root, 'server/src/network/tcp/handshake.js');
      native.require = name => {
        if (['path', 'crypto'].includes(name)) return require(name);
        if (/utils[\\/]marshal$/.test(name)) return codec;
        if (/utils[\\/]logger$/.test(name)) return logger;
        if (/accountStore$/.test(name)) return {
          readAccountsTable: () => ({fixture: account}),
          writeAccountRecord: () => {attemptedWrites++; throw Error('Production/account writes forbidden');},
          flushAccounts: () => {attemptedWrites++; throw Error('Production/account writes forbidden');},
        };
        if (/accountRoleProfiles$/.test(name)) return {
          DEFAULT_CHAT_ROLE: 0, roleToString: () => '0', buildPersistedAccountRoleRecord: value => value,
        };
        if (/globalConfig$/.test(name)) return {
          normalizeCountryCode: () => 'NL', getRuntimeConfig: () => ({}),
          buildClientBootMetadataEntries: () => [['boot_build', 3396210]],
          buildServerStatusDict: () => ({entries: [['cluster_usercount', 2]]}),
          buildGlobalConfigDict: () => ({type: 'dict', entries: [['clock-fixture', 123n]]}),
        };
        if (/protocolProfile$/.test(name)) return {
          PROXY_NODE_ID: 1000003120, SEED_SKILL_EXTRACTOR_ACCESS_TOKEN: true,
          CLIENT_COMPATIBILITY_PROFILE: {machoVersion: 496},
        };
        if (/[\\/]config$/.test(name)) return {devSkipPasswordValidation: true};
        return {};
      };
      delete require.cache[require.resolve(menuFiles[0])];
      require(menuFiles[0]); // Only installs an in-memory compiler wrapper; no services or databases.
      native._compile(auto.extendSource(source), native.filename);
      Module.prototype._compile = originalCompile;
      const Native = native.exports, originalSend = Native.prototype._sendPacket;
      const hooks = [
        () => installHandshake(Native, {codec, delivery}),
        () => asteroid.installHandshake(Native, {codec, delivery: asteroid.createDelivery(asteroidRoot, asteroidConfig)}),
        () => buyers.installHandshake(Native, {codec, delivery: buyers.createDelivery(buyersRoot)}),
      ];
      if (reverse) hooks.reverse();
      hooks.forEach(hook => hook());
      const sessions = [], login = [null, {type: 'dict', entries: [
        ['user_name', 'fixture'], ['user_password_hash', 'ff'], ['user_languageid', 'EN'],
      ]}];
      for (let index = 0; index < 2; index++) {
        const writes = [], session = new Native({write: packet => writes.push(packet), end() {}, remoteAddress: 'fixture'});
        session._handleAuthentication(login);
        assert.equal(writes.length, 2);
        const value = decoded(writes[1]), expression = value[1][0].subarray(5).toString('latin1');
        for (const marker of ['TIDI_HANDLER:OK', 'PORTRAIT_UPLOAD_HANDLER:OK',
          'SKILL_EXTRACTOR_ACCESS_TOKEN:OK', 'automining-delivery', 'evejs-localtime-delivery',
          'asteroid-erosion-delivery', 'npc-market-delivery', 'evejs-shared-mod-menu']) {
          assert.ok(expression.includes(marker), marker);
        }
        assert.equal(value[1][0].readUInt32LE(1), value[1][0].length - 5);
        assert.equal(session.clientId % 10000000000, 1000003120);
        const plain = [], originalSocket = session.socket;
        session.socket = {write: packet => plain.push(packet)};
        const nativeAck = codec.encodePacket({type: 'dict', entries: [['sessionID', 123n], ['user_clientid', BigInt(session.clientId)]]});
        originalSend.call(session, nativeAck);
        session._sendPacket(nativeAck);
        assert.deepEqual(plain[1], plain[0], 'ack bytes unchanged');
        const close = codec.encodePacket(Native.buildGPSTransportClosedPayload('LoginAuthFailed', {retry: false}));
        originalSend.call(session, close);
        session._sendPacket(close);
        assert.deepEqual(plain[3], plain[2], 'new native objectex1 close bytes unchanged');
        // Use the native encryption implementation, then decrypt the resulting
        // packet locally. No transport, database or game process is started.
        session.socket = originalSocket;
        session.encrypted = true; session.sessionKey = Buffer.alloc(32, 0x31); session.sessionIV = Buffer.alloc(16, 0x42);
        const iv = Buffer.from(session.sessionIV);
        session._sendPacket(nativeAck);
        const encrypted = writes.at(-1);
        const decipher = crypto.createDecipheriv('aes-256-cbc', session.sessionKey, iv);
        assert.deepEqual(Buffer.concat([decipher.update(encrypted.subarray(4)), decipher.final()]), nativeAck.subarray(4));
        sessions.push(session);
      }
      assert.notEqual(sessions[0].clientId, sessions[1].clientId, 'same account keeps separate native connection IDs');
    }
    assert.equal(attemptedWrites, 0);
  } finally {
    Module.prototype._compile = originalCompile;
    if (savedAuto === undefined) delete globalThis[autoStateKey];
    else globalThis[autoStateKey] = savedAuto;
  }
});
