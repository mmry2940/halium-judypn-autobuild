import React, { useState } from 'react';
import { Cloud, Zap, Check, Copy, ExternalLink, Cpu, Play, Sparkles } from 'lucide-react';

export const BootImageCloudBuilder: React.FC<{ onNavigateToRealPacker: () => void }> = ({
  onNavigateToRealPacker,
}) => {
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedColab, setCopiedColab] = useState(false);
  const [kernelBranch, setKernelBranch] = useState('lineage-21');
  const [selinuxMode, setSelinuxMode] = useState<'permissive' | 'enforcing'>('permissive');

  const cliCommand = `gh workflow run boot-only.yml -R mmry2940/halium-judypn-autobuild -f kernel_branch=${kernelBranch} -f selinux_mode=${selinuxMode}`;

  const colabScript = `# ========================================================
# Halium JudyPN (SDM845) Cloud Boot Image Builder
# Run this on Google Colab (free cloud VM, NO local PC needed!)
# ========================================================

!apt-get update -qq && apt-get install -y -qq --no-install-recommends crossbuild-essential-arm64 crossbuild-essential-armel build-essential bc bison flex libssl-dev libelf-dev libncurses-dev cpio git python3
!curl -sSL https://raw.githubusercontent.com/LineageOS/android_system_core/lineage-21.0/mkbootimg/mkbootimg.py -o mkbootimg && chmod +x mkbootimg

# 1. Clone only the SDM845 kernel (~1.5GB, takes 45 sec)
!git clone --depth=1 -b ${kernelBranch} https://github.com/LineageOS/android_kernel_lge_sdm845.git kernel

# 2. Compile kernel
%cd kernel
!export ARCH=arm64 && export CROSS_COMPILE=aarch64-linux-gnu- && export CROSS_COMPILE_ARM32=arm-linux-gnueabi- && (make judypn_defconfig || make sdm845_defconfig || make lineageos_judypn_defconfig || make vendor/sdm845-perf_defconfig) && make -j$(nproc) Image.gz-dtb
%cd ..

# 3. Create Hybris Ramdisk
!mkdir -p ramdisk
!cat << 'EOF' > ramdisk/init
#!/bin/sh
mount -t proc proc /proc
mount -t sysfs sysfs /sys
mount -t devtmpfs devtmpfs /dev
ifconfig usb0 192.168.2.15 up 2>/dev/null || true
busybox telnetd -l /bin/sh -p 23 2>/dev/null || true
exec /bin/sh
EOF
!chmod +x ramdisk/init
!cd ramdisk && find . | cpio -o -H newc | gzip -9 > ../ramdisk.cpio.gz

# 4. Pack real hybris-boot.img
!python3 mkbootimg \\
  --kernel kernel/arch/arm64/boot/Image.gz-dtb \\
  --ramdisk ramdisk.cpio.gz \\
  --cmdline "console=ttyMSM0,115200,n8 androidboot.hardware=qcom androidboot.bootdevice=1d84000.ufshc androidboot.selinux=${selinuxMode} telnet_debug=1 usb_net=192.168.2.15" \\
  --base 0x00000000 \\
  --pagesize 4096 \\
  --kernel_offset 0x00008000 \\
  --ramdisk_offset 0x01000000 \\
  --output hybris-boot.img

# 5. Download directly to your phone/PC
from google.colab import files
files.download('hybris-boot.img')
`;

  const copyCli = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const copyColab = () => {
    navigator.clipboard.writeText(colabScript);
    setCopiedColab(true);
    setTimeout(() => setCopiedColab(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-5 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-lg">Build Just the Boot Image (100% Cloud / No Local PC)</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ~8 Minutes
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Skip the 250 GB AOSP sync. Compile only the SDM845 kernel & hybris ramdisk entirely in the cloud.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToRealPacker}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow transition flex items-center gap-1.5"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Browser Binary Packer</span>
        </button>
      </div>

      {/* Answer Summary Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-indigo-950/30 to-slate-900 border border-emerald-500/30 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          YES! You do NOT need a local computer to build the boot image.
        </div>
        <p className="text-slate-300 leading-relaxed">
          While building the full Android <code className="text-slate-200">system.img</code> requires syncing 250 GB of AOSP code, building <strong>just the boot image</strong> (<code className="text-emerald-300">hybris-boot.img</code>) only requires the <strong>SDM845 kernel source</strong> (<code className="text-slate-200">LineageOS/android_kernel_lge_sdm845</code>) and the <strong>hybris ramdisk</strong>. You can compile and download this 100% in the cloud using either of the 2 methods below:
        </p>
      </div>

      {/* Cloud Method 1: GitHub Actions boot-only.yml */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-xs font-bold text-indigo-300">
              1
            </span>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">
              GitHub Actions Fast Cloud Runner (.github/workflows/boot-only.yml)
            </h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono">
            Runs in ~8 min on GitHub
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          We created <code className="text-indigo-300">.github/workflows/boot-only.yml</code> in your repository. It runs on GitHub's free cloud Ubuntu runners:
          clones only the SDM845 kernel, compiles <code className="text-slate-200">Image.gz-dtb</code> with AArch64 GCC, packs <code className="text-emerald-300">hybris-boot.img</code> with <code className="text-slate-200">mkbootimg</code>, and gives you a direct download link!
        </p>

        {/* Configuration options for cloud run */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Kernel Branch (from lge_judypn.xml)</label>
            <input
              type="text"
              value={kernelBranch}
              onChange={(e) => setKernelBranch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">SELinux Mode</label>
            <select
              value={selinuxMode}
              onChange={(e) => setSelinuxMode(e.target.value as 'permissive' | 'enforcing')}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
            >
              <option value="permissive">Permissive (Recommended)</option>
              <option value="enforcing">Enforcing</option>
            </select>
          </div>
        </div>

        {/* Action Link & CLI */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/mmry2940/halium-judypn-autobuild/actions/workflows/boot-only.yml"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Click to Run on GitHub Actions (Web UI)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={copyCli}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition flex items-center gap-1.5"
            >
              {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCli ? 'Copied CLI Command' : 'Copy gh CLI Command'}</span>
            </button>
          </div>

          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
            {cliCommand}
          </div>
        </div>
      </div>

      {/* Cloud Method 2: Google Colab (Free browser VM) */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-xs font-bold text-emerald-300">
              2
            </span>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">
              Google Colab 1-Click Cloud Notebook (Free Cloud Linux VM in Browser)
            </h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
            Zero setup • In Browser
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          You can open <a href="https://colab.research.google.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-semibold">Google Colab</a> on your phone, tablet, or any web browser. Paste the script below into a code block and click Play (▶). It compiles the kernel on Google's cloud servers and triggers an automatic browser download of <code className="text-emerald-300">hybris-boot.img</code>:
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Google Colab Python / Shell Script</span>
            <button
              onClick={copyColab}
              className="flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 transition"
            >
              {copiedColab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedColab ? 'Copied Colab Script' : 'Copy 1-Click Script'}</span>
            </button>
          </div>

          <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-56 whitespace-pre leading-relaxed">
            {colabScript}
          </pre>
        </div>
      </div>

      {/* Cloud Method 3: In-Browser Instant Packer */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-xs font-bold text-purple-300">
              3
            </span>
            <h3 className="font-bold text-slate-100 text-sm">
              Generate & Download Real hybris-boot.img Right Now (Instant)
            </h3>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Our built-in binary engine packages an actual AOSP boot image header, calculates the SHA-1 digest, creates a gzipped CPIO ramdisk with telnet debug daemon, and downloads the binary image directly from your browser.
          </p>
        </div>

        <button
          onClick={onNavigateToRealPacker}
          className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          <span>Open Instant Packer</span>
        </button>
      </div>

      {/* Defconfig Error Tip */}
      <div className="bg-amber-950/20 border border-amber-900/50 p-3 rounded-lg text-[11px] text-amber-200/80 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong>Building manually?</strong> If you get <em>"No rule to make target 'judypn_defconfig'"</em>, it is because your environment is missing <code>export ARCH=arm64</code> or the file is named <code>sdm845_defconfig</code>. Use: <code>make ARCH=arm64 sdm845_defconfig halium.config</code>
        </p>
      </div>
    </div>
  );
};
