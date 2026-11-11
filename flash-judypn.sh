#!/bin/bash
# ==============================================================================
# Flash Halium Images to LG JudyPN (LG V40 ThinQ - SDM845)
# ==============================================================================
set -e

BOOT_IMG="${1:-hybris-boot.img}"
SYSTEM_IMG="${2:-system.img}"

echo "=========================================================="
echo " Flashing Halium to LG JudyPN (SDM845)                   "
echo " Boot Image   : $BOOT_IMG                                 "
echo " System Image : $SYSTEM_IMG                               "
echo "=========================================================="

# Check fastboot connection
echo "Checking fastboot device..."
if ! fastboot devices | grep -q "fastboot"; then
    echo "❌ No fastboot device detected!"
    echo "1. Power off device."
    echo "2. Hold Volume Down (-) and plug in USB-C cable."
    echo "3. Re-run this script."
    exit 1
fi

echo "✅ Device connected in fastboot mode."

# Flash boot image to both A and B slots
if [ -f "$BOOT_IMG" ]; then
    echo "Flashing $BOOT_IMG to boot_a and boot_b..."
    fastboot flash boot_a "$BOOT_IMG"
    fastboot flash boot_b "$BOOT_IMG"
else
    echo "⚠️ $BOOT_IMG not found, skipping boot partition flash."
fi

# Flash system image if present
if [ -f "$SYSTEM_IMG" ]; then
    echo "Flashing $SYSTEM_IMG to system..."
    fastboot flash system "$SYSTEM_IMG"
fi

echo ""
read -p "Reboot to system now? (y/N): " -r REBOOT_CONFIRM
if [[ "$REBOOT_CONFIRM" =~ ^[Yy]$ ]]; then
    fastboot reboot
    echo "Rebooting device! If screen remains dark, connect via USB Ethernet:"
    echo "  sudo ip addr add 192.168.2.1/24 dev usb0 && telnet 192.168.2.15"
fi
