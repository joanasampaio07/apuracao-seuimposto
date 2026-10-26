const { fork } = require('child_process');
const path = require('path');

const serverProc = fork(path.join(__dirname, '..', 'server.js'), [], {
  env: { ...process.env, PORT: '5175' },
  stdio: 'inherit'
});

setTimeout(async () => {
  try {
    const { default: run } = await import('./test_turnos.js');
  } catch (e) {
    // test_turnos is commonjs
    require('./test_turnos.js');
  }

  setTimeout(() => {
    serverProc.kill();
    process.exit(0);
  }, 2000);
}, 1500);
