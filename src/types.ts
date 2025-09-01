// This is like defining props in Vue - we specify what shape our data should have
export interface GitHubRepoOptions {
  name: string;           // Required
  description?: string;   // Optional (the ? makes it optional)
  private?: boolean;      // Optional, defaults to false
  autoInit?: boolean;     // Optional, whether to create README
}

// This defines what GitHub API returns (like typing API responses in Vue)
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  clone_url: string;
}

// Tool result type - what our MCP tools return to Claude
export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;  // Optional additional data
}