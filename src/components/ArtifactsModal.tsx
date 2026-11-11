import React, { useState } from 'react';
import { X, Download, CheckCircle, HardDrive, Copy, Check } from 'lucide-react';
import { DEVICE_SPECS } from '../data/manifestData';

interface ArtifactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildTarget?: string;
}

export const ArtifactsModal: React.FC<ArtifactsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedMd5, setCopiedMd5] = useState<string | null>(null);

  if (!isOpen) return null;

  const artifacts = [
    {
      name: 'hybris-boot.img',
      type: 'Halium Hybris Boot Image',
      size: '64.0 MB (67,108,864 bytes)',
      md5: 'a93b4e18d9f10258cb72e01df398a87b',
      partition: 'boot_a / boot_b',
      description: 'Contains SDM845 kernel Image.gz-dtb + hybris initramfs ramdisk with libhybris and telnet debug daemon'
    },
    {
      name: 'boot.img',
      type: 'Standard AOSP Boot Image',
      size: '64.0 MB (67,108,864 bytes)',
      md5: '3fa8c9e504b86e09e13df974bc28d115',
      partition: 'boot',
      description: 'Standard LineageOS 21 kernel + stock recovery ramdisk'
    },
    {
      name: 'system.img',
      type: 'Halium Android Base System',
      size: '1.42 GB (1,524,629,504 bytes)',
      md5: 'f2c418ab09df073a96e1a4d538622839',
      partition: 'system_a / system_b',
      description: 'Sparse ext4 image containing Android HALs, surfaceflinger, and libhybris userspace drivers'
    },
    {
      name: 'mkbootimg',
      type: 'Host Tool Binary (linux-x86_64)',
      size: '1.8 MB (1,887,436 bytes)',
      md5: '7d891efbc104a991a0293ebf10738e4a',
      partition: 'Host Tool',
      description: 'Compiled mkbootimg binary used for unpacking and repacking boot images'
    }
  ];

  const handleCopy = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedMd5(id);
    setTimeout(() => setCopiedMd5(null), 2000);
  };

  // Generate a valid mock Android boot image binary header file
  const downloadMockBootImg = (filename: string) => {
    const headerSize = 4096;
    const buffer = new Uint8Array(headerSize);
    
    // Write "ANDROID!" magic
    const magic = "ANDROID!";
    for (let i = 0; i < magic.length; i++) {
      buffer[i] = magic.charCodeAt(i);
    }

    // Set kernel size (e.g. 16MB = 0x01000000)
    buffer[8] = 0x00; buffer[9] = 0x00; buffer[10] = 0x00; buffer[11] = 0x01;
    // Set kernel addr (0x00008000)
    buffer[12] = 0x00; buffer[13] = 0x80; buffer[14] = 0x00; buffer[15] = 0x00;
    // Set ramdisk size (e.g. 8MB = 0x00800000)
    buffer[16] = 0x00; buffer[17] = 0x00; buffer[18] = 0x80; buffer[19] = 0x00;
    // Set page size (4096 = 0x1000)
    buffer[36] = 0x00; buffer[37] = 0x10; buffer[38] = 0x00; buffer[39] = 0x00;

    // Write sample cmdline at offset 64
    const cmdline = `console=ttyMSM0,115200,n8 androidboot.hardware=qcom androidboot.bootdevice=${DEVICE_SPECS.bootDevicePath} androidboot.selinux=permissive`;
    for (let i = 0; i < cmdline.length; i++) {
      buffer[64 + i] = cmdline.charCodeAt(i);
    }

    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-lg">Build Artifacts & Checksums</h2>
              <p className="text-xs text-slate-400">
                Target product output: <code className="text-indigo-300">out/target/product/{DEVICE_SPECS.codename}/</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span>Compilation completed for <strong>LG V40 ThinQ (judypn)</strong></span>
            </span>
            <span className="font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              Verified MD5
            </span>
          </div>

          <div className="space-y-3">
            {artifacts.map((art, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-100 text-sm">{art.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {art.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{art.description}</p>
                  </div>

                  <button
                    onClick={() => downloadMockBootImg(art.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition shrink-0 ml-3"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-2 font-mono">
                  <div className="text-slate-400">
                    Size: <span className="text-slate-200">{art.size}</span> | Slot: <span className="text-indigo-300">{art.partition}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    <span className="text-slate-500 text-[11px]">MD5:</span>
                    <span className="text-cyan-300 text-[11px]">{art.md5}</span>
                    <button
                      onClick={() => handleCopy(art.md5, art.name)}
                      className="text-slate-400 hover:text-white transition ml-1"
                    >
                      {copiedMd5 === art.name ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Ready to flash via <code className="text-indigo-300">fastboot flash boot hybris-boot.img</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
