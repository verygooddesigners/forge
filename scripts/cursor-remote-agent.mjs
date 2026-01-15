import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const baseUrl = process.env.CURSOR_REMOTE_BASE_URL;
const token = process.env.CURSOR_REMOTE_AGENT_TOKEN;
const agentId = process.env.CURSOR_REMOTE_AGENT_ID || os.hostname();
const pollIntervalMs = Number(process.env.CURSOR_REMOTE_POLL_INTERVAL_MS || 5000);
const heartbeatIntervalMs = Number(
  process.env.CURSOR_REMOTE_HEARTBEAT_INTERVAL_MS || 15000
);
const writeDir = process.env.CURSOR_REMOTE_WRITE_DIR || path.join(process.cwd(), 'commands');
const writeFile = process.env.CURSOR_REMOTE_WRITE_FILE || 'remote-commands.md';

if (!baseUrl || !token) {
  console.error(
    'Missing CURSOR_REMOTE_BASE_URL or CURSOR_REMOTE_AGENT_TOKEN environment variables.'
  );
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'x-cursor-agent-token': token,
};

let currentTask = null;
let lastMessage = null;

async function postJson(endpoint, payload) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed (${response.status}): ${text}`);
  }

  return response.json();
}

async function sendHeartbeat(status) {
  try {
    await postJson('/api/remote/agent/heartbeat', {
      agentId,
      status,
      currentTask,
      lastMessage,
      metadata: {
        hostname: os.hostname(),
        platform: process.platform,
        cwd: process.cwd(),
      },
    });
  } catch (error) {
    console.error('Heartbeat error:', error.message);
  }
}

async function claimCommand() {
  const data = await postJson('/api/remote/agent/commands/claim', { agentId });
  return data.command || null;
}

async function completeCommand(commandId, status, resultText, errorText) {
  await postJson('/api/remote/agent/commands/complete', {
    commandId,
    agentId,
    status,
    resultText,
    errorText,
  });
}

async function appendCommand(command) {
  await fs.mkdir(writeDir, { recursive: true });
  const filePath = path.join(writeDir, writeFile);
  const entry = `\n## ${new Date().toISOString()}\n${command.command_text}\n`;
  await fs.appendFile(filePath, entry, 'utf8');
  return filePath;
}

async function runLoop() {
  console.log(`Cursor remote agent started (${agentId}).`);
  await sendHeartbeat('idle');

  setInterval(() => {
    const status = currentTask ? 'busy' : 'idle';
    sendHeartbeat(status);
  }, heartbeatIntervalMs);

  setInterval(async () => {
    if (currentTask) return;
    try {
      const command = await claimCommand();
      if (!command) return;

      currentTask = command.command_text;
      lastMessage = 'Command received';
      await sendHeartbeat('busy');

      const filePath = await appendCommand(command);
      const relativePath = path.relative(process.cwd(), filePath);
      lastMessage = `Saved to ${relativePath}`;
      await completeCommand(
        command.id,
        'completed',
        `Saved to ${relativePath}`,
        null
      );
      console.log(`Command saved to ${relativePath}.`);
    } catch (error) {
      lastMessage = 'Failed to process command';
      console.error('Command handling error:', error.message);
    } finally {
      currentTask = null;
    }
  }, pollIntervalMs);
}

runLoop().catch((error) => {
  console.error('Agent failed to start:', error.message);
  process.exit(1);
});
