import { spawn } from 'child_process';

// Function to run the agent once
async function runAgent() {
  return new Promise((resolve, reject) => {
    const agent = spawn('pnpm', ['start'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        SINGLE_ATTEMPT: 'true' // Add this flag to indicate single attempt mode
      }
    });

    agent.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Agent exited with code ${code}`));
      }
    });

    agent.on('error', (err) => {
      reject(err);
    });
  });
}

// Main function
async function main() {
  try {
    console.log('Starting agent (single attempt)...');
    await runAgent();
  } catch (error) {
    console.error('Failed to start agent:', error.message);
    process.exit(1);
  }
}

main();
