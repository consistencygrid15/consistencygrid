import Link from 'next/link';
import { Download, Smartphone, Monitor, Shield, CheckCircle, Settings, ChevronRight, Star, Zap, Bell } from 'lucide-react';

export const metadata = {
  title: 'Download ConsistencyGrid – Android & Windows',
  description: 'Download the ConsistencyGrid app for Android or Windows. Track habits, auto-update your wallpaper, and build streaks on every device.',
};

const androidSteps = [
  {
    number: '01',
    icon: Download,
    title: 'Download the APK',
    description: 'Tap the "Download APK" button below. Your browser will download the ConsistencyGrid.apk file.',
  },
  {
    number: '02',
    icon: Settings,
    title: 'Allow Unknown Sources',
    description: 'Go to Settings → Security → Enable "Install Unknown Apps" for your browser.',
    tip: 'On Android 8+, you\'ll be prompted automatically when you open the APK.',
  },
  {
    number: '03',
    icon: Smartphone,
    title: 'Open the APK & Install',
    description: 'Open your Downloads folder, tap the .apk file, and tap "Install".',
  },
];

const windowsSteps = [
  {
    number: '01',
    icon: Download,
    title: 'Download the App Archive',
    description: 'Click the "Download .zip" button below to get the ConsistencyGrid Windows app archive.',
  },
  {
    number: '02',
    icon: Shield,
    title: 'Extract & Run',
    description: 'Right-click the downloaded .zip and select "Extract All". Then open the folder and double-click ConsistencyGrid.exe. If Windows SmartScreen appears, click "More Info" → "Run anyway".',
  },
  {
    number: '03',
    icon: Monitor,
    title: 'Launch & Log In',
    description: 'Log in with your account — your wallpaper will start auto-updating immediately! You can right-click the app to pin it to your taskbar.',
  },
];

const features = [
  { icon: Zap, text: 'Wallpaper auto-updates when you mark habits' },
  { icon: Bell, text: 'Runs silently in the system tray' },
  { icon: Star, text: 'Full ConsistencyGrid website in a native window' },
  { icon: CheckCircle, text: 'No setup needed — just install and log in' },
];

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-black tracking-tight text-white hover:text-orange-400 transition-colors">
          ConsistencyGrid
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
          Dashboard <ChevronRight size={14} />
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-orange-500/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <Shield size={12} />
            OFFICIAL DOWNLOAD — ANDROID &amp; WINDOWS
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            Get ConsistencyGrid
            <span className="block text-orange-500">on Every Device</span>
          </h1>

          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
            Your habits. Your wallpaper. Always in sync — whether you're on Android or Windows.
          </p>

          {/* Platform Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">

            {/* Android Card */}
            <div className="bg-white/5 border border-white/10 hover:border-orange-500/40 rounded-3xl p-8 transition-colors group">
              <div className="w-14 h-14 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center mb-5">
                <Smartphone size={26} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-black mb-2">Android App</h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Direct APK download. Live wallpaper that updates with your streaks. Works on Android 8.0+.
              </p>
              <a
                href="/api/download/app"
                id="download-apk-btn"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 group-hover:shadow-lg group-hover:shadow-green-900/30"
              >
                <Download size={18} />
                Download APK — Free
              </a>
              <p className="text-gray-600 text-xs mt-3">Android 8.0+ · ~20 MB · Version 1.0</p>
            </div>

            {/* Windows Card */}
            <div className="bg-white/5 border border-white/10 hover:border-orange-500/40 rounded-3xl p-8 transition-colors group">
              <div className="w-14 h-14 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-5">
                <Monitor size={26} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-black mb-2">Windows App</h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Desktop app that auto-updates your wallpaper every time you mark a habit. Runs in the system tray.
              </p>
              <a
                href="/ConsistencyGrid-Windows.zip"
                download="ConsistencyGrid-Windows.zip"
                id="download-windows-btn"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 group-hover:shadow-lg group-hover:shadow-blue-900/30"
              >
                <Download size={18} />
                Download .zip
              </a>
              <p className="text-gray-600 text-xs mt-3">Windows 10/11 · ~70 MB · Version 1.0.0</p>
            </div>

          </div>
        </div>
      </section>

      {/* Windows Features */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-black text-center mb-5 text-gray-300">What the Windows App does</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-16">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-4">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={16} className="text-orange-400" />
              </div>
              <span className="text-sm text-gray-300">{text}</span>
            </div>
          ))}
        </div>

        {/* Install Steps — Windows */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-center mb-3">How to Install — Windows</h2>
          <div className="space-y-4">
            {windowsSteps.map(({ number, icon: Icon, title, description, tip }) => (
              <div key={number} className="relative flex gap-5 bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-colors">
                <div className="text-4xl font-black text-white/10 absolute top-4 right-6 select-none">{number}</div>
                <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white mb-1">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
                  {tip && (
                    <p className="mt-2 text-xs text-orange-400/80 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 inline-block">
                      💡 {tip}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Install Steps — Android */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-center mb-3">How to Install — Android</h2>
          <div className="space-y-4">
            {androidSteps.map(({ number, icon: Icon, title, description, tip }) => (
              <div key={number} className="relative flex gap-5 bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-green-500/30 transition-colors">
                <div className="text-4xl font-black text-white/10 absolute top-4 right-6 select-none">{number}</div>
                <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white mb-1">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
                  {tip && (
                    <p className="mt-2 text-xs text-orange-400/80 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 inline-block">
                      💡 {tip}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety note */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center shrink-0">
              <Shield size={18} className="text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Are these safe?</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Yes. Both apps are the official ConsistencyGrid app, built from the same codebase as the web version.
                The Android APK is not on the Play Store yet (early access). The Windows app may trigger SmartScreen — just click "More Info → Run anyway". Your account and data are fully protected.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <Link href="/dashboard" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
              Go to Dashboard →
            </Link>
          </p>
          <p className="text-gray-600 text-sm mt-2">
            New here?{' '}
            <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
              Create a free account →
            </Link>
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-gray-600 text-xs">
        <p>© {new Date().getFullYear()} ConsistencyGrid. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
          <Link href="/help" className="hover:text-gray-400 transition-colors">Help</Link>
        </div>
      </footer>
    </main>
  );
}



