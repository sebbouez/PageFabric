using System;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Interop;
using static WpfApp1.NativeMethods;

namespace WpfApp1
{
    public class MicaWindow : Window
    {
        public MicaWindow()
        {
            SourceInitialized += MicaWindow_SourceInitialized;
        }

        private void MicaWindow_SourceInitialized(object? sender, EventArgs e)
        {
            HwndSource windowHandleSource = HwndSource.FromHwnd(new WindowInteropHelper(this).Handle);
            if (windowHandleSource == null)
            {
                return;
            }

            ApplyMica(windowHandleSource, false);
        }

        private static void ApplyMica(HwndSource source, bool dark)
        {
            int attrValue = 1;

            if (dark)
            {
                _ = DwmSetWindowAttribute(source.Handle, DwmWindowAttribute.DWMWA_USE_IMMERSIVE_DARK_MODE, ref attrValue, Marshal.SizeOf(typeof(int)));
            }
            else
            {
                _ = DwmSetWindowAttribute(source.Handle, DwmWindowAttribute.DWMWA_MICA_EFFECT, ref attrValue, Marshal.SizeOf(typeof(int)));
            }
        }
    }
}