import React, { useState, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { WorkflowStepper } from './components/WorkflowStepper';
import { BuildTerminal } from './components/BuildTerminal';
import { ManifestEditor } from './components/ManifestEditor';
import { BootConfigurator } from './components/BootConfigurator';
import { FlashingGuide } from './components/FlashingGuide';
import { WorkflowYamlViewer } from './components/WorkflowYamlViewer';
import { ArtifactsModal } from './components/ArtifactsModal';
import { RealBootPacker } from './components/RealBootPacker';
import { GitHubActionsRunner } from './components/GitHubActionsRunner';
import { BootImageCloudBuilder } from './components/BootImageCloudBuilder';
import { RemotePcGuide } from './components/RemotePcGuide';
import { FullBuildScripts } from './components/FullBuildScripts';
import {
  DEFAULT_RAW_XML,
  PARSED_PROJECTS,
  WORKFLOW_BUILD_STEPS,
  DEVICE_SPECS,
} from './data/manifestData';
import { ManifestProject, BuildStep, BuildLogLine, BootConfig } from './types';
import { Cpu, Download, Terminal, Server, FileCode as FileCodeIcon } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'manifest' | 'config' | 'workflow' | 'flashing' | 'real-boot' | 'cloud-build' | 'cloud-boot' | 'remote-pc' | 'scripts'>('scripts');
  const [projects, setProjects] = useState<ManifestProject[]>(PARSED_PROJECTS);
  const [rawXml, setRawXml] = useState<string>(DEFAULT_RAW_XML);
  const [selectedStep, setSelectedStep] = useState<BuildStep>(WORKFLOW_BUILD_STEPS[0]);

  // Build simulation state
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [currentAction, setCurrentAction] = useState<string>('Ready to build');
  const [logs, setLogs] = useState<BuildLogLine[]>([]);
  const [hasBuilt, setHasBuilt] = useState<boolean>(false);
  const [artifactsModalOpen, setArtifactsModalOpen] = useState<boolean>(false);
  const [speed, setSpeed] = useState<'normal' | 'turbo' | 'instant'>('turbo');

  const [bootConfig, setBootConfig] = useState<BootConfig>({
    device: 'judypn',
    haliumBranch: 'halium-14.0',
    kernelBranch: 'lineage-21',
    targetImage: 'hybris-boot',
    buildSystemImage: true,
    ccache: true,
    ccacheSize: '50G',
    jobs: 12,
    selinuxMode: 'permissive',
    telnetDebug: true,
    usbIp: '192.168.2.15',
    extraCmdline: '',
    pageSize: 4096,
    baseAddress: '0x00000000',
  });

  const abortControllerRef = useRef<boolean>(false);

  // Helper to add log line
  const addLog = (text: string, type: BuildLogLine['type'] = 'info') => {
    const time = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [...prev, { text, type, timestamp: time }]);
  };

  // Build simulation runner
  const startBuild = async () => {
    if (isBuilding) return;

    abortControllerRef.current = false;
    setIsBuilding(true);
    setProgress(0);
    setCompletedSteps([]);
    setLogs([]);
    setCurrentStepIndex(0);
    setActiveTab('pipeline');

    const delay = (ms: number) => {
      if (speed === 'instant') return Promise.resolve();
      const mult = speed === 'turbo' ? 0.2 : 1;
      return new Promise((resolve) => setTimeout(resolve, ms * mult));
    };

    addLog('=== Starting Halium Autobuild for LG V40 / JudyPN (SDM845) ===', 'header');
    addLog(`Target: hybris-boot.img | Halium Base: ${bootConfig.haliumBranch} | Kernel: ${bootConfig.kernelBranch}`, 'info');
    addLog(`Manifest source: lge_judypn.xml (${projects.length} repositories mapped)`, 'info');
    await delay(300);

    // Step 1: Environment Initialization
    setCurrentStepIndex(0);
    setSelectedStep(WORKFLOW_BUILD_STEPS[0]);
    setCurrentAction('1/7 Initializing build environment...');
    setProgress(5);
    addLog('Executing: sudo apt-get update && sudo apt-get install -y openjdk-8-jdk ...', 'cmd');
    await delay(400);
    addLog('Hit:1 http://azure.archive.ubuntu.com/ubuntu jammy InRelease', 'info');
    addLog('Setting up openjdk-8-jdk:amd64 (8u382-ga-1~22.04.1)...', 'info');
    addLog('Installing Android build tools: bc bison flex g++-multilib liblz4-tool git repo...', 'info');
    addLog('Configuring Google git-repo tool to ~/bin/repo (v2.45)', 'success');
    setCompletedSteps((prev) => [...prev, WORKFLOW_BUILD_STEPS[0].id]);
    setProgress(15);
    await delay(400);

    // Step 2: Downloading source code
    setCurrentStepIndex(1);
    setSelectedStep(WORKFLOW_BUILD_STEPS[1]);
    setCurrentAction('2/7 Initializing Halium repo & syncing...');
    setProgress(20);
    addLog('Executing: repo init -u https://github.com/Halium/android -b halium-14.0 --depth=1 --git-lfs', 'cmd');
    await delay(300);
    addLog('repo: manifest has been initialized in /home/runner/work/halium', 'info');
    addLog(`Executing: repo sync -c -j${bootConfig.jobs} --fail-fast`, 'cmd');
    await delay(400);
    addLog('Fetching projects: 100% (420/420), done.', 'info');
    addLog('Syncing work tree: 100% (420/420), done.', 'success');
    setCompletedSteps((prev) => [...prev, WORKFLOW_BUILD_STEPS[1].id]);
    setProgress(35);
    await delay(300);

    // Step 3: Copy Local Device Manifest
    setCurrentStepIndex(2);
    setSelectedStep(WORKFLOW_BUILD_STEPS[2]);
    setCurrentAction('3/7 Injecting lge_judypn.xml local manifest...');
    setProgress(40);
    addLog('Executing: cp lge_judypn.xml $ANDROID_ROOT/.repo/local_manifests/lge_judypn.xml', 'cmd');
    addLog('Parsing device manifest dependencies:', 'info');
    projects.forEach((p) => {
      addLog(` -> [${p.category.toUpperCase()}] ${p.path} @ ${p.revision} (${p.name})`, 'info');
    });
    addLog('Local manifest validation passed: 17 CAF & device targets resolved.', 'success');
    setCompletedSteps((prev) => [...prev, WORKFLOW_BUILD_STEPS[2].id]);
    setProgress(48);
    await delay(300);

    // Step 4: Clone Device Spec Source (halium-setup)
    setCurrentStepIndex(3);
    setSelectedStep(WORKFLOW_BUILD_STEPS[3]);
    setCurrentAction('4/7 Running Halium device setup for judypn...');
    setProgress(52);
    addLog('Executing: ./halium/devices/setup judypn', 'cmd');
    await delay(400);
    addLog('Found device tree for LG JudyPN in device/lge/judypn', 'info');
    addLog('Applying build/core/main.mk SELinux and libcurl hybris patches', 'info');
    addLog('Setting roomservice branch: lineage-21', 'info');
    setCompletedSteps((prev) => [...prev, WORKFLOW_BUILD_STEPS[3].id]);
    setProgress(60);
    await delay(350);

    // Step 5: Build HAL (mkbootimg & halium-boot / hybris-boot)
    setCurrentStepIndex(4);
    setSelectedStep(WORKFLOW_BUILD_STEPS[4]);
    setCurrentAction('5/7 Compiling SDM845 Kernel & hybris-boot.img...');
    setProgress(65);
    addLog('Executing: source build/envsetup.sh && breakfast judypn', 'cmd');
    await delay(400);
    addLog('============================================', 'info');
    addLog('PLATFORM_VERSION_CODENAME=REL', 'info');
    addLog('PLATFORM_VERSION=14', 'info');
    addLog('LINEAGE_VERSION=21.0-judypn-UNOFFICIAL', 'info');
    addLog('TARGET_PRODUCT=lineage_judypn', 'info');
    addLog('TARGET_BUILD_VARIANT=userdebug', 'info');
    addLog('TARGET_BUILD_TYPE=release', 'info');
    addLog('TARGET_ARCH=arm64', 'info');
    addLog('TARGET_CPU_VARIANT=kryo385', 'info');
    addLog('HOST_OS=linux', 'info');
    addLog('============================================', 'info');
    await delay(400);

    addLog('Executing: mka mkbootimg', 'cmd');
    addLog('[  5% 12/214] Building host tool: out/host/linux-x86/bin/mkbootimg', 'info');
    addLog('mkbootimg tool ready.', 'success');
    setProgress(72);
    await delay(300);

    addLog(`Executing: mka -j${bootConfig.jobs} halium-boot`, 'cmd');
    addLog('[ 28% 412/1420] Compiling kernel: arch/arm64/boot/Image.gz-dtb (sdm845_defconfig)', 'info');
    addLog('[ 54% 780/1420] CC drivers/soc/qcom/qcom_ipcc.o', 'info');
    addLog('[ 71% 1024/1420] CC drivers/gpu/drm/msm/adreno/a6xx_gpu.o', 'info');
    addLog('[ 88% 1250/1420] LD vmlinux', 'info');
    addLog('[ 92% 1310/1420] OBJCOPY arch/arm64/boot/Image.gz', 'info');
    addLog('Assembling Hybris Ramdisk (initramfs-tools-halium)...', 'info');
    addLog('Injecting libhybris init scripts and udev rules...', 'info');
    if (bootConfig.telnetDebug) {
      addLog(`Spawning early telnet debug service (listening on ${bootConfig.usbIp}:23)`, 'warn');
    }
    addLog('Packaging out/target/product/judypn/hybris-boot.img (PageSize: 4096, Base: 0x00000000)', 'info');
    addLog('Successfully generated hybris-boot.img (64 MB)', 'success');
    setCompletedSteps((prev) => [...prev, WORKFLOW_BUILD_STEPS[4].id]);
    setProgress(85);
    await delay(400);

    // Step 6: System Image
    if (bootConfig.buildSystemImage) {
      setCurrentStepIndex(5);
      setSelectedStep(WORKFLOW_BUILD_STEPS[5]);
      setCurrentAction('6/7 Assembling Android HAL systemimage...');
      setProgress(88);
      addLog(`Executing: mka -j${bootConfig.jobs} systemimage`, 'cmd');
      await delay(300);
      addLog('[ 95% 1840/1920] Compiling hardware/qcom-caf/sdm845/display HAL...', 'info');
      addLog('[ 98% 1890/1920] Compiling hardware/qcom-caf/sdm845/audio HAL...', 'info');
      addLog('Generating sparse ext4 system.img (1.42 GB)', 'info');
      addLog('Created out/target/product/judypn/system.img', 'success');
      setCompletedSteps((prev) => [...prev, WORKFLOW_BUILD_STEPS[5].id]);
      setProgress(94);
      await delay(300);
    }

    // Step 7: Verify MD5 & Checksums
    setCurrentStepIndex(6);
    setSelectedStep(WORKFLOW_BUILD_STEPS[6]);
    setCurrentAction('7/7 Verifying MD5 Checksums & Artifacts...');
    setProgress(98);
    addLog('Executing: md5sum $ANDROID_ROOT/out/target/product/judypn/hybris-boot.img', 'cmd');
    addLog('a93b4e18d9f10258cb72e01df398a87b  out/target/product/judypn/hybris-boot.img', 'success');
    addLog('3fa8c9e504b86e09e13df974bc28d115  out/target/product/judypn/boot.img', 'success');
    if (bootConfig.buildSystemImage) {
      addLog('Executing: md5sum $ANDROID_ROOT/out/target/product/judypn/system.img', 'cmd');
      addLog('f2c418ab09df073a96e1a4d538622839  out/target/product/judypn/system.img', 'success');
    }
    addLog('=== Halium Autobuild Complete! Images ready for Fastboot flashing ===', 'header');

    setCompletedSteps((prev) => [...prev, WORKFLOW_BUILD_STEPS[6].id]);
    setProgress(100);
    setIsBuilding(false);
    setHasBuilt(true);
    setCurrentAction('Build Completed (100%)');
  };

  const handleClearLogs = () => {
    setLogs([]);
    setProgress(0);
    setCurrentAction('Cleared');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBuilding={isBuilding}
        onStartBuild={startBuild}
        hasBuilt={hasBuilt}
        onOpenArtifacts={() => setArtifactsModalOpen(true)}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Device & Status Quick Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-100 text-base sm:text-lg">
                  Halium Autobuild Studio: {DEVICE_SPECS.name} ({DEVICE_SPECS.codename})
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  SDM845
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: <span className="text-slate-200">hybris-boot.img</span> for Ubuntu Touch / postmarketOS • Local Manifest: <code className="text-indigo-300">lge_judypn.xml</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('scripts')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
            >
              <FileCodeIcon className="w-3.5 h-3.5" />
              <span>Build Scripts</span>
            </button>

            <button
              onClick={() => setActiveTab('remote-pc')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Remote PC Build</span>
            </button>

            <button
              onClick={() => setActiveTab('real-boot')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow transition flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>boot.img Packer</span>
            </button>

            {hasBuilt && (
              <button
                onClick={() => setArtifactsModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold shadow transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Artifacts</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab: Full Halium Build Scripts */}
        {activeTab === 'scripts' && <FullBuildScripts />}

        {/* Tab: Remote PC Build Guide via SSH */}
        {activeTab === 'remote-pc' && <RemotePcGuide />}

        {/* Tab: Build Just Boot Image (No Local PC) */}
        {activeTab === 'cloud-boot' && (
          <BootImageCloudBuilder onNavigateToRealPacker={() => setActiveTab('real-boot')} />
        )}

        {/* Tab: Real Android Boot Image Binary Packer */}
        {activeTab === 'real-boot' && <RealBootPacker />}

        {/* Tab: Real Cloud Build via GitHub Actions */}
        {activeTab === 'cloud-build' && <GitHubActionsRunner />}

        {/* Tab 1: Build Pipeline (Interactive Workflow + Live Terminal) */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            {/* Step 1-7 GitHub Actions Stepper */}
            <WorkflowStepper
              steps={WORKFLOW_BUILD_STEPS}
              currentStepIndex={currentStepIndex}
              selectedStep={selectedStep}
              onSelectStep={setSelectedStep}
              isBuilding={isBuilding}
              completedSteps={completedSteps}
            />

            {/* Terminal with Live Execution */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Live Compilation Terminal (mka mkbootimg & hybris-boot)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Logs from build-hal.sh & halium-setup.sh
                </span>
              </div>

              <BuildTerminal
                logs={logs}
                isBuilding={isBuilding}
                progress={progress}
                currentAction={currentAction}
                onClear={handleClearLogs}
                speed={speed}
                setSpeed={setSpeed}
                onStartBuild={startBuild}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Manifest XML Inspector & Editor */}
        {activeTab === 'manifest' && (
          <ManifestEditor
            projects={projects}
            rawXml={rawXml}
            onUpdateXml={setRawXml}
            onUpdateProjects={setProjects}
          />
        )}

        {/* Tab 3: Boot Configurator */}
        {activeTab === 'config' && (
          <BootConfigurator
            config={bootConfig}
            onChangeConfig={setBootConfig}
            onApplyAndBuild={startBuild}
          />
        )}

        {/* Tab 4: GitHub Actions & Shell Scripts */}
        {activeTab === 'workflow' && <WorkflowYamlViewer />}

        {/* Tab 5: Fastboot Flashing Guide */}
        {activeTab === 'flashing' && <FlashingGuide />}
      </main>

      {/* Artifacts Modal */}
      <ArtifactsModal
        isOpen={artifactsModalOpen}
        onClose={() => setArtifactsModalOpen(false)}
        buildTarget={bootConfig.targetImage}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            LG JudyPN (LG V40 ThinQ / Snapdragon 845) Halium autobuild pipeline • Halium 14.0 / LineageOS 21
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-slate-400">Repository: mmry2940/halium-judypn-autobuild</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
