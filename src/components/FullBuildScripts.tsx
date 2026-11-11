import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, FileCode, CheckCircle2 } from 'lucide-react';
import { DEVICE_SPECS } from '../data/manifestData';

export const FullBuildScripts: React.FC = () => {
  const [activeScript, setActiveScript] = useState<'full' | 'build-hal' | 'setup' | 'env' | 'flash'>('full');
  const [androidRoot, setAndroidRoot] = useState('$HOME/halium');
  const [deviceCodename] = useState('judypn');
  const [haliumBranch, setHaliumBranch] = useState('halium-14.0');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fullScriptContent = `#!/bin/bash
# ==============================================================================
# Full Halium Autobuild Script for LG JudyPN (LG V40 ThinQ - SDM845)
# Builds: hybris-boot.img (Full Halium Boot) & system.img (HAL Partition)
# ==============================================================================
set -eo pipefail

export ANDROID_ROOT="${androidRoot}"
export DEVICE="${deviceCodename}"
export HALIUM_BRANCH="${haliumBranch}"
export JOBS="\${JOBS:-\$(nproc)}"
export USE_CCACHE=1
export CCACHE_EXEC=/usr/bin/ccache
export CCACHE_DIR="$HOME/.ccache"
export PATH="$HOME/bin:$PATH"

echo "=========================================================="
echo " Starting Full Halium Build for LG JudyPN (SDM845)        "
echo " Android Root : $ANDROID_ROOT                             "
echo " Halium Base  : $HALIUM_BRANCH                            "
echo " Build Jobs   : $JOBS                                     "
echo "=========================================================="

# 1. Install Full Build Dependencies
echo "[1/6] Installing build dependencies..."
sudo apt-get update && sudo apt-get install -y \\
  openjdk-8-jdk android-tools-adb bc bison build-essential curl flex \\
  g++-multilib gcc-multilib gnupg gperf imagemagick lib32ncurses5-dev \\
  lib32readline-dev lib32z1-dev libsdl2-dev libpulse-dev liblz4-tool \\
  libncurses5-dev libsdl1.2-dev libssl-dev libwxgtk3.0-gtk3-dev \\
  libxml2 libxml2-utils lzop pngcrush rsync schedtool \\
  squashfs-tools xsltproc yasm zip zlib1g-dev git repo ccache

# Ensure repo tool exists
mkdir -p "$HOME/bin"
if ! command -v repo >/dev/null 2>&1; then
    curl -sSL "https://storage.googleapis.com/git-repo-downloads/repo" > "$HOME/bin/repo"
    chmod +x "$HOME/bin/repo"
fi

# 2. Configure 50GB CCACHE
mkdir -p "$CCACHE_DIR"
ccache -M 50G

# 3. Initialize Halium Tree & Local Manifest
echo "[2/6] Initializing Halium tree at $ANDROID_ROOT..."
mkdir -p "$ANDROID_ROOT" && cd "$ANDROID_ROOT"

if [ ! -d ".repo" ]; then
    repo init -u https://github.com/Halium/android -b "$HALIUM_BRANCH" --depth=1 --git-lfs
fi

echo "[3/6] Injecting lge_judypn.xml local manifest..."
mkdir -p .repo/local_manifests
curl -sSL https://raw.githubusercontent.com/mmry2940/halium-judypn-autobuild/hybris/lge_judypn.xml > .repo/local_manifests/lge_judypn.xml

echo "Syncing repositories..."
repo sync -c -j"$JOBS" --fail-fast --force-sync

# 4. Device Setup Hook
echo "[4/6] Running Halium device setup..."
if [ -f "./halium/devices/setup" ]; then
    ./halium/devices/setup "$DEVICE"
fi

# Patch libcurl/selinux
if [ -f "build/core/main.mk" ]; then
    sed -i 's/external\\/selinux/external\\/selinux external\\/libcurl/g' build/core/main.mk 2>/dev/null || true
fi

# 5. Build Environment & Lunch Combo
echo "[5/6] Sourcing envsetup and breakfast $DEVICE..."
source build/envsetup.sh
breakfast "$DEVICE"

# 6. Compiling Full Boot Image & System Image
echo "[6/6] Building Full Halium Boot Image (hybris-boot.img)..."
mka mkbootimg
mka halium-boot || make -j"$JOBS" hybris-boot

echo "Building Halium systemimage..."
mka systemimage || make -j"$JOBS" systemimage

echo "=========================================================="
echo " BUILD SUCCESSFUL!                                        "
echo " hybris-boot.img: out/target/product/$DEVICE/hybris-boot.img"
echo " system.img:      out/target/product/$DEVICE/system.img   "
echo "=========================================================="
md5sum out/target/product/$DEVICE/hybris-boot.img
md5sum out/target/product/$DEVICE/system.img
`;

  const buildHalContent = `#!/bin/bash
# ==============================================================================
# build-hal.sh: Build Halium Boot & System Image for LG JudyPN
# ==============================================================================
set -e

if [ -f "halium.env" ]; then
    source halium.env
elif [ -f "../halium.env" ]; then
    source ../halium.env
fi

export ANDROID_ROOT="\${ANDROID_ROOT:-$HOME/halium}"
export DEVICE="\${DEVICE:-judypn}"

cd "$ANDROID_ROOT"

# Ensure libcurl is included alongside selinux for hybris networking
if [ -f "build/core/main.mk" ]; then
    sed -i 's/external\\/selinux/external\\/selinux external\\/libcurl/g' build/core/main.mk 2>/dev/null || true
fi

source build/envsetup.sh
export USE_CCACHE=1
breakfast "$DEVICE"

echo "=== Building host tool mkbootimg ==="
mka mkbootimg

echo "=== Building Full Halium Boot Image (hybris-boot.img) ==="
mka halium-boot || make -j\$(nproc) hybris-boot

echo "=== Building Halium System Image (system.img) ==="
mka systemimage || make -j\$(nproc) systemimage

echo "=========================================================="
echo "MD5 Checksums:"
echo "=========================================================="
md5sum out/target/product/$DEVICE/hybris-boot.img
md5sum out/target/product/$DEVICE/system.img
`;

  const setupContent = `#!/bin/bash
# ==============================================================================
# halium-setup.sh: Clones and prepares JudyPN device trees
# ==============================================================================
set -e

if [ -f "halium.env" ]; then
    source halium.env
elif [ -f "../halium.env" ]; then
    source ../halium.env
fi

export ANDROID_ROOT="\${ANDROID_ROOT:-$HOME/halium}"
export DEVICE="\${DEVICE:-judypn}"

cd "$ANDROID_ROOT"
./halium/devices/setup "$DEVICE"
`;

  const envContent = `# Halium Build Environment Configuration for LG JudyPN (SDM845)
export ANDROID_ROOT="${androidRoot}"
export DEVICE="judypn"
export PATH="$HOME/bin:$PATH"
export ROOMSERVICE_BRANCHES="lineage-21"
export USE_CCACHE=1
export CCACHE_DIR="$HOME/.ccache"
`;

  const flashContent = `#!/bin/bash
# ==============================================================================
# flash-judypn.sh: Fastboot Flasher for LG JudyPN (SDM845)
# ==============================================================================
set -e

BOOT_IMG="\${1:-hybris-boot.img}"
SYSTEM_IMG="\${2:-system.img}"

echo "Checking fastboot device..."
fastboot devices

echo "Flashing $BOOT_IMG to boot_a and boot_b..."
fastboot flash boot_a "$BOOT_IMG"
fastboot flash boot_b "$BOOT_IMG"

if [ -f "$SYSTEM_IMG" ]; then
    echo "Flashing $SYSTEM_IMG to system partition..."
    fastboot flash system "$SYSTEM_IMG"
fi

echo "Flashing complete! Rebooting..."
fastboot reboot
`;

  const getActiveData = () => {
    switch (activeScript) {
      case 'full':
        return { filename: 'full-halium-build.sh', content: fullScriptContent, title: 'Full Halium Build Script (End-to-End)' };
      case 'build-hal':
        return { filename: 'build-hal.sh', content: buildHalContent, title: 'build-hal.sh (HAL Boot & System)' };
      case 'setup':
        return { filename: 'halium-setup.sh', content: setupContent, title: 'halium-setup.sh (Device Setup Hook)' };
      case 'env':
        return { filename: 'halium.env', content: envContent, title: 'halium.env (Environment Exports)' };
      case 'flash':
        return { filename: 'flash-judypn.sh', content: flashContent, title: 'flash-judypn.sh (Fastboot Flasher)' };
    }
  };

  const current = getActiveData();

  const handleDownload = () => {
    const blob = new Blob([current.content], { type: 'text/x-shellscript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = current.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-lg">Full Halium Boot Build Scripts</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                LG JudyPN (SDM845)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ready-to-run shell scripts to build <code className="text-emerald-300">hybris-boot.img</code> and <code className="text-emerald-300">system.img</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy(current.content, 'curr')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition"
          >
            {copiedId === 'curr' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'curr' ? 'Copied' : 'Copy Script'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {current.filename}</span>
          </button>
        </div>
      </div>

      {/* Script Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 text-xs">
        {[
          { id: 'full', label: 'full-halium-build.sh (All-in-One)' },
          { id: 'build-hal', label: 'build-hal.sh' },
          { id: 'setup', label: 'halium-setup.sh' },
          { id: 'env', label: 'halium.env' },
          { id: 'flash', label: 'flash-judypn.sh' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveScript(tab.id as typeof activeScript)}
            className={`px-3 py-1.5 rounded-lg font-mono transition ${
              activeScript === tab.id
                ? 'bg-indigo-600 text-white font-semibold shadow'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Script Variables Customizer */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Customize Script Variables (Updates in Real-Time):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">ANDROID_ROOT Directory</label>
            <input
              type="text"
              value={androidRoot}
              onChange={(e) => setAndroidRoot(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Halium Base Version</label>
            <select
              value={haliumBranch}
              onChange={(e) => setHaliumBranch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
            >
              <option value="halium-14.0">halium-14.0 (Lineage 21 / Android 14)</option>
              <option value="halium-11.0">halium-11.0 (Lineage 18.1)</option>
              <option value="halium-9.0">halium-9.0 (Pie)</option>
              <option value="halium-7.1">halium-7.1 (Nougat)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Device Codename</label>
            <input
              type="text"
              disabled
              value={DEVICE_SPECS.codename}
              className="w-full bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1.5 text-slate-400 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Script Viewer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>File: <strong className="text-indigo-300">{current.filename}</strong></span>
          <span>Target: LG V40 (judypn) • {current.title}</span>
        </div>

        <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto max-h-[500px] whitespace-pre leading-relaxed shadow-inner selection:bg-indigo-600/40">
          {current.content}
        </pre>
      </div>

      {/* Full Halium Build Steps Checklist */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
        <h4 className="font-bold text-slate-200 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          What Happens During the Full Halium Build:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              1. hybris-boot.img Assembly
            </span>
            <p className="text-slate-400 text-[11px]">
              Compiles SDM845 kernel with <code className="text-slate-300">sdm845_defconfig</code>, packages initramfs with libhybris init scripts, udev rules, and telnet daemon for early debugging.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              2. system.img Assembly
            </span>
            <p className="text-slate-400 text-[11px]">
              Compiles Android HAL drivers for audio, camera, and Qualcomm CAF display, generating a sparse ext4 Android system partition used by Ubuntu Touch / pmOS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
