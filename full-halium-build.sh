#!/bin/bash
# ==============================================================================
# Full Halium 14.0 Autobuild Script for LG JudyPN (LG V40 ThinQ - SDM845)
# Builds: hybris-boot.img (Full Halium Boot) & system.img (HAL Partition)
# ==============================================================================

set -eo pipefail

# 1. Configuration & Default Paths
export ANDROID_ROOT="${ANDROID_ROOT:-$HOME/halium}"
export DEVICE="${DEVICE:-judypn}"
export HALIUM_BRANCH="${HALIUM_BRANCH:-halium-14.0}"
export JOBS="${JOBS:-$(nproc)}"
export USE_CCACHE=1
export CCACHE_EXEC=/usr/bin/ccache
export CCACHE_DIR="${CCACHE_DIR:-$HOME/.ccache}"
export PATH="$HOME/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST_FILE="${SCRIPT_DIR}/lge_judypn.xml"

echo "=========================================================="
echo " Starting Full Halium Build for LG JudyPN (SDM845)        "
echo " Android Root : $ANDROID_ROOT                             "
echo " Halium Base  : $HALIUM_BRANCH                            "
echo " Manifest     : $MANIFEST_FILE                            "
echo " Build Jobs   : $JOBS                                     "
echo "=========================================================="

# 2. Check Disk Space (Halium requires at least 150 GB)
AVAIL_DISK=$(df -BG "$HOME" | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$AVAIL_DISK" -lt 80 ]; then
    echo "⚠️  WARNING: Less than 80 GB available ($AVAIL_DISK GB). Full Halium build requires ~150-200 GB."
    read -p "Continue anyway? (y/N): " -r CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 3. Ensure Build Dependencies
echo "[1/7] Checking build dependencies..."
MISSING_PKGS=()
for pkg in openjdk-8-jdk android-tools-adb bc bison flex gcc g++ git make ccache python3; do
    if ! dpkg -s "$pkg" >/dev/null 2>&1; then
        MISSING_PKGS+=("$pkg")
    fi
done

if [ ${#MISSING_PKGS[@]} -gt 0 ]; then
    echo "Installing missing packages: ${MISSING_PKGS[*]}"
    sudo apt-get update
    sudo apt-get install -y \
        openjdk-8-jdk android-tools-adb bc \
        bison build-essential curl flex g++-multilib \
        gcc-multilib gnupg gperf imagemagick lib32ncurses5-dev \
        lib32readline-dev lib32z1-dev libsdl2-dev libpulse-dev liblz4-tool \
        libncurses-dev libsdl1.2-dev libssl-dev libwxgtk3.0-gtk3-dev \
        libxml2 libxml2-utils lzop pngcrush rsync schedtool \
        squashfs-tools xsltproc yasm zip zlib1g-dev git repo ccache \
        crossbuild-essential-armel
fi

# Ensure Google 'repo' binary exists
mkdir -p "$HOME/bin"
if ! command -v repo >/dev/null 2>&1; then
    echo "Installing Google repo launcher..."
    curl -sSL "https://storage.googleapis.com/git-repo-downloads/repo" > "$HOME/bin/repo"
    chmod +x "$HOME/bin/repo"
fi

# 4. Configure CCACHE
echo "[2/7] Configuring ccache..."
mkdir -p "$CCACHE_DIR"
ccache -M 50G

# 5. Initialize Halium Tree & Sync
echo "[3/7] Initializing Halium tree at $ANDROID_ROOT..."
mkdir -p "$ANDROID_ROOT"
cd "$ANDROID_ROOT"

if [ ! -d ".repo" ]; then
    repo init -u https://github.com/Halium/android -b "$HALIUM_BRANCH" --depth=1 --git-lfs
fi

# 6. Inject Local Device Manifest (lge_judypn.xml)
echo "[4/7] Injecting local manifest for LG JudyPN SDM845..."
mkdir -p "$ANDROID_ROOT/.repo/local_manifests"
if [ -f "$MANIFEST_FILE" ]; then
    cp "$MANIFEST_FILE" "$ANDROID_ROOT/.repo/local_manifests/lge_judypn.xml"
elif [ -f "$ANDROID_ROOT/halium/devices/manifests/lge_judypn.xml" ]; then
    cp "$ANDROID_ROOT/halium/devices/manifests/lge_judypn.xml" "$ANDROID_ROOT/.repo/local_manifests/lge_judypn.xml"
else
    echo "Downloading lge_judypn.xml from repository..."
    curl -sSL https://raw.githubusercontent.com/mmry2940/halium-judypn-autobuild/hybris/lge_judypn.xml > "$ANDROID_ROOT/.repo/local_manifests/lge_judypn.xml"
fi

echo "Synchronizing repositories (this may take 15-30 minutes on first run)..."
repo sync -c -j"$JOBS" --fail-fast --force-sync

# 7. Run Halium Device Setup Hook
echo "[5/7] Executing Halium device setup for $DEVICE..."
if [ -f "./halium/devices/setup" ]; then
    ./halium/devices/setup "$DEVICE"
fi

# Patch SELinux build if necessary (from build-hal.sh)
if [ -f "build/core/main.mk" ]; then
    sed -i 's/external\/selinux/external\/selinux external\/libcurl/g' build/core/main.mk 2>/dev/null || true
fi

# 8. Setup Build Environment & Lunch Target
echo "[6/7] Setting up build environment..."
export ARCH=arm64
# Fix: Many SDM845 kernels require a 32-bit toolchain for compat vDSO
export CROSS_COMPILE_ARM32=arm-linux-gnueabi-
source build/envsetup.sh
breakfast "$DEVICE"

# 9. Build Targets: mkbootimg, hybris-boot (Full Halium Boot), and systemimage
echo "[7/7] Compiling Full Halium Boot Image (hybris-boot.img)..."
mka mkbootimg
mka halium-boot || make -j"$JOBS" hybris-boot

echo "Compiling Halium systemimage..."
mka systemimage || make -j"$JOBS" systemimage

# 10. Checksums and Output Artifacts
OUT_DIR="$ANDROID_ROOT/out/target/product/$DEVICE"
echo "=========================================================="
echo " BUILD COMPLETE! Artifacts in: $OUT_DIR                   "
echo "=========================================================="

if [ -f "$OUT_DIR/hybris-boot.img" ]; then
    echo "✅ hybris-boot.img : $(ls -lh "$OUT_DIR/hybris-boot.img" | awk '{print $5}')"
    md5sum "$OUT_DIR/hybris-boot.img"
fi

if [ -f "$OUT_DIR/system.img" ]; then
    echo "✅ system.img      : $(ls -lh "$OUT_DIR/system.img" | awk '{print $5}')"
    md5sum "$OUT_DIR/system.img"
fi

echo ""
echo "To flash to your LG JudyPN:"
echo "  fastboot flash boot_a $OUT_DIR/hybris-boot.img"
echo "  fastboot flash boot_b $OUT_DIR/hybris-boot.img"
echo "  fastboot flash system $OUT_DIR/system.img"
