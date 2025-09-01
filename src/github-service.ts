import { Octokit } from '@octokit/rest';
import fetch from 'node-fetch';
import { GitHubRepoOptions, GitHubRepo } from './types.js';

export class GitHubService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
      request: {
        fetch: fetch as any,
      },
    });
  }

  async createRepository(options: GitHubRepoOptions): Promise<GitHubRepo> {
    try {
      const response = await this.octokit.rest.repos.createForAuthenticatedUser({
        name: options.name,
        description: options.description,
        private: options.private ?? false,
        auto_init: options.autoInit ?? true,
      });

      return response.data as GitHubRepo;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create repository: ${error.message}`);
      }
      throw new Error('Unknown error occurred');
    }
  }

  async listRepositories(): Promise<GitHubRepo[]> {
    const response = await this.octokit.rest.repos.listForAuthenticatedUser();
    return response.data as GitHubRepo[];
  }
}
