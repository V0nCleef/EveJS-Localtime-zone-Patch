# Python 2.7 compatible. Read the player's computer, never the server timezone.
import calendar as _lt_calendar
import time as _lt_time


class _LocalTimeReader(object):
    def __init__(self):
        self.native = None
        try:
            import ctypes

            class SystemTime(ctypes.Structure):
                _fields_ = [(name, ctypes.c_ushort) for name in (
                    'year', 'month', 'day_of_week', 'day', 'hour',
                    'minute', 'second', 'millisecond')]

            library = ctypes.WinDLL('kernel32', use_last_error=True)
            get_utc = library.GetSystemTime
            get_utc.argtypes = [ctypes.POINTER(SystemTime)]
            get_utc.restype = None
            convert = library.SystemTimeToTzSpecificLocalTime
            convert.argtypes = [ctypes.c_void_p, ctypes.POINTER(SystemTime), ctypes.POINTER(SystemTime)]
            convert.restype = ctypes.c_int

            def read_native():
                utc, local = SystemTime(), SystemTime()
                get_utc(ctypes.byref(utc))
                # NULL means the user's currently active Windows timezone.
                # Windows applies DST to this instant on every refresh.
                if not convert(None, ctypes.byref(utc), ctypes.byref(local)):
                    raise RuntimeError('Windows local time conversion failed')

                def parts(value):
                    return (value.year, value.month, value.day, value.hour,
                            value.minute, value.second, (value.day_of_week + 6) % 7, 0, -1)

                return parts(local), parts(utc)

            self.native = read_native
        except (ImportError, AttributeError, OSError):
            pass

    def read(self):
        if self.native is not None:
            try:
                return self.native()
            except Exception:
                pass
        # Also works when Windows native access is unavailable. Never cache
        # time.timezone/altzone: the offset depends on the current date.
        stamp = _lt_time.time()
        return _lt_time.localtime(stamp), _lt_time.gmtime(stamp)


def _lt_clock_text(local):
    return '<b>%02d:%02d</b>' % (local[3], local[4])


def _lt_tooltip_text(local, utc):
    offset = int((_lt_calendar.timegm(local) - _lt_calendar.timegm(utc)) // 60)
    sign = '+' if offset >= 0 else '-'
    hours, minutes = divmod(abs(offset), 60)
    return '%04d-%02d-%02d %02d:%02d (UTC%s%02d:%02d)' % (
        local[0], local[1], local[2], local[3], local[4], sign, hours, minutes)
