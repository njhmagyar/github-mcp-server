import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolResult } from './types.js';
export declare function initializeGitHubService(token: string): void;
export declare const tools: Tool[];
export declare function handleToolCall(name: string, arguments_: any): Promise<ToolResult>;
//# sourceMappingURL=tools.d.ts.map