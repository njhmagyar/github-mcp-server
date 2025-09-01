import * as nodePath from 'node:path';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { FileSystemService } from './file-system-service.js';
import { GitHubService } from './github-service.js';
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
  },
  {
    name: 'initialize_git_repository',
    description: 'Initializes a directory with version control, creating the folder if necessary',
    inputSchema: {
      type: 'object',
      properties: {
        baseDirectory: {
          type: 'string',
          description: 'Absolute path of the directory to initialize (becomes the parent of the git directory if newDirectoryName is present)'
        },
        newDirectoryName: {
          type: 'string',
          description: 'Name of the directory to initialize with git if it does not exist yet'
        }
      },
      required: ['baseDirectory']
    }
  },
  {
    name: 'bootstrap_project',
    description: 'Creates a local directory at a given path, initializes it as a git repo, and creates a remote repository on GitHub',
    inputSchema: {
      type: 'object',
      properties: {
        baseDirectory: {
          type: 'string',
          description: 'Absolute path of the directory to initialize (becomes the parent of the git directory if newDirectoryName is present)'
        },
        projectName: {
          type: 'string',
          description: 'Name of the directory to initialize with git if it does not exist yet'
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

    case 'initialize_git_repository':
      return await initializeGitRepository(arguments_);

    case 'bootstrap_project':
      return await bootstrapProject(arguments_);

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

async function initializeGitRepository(args: any): Promise<ToolResult> {
  const path = args.newDirectoryName ? nodePath.join(args.baseDirectory, args.newDirectoryName) : args.baseDirectory;
  return FileSystemService.initializeGit(path);
}

async function bootstrapProject(args: any): Promise<ToolResult> {
  const path = nodePath.join(args.baseDirectory, args.projectName);
  const initializedGitResult = await initializeGitRepository(args);
  if (!initializedGitResult.success) {
    return {
      success: false,
      message: `Error initializing git repo at ${path}: ${initializedGitResult.message}`
    }
  }
  const repoResult = await createGitHubRepo({
    name: args.projectName,
    description: args.description ?? '',
    private: args.private ?? false
  })
  if (!repoResult.success) {
    return {
      success: false,
      message: `Initialized git repo at ${path} but failed to create remote repository: ${repoResult.message}`
    }
  }
  return {
    success: true,
    message: `Successfully bootstrapped project '${args.projectName}': local git repo at ${path} and GitHub repo created`,
    data: {
      localPath: path,
      githubRepo: repoResult.data
    }
  }
}