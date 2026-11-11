import React from 'react';
import { BootConfig } from '../types';
import { Sliders, HardDrive, Terminal, Shield, Zap, Info } from 'lucide-react';
import { DEVICE_SPECS } from '../data/manifestData';

interface BootConfiguratorProps {
  config: BootConfig;
  onChangeConfig: (newConfig: BootConfig) => void;
  onApplyAndBuild: () => void;
}

export const BootConfigurator: React.FC<BootConfiguratorProps> = ({
  config,
  onChangeConfig,
  onApplyAndBuild,
}) => {
  const updateField = <K extends keyof BootConfig>(field: K, value: BootConfig[K]) => {
    onChangeConfig({
      ...config,
      [field]: value,
    });
  };

  const fullCmdline = `console=ttyMSM0,115200,n8 androidboot.console=ttyMSM0 androidboot.hardware=qcom user_debug=31 msm_rtb.filter=0x237 ehci-hcd.park=3 lpm_levels.sleep_disabled=1 service_locator.enable=1 androidboot.bootdevice=${DEVICE_SPECS.bootDevicePath} androidboot.selinux=${config.selinuxMode}${
    config.telnetDebug ? ` telnet_debug=1 usb_net=${config.usbIp}` : ''
  }${config.extraCmdline ? ` ${config.extraCmdline}` : ''}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-5 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="font-bold text-slate-100 text-lg">Halium Boot Image & Kernel Configurator</h2>
            <p className="text-xs text-slate-400">
              Configure parameters for compiling <code className="text-indigo-300">hybris-boot.img</code> and <code className="text-indigo-300">mkbootimg</code> for LG JudyPN
            </p>
          </div>
        </div>

        <button
          onClick={onApplyAndBuild}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Apply & Run Build
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Branch & Target Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-indigo-400" />
            Build Target & Tree Branches
          </h3>

          <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Halium Base Version
              </label>
              <select
                value={config.haliumBranch}
                onChange={(e) => updateField('haliumBranch', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="halium-14.0">halium-14.0 (Android 14 / Lineage-21 - Recommended)</option>
                <option value="halium-11.0">halium-11.0 (Android 11 / Lineage-18.1)</option>
                <option value="halium-9.0">halium-9.0 (Android 9 Pie)</option>
                <option value="halium-7.1">halium-7.1 (Legacy Nougat)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                SDM845 Kernel Branch
              </label>
              <input
                type="text"
                value={config.kernelBranch}
                onChange={(e) => updateField('kernelBranch', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Image Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['hybris-boot', 'halium-boot', 'both'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateField('targetImage', t)}
                    className={`py-1.5 px-2 rounded border text-xs capitalize transition font-mono ${
                      config.targetImage === t
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.buildSystemImage}
                  onChange={(e) => updateField('buildSystemImage', e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-500"
                />
                Compile systemimage (mka systemimage)
              </label>
            </div>
          </div>
        </div>

        {/* Debug & Hybris Ramdisk Parameters */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Hybris Boot & Debug Environment
          </h3>

          <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                SELinux Mode in Boot Image
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateField('selinuxMode', 'permissive')}
                  className={`py-1.5 px-2 rounded border text-xs capitalize transition ${
                    config.selinuxMode === 'permissive'
                      ? 'bg-amber-600/30 text-amber-300 border-amber-500/50 font-semibold'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Permissive (Recommended for Halium init)
                </button>
                <button
                  type="button"
                  onClick={() => updateField('selinuxMode', 'enforcing')}
                  className={`py-1.5 px-2 rounded border text-xs capitalize transition ${
                    config.selinuxMode === 'enforcing'
                      ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Enforcing
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.telnetDebug}
                  onChange={(e) => updateField('telnetDebug', e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-500"
                />
                Enable USB Telnet Debugging Daemon (port 23)
              </label>
              <p className="text-[11px] text-slate-500 mt-0.5 ml-5">
                Spawns telnet shell on early boot if display does not initialize
              </p>
            </div>

            {config.telnetDebug && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Device USB IP Address
                </label>
                <input
                  type="text"
                  value={config.usbIp}
                  onChange={(e) => updateField('usbIp', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Build Parallelism
                </label>
                <input
                  type="number"
                  min="1"
                  max="64"
                  value={config.jobs}
                  onChange={(e) => updateField('jobs', parseInt(e.target.value) || 4)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  CCACHE Size
                </label>
                <input
                  type="text"
                  value={config.ccacheSize}
                  onChange={(e) => updateField('ccacheSize', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Kernel Cmdline Preview */}
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            Generated Snapdragon 845 Kernel Boot Cmdline:
          </span>
          <span className="text-[11px] font-mono text-slate-400">mkbootimg --cmdline</span>
        </div>
        <div className="p-3 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 break-all leading-relaxed select-all">
          {fullCmdline}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5" />
          <span>LG V40 UFS controller is addressed at <code className="text-slate-400">1d84000.ufshc</code></span>
        </div>
      </div>
    </div>
  );
};
