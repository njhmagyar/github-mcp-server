import { GitHubRepoOptions, GitHubRepo } from './types.js';
export declare class GitHubService {
    private octokit;
    constructor(token: string);
    createRepository(options: GitHubRepoOptions): Promise<GitHubRepo>;
    listRepositories(): Promise<GitHubRepo[]>;
}
//# sourceMappingURL=github-service.d.ts.map