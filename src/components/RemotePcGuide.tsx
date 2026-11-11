import React, { useState } from 'react';
import { Server, Terminal, Copy, Check, Shield, Download, Sparkles, AlertCircle, ArrowRight, Monitor } from 'lucide-react';
import { DEVICE_SPECS } from '../data/manifestData';

interface RemotePcConfig {
  host: string;
  user: string;
  port: string;
  buildDir: string;
  jobs: string;
  target: 'boot-only' | 'full';
  useTmux: boolean;
}

export const RemotePcGuide: React.FC = () => {
  const [config, setConfig] = useState<RemotePcConfig>({
    host: '192.168.1.100',
    user: 'ubuntu',
    port: '22',
    buildDir: '~/halium',
    jobs: '$(nproc)',
    target: 'boot-only',
    useTmux: true,
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sshConnectCmd = `ssh ${config.port !== '22' ? `-p ${config.port} ` : ''}${config.user}@${config.host}`;

  const scpDownloadCmd = config.target === 'boot-only'
    ? `scp ${config.port !== '22' ? `-P ${config.port} ` : ''}${config.user}@${config.host}:${config.buildDir}/hybris-boot.img ./`
    : `scp ${config.port !== '22' ? `-P ${config.port} ` : ''}${config.user}@${config.host}:${config.buildDir}/out/target/product/${DEVICE_SPECS.codename}/hybris-boot.img ./`;

  // One-liner automated script
  const oneLinerSetupAndBuild = config.target === 'boot-only'
    ? `# 1-Liner: Setup & Fast Boot Image Build (~8 min)
sudo apt update && sudo apt install -y gcc-aarch64-linux-gnu gcc-arm-linux-gnueabi build-essential bc bison flex libssl-dev libelf-dev cpio mkbootimg git && \\
mkdir -p ${config.buildDir} && cd ${config.buildDir} && \\
git clone --depth=1 -b lineage-21 https://github.com/LineageOS/android_kernel_lge_sdm845.git kernel && \\
cd kernel && export ARCH=arm64 && export CROSS_COMPILE=aarch64-linux-gnu- && export CROSS_COMPILE_ARM32=arm-linux-gnueabi- && \\
(make judypn_defconfig || make sdm845_defconfig || make lineageos_judypn_defconfig || make vendor/sdm845-perf_defconfig) && \\
make -j${config.jobs} Image.gz-dtb && cd .. && \\
mkdir -p ramdisk && cat << 'EOF' > ramdisk/init
#!/bin/sh
mount -t proc proc /proc; mount -t sysfs sysfs /sys; mount -t devtmpfs devtmpfs /dev
ifconfig usb0 192.168.2.15 up 2>/dev/null; busybox telnetd -l /bin/sh -p 23 2>/dev/null
exec /bin/sh
EOF
chmod +x ramdisk/init && (cd ramdisk && find . | cpio -o -H newc | gzip -9 > ../ramdisk.cpio.gz) && \\
mkbootimg --kernel kernel/arch/arm64/boot/Image.gz-dtb --ramdisk ramdisk.cpio.gz \\
  --cmdline "console=ttyMSM0,115200,n8 androidboot.hardware=qcom androidboot.bootdevice=1d84000.ufshc androidboot.selinux=permissive telnet_debug=1 usb_net=192.168.2.15" \\
  --base 0x00000000 --pagesize 4096 --kernel_offset 0x00008000 --ramdisk_offset 0x01000000 --output hybris-boot.img && \\
echo "SUCCESS: hybris-boot.img built in $(pwd)/hybris-boot.img"`
    : `# 1-Liner: Setup & Full Halium AOSP Build (~2-3 hours)
sudo apt update && sudo apt install -y openjdk-8-jdk android-tools-adb bc bison build-essential curl flex g++-multilib gcc-multilib gnupg gperf imagemagick lib32ncurses5-dev lib32readline-dev lib32z1-dev libsdl2-dev libpulse-dev liblz4-tool libncurses5-dev libsdl1.2-dev libssl-dev libwxgtk3.0-gtk3-dev libxml2 libxml2-utils lzop pngcrush rsync schedtool squashfs-tools xsltproc yasm zip zlib1g-dev git repo tmux gcc-arm-linux-gnueabi && \\
mkdir -p ~/bin && wget -qO ~/bin/repo https://storage.googleapis.com/git-repo-downloads/repo && chmod +x ~/bin/repo && export PATH=~/bin:$PATH && \\
mkdir -p ${config.buildDir} && cd ${config.buildDir} && \\
repo init -u https://github.com/Halium/android -b halium-14.0 --depth=1 && \\
repo sync -c -j12 --fail-fast && \\
mkdir -p .repo/local_manifests && \\
git clone https://github.com/mmry2940/halium-judypn-autobuild.git /tmp/autobuild && \\
cp /tmp/autobuild/lge_judypn.xml .repo/local_manifests/ && \\
./halium/devices/setup judypn && \\
source build/envsetup.sh && breakfast judypn && \\
mka mkbootimg && mka halium-boot && \\
echo "SUCCESS: out/target/product/judypn/hybris-boot.img built!"`;

  const downloadSetupScript = () => {
    const blob = new Blob([oneLinerSetupAndBuild], { type: 'text/x-shellscript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = config.target === 'boot-only' ? 'build-boot-remote.sh' : 'build-halium-full-remote.sh';
    a.click();
    URL.revokeObjectURL(url);
  };

  const steps = [
    {
      num: 1,
      title: 'Connect to Remote PC via SSH',
      desc: 'Open your terminal (PowerShell, macOS Terminal, or Linux) and run:',
      command: sshConnectCmd,
      id: 'step1',
      tip: 'If using SSH keys: ssh-copy-id ' + (config.port !== '22' ? `-p ${config.port} ` : '') + `${config.user}@${config.host}`,
    },
    {
      num: 2,
      title: 'Start a Persistent Terminal Session (tmux)',
      desc: 'Prevents the build from getting aborted if your internet connection drops:',
      command: `tmux new -s halium_build`,
      id: 'step2',
      tip: 'To reattach later if disconnected: tmux attach -t halium_build',
    },
    {
      num: 3,
      title: 'Install Build Dependencies & Toolchain',
      desc: config.target === 'boot-only'
        ? 'Installs the AArch64 cross-compiler, kernel build tools, and mkbootimg (~1 min):'
        : 'Installs full Android build packages, 32-bit multilib libraries, and Google repo tool (~3 min):',
      command: config.target === 'boot-only'
        ? `sudo apt update && sudo apt install -y gcc-aarch64-linux-gnu gcc-arm-linux-gnueabi build-essential bc bison flex libssl-dev libelf-dev cpio gzip mkbootimg git`
        : `sudo apt update && sudo apt install -y openjdk-8-jdk android-tools-adb bc bison build-essential curl flex g++-multilib gcc-multilib gnupg gperf imagemagick lib32ncurses5-dev lib32readline-dev lib32z1-dev libsdl2-dev libpulse-dev liblz4-tool libncurses5-dev libsdl1.2-dev libssl-dev libwxgtk3.0-gtk3-dev libxml2 libxml2-utils lzop pngcrush rsync schedtool squashfs-tools xsltproc yasm zip zlib1g-dev git repo gcc-arm-linux-gnueabi
mkdir -p ~/bin && wget 'https://storage.googleapis.com/git-repo-downloads/repo' -P ~/bin && chmod +x ~/bin/repo
export PATH=~/bin:$PATH`,
      id: 'step3',
      tip: 'Works on Ubuntu 20.04, 22.04, and 24.04 LTS.',
    },
    {
      num: 4,
      title: config.target === 'boot-only' ? 'Clone Kernel Source & Compile Image.gz-dtb' : 'Initialize Halium Repo & Sync Manifest',
      desc: config.target === 'boot-only'
        ? 'Clones LineageOS SDM845 kernel from lge_judypn.xml and compiles (~6 min):'
        : 'Clones Halium AOSP manifest and fetches tree (~20 min):',
      command: config.target === 'boot-only'
        ? `mkdir -p ${config.buildDir} && cd ${config.buildDir}
git clone --depth=1 -b lineage-21 https://github.com/LineageOS/android_kernel_lge_sdm845.git kernel
cd kernel
export ARCH=arm64
export CROSS_COMPILE=aarch64-linux-gnu-
export CROSS_COMPILE_ARM32=arm-linux-gnueabi-
# Attempt to find correct defconfig
make judypn_defconfig || make sdm845_defconfig || make lineageos_judypn_defconfig || make vendor/sdm845-perf_defconfig
make -j${config.jobs} Image.gz-dtb
cd ..`
        : `mkdir -p ${config.buildDir} && cd ${config.buildDir}
repo init -u https://github.com/Halium/android -b halium-14.0 --depth=1
repo sync -c -j12 --fail-fast`,
      id: 'step4',
      tip: 'Requires ~3GB for kernel only, or ~150GB for full AOSP.',
    },
    {
      num: 5,
      title: config.target === 'boot-only' ? 'Assemble Ramdisk & Pack Real hybris-boot.img' : 'Inject lge_judypn.xml & Run breakfast',
      desc: config.target === 'boot-only'
        ? 'Packs the compiled kernel with hybris initramfs into a flashable boot image (~10 sec):'
        : 'Sets up JudyPN device trees and compiles hybris-boot.img (~25 min):',
      command: config.target === 'boot-only'
        ? `mkdir -p ramdisk
cat << 'EOF' > ramdisk/init
#!/bin/sh
mount -t proc proc /proc && mount -t sysfs sysfs /sys && mount -t devtmpfs devtmpfs /dev
ifconfig usb0 192.168.2.15 up 2>/dev/null
busybox telnetd -l /bin/sh -p 23 2>/dev/null
exec /bin/sh
EOF
chmod +x ramdisk/init
cd ramdisk && find . | cpio -o -H newc | gzip -9 > ../ramdisk.cpio.gz && cd ..

mkbootimg \\
  --kernel kernel/arch/arm64/boot/Image.gz-dtb \\
  --ramdisk ramdisk.cpio.gz \\
  --cmdline "console=ttyMSM0,115200,n8 androidboot.hardware=qcom androidboot.bootdevice=1d84000.ufshc androidboot.selinux=permissive telnet_debug=1 usb_net=192.168.2.15" \\
  --base 0x00000000 \\
  --pagesize 4096 \\
  --kernel_offset 0x00008000 \\
  --ramdisk_offset 0x01000000 \\
  --output hybris-boot.img`
        : `mkdir -p .repo/local_manifests
curl -sSL https://raw.githubusercontent.com/mmry2940/halium-judypn-autobuild/hybris/lge_judypn.xml > .repo/local_manifests/lge_judypn.xml
./halium/devices/setup judypn
source build/envsetup.sh
breakfast judypn
mka mkbootimg
mka halium-boot`,
      id: 'step5',
      tip: 'Output file: hybris-boot.img',
    },
    {
      num: 6,
      title: 'Download Built Image to Your Current Computer',
      desc: 'Run this from your CURRENT local computer to download the built image from the remote PC:',
      command: scpDownloadCmd,
      id: 'step6',
      tip: 'Once downloaded, flash via: fastboot flash boot hybris-boot.img',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-lg">Remote PC Build Guide (SSH & Automated Commands)</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                SSH Helper
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Connect to your remote Linux PC / server, setup the environment, and build Halium JudyPN
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadSetupScript}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Download .sh Script</span>
          </button>
        </div>
      </div>

      {/* Connection & Target Configurator */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-indigo-400" />
            1. Configure Your Remote PC / Server Connection
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Commands dynamically update below</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Remote Host / IP</label>
            <input
              type="text"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
              placeholder="e.g. 192.168.1.50 or vps.domain.com"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">SSH Username</label>
            <input
              type="text"
              value={config.user}
              onChange={(e) => setConfig({ ...config, user: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
              placeholder="e.g. ubuntu, root"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">SSH Port</label>
            <input
              type="text"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
              placeholder="22"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Remote Build Directory</label>
            <input
              type="text"
              value={config.buildDir}
              onChange={(e) => setConfig({ ...config, buildDir: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Build Target Mode</label>
            <select
              value={config.target}
              onChange={(e) => setConfig({ ...config, target: e.target.value as 'boot-only' | 'full' })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
            >
              <option value="boot-only">Boot Image Only (~8 min)</option>
              <option value="full">Full Halium AOSP (~2-3 hrs)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 1-Click Automated Setup Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              Option A: 1-Click All-in-One Command on Remote PC
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
            Fastest
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Log into your remote PC with <code className="text-indigo-300">{sshConnectCmd}</code> and run this single command to automatically install tools, setup the environment, compile, and output <code className="text-emerald-300">hybris-boot.img</code>:
        </p>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400">Paste in remote terminal:</span>
            <button
              onClick={() => handleCopy(oneLinerSetupAndBuild, 'oneliner')}
              className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs transition"
            >
              {copiedId === 'oneliner' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'oneliner' ? 'Copied 1-Liner' : 'Copy All-In-One Command'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-48 whitespace-pre leading-relaxed shadow-inner">
            {oneLinerSetupAndBuild}
          </pre>
        </div>
      </div>

      {/* Step by Step Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            Option B: Step-by-Step Remote Execution
          </h3>
          <span className="text-xs text-slate-400">Step {activeStep} of {steps.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Step selector */}
          <div className="md:col-span-4 space-y-1.5">
            {steps.map((st) => (
              <button
                key={st.num}
                onClick={() => setActiveStep(st.num)}
                className={`w-full text-left p-3 rounded-lg border transition text-xs flex items-center justify-between ${
                  activeStep === st.num
                    ? 'bg-indigo-950/50 border-indigo-500 text-white font-medium'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeStep === st.num ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {st.num}
                  </span>
                  <span className="truncate">{st.title}</span>
                </div>
                <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${activeStep === st.num ? 'text-indigo-400' : 'text-slate-600'}`} />
              </button>
            ))}
          </div>

          {/* Active Step Command Box */}
          <div className="md:col-span-8 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-200">
                  Step {activeStep}: {steps[activeStep - 1].title}
                </span>
                <button
                  onClick={() => handleCopy(steps[activeStep - 1].command, steps[activeStep - 1].id)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition"
                >
                  {copiedId === steps[activeStep - 1].id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === steps[activeStep - 1].id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-2.5">{steps[activeStep - 1].desc}</p>

              <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                {steps[activeStep - 1].command}
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Tip: {steps[activeStep - 1].tip}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <button
                disabled={activeStep === 1}
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition"
              >
                Previous Step
              </button>
              <button
                disabled={activeStep === steps.length}
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-medium transition"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Troubleshooting and Hardware Advice */}
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
        <h4 className="font-bold text-slate-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Remote PC Requirements for Halium JudyPN:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-400 pt-1">
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
            <span className="font-semibold text-slate-200">For Boot Image Only (~8 min):</span>
            <p>Any Linux PC or VPS with <strong>2 cores, 4 GB RAM, 10 GB disk</strong> space. Clones only the kernel and compiles very quickly.</p>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
            <span className="font-semibold text-slate-200">For Full Halium system.img (~2.5 hrs):</span>
            <p>Requires <strong>8+ cores, 16–32 GB RAM, and 250 GB SSD</strong> space for the full Android source tree.</p>
          </div>
        </div>
        <div className="p-2.5 mt-2 rounded bg-rose-950/20 border border-rose-900/50 space-y-1 text-rose-200/80">
          <span className="font-semibold text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Fixing "No rule to make target 'judypn_defconfig'":
          </span>
          <p>If you see this error, it means the kernel source uses a different name or ARCH is not set. Fix:</p>
          <code className="block bg-slate-900 p-1.5 rounded mt-1 text-cyan-300 text-[10px]">
            # 1. Ensure ARCH is set:<br/>
            export ARCH=arm64<br/>
            # 2. Try the platform-wide defconfig:<br/>
            make sdm845_defconfig halium.config
          </code>
        </div>
      </div>
    </div>
  );
};
