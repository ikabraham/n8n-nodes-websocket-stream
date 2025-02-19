import {
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeConnectionType,
    IExecuteFunctions
} from "n8n-workflow";
import WebSocket from 'ws';

export class ComfyUIWebSocket implements INodeType {
    description: INodeTypeDescription = {
        displayName: "ComfyUI WebSocket Image Retrieval",
        name: "comfyUIWebSocketImage",
        group: ["output"],
        version: 1,
        description: "Retrieves images from ComfyUI using the WebSocket API",
        defaults: {
            name: "ComfyUI Image",
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        properties: [
            {
                displayName: "ComfyUI Server Address",
                name: "serverAddress",
                type: "string",
                default: "127.0.0.1:8188",
                description: "The address of the ComfyUI server (e.g., 127.0.0.1:8188).",
            },
            {
                displayName: "Client ID",
                name: "clientId",
                type: "string",
                default: "", // Generate in the next node
                description: "The client ID for the WebSocket connection (leave blank to generate one).",
            },
            {
             displayName: 'Prompt ID',
             name: 'promptId',
             type: 'string',
             default: '',
             description: 'The ID of the prompt to listen for.'
           },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const serverAddress = this.getNodeParameter("serverAddress", 0) as string;
        const clientId = this.getNodeParameter("clientId", 0) as string;
        const promptId = this.getNodeParameter("promptId", 0) as string;
        const wsURL = `ws://${serverAddress}/ws?clientId=${clientId}`;

        const executionData: INodeExecutionData[][] = [[]];

        return new Promise((resolve, reject) => {
            const ws = new WebSocket(wsURL);
            let output_images = {};
            let current_node = "";

            ws.onopen = () => {
                this.logger.info(`Connected to ComfyUI WebSocket at ${wsURL}`);
            };

            ws.onmessage = (event) => {
                const out = event.data;
                if (typeof out === 'string') {
                    const message = JSON.parse(out);
                    if (message['type'] === 'executing') {
                        const data = message['data'];
                        if (data['prompt_id'] === promptId) {
                            if (data['node'] === null) {
                                // Execution is done
                                ws.close();
                                const results = Object.entries(output_images).map(([nodeId, images]) => {
                                    return {
                                        nodeId,
                                        images: images.map(image => {
                                            return image.toString('base64') // Convert the image to base64
                                        })
                                    };
                                });

                                executionData[0].push({ json: { results } });
                                resolve(executionData);
                            } else {
                                current_node = data['node'];
                            }
                        }
                    }
                } else {
                    if (current_node === 'save_image_websocket_node') {
                        let images_output = output_images.get(current_node, []);
                        images_output.push(Buffer.from(out.slice(8))); // Append the image data (skip the header)
                        output_images[current_node] = images_output;
                    }
                }
            };

            ws.onerror = (error) => {
                this.logger.error(`WebSocket error: ${error}`);
                reject(error);
            };

            ws.onclose = () => {
                this.logger.info("WebSocket connection closed");
                if (Object.keys(output_images).length === 0) {
                   reject(new Error('No images received'));
                } else {
                   resolve(executionData);
                }
            };
        });
    }
}
