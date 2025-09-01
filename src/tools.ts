import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GitHubService } from './github-service';
import { ToolResult } from './types';

// This is our GitHub service instance - we'll initialize it later
let githubService: GitHubService;

export function initializeGitHubService(token: string): void {
  githubService = new GitHubService(token);
}

// Define our tools - these are what Claude can call
export const tools: Tool[] = [
  {
    name: 'create_github_repo',
    description: 'Create a new GitHub repository',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Repository name (required)'
        },
        description: {
          type: 'string',
          description: 'Repository description (optional)'
        },
        private: {
          type: 'boolean',
          description: 'Make repository private (default: false)'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'list_github_repos',
    description: 'List your GitHub repositories',
    inputSchema: {
      type: 'object',
      properties: {},  // No parameters needed
      required: []
    }
  }
];

// Tool handlers - these functions run when Claude calls our tools
export async function handleToolCall(name: string, arguments_: any): Promise<ToolResult> {
  switch (name) {
    case 'create_github_repo':
      return await createGitHubRepo(arguments_);

    case 'list_github_repos':
      return await listGitHubRepos();

    default:
      return {
        success: false,
        message: `Unknown tool: ${name}`
      };
  }
}

// Individual tool implementations
async function createGitHubRepo(args: any): Promise<ToolResult> {
  try {
    // TypeScript helps us validate the arguments have the right structure
    const repo = await githubService.createRepository({
      name: args.name,
      description: args.description,
      private: args.private
    });

    return {
      success: true,
      message: `Successfully created repository: ${repo.name}`,
      data: {
        name: repo.name,
        url: repo.html_url,
        clone_url: repo.clone_url
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function listGitHubRepos(): Promise<ToolResult> {
  try {
    const repos = await githubService.listRepositories();

    return {
      success: true,
      message: `Found ${repos.length} repositories`,
      data: repos.map(repo => ({
        name: repo.name,
        url: repo.html_url,
        private: repo.private
      }))
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}