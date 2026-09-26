const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1500);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function ensureDatabase() {
  const isRunning = await checkPort(3306);
  if (!isRunning) {
    console.log('\x1b[33m[DATABASE] MySQL is not detected on port 3306.\x1b[0m');
    const fs = require('fs');
    const xamppMysql = 'C:\\xampp\\mysql\\bin\\mysqld.exe';
    if (fs.existsSync(xamppMysql)) {
      console.log('\x1b[36m[DATABASE] Attempting to start MySQL from XAMPP...\x1b[0m');
      spawn(xamppMysql, ['--defaults-file=C:\\xampp\\mysql\\bin\\my.ini'], {
        detached: true,
        stdio: 'ignore'
      }).unref();
      // Give MySQL 3 seconds to spin up
      await new Promise(r => setTimeout(r, 3000));
    } else {
      console.log('\x1b[31m[DATABASE] Please ensure MySQL/MariaDB is running on port 3306 before proceeding.\x1b[0m');
    }
  } else {
    console.log('\x1b[32m[DATABASE] MySQL detected and running on port 3306.\x1b[0m');
  }
}

function startProcess(name, command, args, cwd, color) {
  const proc = spawn(command, args, {
    cwd,
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  const prefix = `${color}[${name}]\x1b[0m `;

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/);
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${prefix}${line}`);
      }
    }
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/);
    for (const line of lines) {
      if (line.trim()) {
        console.error(`${prefix}\x1b[31m${line}\x1b[0m`);
      }
    }
  });

  proc.on('close', (code) => {
    console.log(`${prefix}process exited with code ${code}`);
  });

  return proc;
}

async function main() {
  console.log('\x1b[35m=== Starting Commerza Project ===\x1b[0m');
  await ensureDatabase();

  const backendDir = path.join(__dirname, 'backend');
  const frontendDir = path.join(__dirname, 'frontend');

  console.log('\x1b[36mStarting Backend (NestJS on port 3000)...\x1b[0m');
  const backendProc = startProcess('BACKEND', 'npm', ['run', 'start:dev'], backendDir, '\x1b[34m');

  console.log('\x1b[32mStarting Frontend (Next.js on port 3001)...\x1b[0m');
  const frontendProc = startProcess('FRONTEND', 'npm', ['run', 'dev'], frontendDir, '\x1b[32m');

  const cleanup = () => {
    console.log('\n\x1b[33mShutting down Commerza services...\x1b[0m');
    try {
      if (process.platform === 'win32') {
        if (backendProc.pid) spawn('taskkill', ['/pid', backendProc.pid.toString(), '/f', '/t']);
        if (frontendProc.pid) spawn('taskkill', ['/pid', frontendProc.pid.toString(), '/f', '/t']);
      } else {
        backendProc.kill();
        frontendProc.kill();
      }
    } catch (e) {}
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main();
