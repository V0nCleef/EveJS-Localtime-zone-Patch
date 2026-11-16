# EveJS 261115.2 Native candidate

0.1.4 admits the exact release handshake, normalized only from CRLF to LF:
`7aaa72247049b38d3f656f3b2c602877a8bcf0d9ff0af68f1795ff1327565ba7`.

The sole functional handshake change from 261108.1 appends the conditional staff
server-health UI. Localtime preserves the entire expression and result, numeric
zero Placebo signature, native authentication/SSO, frame limits, AES encryption
and IV behavior. No new time API or client hook is necessary.

Exact source plus GridCheck 0.3.6's opt-in client-agent v1 hooks is reviewed,
including byte-exact reversion, and admitted separately:
`9547dda904196127bac88f72713731ac995d1ddb49e10c89f7d9a00bd34fe46e`.
Arbitrary instrumentation or other source drift is still refused.

Focused controls are described in VERIFICATION.md. Actual 261115.2 GridCheck and
combined-stack retail-client qualification remain pending. The manifest is a
local candidate declaration and does not assert these runtime gates passed.
Native is the only declared backend. Docker and other clients are unqualified.
