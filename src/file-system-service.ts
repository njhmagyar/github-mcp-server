import * as fs from 'fs/promises';
import { ToolResult } from './types.js';
import { ShellService } from './shell-service.js';

export class FileSystemService {

  private static async directoryExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async createDirectory(path: string): Promise<ToolResult> {
    try {
      const exists = await FileSystemService.directoryExists(path);
      if (exists) {
        return {
          success: false,
          message: `Directory already exists at ${path}!`
        }
      }
      await fs.mkdir(path, { recursive: true });
      return {
        success: true,
        message: `Created directory at ${path}`,
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          message: `Failed to create directory at ${path}: ${error.message}`
        }
      }
      return {
        success: false,
        message: 'Unknown error occurred creating directory'
      }
    }
  }

  static async initializeGit(directoryPath: string): Promise<ToolResult> {
    try {
      await fs.access(directoryPath);
    } catch (error) {
      console.error('Error checking for existing directory: ', error instanceof Error ? error.message : 'Oops')
      const directoryResult = await this.createDirectory(directoryPath);
      if (!directoryResult.success) {
        return directoryResult;
      }
    }
    try {
      await ShellService.runShellCommand(directoryPath, 'git init');
      return {
        success: true,
        message: 'Git repo initialized successfully!'
      }
    } catch (error) {
      console.log('Error initializing git directory: ', error instanceof Error ? error.message : 'Oops again')
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}