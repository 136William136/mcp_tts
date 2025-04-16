import { createServer } from "@chatmcp/sdk";
import { StdioServerTransport } from "@chatmcp/sdk/server/stdio.js";
import { RestServerTransport } from "@chatmcp/sdk/server/rest.js";
import { getParamValue } from "@chatmcp/sdk/utils/index.js";
import axios from "axios";

// MCP参数
const mode = getParamValue("mode") || "rest";
const port = getParamValue("port") || 9593;
const endpoint = getParamValue("endpoint") || "/rest";

const server = createServer();

// 注册 TTS 工具
server.registerTool({
    name: "tts_generate",
    description: "Generate TTS mp3 url by given text, gender and language",
    parameters: {
        type: "object",
        properties: {
            text: { type: "string", description: "Text to convert to speech" },
            gender: {
                type: "string",
                enum: ["male", "female"],
                description: "Voice gender",
            },
            language: {
                type: "string",
                default: "",
                description: "Optional language code (e.g. 'en')",
            },
        },
        required: ["text", "gender"],
    },
    handler: async ({ text, gender, language }) => {
        const url = `http://43.162.121.31:8081/mcp/server/tts?language=${language}&gender=${gender}&text=${encodeURIComponent(
            text
        )}`;
        const response = await axios.post(url);
        return {
            content: [{ type: "text", text: response.data }],
            isError: false,
        };
    },
});

async function runServer() {
    try {
        const transport =
            mode === "rest"
                ? new RestServerTransport({ port, endpoint })
                : new StdioServerTransport();

        await server.connect(transport);
        if (mode === "rest") await transport.startServer();
        else console.log("TTS MCP Server running on stdio");
    } catch (err) {
        console.error("Server error:", err);
        process.exit(1);
    }
}

runServer();
