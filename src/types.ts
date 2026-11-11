export interface ManifestProject {
  path: string;
  name: string;
  revision: string;
  remote?: string;
  category: 'device' | 'kernel' | 'vendor' | 'hardware' | 'sepolicy';
  description?: string;
}

export interface BuildStep {
  id: string;
  name: string;
  command: string;
  description: string;
  durationEst: string;
  details: string[];
}

export interface BuildLogLine {
  text: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'cmd' | 'header';
  timestamp: string;
}

export interface BootConfig {
  device: string;
  haliumBranch: string;
  kernelBranch: string;
  targetImage: 'hybris-boot' | 'halium-boot' | 'both';
  buildSystemImage: boolean;
  ccache: boolean;
  ccacheSize: string;
  jobs: number;
  selinuxMode: 'permissive' | 'enforcing';
  telnetDebug: boolean;
  usbIp: string;
  extraCmdline: string;
  pageSize: number;
  baseAddress: string;
}
