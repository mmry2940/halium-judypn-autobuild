import { ManifestProject, BuildStep } from '../types';

export const DEFAULT_RAW_XML = `<?xml version="1.0" encoding="UTF-8"?>
<manifest> 
    <!-- Device Judypn (LGE - QUALCOMM - SDM845 ) -->
    <project path="device/lge/judypn" name="LineageOS/android_device_lge_judypn" revision="lineage-21" />
    <project path="kernel/lge/sdm845" name="LineageOS/android_kernel_lge_sdm845" revision="lineage-21" />
    <project path="vendor/lge/judypn" name="TheMuppets/proprietary_vendor_lge_judypn" revision="lineage-21" />

    <!-- Extras -->
    <project path="vendor/lge/sdm845-common" name="LineageOS/proprietary_vendor_lge_sdm845-common" revision="lineage-21" />
    <project path="device/lge/sdm845-common" name="LineageOS/android_device_lge_sdm845-common" revision="lineage-21" />
    <project path="vendor/qcom/opensource/dataservices" remote="github" name="LineageOS/android_vendor_qcom_opensource_dataservices" revision="lineage-21.0" />
    <project path="vendor/qcom/opensource/display" remote="github" name="LineageOS/android_vendor_qcom_opensource_display" revision="lineage-21.0" />

    <!-- SEPOLICY -->
    <project path="device/lineage/sepolicy" remote="github" name="LineageOS/android_device_lineage_sepolicy" revision="lineage-21.0" />
    <project path="device/qcom/sepolicy" remote="github" name="LineageOS/android_device_qcom_sepolicy" revision="lineage-21.0" />
    <project path="device/qcom/sepolicy_vndr" remote="github" name="LineageOS/android_device_qcom_sepolicy_vndr" revision="lineage-21.0-caf-sm8450" />

    <!-- QCOM Hardware -->
    <project path="hardware/qcom/thermal" remote="github" name="LineageOS/android_hardware_qcom_thermal" revision="lineage-21.0" />
    <project path="hardware/qcom-caf/common" remote="github" name="LineageOS/android_hardware_qcom-caf_common" revision="lineage-21.0" />
    <project path="hardware/qcom-caf/bootctrl" remote="github" name="LineageOS/android_hardware_qcom_bootctrl" revision="lineage-21.0-caf" />
    <project path="hardware/qcom-caf/sdm845/audio" remote="github" name="LineageOS/android_hardware_qcom_audio" revision="lineage-21.0-caf-sdm845" />
    <project path="hardware/qcom-caf/sdm845/media" remote="github" name="LineageOS/android_hardware_qcom_media" revision="lineage-21.0-caf-sdm845" />
    <project path="hardware/qcom-caf/sdm845/display" remote="github" name="LineageOS/android_hardware_qcom_display" revision="lineage-21.0-caf-sdm845" />
    <project path="hardware/qcom-caf/wlan" remote="github" name="LineageOS/android_hardware_qcom_wlan" revision="lineage-21.0-caf" />
</manifest>`;

export const PARSED_PROJECTS: ManifestProject[] = [
  {
    path: "device/lge/judypn",
    name: "LineageOS/android_device_lge_judypn",
    revision: "lineage-21",
    category: "device",
    description: "Device tree configuration for LG V40 ThinQ (judypn), overlays & init configs"
  },
  {
    path: "kernel/lge/sdm845",
    name: "LineageOS/android_kernel_lge_sdm845",
    revision: "lineage-21",
    category: "kernel",
    description: "Linux kernel source for SDM845 chipset with Halium/Hybris patches"
  },
  {
    path: "vendor/lge/judypn",
    name: "TheMuppets/proprietary_vendor_lge_judypn",
    revision: "lineage-21",
    category: "vendor",
    description: "Binary blobs, firmware, camera, audio and sensor proprietary libraries"
  },
  {
    path: "vendor/lge/sdm845-common",
    name: "LineageOS/proprietary_vendor_lge_sdm845-common",
    revision: "lineage-21",
    category: "vendor",
    description: "Shared vendor libraries for LG SDM845 platforms (G7, V40, V35)"
  },
  {
    path: "device/lge/sdm845-common",
    name: "LineageOS/android_device_lge_sdm845-common",
    revision: "lineage-21",
    category: "device",
    description: "Common board config, partition maps, and shared hardware definitions"
  },
  {
    path: "vendor/qcom/opensource/dataservices",
    name: "LineageOS/android_vendor_qcom_opensource_dataservices",
    revision: "lineage-21.0",
    remote: "github",
    category: "hardware",
    description: "Qualcomm data services daemon and rmnet network interface"
  },
  {
    path: "vendor/qcom/opensource/display",
    name: "LineageOS/android_vendor_qcom_opensource_display",
    revision: "lineage-21.0",
    remote: "github",
    category: "hardware",
    description: "Open source Qualcomm display HAL and gralloc drivers"
  },
  {
    path: "device/lineage/sepolicy",
    name: "LineageOS/android_device_lineage_sepolicy",
    revision: "lineage-21.0",
    remote: "github",
    category: "sepolicy",
    description: "LineageOS base SELinux security policy definitions"
  },
  {
    path: "device/qcom/sepolicy",
    name: "LineageOS/android_device_qcom_sepolicy",
    revision: "lineage-21.0",
    remote: "github",
    category: "sepolicy",
    description: "Qualcomm specific SELinux security context and allow rules"
  },
  {
    path: "device/qcom/sepolicy_vndr",
    name: "LineageOS/android_device_qcom_sepolicy_vndr",
    revision: "lineage-21.0-caf-sm8450",
    remote: "github",
    category: "sepolicy",
    description: "Vendor-side SELinux rules tailored for CAF audio/display/camera"
  },
  {
    path: "hardware/qcom/thermal",
    name: "LineageOS/android_hardware_qcom_thermal",
    revision: "lineage-21.0",
    remote: "github",
    category: "hardware",
    description: "Thermal engine HAL to prevent SDM845 throttling and overheating"
  },
  {
    path: "hardware/qcom-caf/common",
    name: "LineageOS/android_hardware_qcom-caf_common",
    revision: "lineage-21.0",
    remote: "github",
    category: "hardware",
    description: "CAF common build interfaces and power HAL modules"
  },
  {
    path: "hardware/qcom-caf/bootctrl",
    name: "LineageOS/android_hardware_qcom_bootctrl",
    revision: "lineage-21.0-caf",
    remote: "github",
    category: "hardware",
    description: "A/B seamless update boot control HAL for slot switching"
  },
  {
    path: "hardware/qcom-caf/sdm845/audio",
    name: "LineageOS/android_hardware_qcom_audio",
    revision: "lineage-21.0-caf-sdm845",
    remote: "github",
    category: "hardware",
    description: "Hardware audio driver & ALSA audio HAL for SDM845"
  },
  {
    path: "hardware/qcom-caf/sdm845/media",
    name: "LineageOS/android_hardware_qcom_media",
    revision: "lineage-21.0-caf-sdm845",
    remote: "github",
    category: "hardware",
    description: "Qualcomm OMX video encoders and media decoders"
  },
  {
    path: "hardware/qcom-caf/sdm845/display",
    name: "LineageOS/android_hardware_qcom_display",
    revision: "lineage-21.0-caf-sdm845",
    remote: "github",
    category: "hardware",
    description: "Hardware composer (HWC 2.x) and surface flinger DRM driver"
  },
  {
    path: "hardware/qcom-caf/wlan",
    name: "LineageOS/android_hardware_qcom_wlan",
    revision: "lineage-21.0-caf",
    remote: "github",
    category: "hardware",
    description: "Qualcomm Wi-Fi HAL and firmware loader"
  }
];

export const WORKFLOW_BUILD_STEPS: BuildStep[] = [
  {
    id: "step-1",
    name: "1. Initialization Environment",
    command: `sudo apt-get update && sudo apt-get install -y openjdk-8-jdk android-tools-adb bc bison build-essential curl flex g++-multilib gcc-multilib gnupg gperf imagemagick lib32ncurses5-dev lib32readline-dev lib32z1-dev libsdl2-dev libpulse-dev liblz4-tool libncurses5-dev libsdl1.2-dev libssl-dev libwxgtk3.0-gtk3-dev libxml2 libxml2-utils lzop pngcrush rsync schedtool squashfs-tools xsltproc yasm zip zlib1g-dev git repo
mkdir -p ~/bin && wget 'https://storage.googleapis.com/git-repo-downloads/repo' -P ~/bin && chmod +x ~/bin/repo
sudo cp ~/bin/repo /usr/bin/repo`,
    description: "Configures Ubuntu build environment with Android toolchain, GCC/Clang multilib, OpenJDK, and repo launcher.",
    durationEst: "~3 min",
    details: [
      "Installs 32-bit compatibility libraries and host native tools",
      "Configures Google git-repo binary into system PATH",
      "Cleans up disk space (/usr/share/dotnet, mysql, php) on runner"
    ]
  },
  {
    id: "step-2",
    name: "2. Downloading Source Code (Halium Base)",
    command: `mkdir -p $ANDROID_ROOT
cd $ANDROID_ROOT
repo init -u https://github.com/Halium/android -b halium-14.0 --depth=1 --git-lfs
repo sync -c -j12 --fail-fast`,
    description: "Initializes Halium Android manifest repo and synchronizes core repositories with multi-threaded git-lfs.",
    durationEst: "~18 min",
    details: [
      "Branch: halium-14.0 (AOSP / Lineage base)",
      "Syncs android tree (build/core, system/core, frameworks/base, bionic)",
      "Depth 1 shallow sync saves ~60GB of git history"
    ]
  },
  {
    id: "step-3",
    name: "3. Copy Local Device Manifest (lge_judypn.xml)",
    command: `cp lge_judypn.xml $ANDROID_ROOT/halium/devices/manifests/lge_judypn.xml
# Also link into .repo/local_manifests/
mkdir -p $ANDROID_ROOT/.repo/local_manifests
cp lge_judypn.xml $ANDROID_ROOT/.repo/local_manifests/lge_judypn.xml`,
    description: "Injects the local manifest containing LG JudyPN (SDM845) device, kernel, and vendor repository paths.",
    durationEst: "~10 sec",
    details: [
      "Specifies device/lge/judypn and device/lge/sdm845-common",
      "Injects kernel/lge/sdm845 on branch lineage-21",
      "Configures TheMuppets vendor blobs & QCOM CAF hardware HALs"
    ]
  },
  {
    id: "step-4",
    name: "4. Clone Device Spec Source",
    command: `cd $ANDROID_ROOT
sudo ./halium/devices/setup judypn`,
    description: "Runs Halium device setup hook for judypn to pull manifests, apply device overrides and patches.",
    durationEst: "~4 min",
    details: [
      "Executes setup judypn hook",
      "Patches build/core/main.mk (SELinux and libcurl inclusion)",
      "Fetches roomservice dependencies"
    ]
  },
  {
    id: "step-5",
    name: "5. Build HAL: mkbootimg & hybris-boot",
    command: `cd $ANDROID_ROOT
source $ANDROID_ROOT/build/envsetup.sh
breakfast judypn
mka mkbootimg
mka halium-boot
# or: make -j$(nproc) hybris-boot`,
    description: "Compiles the SDM845 kernel, packages the initramfs ramdisk with libhybris init, and builds hybris-boot.img.",
    durationEst: "~25 min",
    details: [
      "Loads lunch combos for lineaged_judypn-userdebug",
      "Builds mkbootimg host binary with header v1/v2 support",
      "Compiles kernel Image.gz-dtb with Snapdragon 845 defconfig",
      "Packages hybris-boot.img with command-line arguments"
    ]
  },
  {
    id: "step-6",
    name: "6. Build System Image (Optional for full HAL)",
    command: `cd $ANDROID_ROOT
mka systemimage`,
    description: "Builds Android system partition containing libhybris, surfaceflinger, and hardware drivers.",
    durationEst: "~35 min",
    details: [
      "Compiles hardware audio, display, camera HALs",
      "Assembles sparse ext4 system.img"
    ]
  },
  {
    id: "step-7",
    name: "7. Verify MD5 & Upload Artifacts",
    command: `echo "md5sum hybris-boot.img and system.img"
md5sum $ANDROID_ROOT/out/target/product/judypn/hybris-boot.img
md5sum $ANDROID_ROOT/out/target/product/judypn/system.img
# Upload via actions/upload-artifact@v4`,
    description: "Computes cryptographic checksums of generated images and archives artifacts for download and flashing.",
    durationEst: "~2 min",
    details: [
      "Generates hybris-boot.img artifact",
      "Generates boot.img artifact",
      "Generates system.img artifact"
    ]
  }
];

export const DEVICE_SPECS = {
  codename: "judypn",
  name: "LG V40 ThinQ",
  family: "LGE SDM845 Family (judypn, judyln, judyp)",
  soc: "Qualcomm Snapdragon 845 (SDM845)",
  cpu: "Octa-core Kryo 385 (4x2.8 GHz Gold & 4x1.7 GHz Silver)",
  gpu: "Adreno 630",
  ram: "6 GB LPDDR4X",
  storageDevice: "/dev/block/bootdevice/by-name",
  bootDevicePath: "1d84000.ufshc",
  screenResolution: "1440 x 3120 pixels (19.5:9 OLED)",
  slots: "A/B Partition Scheme",
  kernelBase: "0x00000000",
  pageSize: "4096",
  defconfig: "sdm845_defconfig"
};
