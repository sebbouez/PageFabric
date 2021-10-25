using System;
using System.Runtime.InteropServices;

namespace WpfApp1
{
    internal static class NativeMethods
    {
        [DllImport("dwmapi.dll")]
        internal static extern int DwmSetWindowAttribute(IntPtr hwnd, DwmWindowAttribute dwAttribute, ref int pvAttribute, int cbAttribute);

        [Flags]
        internal enum DwmWindowAttribute : uint
        {
            DWMWA_USE_IMMERSIVE_DARK_MODE = 20,
            DWMWA_MICA_EFFECT = 1029
        }
    }
}