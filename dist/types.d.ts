export interface GitHubRepoOptions {
    name: string;
    description?: string;
    private?: boolean;
    autoInit?: boolean;
}
export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    clone_url: string;
    private: boolean;
}
export interface ToolResult {
    success: boolean;
    message: string;
    data?: any;
}
//# sourceMappingURL=types.d.ts.map