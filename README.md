# n8n-nodes-websocket-stream

A production-ready custom n8n node for streaming data continuously from a WebSocket connection. This node establishes a persistent WebSocket connection and emits each incoming message to the workflow.

## Features

- **Continuous Streaming:** Maintains an open WebSocket connection and streams each incoming message as a workflow item.
- **Automatic Reconnection:** Optionally reconnects if the connection closes or errors out.
- **Strict Type Checking:** Built with TypeScript using strict compiler settings.
- **Type Declarations & Source Maps:** Generates declaration files and source maps for improved developer experience.
- **Community Node Format:** Configured to work with the standard file layout (nodes and credentials folders) expected by n8n community nodes.

## Installation

Install the package from npm:

```bash
npm install n8n-nodes-websocket-stream
