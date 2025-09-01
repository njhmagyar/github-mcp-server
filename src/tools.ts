import * as nodePath from 'node:path';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { FileSystemService } from './file-system-service.js';
import { GitHubService } from './github-service.js';  // Note the .js extension
import { ToolResult } from './types.js';

let githubService: GitHubService;

export function initializeGitHubService(token: string): void {
  githubService = new GitHubService(token);
}

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
      properties: {},
      required: []
    }
  },
  {
    name: 'create_local_directory',
    description: 'Create a directory in the local file system',
    inputSchema: {
      type: 'object',
      properties: {
        baseDirectory: {
          type: 'string',
          description: 'Absolute path of the parent directory of the new directory'
        },  
        projectName: {
          type: 'string',
          description: 'Name of the new directory to create'
        }
      },
      required: ['baseDirectory', 'projectName']
    }
  }
];

export async function handleToolCall(name: string, arguments_: any): Promise<ToolResult> {
  switch (name) {
    case 'create_github_repo':
      return await createGitHubRepo(arguments_);

    case 'list_github_repos':
      return await listGitHubRepos();

    case 'create_local_directory':
      return await createLocalDirectory(arguments_);

    default:
      return {
        success: false,
        message: `Unknown tool: ${name}`
      };
  }
}

async function createGitHubRepo(args: any): Promise<ToolResult> {
  try {
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

async function createLocalDirectory(args: any): Promise<ToolResult> {
  const path = nodePath.join(args.baseDirectory, args.projectName);
  return FileSystemService.createDirectory(path);
}