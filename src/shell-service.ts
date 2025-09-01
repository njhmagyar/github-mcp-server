import { exec } from 'child_process';
import { ShellCommandResult } from './types.js';

export class ShellService {

  static async runShellCommand(workingDirectory: string, command: string): Promise<ShellCommandResult> {
    return new Promise((resolve, reject) => {
      exec(command, {cwd: workingDirectory}, (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }
        if (stderr) {
          console.warn(`Command stderr: ${stderr}`);
        }
        resolve({
          stdout,
          stderr
        });
      })
    })
  }
}