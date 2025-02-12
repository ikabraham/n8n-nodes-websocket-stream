import {
	ITriggerFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from "n8n-workflow";

export class WebSocketStream implements INodeType {
	description: INodeTypeDescription = {
		displayName: "WebSocket Stream",
		name: "webSocketStream",
		group: ["trigger"],
		version: 1,
		description: "Streams data continuously from a WebSocket connection",
		defaults: {
			name: "WebSocket Stream",
		},
		inputs: [],
		outputs: ["main"],
		properties: [
			{
				displayName: "WebSocket URL",
				name: "url",
				type: "string",
				default: "ws://localhost:8080",
				placeholder: "wss://example.com",
				description: "The URL of the WebSocket server.",
			},
			{
				displayName: "Reconnect on Error",
				name: "reconnect",
				type: "boolean",
				default: true,
				description: "Automatically try to reconnect if the connection closes or errors out.",
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<() => Promise<void>> {
		// Read node parameters.
		const url = this.getNodeParameter("url", 0) as string;
		const reconnect = this.getNodeParameter("reconnect", 0) as boolean;

		// Import the ws package.
		const WebSocket = require("ws");

		// Function to establish and maintain the connection.
		let ws: any;
		let isActive = true;

		const connect = () => {
			ws = new WebSocket(url);

			ws.on("open", () => {
				this.logger.info(`Connected to WebSocket at ${url}`);
			});

			ws.on("message", (message: string) => {
				// Each incoming message is emitted as a new workflow item.
				const newItem: INodeExecutionData = { json: { message: message.toString() } };
				this.emit([ [newItem] ]);
			});

			ws.on("close", () => {
				this.logger.info("WebSocket connection closed");
				// Optionally reconnect if the node is still active.
				if (isActive && reconnect) {
					setTimeout(connect, 1000);
				}
			});

			ws.on("error", (error: Error) => {
				this.logger.error(`WebSocket error: ${error}`);
				// Close the socket on error so that 'close' is emitted.
				ws.close();
			});
		};

		// Establish the connection.
		connect();

		// Return the close function that is called when the workflow is deactivated.
		return async () => {
			isActive = false;
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.close();
			}
			this.logger.info("WebSocket Stream node closed");
		};
	}
}
