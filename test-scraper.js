// Simple test script to verify scraper execution
const { spawn } = require('child_process');

console.log('Testing scraper execution...');

// Test command
const testCommand = 'node';
const testArgs = ['scraper_experiment.js', '560037', 'rice', '--mode=search'];

console.log('Command:', testCommand, testArgs.join(' '));

const testProcess = spawn(testCommand, testArgs, {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe']
});

testProcess.stdout.on('data', (data) => {
  console.log('Output:', data.toString());
});

testProcess.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

testProcess.on('close', (code) => {
  console.log(`Test process exited with code ${code}`);
  if (code === 0) {
    console.log('✅ Scraper test successful!');
  } else {
    console.log('❌ Scraper test failed!');
  }
});

// Kill after 10 seconds for testing
setTimeout(() => {
  console.log('Stopping test process...');
  testProcess.kill();
}, 10000); 