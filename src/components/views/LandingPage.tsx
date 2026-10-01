import React from 'react';
import {
  HardDrive,
  Shield,
  Lock,
  Sparkles,
  Share2,
  Activity,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  FileText,
  Key,
  Database,
  Eye,
} from 'lucide-react';

interface LandingPageProps {
  onGoToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin }) => {
  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex flex-col selection:bg-blue-600/30 selection:text-blue-200">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-[#09090B]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center p-0.5 shadow-md">
              <HardDrive className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">AetherDrive</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Security
            </a>
            <a href="#lifecycle" className="hover:text-white transition-colors">
              Lifecycle
            </a>
            <a href="#enterprise" className="hover:text-white transition-colors">
              Enterprise
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoToLogin}
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Log In
            </button>
            <button
              onClick={onGoToLogin}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-medium">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Zero-Knowledge Multi-Admin Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Secure Your Files. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-blue-200">
              Control Your Data.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Enterprise-grade cloud storage with intelligent organization, cryptographic checksum integrity, and strict dual-administrator access controls.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onGoToLogin}
              className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-500 rounded-lg text-xs font-bold transition-all shadow-xl shadow-blue-900/30 flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-semibold transition-all"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Hero Interactive UI Mockup */}
        <div className="max-w-5xl mx-auto mt-14 relative">
          <div className="rounded-2xl bg-[#0C0C0E] border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4">
            {/* Top mockup bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-slate-400 ml-2 font-mono">vault.aetherdrive.internal</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400 bg-green-950/40 border border-green-500/30 px-2.5 py-1 rounded-full font-mono">
                <Lock className="w-3 h-3" />
                <span>E2EE Active</span>
              </div>
            </div>

            {/* Mockup content rows */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-xs text-slate-400 mb-1 font-medium">Cloud Vault Allocation</div>
                <div className="text-xl font-bold text-white">100 GB Available</div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-blue-600 w-[24%]" />
                </div>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-xs text-slate-400 mb-1 font-medium">Security Score</div>
                <div className="text-xl font-bold text-green-500">92 / 100</div>
                <div className="text-[11px] text-slate-400 mt-1">Multi-Admin Verified</div>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-xs text-slate-400 mb-1 font-medium">Integrity Monitoring</div>
                <div className="text-xl font-bold text-blue-400">SHA-256 Validated</div>
                <div className="text-[11px] text-slate-400 mt-1">Zero bit-rot detected</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 border-t border-slate-800 bg-[#09090B]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Engineered for Performance and Security
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Discover the suite of tools designed to keep your enterprise moving fast without compromising on control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 bg-[#0C0C0E] border border-slate-800 hover:border-blue-500/40 rounded-2xl transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">End-to-End Protection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero-knowledge encryption ensures that only authorized administrators can access sensitive data, safeguarding it from external interception.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-[#0C0C0E] border border-slate-800 hover:border-blue-500/40 rounded-2xl transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Secure Cloud Storage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Highly scalable, redundant storage infrastructure built for enterprise-grade uptime and real-time synchronization.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-[#0C0C0E] border border-slate-800 hover:border-blue-500/40 rounded-2xl transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Smart File Organization</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Intelligent tagging and categorization analyze metadata to keep root directories impeccably organized.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 bg-[#0C0C0E] border border-slate-800 hover:border-blue-500/40 rounded-2xl transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Controlled File Sharing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Granular permissions, time-based expiration windows, and instant revocation ensure temporary shares remain under your control.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 bg-[#0C0C0E] border border-slate-800 hover:border-blue-500/40 rounded-2xl transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Activity Monitoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comprehensive audit logs track every login, file upload, rename, move, and administrative switch for complete visibility.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-6 bg-[#0C0C0E] border border-slate-800 hover:border-blue-500/40 rounded-2xl transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Storage Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visual breakdowns across PDFs, media, spreadsheets, archives, and code files with real-time volume calculations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Secure Data Lifecycle */}
      <section id="lifecycle" className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">The Secure Data Lifecycle</h2>
            <p className="text-xs text-slate-400">
              A seamless, automated workflow designed to protect your assets at every stage of their journey.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <FileText className="w-6 h-6 text-blue-400 mx-auto" />
              <div className="text-xs font-semibold text-white">Upload</div>
              <div className="text-[10px] text-slate-400">Direct drag & drop file input</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <Key className="w-6 h-6 text-cyan-400 mx-auto" />
              <div className="text-xs font-semibold text-white">Encrypt</div>
              <div className="text-[10px] text-slate-400">SHA-256 cryptographic hashing</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <Database className="w-6 h-6 text-purple-400 mx-auto" />
              <div className="text-xs font-semibold text-white">Store</div>
              <div className="text-[10px] text-slate-400">Redundant cloud replication</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <Lock className="w-6 h-6 text-green-500 mx-auto" />
              <div className="text-xs font-semibold text-white">Control Access</div>
              <div className="text-[10px] text-slate-400">Strict dual-admin rules</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <Share2 className="w-6 h-6 text-amber-400 mx-auto" />
              <div className="text-xs font-semibold text-white">Share</div>
              <div className="text-[10px] text-slate-400">Expiring revocable tokens</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <Activity className="w-6 h-6 text-rose-400 mx-auto" />
              <div className="text-xs font-semibold text-white">Monitor</div>
              <div className="text-[10px] text-slate-400">Full audit log traceability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#09090B] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-300">AetherDrive</span>
            <span>— Enterprise Infrastructure</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
