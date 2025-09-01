import { Octokit } from '@octokit/rest';
import fetch from 'node-fetch';
export class GitHubService {
    constructor(token) {
        this.octokit = new Octokit({
            auth: token,
            request: {
                fetch: fetch,
            },
        });
    }
    async createRepository(options) {
        try {
            const response = await this.octokit.rest.repos.createForAuthenticatedUser({
                name: options.name,
                description: options.description,
                private: options.private ?? false,
                auto_init: options.autoInit ?? true,
            });
            return response.data;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create repository: ${error.message}`);
            }
            throw new Error('Unknown error occurred');
        }
    }
    async listRepositories() {
        const response = await this.octokit.rest.repos.listForAuthenticatedUser();
        return response.data;
    }
}
