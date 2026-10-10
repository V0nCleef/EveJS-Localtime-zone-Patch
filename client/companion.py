# The only patched UI is the Neocom clock and its date tooltip.
import __builtin__ as _lt_builtins
import blue as _lt_blue
import uthread as _lt_uthread
import weakref as _lt_weakref

_LT_KEY = '_evejs_localtime_zone_patch_v1'


class _LocalClockPatch(object):
    __notifyevents__ = ['OnDisconnect', 'OnConnectionClosed']

    def __init__(self):
        self.active = True
        self.sm = None
        self.hooks = []
        self.registered = []
        self.clocks = _lt_weakref.WeakSet()
        self.reader = _LocalTimeReader()
        self.diagnostic_count = 0

    def current(self):
        return self.active and getattr(_lt_builtins, _LT_KEY, None) is self

    def diagnostic(self, text):
        print('EVEJS_LOCALTIME:' + text)
        if self.diagnostic_count >= 8:
            return
        self.diagnostic_count += 1
        try:
            path = _lt_blue.paths.ResolvePath(u'cache:/evejs-localtime-zone-patch.log')
            with open(path, 'a') as output:
                output.write(_lt_time.strftime('%Y-%m-%dT%H:%M:%SZ ', _lt_time.gmtime())
                             + 'EVEJS_LOCALTIME:' + str(text)[:160] + '\n')
        except Exception:
            pass

    def patch(self, owner, name, wrapper):
        original = getattr(owner, name)
        replacement = wrapper(original)
        setattr(owner, name, replacement)
        self.hooks.append((owner, name, original, replacement))

    def install(self, Clock, Button, ui):
        # Reject an unknown widget contract instead of touching global clocks.
        for owner, name, expected_names in (
                (Clock, '_update_clock', ('clock_label', 'destroyed', 'GetTimeParts', 'SleepWallclock')),
                (Button, 'LoadTooltipPanel', ('LoadGeneric3ColumnTemplate', 'AddCommandTooltip', 'AddLabelMedium'))):
            method = getattr(owner, name, None)
            function = getattr(method, 'im_func', getattr(method, '__func__', method))
            code = getattr(function, 'func_code', getattr(function, '__code__', None))
            if code is None or not all(value in code.co_names for value in expected_names):
                raise RuntimeError('Unsupported client clock widget')
        manager = self

        def update_hook(original):
            def update(clock):
                if not manager.current() or not isinstance(getattr(clock, 'parent', None), Button):
                    return original(clock)
                manager.clocks.add(clock)
                while manager.current() and not clock.destroyed:
                    try:
                        local, utc = manager.reader.read()
                        clock.clock_label.text = _lt_clock_text(local)
                    except Exception:
                        manager.diagnostic('READ_FAILED_USING_ORIGINAL')
                        return original(clock)
                    _lt_blue.synchro.SleepWallclock(5000)
                return None
            return update

        def tooltip_hook(original):
            def tooltip(button, panel, *args):
                if not manager.current():
                    return original(button, panel, *args)
                try:
                    local, utc = manager.reader.read()
                    text = _lt_tooltip_text(local, utc)
                except Exception:
                    return original(button, panel, *args)
                panel.LoadGeneric3ColumnTemplate()
                command = ui.cmd.commandMap.GetCommandByName(button.cmdName)
                panel.AddCommandTooltip(command)
                panel.AddLabelMedium(text=text, colSpan=panel.columns)
                return None
            return tooltip

        self.patch(Clock, '_update_clock', update_hook)
        self.patch(Button, 'LoadTooltipPanel', tooltip_hook)
        # Login normally precedes clock construction. Refresh an existing
        # Neocom too, for a repeated bootstrap or a reconnect that retains UI.
        try:
            service = self.sm.GetService('neocom')
            pending = [getattr(service, 'neocom', None)]
            seen = set()
            while pending and len(seen) < 256:
                widget = pending.pop()
                if widget is None or id(widget) in seen:
                    continue
                seen.add(id(widget))
                if isinstance(widget, Clock) and isinstance(getattr(widget, 'parent', None), Button):
                    self.clocks.add(widget)
                    widget.update_clock()
                pending.extend(list(getattr(widget, 'children', ())))
        except Exception:
            pass
        self.diagnostic('READY:0.1.0')

    def start(self):
        try:
            for attempt in range(240):
                if not self.current():
                    return
                context = globals().get('_lt_context') or {}
                self.sm = context.get('sm') or getattr(_lt_builtins, 'sm', None)
                if self.sm is not None:
                    break
                _lt_blue.pyos.synchro.SleepWallclock(500)
            else:
                raise RuntimeError('Client services unavailable')
            from gametime.ingameclock import InGameClock
            from eve.client.script.ui.shared.neocom.neocom.buttons.clockButton import ClockButton
            from carbonui.uicore import uicore
            self.install(InGameClock, ClockButton, uicore)
            for event in self.__notifyevents__:
                self.sm.RegisterForNotifyEvent(self, event)
                self.registered.append(event)
        except Exception as error:
            self.close()
            self.diagnostic('INACTIVE:' + type(error).__name__)

    def OnDisconnect(self, *args):
        self.close()

    def OnConnectionClosed(self, *args):
        self.close()

    def close(self):
        self.active = False
        for owner, name, original, replacement in reversed(self.hooks):
            current = getattr(owner, name, None)
            function = getattr(current, 'im_func', getattr(current, '__func__', current))
            if function is replacement:
                setattr(owner, name, original)
        self.hooks = []
        for clock in list(self.clocks):
            try:
                if not clock.destroyed:
                    clock.update_clock()
            except Exception:
                pass
        self.clocks.clear()
        for event in self.registered:
            try:
                self.sm.UnregisterForNotifyEvent(self, event)
            except Exception:
                pass
        self.registered = []


_lt_previous = getattr(_lt_builtins, _LT_KEY, None)
if _lt_previous is not None:
    _lt_previous.close()
_lt_manager = _LocalClockPatch()
setattr(_lt_builtins, _LT_KEY, _lt_manager)
_lt_uthread.new(_lt_manager.start)
