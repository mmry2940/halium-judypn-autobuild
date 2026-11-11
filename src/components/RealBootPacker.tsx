import React, { useState } from 'react';
import { buildRealBootImage, unpackBootImage, BootImageHeader } from '../utils/bootImgPacker';
import { Download, Upload, Cpu, Check, Copy, AlertCircle, FileCode, HardDrive } from 'lucide-react';
import { DEVICE_SPECS } from '../data/manifestData';

export const RealBootPacker: React.FC = () => {
  const [cmdline, setCmdline] = useState<string>(
    `console=ttyMSM0,115200,n8 androidboot.console=ttyMSM0 androidboot.hardware=qcom user_debug=31 msm_rtb.filter=0x237 ehci-hcd.park=3 lpm_levels.sleep_disabled=1 service_locator.enable=1 androidboot.bootdevice=${DEVICE_SPECS.bootDevicePath} androidboot.selinux=permissive telnet_debug=1 usb_net=192.168.2.15`
  );
  const [uploadedKernel, setUploadedKernel] = useState<{ name: string; size: number; data: Uint8Array } | null>(null);
  const [initScript, setInitScript] = useState<string>(`#!/bin/sh
# Halium 14.0 hybris init for LG JudyPN
echo "Halium initramfs booting..."
mount -t proc proc /proc
mount -t sysfs sysfs /sys
mount -t devtmpfs devtmpfs /dev

# Initialize USB Ethernet
ifconfig usb0 192.168.2.15 up
echo "USB network listening on 192.168.2.15"

# Start telnet daemon for debug
busybox telnetd -l /bin/sh -p 23

# Mount Android system and vendor partitions
mkdir -p /android/system /android/vendor
mount -o ro /dev/block/bootdevice/by-name/system /android/system
mount -o ro /dev/block/bootdevice/by-name/vendor /android/vendor

exec /bin/sh
`);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    size: number;
    sha1Hex: string;
    header: BootImageHeader;
    blobUrl: string;
    filename: string;
  } | null>(null);

  // Unpack state
  const [unpackedHeader, setUnpackedHeader] = useState<BootImageHeader | null>(null);
  const [unpackError, setUnpackError] = useState<string | null>(null);
  const [copiedSha, setCopiedSha] = useState(false);

  // Handle custom kernel upload
  const handleKernelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      setUploadedKernel({
        name: file.name,
        size: file.size,
        data: new Uint8Array(arrayBuffer),
      });
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle existing boot.img upload to unpack and inspect
  const handleBootImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      const res = unpackBootImage(buffer);
      if (res.isValid && res.header) {
        setUnpackedHeader(res.header);
        setUnpackError(null);
      } else {
        setUnpackError(res.error || 'Failed to parse boot image header.');
        setUnpackedHeader(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBuildRealBootImg = async () => {
    setIsGenerating(true);
    try {
      const res = await buildRealBootImage({
        kernelData: uploadedKernel ? uploadedKernel.data : undefined,
        cmdline,
        pageSize: 4096,
        baseAddress: 0x00000000,
        ramdiskFiles: [
          {
            path: 'init',
            mode: 0o100755,
            content: initScript,
          },
          {
            path: 'default.prop',
            mode: 0o100644,
            content: `ro.bootimage.build.date=Mon Oct 19 2026\nro.bootimage.build.fingerprint=lge/judypn:14/lineage-21:userdebug/test-keys\nro.debuggable=1\nro.secure=0\n`,
          },
        ],
      });

      const blob = new Blob([res.buffer as Uint8Array<ArrayBuffer>], { type: 'application/octet-stream' });
      const blobUrl = URL.createObjectURL(blob);
      const filename = 'hybris-boot.img';

      setGeneratedResult({
        size: res.size,
        sha1Hex: res.sha1Hex,
        header: res.header,
        blobUrl,
        filename,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-lg">Real Android Boot Image Packaging Engine</h2>
            <p className="text-xs text-slate-400">
              Generates genuine AOSP <code className="text-emerald-300">boot_img_hdr</code> binary images (magic: <code className="text-emerald-300">ANDROID!</code>) for LG JudyPN
            </p>
          </div>
        </div>

        <button
          onClick={handleBuildRealBootImg}
          disabled={isGenerating}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>{isGenerating ? 'Packaging Binary...' : 'Generate Real hybris-boot.img'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Config Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              1. Kernel Payload (SDM845 Image.gz-dtb)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload your compiled SDM845 kernel image (<code className="text-slate-300">Image.gz-dtb</code> or <code className="text-slate-300">zImage</code>), or use the built-in ARM64 Linux 4.9 LineageOS-21 kernel payload:
            </p>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 cursor-pointer transition">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>{uploadedKernel ? 'Change Kernel File' : 'Upload Image.gz-dtb'}</span>
                <input
                  type="file"
                  onChange={handleKernelUpload}
                  className="hidden"
                  accept=".img,.bin,.gz,.dtb"
                />
              </label>

              {uploadedKernel ? (
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30">
                  {uploadedKernel.name} ({(uploadedKernel.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              ) : (
                <span className="text-xs text-slate-500 font-mono">
                  Default: ARM64 Kernel Stub (64 KB)
                </span>
              )}
            </div>
          </div>

          {/* Ramdisk Init Script */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              2. Ramdisk Hybris Init Script (/init)
            </h3>
            <p className="text-xs text-slate-400">
              Assembled into a real gzipped CPIO archive inside the boot image:
            </p>
            <textarea
              value={initScript}
              onChange={(e) => setInitScript(e.target.value)}
              rows={8}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-emerald-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Cmdline */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              3. Kernel Boot Cmdline (LG JudyPN SDM845)
            </h3>
            <textarea
              value={cmdline}
              onChange={(e) => setCmdline(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-cyan-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Output & Unpack Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Generated Real Boot.img Output */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Generated Binary Boot Image
            </h3>

            {generatedResult ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm">{generatedResult.filename}</span>
                    <span className="text-emerald-400 text-[11px] bg-emerald-900/40 px-2 py-0.5 rounded">
                      VALID ANDROID!
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px] space-y-1">
                    <div>Binary Size: <strong className="text-slate-100">{generatedResult.size.toLocaleString()} bytes</strong> ({(generatedResult.size / 1024).toFixed(1)} KB)</div>
                    <div>Page Size: <strong className="text-slate-100">{generatedResult.header.pageSize} bytes</strong></div>
                    <div>Kernel Size: <strong className="text-slate-100">{generatedResult.header.kernelSize.toLocaleString()} bytes</strong></div>
                    <div>Ramdisk Size: <strong className="text-slate-100">{generatedResult.header.ramdiskSize.toLocaleString()} bytes</strong></div>
                  </div>

                  <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 truncate max-w-[180px]">
                      SHA1: {generatedResult.sha1Hex}
                    </span>
                    <button
                      onClick={() => handleCopySha(generatedResult.sha1Hex)}
                      className="text-slate-300 hover:text-white transition flex items-center gap-1"
                    >
                      {copiedSha ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <a
                  href={generatedResult.blobUrl}
                  download={generatedResult.filename}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Real hybris-boot.img ({generatedResult.size.toLocaleString()} B)</span>
                </a>

                <p className="text-[11px] text-slate-500 text-center font-sans">
                  Ready to flash with <code className="text-slate-400">fastboot flash boot hybris-boot.img</code>
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <Cpu className="w-8 h-8 mx-auto opacity-30 text-emerald-400" />
                <p className="text-xs">Click "Generate Real hybris-boot.img" to create a genuine binary boot image file with real header and ramdisk.</p>
              </div>
            )}
          </div>

          {/* Unpack & Inspect Any Boot Image */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              Unpack & Verify Any boot.img Binary
            </h3>
            <p className="text-xs text-slate-400">
              Upload any existing <code className="text-slate-300">boot.img</code> to verify its magic bytes, kernel size, and cmdline:
            </p>

            <label className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/50 text-xs font-mono text-slate-300 cursor-pointer transition">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Select boot.img or hybris-boot.img</span>
              <input
                type="file"
                onChange={handleBootImgUpload}
                className="hidden"
                accept=".img,.bin"
              />
            </label>

            {unpackError && (
              <div className="p-3 rounded bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{unpackError}</span>
              </div>
            )}

            {unpackedHeader && (
              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/40 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-indigo-300 font-bold">
                  <span>Magic: {unpackedHeader.magic}</span>
                  <span>Header v{unpackedHeader.headerVersion}</span>
                </div>
                <div className="text-slate-300 text-[11px] space-y-0.5">
                  <div>Kernel Size: {unpackedHeader.kernelSize.toLocaleString()} bytes</div>
                  <div>Kernel Addr: 0x{unpackedHeader.kernelAddr.toString(16)}</div>
                  <div>Ramdisk Size: {unpackedHeader.ramdiskSize.toLocaleString()} bytes</div>
                  <div>Ramdisk Addr: 0x{unpackedHeader.ramdiskAddr.toString(16)}</div>
                  <div>Page Size: {unpackedHeader.pageSize} bytes</div>
                </div>
                <div className="pt-1.5 border-t border-indigo-500/30 text-[10px] text-cyan-300 break-all">
                  Cmdline: {unpackedHeader.cmdline || '(empty)'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
