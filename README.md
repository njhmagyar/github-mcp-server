# GitHub MCP Server

A TypeScript-based playground for developing my knowledge of model context processors.

So far I've built tools for:
- Creating a new directory on my local file system
- Initializing a local git environment
- Creating a remote repository on GitHub, based on the name of the newly-created directory
- Listing all of my remote GitHub repositories
- Tying parts 1-3 together in an overaching `bootstrap_project` function

Key considerations I made in the development process:
- What happens if a step in the process fails? How can I reliably surface/handle errors?
- What happens if a local folder already exists when the code goes to create it?
- For each tool definition, which arguments are required vs optional? What are logical defaults for the latter?
