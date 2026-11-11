#!/bin/bash
# ==============================================================================
# Build Halium Boot & System Image for LG JudyPN
# ==============================================================================
set -e

if [ -f "halium.env" ]; then
    source halium.env
elif [ -f "../halium.env" ]; then
    source ../halium.env
fi

export ANDROID_ROOT="${ANDROID_ROOT:-$HOME/halium}"
export DEVICE="${DEVICE:-judypn}"

cd "$ANDROID_ROOT"

# Ensure libcurl is available alongside selinux for hybris networking
if [ -f "build/core/main.mk" ]; then
    sed -i 's/external\/selinux/external\/selinux external\/libcurl/g' build/core/main.mk 2>/dev/null || true
fi

source build/envsetup.sh
export USE_CCACHE=1
export CROSS_COMPILE_ARM32=arm-linux-gnueabi-
breakfast "$DEVICE"

echo "=== Building host tool mkbootimg ==="
mka mkbootimg

echo "=== Building Full Halium Boot Image (hybris-boot.img) ==="
mka halium-boot || make -j$(nproc) hybris-boot

echo "=== Building Halium System Image (system.img) ==="
mka systemimage || make -j$(nproc) systemimage

echo "=========================================================="
echo "MD5 Checksums of Built Images:"
echo "=========================================================="
if [ -f "$ANDROID_ROOT/out/target/product/$DEVICE/hybris-boot.img" ]; then
    md5sum "$ANDROID_ROOT/out/target/product/$DEVICE/hybris-boot.img"
fi

if [ -f "$ANDROID_ROOT/out/target/product/$DEVICE/system.img" ]; then
    md5sum "$ANDROID_ROOT/out/target/product/$DEVICE/system.img"
fi
