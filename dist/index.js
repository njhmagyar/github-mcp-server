import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
// Removed dotenv import - we'll get the token from environment variables passed by Claude
import { tools, handleToolCall, initializeGitHubService } from './tools.js'; // Note .js extension
// Token will be passed via environment variables from Claude's config
console.error('Server starting...');
console.error('GitHub token present:', !!process.env.GITHUB_TOKEN);
// Create MCP server instance
const server = new Server({
    name: 'github-project-bootstrapper',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Initialize GitHub service with token from environment or file
let githubToken = process.env.GITHUB_TOKEN;
// If not in environment, try reading from .github_token file
if (!githubToken) {
    try {
        const fs = await import('fs');
        githubToken = fs.readFileSync('.github_token', 'utf8').trim();
        console.error('Token loaded from .github_token file');
    }
    catch (error) {
        console.error('Could not load GitHub token from environment or .github_token file');
        process.exit(1);
    }
}
if (!githubToken) {
    console.error('GITHUB_TOKEN is required');
    process.exit(1);
}
initializeGitHubService(githubToken);
console.error('GitHub service initialized');
// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error('Tools requested');
    return {
        tools: tools,
    };
});
// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    console.error('Tool called:', request.params.name);
    const { name, arguments: args } = request.params;
    const result = await handleToolCall(name, args);
    console.error('Tool result:', result.success ? 'success' : 'failed');
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('GitHub MCP Server connected and ready');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
