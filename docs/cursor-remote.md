# Cursor Remote Monitor

## Overview
This adds a lightweight command queue and heartbeat feed so you can monitor a local Cursor session
and send new instructions from the Admin panel. It does not directly control Cursor; the local
agent simply writes new commands into `commands/remote-commands.md` for you to open.

## Server Environment
- CURSOR_REMOTE_AGENT_TOKEN: Shared secret used by the remote agent endpoints

## Local Agent Environment
- CURSOR_REMOTE_BASE_URL: Your Vercel URL (for example https://your-app.vercel.app)
- CURSOR_REMOTE_AGENT_TOKEN: Same shared secret as the server
- CURSOR_REMOTE_AGENT_ID: Optional agent identifier (defaults to hostname)
- CURSOR_REMOTE_POLL_INTERVAL_MS: Optional poll interval (default 5000)
- CURSOR_REMOTE_HEARTBEAT_INTERVAL_MS: Optional heartbeat interval (default 15000)
- CURSOR_REMOTE_WRITE_DIR: Optional output directory (default commands)
- CURSOR_REMOTE_WRITE_FILE: Optional output file (default remote-commands.md)

## Behavior Notes
- Admins can issue commands from the Admin panel.
- The local agent claims commands, writes them to `commands/remote-commands.md`, and marks them completed.
- Heartbeats show current task and last message in the admin dashboard.
