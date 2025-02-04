import { spawn } from 'child_process';
import fs from 'fs';

// Function to log with timestamp
function logWithTimestamp(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}`;
  console.log(logMessage);
  
  // Also write to a log file
  fs.appendFileSync('agent.log', logMessage + '\n');
}

// Function to run the agent once
async function runAgent() {
  return new Promise((resolve, reject) => {
    logWithTimestamp('Starting Twitter agent...');
    
    const agent = spawn('pnpm', ['start'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: {
        ...process.env,
        SINGLE_ATTEMPT: 'true'
      }
    });

    // Monitor stdout for login status
    agent.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output); // Still show output in console
      
      // Look for specific login-related messages
      if (output.includes('Logging into Twitter')) {
        logWithTimestamp('Attempting Twitter login...', 'STATUS');
      }
      if (output.includes('Successfully logged in')) {
        logWithTimestamp('Successfully logged into Twitter!', 'SUCCESS');
      }
      if (output.includes('Login failed') || output.includes('Authentication failed')) {
        logWithTimestamp('Failed to login to Twitter', 'ERROR');
      }
      if (output.includes('Arkose')) {
        logWithTimestamp('Encountered Arkose verification challenge', 'WARNING');
      }
    });

    // Monitor stderr for errors
    agent.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(error); // Show error in console
      logWithTimestamp(error, 'ERROR');
    });

    agent.on('exit', (code) => {
      if (code === 0) {
        logWithTimestamp('Agent exited successfully', 'SUCCESS');
        resolve();
      } else {
        const errorMsg = `Agent exited with code ${code}`;
        logWithTimestamp(errorMsg, 'ERROR');
        reject(new Error(errorMsg));
      }
    });

    agent.on('error', (err) => {
      logWithTimestamp(`Failed to start agent: ${err.message}`, 'ERROR');
      reject(err);
    });
  });
}

// Main function
async function main() {
  try {
    logWithTimestamp('=== Starting Twitter Agent (Single Attempt Mode) ===');
    await runAgent();
  } catch (error) {
    logWithTimestamp(`Fatal error: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

main();
