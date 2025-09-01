import * as fs from 'fs/promises';
export class FileSystemService {
    static async directoryExists(path) {
        try {
            await fs.access(path);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    static async createDirectory(path) {
        try {
            const exists = await FileSystemService.directoryExists(path);
            if (exists) {
                return {
                    success: false,
                    message: `Directory already exists at ${path}!`
                };
            }
            await fs.mkdir(path, { recursive: true });
            return {
                success: true,
                message: `Created directory at ${path}`,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                return {
                    success: false,
                    message: `Failed to create directory at ${path}: ${error.message}`
                };
            }
            return {
                success: false,
                message: 'Unknown error occurred creating directory'
            };
        }
    }
}
