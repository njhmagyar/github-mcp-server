import { Octokit } from '@octokit/rest';
import { GitHubRepoOptions, GitHubRepo } from './types';

export class GitHubService {
  private octokit: Octokit;  // 'private' means only this class can access it

  // Constructor - runs when we create a new GitHubService instance
  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  // Async function that returns a Promise<GitHubRepo>
  // This is like async methods in Vue components
  async createRepository(options: GitHubRepoOptions): Promise<GitHubRepo> {
    try {
      const response = await this.octokit.rest.repos.createForAuthenticatedUser({
        name: options.name,
        description: options.description,
        private: options.private ?? false,  // ?? is "nullish coalescing" - uses false if private is undefined
        auto_init: options.autoInit ?? true,
      });

      // TypeScript knows response.data has the right shape because of our types
      return response.data as GitHubRepo;
    } catch (error) {
      // TypeScript helps us handle errors properly
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