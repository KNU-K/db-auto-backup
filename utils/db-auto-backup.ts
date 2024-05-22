import { exec } from "child_process";
import * as fs from "fs";
import DatabaseConfiguration from "../types/config.type";

class DBAutoBackup {
  private dialect: string;
  private host: string;
  private port: string | number;
  private username: string;
  private password: string;
  private database: string;
  private fileNameWithPath: string;

  constructor(config: DatabaseConfiguration, fileNameWithPath: string) {
    this.dialect = config.dialect;
    this.host = config.host;
    this.port = config.port;
    this.username = config.username;
    this.password = config.password;
    this.database = config.database;
    this.fileNameWithPath = fileNameWithPath;
  }

  private runCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`exec error: ${error.message}`));
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);

        fs.access(this.fileNameWithPath, fs.constants.F_OK, (err) => {
          if (err) {
            reject(new Error(`File not found: ${this.fileNameWithPath}`));
          } else {
            console.log(
              `Database dump was successful and saved to ${this.fileNameWithPath}`
            );
            resolve();
          }
        });
      });
    });
  }

  private getBackupCommand(): string {
    switch (this.dialect) {
      case "mysql":
        return `mysqldump -h ${this.host} -P ${this.port} -u ${this.username} -p${this.password} ${this.database} > ${this.fileNameWithPath}`;
      case "oracle":
        return `expdp ${this.username}/${this.password}@${this.host}:${this.port}/${this.database} directory=DATA_PUMP_DIR dumpfile=${this.fileNameWithPath}`;
      case "mariadb":
        return `mysqldump -h ${this.host} -P ${this.port} -u ${this.username} -p${this.password} ${this.database} > ${this.fileNameWithPath}`;
      default:
        throw new Error("Unsupported database dialect");
    }
  }

  public runBackup(): Promise<void> {
    const command = this.getBackupCommand();
    return this.runCommand(command);
  }
}

export default DBAutoBackup;
