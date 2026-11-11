import React, { useState } from 'react';
import { Smartphone, AlertTriangle, Check, Copy } from 'lucide-react';
import { DEVICE_SPECS } from '../data/manifestData';

export const FlashingGuide: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Smartphone className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="font-bold text-slate-100 text-lg">
              Flashing & Deployment Guide for LG {DEVICE_SPECS.name} ({DEVICE_SPECS.codename})
            </h2>
            <p className="text-xs text-slate-400">
              Step-by-step instructions for flashing the generated Halium boot image and rootfs
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono">
          Qualcomm SDM845 • A/B Slot
        </span>
      </div>

      {/* Guide Steps */}
      <div className="space-y-5">
        {/* Step 1 */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-xs font-bold text-indigo-300">
                1
              </span>
              Enter Fastboot Mode on LG V40 / JudyPN
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            1. Power off the phone completely.<br />
            2. Hold the <strong className="text-slate-200">Volume Down (-)</strong> button and plug in the USB Type-C cable connected to your PC.<br />
            3. Release the button when the fastboot / bootloader screen appears.<br />
            4. Verify device detection via terminal:
          </p>

          <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between font-mono text-xs text-cyan-300">
            <span>fastboot devices</span>
            <button
              onClick={() => copyToClipboard('fastboot devices', 'step1')}
              className="text-slate-400 hover:text-white transition"
            >
              {copiedCmd === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-xs font-bold text-indigo-300">
                2
              </span>
              Flash the Halium Boot Image (hybris-boot.img)
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Flash to both A and B slots to ensure seamless bootability on Snapdragon 845 A/B layout:
          </p>

          <div className="space-y-1.5 font-mono text-xs">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between text-cyan-300">
              <span>fastboot flash boot_a hybris-boot.img && fastboot flash boot_b hybris-boot.img</span>
              <button
                onClick={() => copyToClipboard('fastboot flash boot_a hybris-boot.img && fastboot flash boot_b hybris-boot.img', 'step2a')}
                className="text-slate-400 hover:text-white transition"
              >
                {copiedCmd === 'step2a' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between text-cyan-300">
              <span>fastboot flash system system.img</span>
              <button
                onClick={() => copyToClipboard('fastboot flash system system.img', 'step2b')}
                className="text-slate-400 hover:text-white transition"
              >
                {copiedCmd === 'step2b' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-xs font-bold text-indigo-300">
                3
              </span>
              Install Rootfs (Ubuntu Touch or postmarketOS)
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Boot into TWRP recovery or halium-recovery, then run <code className="text-slate-300">halium-install</code>:
          </p>

          <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between font-mono text-xs text-cyan-300">
            <span>./halium-install -p ut rootfs.tar.gz system.img</span>
            <button
              onClick={() => copyToClipboard('./halium-install -p ut rootfs.tar.gz system.img', 'step3')}
              className="text-slate-400 hover:text-white transition"
            >
              {copiedCmd === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 4: Telnet Debugging */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-xs font-bold text-indigo-300">
                4
              </span>
              Debug via USB Networking & Telnet Shell
            </h3>
            <span className="text-xs text-emerald-400 font-mono">hybris-boot debug mode</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            If the device boots into a black screen or encounters a kernel panic during init, connect via USB Ethernet:
          </p>

          <div className="space-y-1.5 font-mono text-xs">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between text-cyan-300">
              <span>sudo ip addr add 192.168.2.1/24 dev usb0 && telnet 192.168.2.15</span>
              <button
                onClick={() => copyToClipboard('sudo ip addr add 192.168.2.1/24 dev usb0 && telnet 192.168.2.15', 'step4a')}
                className="text-slate-400 hover:text-white transition"
              >
                {copiedCmd === 'step4a' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between text-cyan-300">
              <span>dmesg -w # inspect kernel dmesg logs for missing firmware blobs or hal errors</span>
              <button
                onClick={() => copyToClipboard('dmesg -w', 'step4b')}
                className="text-slate-400 hover:text-white transition"
              >
                {copiedCmd === 'step4b' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Troubleshooting Tips */}
      <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/50 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-amber-300 font-semibold">
          <AlertTriangle className="w-4 h-4" />
          LG JudyPN SDM845 Troubleshooting Tips:
        </div>
        <ul className="list-disc list-inside text-amber-200/80 space-y-1">
          <li><strong>OLED Display initialization:</strong> SDM845 requires CAF display HAL on <code className="text-amber-200">lineage-21.0-caf-sdm845</code>. Ensure <code className="text-amber-200">hardware/qcom-caf/sdm845/display</code> is in <code className="text-amber-200">lge_judypn.xml</code>.</li>
          <li><strong>SELinux errors:</strong> If init halts, keep cmdline set to <code className="text-amber-200">androidboot.selinux=permissive</code>.</li>
          <li><strong>UFS storage timeout:</strong> LG V40 uses UFS 2.1 chip mapped at <code className="text-amber-200">1d84000.ufshc</code>; make sure this path matches in the cmdline.</li>
        </ul>
      </div>
    </div>
  );
};
