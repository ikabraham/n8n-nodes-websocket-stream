# n8n-nodes-websocket-stream

A custom community node for n8n that establishes a persistent WebSocket connection and streams incoming messages as workflow data.

## Features

- **Continuous Streaming:** Keeps the connection open and emits each incoming message.
- **Reconnect on Error:** Optionally reconnects if the connection is lost.
- **Configurable:** Set the WebSocket URL and reconnection options via node parameters.

## Installation

To install from npm:

```bash
npm install n8n-nodes-websocket-stream
