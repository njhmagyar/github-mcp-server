import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';
import { tools, handleToolCall, initializeGitHubService } from './tools';

// Load environment variables (like process.env in Vue)
dotenv.config();

// Create MCP server instance
const server = new Server(
  {
    name: 'github-project-bootstrapper',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},  // We provide tools
    },
  }
);

// Initialize GitHub service with token from environment
const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  console.error('GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

initializeGitHubService(githubToken);

// Handle tool listing (when Claude asks "what tools do you have?")
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools,
  };
});

// Handle tool execution (when Claude calls a tool)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const result = await handleToolCall(name, args);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),  // Pretty-print the result
      },
    ],
  };
});

// Start the server
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('GitHub MCP Server running on stdio');
}

// Run the server (like calling app.listen() in Express)
main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});