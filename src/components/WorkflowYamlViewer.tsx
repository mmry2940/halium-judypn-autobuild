import React, { useState } from 'react';
import { Copy, Check, Download, Zap } from 'lucide-react';

const WORKFLOW_YML = `name: Halium Image

on: 
  workflow_dispatch:
  push:
    branches:
      - hybris
      - main
  release:
    types: [published]

jobs:
  build:
    runs-on: ubuntu-22.04
    permissions: 
      contents: read

    env:
      DEVICE: judypn
      ANDROID_ROOT: /home/runner/work/halium/

    steps:
    - name: Checkout into Directory
      uses: actions/checkout@v4
    
    - name: Initialization environment
      run: |
        sudo apt-get update
        sudo apt-get install -y \\
        openjdk-8-jdk android-tools-adb bc \\
        bison build-essential curl flex g++-multilib \\
        gcc-multilib gnupg gperf imagemagick lib32ncurses5-dev \\
        lib32readline-dev lib32z1-dev libsdl2-dev libpulse-dev liblz4-tool \\
        libncurses5-dev libsdl1.2-dev libssl-dev libwxgtk3.0-gtk3-dev \\
        libxml2 libxml2-utils lzop pngcrush rsync schedtool \\
        squashfs-tools xsltproc yasm zip zlib1g-dev git repo
        sudo rm -rf \\
          /usr/share/dotnet \\
          /etc/mysql \\
          /etc/php
        mkdir -p ~/bin
        wget 'https://storage.googleapis.com/git-repo-downloads/repo' -P ~/bin
        chmod +x ~/bin/repo
        sudo cp ~/bin/repo /usr/bin/repo
        git config --global user.name "mmry2940"
        git config --global user.email "mmry2940@gmail.com"

    - name: Downloading source code
      run: |
        mkdir -p $ANDROID_ROOT
        cd $ANDROID_ROOT
        repo init -u https://github.com/Halium/android -b halium-14.0 --depth=1 --git-lfs
        repo sync -c -j12 --fail-fast

    - name: Copy Device Manifest
      run: |
        mkdir -p $ANDROID_ROOT/halium/devices/manifests
        cp lge_judypn.xml $ANDROID_ROOT/halium/devices/manifests/lge_judypn.xml
        mkdir -p $ANDROID_ROOT/.repo/local_manifests
        cp lge_judypn.xml $ANDROID_ROOT/.repo/local_manifests/lge_judypn.xml
    
    - name: Clone device spec source
      run: |
        cd $ANDROID_ROOT
        sudo ./halium/devices/setup judypn

    - name: Build HAL
      run: |
        cd $ANDROID_ROOT
        source $ANDROID_ROOT/build/envsetup.sh
        breakfast judypn
        mka mkbootimg
        mka halium-boot
        mka systemimage
      shell: bash

    - name: Upload mkbootimg
      uses: actions/upload-artifact@v4
      with:
        name: mkbootimg-tools
        path: /home/runner/work/halium/out/host/linux-x86/bin/mkbootimg

    - name: Upload boot image
      uses: actions/upload-artifact@v4
      with:
        name: hybris-boot-image
        path: /home/runner/work/halium/out/target/product/judypn/hybris-boot.img

    - name: Upload system image
      uses: actions/upload-artifact@v4
      with:
        name: system-image
        path: /home/runner/work/halium/out/target/product/judypn/system.img
`;

const BUILD_HAL_SH = `#!/bin/bash
source halium.env
cd $ANDROID_ROOT

# replace something
sed -i 's/external\\/selinux/external\\/selinux external\\/libcurl/g' build/core/main.mk

source build/envsetup.sh
export USE_CCACHE=1
breakfast $DEVICE
make -j$(nproc) hybris-boot
make -j$(nproc) systemimage 

echo "md5sum hybris-boot.img and system.img"
md5sum $ANDROID_ROOT/out/target/product/judypn/hybris-boot.img
md5sum $ANDROID_ROOT/out/target/product/judypn/system.img
`;

const HALIUM_SETUP_SH = `#!/bin/bash
source halium.env
cd $ANDROID_ROOT

./halium/devices/setup judypn
`;

const HALIUM_ENV = `export ANDROID_ROOT=/home/runner/work/halium/
export DEVICE=judypn
export PATH=~/bin:$PATH
export ROOMSERVICE_BRANCHES=lineage-21
export USE_CCACHE=1
`;

export const WorkflowYamlViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'workflow' | 'build-sh' | 'setup-sh' | 'env'>('workflow');
  const [copied, setCopied] = useState(false);

  const getActiveContent = () => {
    switch (activeFile) {
      case 'workflow':
        return { filename: '.github/workflows/build.yml', content: WORKFLOW_YML };
      case 'build-sh':
        return { filename: 'build-hal.sh', content: BUILD_HAL_SH };
      case 'setup-sh':
        return { filename: 'halium-setup.sh', content: HALIUM_SETUP_SH };
      case 'env':
        return { filename: 'halium.env', content: HALIUM_ENV };
    }
  };

  const current = getActiveContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(current.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([current.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = current.filename.split('/').pop() || 'file';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="font-bold text-slate-100 text-base">Automation & Workflow Configuration</h2>
            <p className="text-xs text-slate-400">
              CI workflow definitions and shell scripts for automated remote and local compilation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* File selector tabs */}
          <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex text-xs">
            <button
              onClick={() => setActiveFile('workflow')}
              className={`px-3 py-1 rounded-md transition ${
                activeFile === 'workflow' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              build.yml
            </button>
            <button
              onClick={() => setActiveFile('build-sh')}
              className={`px-3 py-1 rounded-md transition ${
                activeFile === 'build-sh' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              build-hal.sh
            </button>
            <button
              onClick={() => setActiveFile('setup-sh')}
              className={`px-3 py-1 rounded-md transition ${
                activeFile === 'setup-sh' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              halium-setup.sh
            </button>
            <button
              onClick={() => setActiveFile('env')}
              className={`px-3 py-1 rounded-md transition ${
                activeFile === 'env' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              halium.env
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span>Path: <strong className="text-indigo-300">{current.filename}</strong></span>
          <span>Syntax: {activeFile === 'workflow' ? 'YAML' : 'Bash'}</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 whitespace-pre overflow-x-auto max-h-[500px] leading-relaxed shadow-inner">
          {current.content}
        </div>
      </div>
    </div>
  );
};
