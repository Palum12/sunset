const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

const androidDir = path.join(process.cwd(), 'android');
if (!fs.existsSync(androidDir)) {
  console.error('Android project not found. Run expo prebuild first.');
  process.exit(1);
}

const isWindows = process.platform === 'win32';
const gradleCommand = isWindows ? 'gradlew.bat' : './gradlew';
const gradlePath = path.join(androidDir, gradleCommand);

if (!fs.existsSync(gradlePath)) {
  console.error(`Gradle wrapper not found at ${gradlePath}`);
  process.exit(1);
}

const result = spawnSync(gradleCommand, ['assembleDebug'], {
  cwd: androidDir,
  stdio: 'inherit',
  shell: isWindows,
});

if (result.error) {
  console.error(result.error.message || result.error);
  process.exit(result.status ?? 1);
}

process.exit(result.status ?? 0);
