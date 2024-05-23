import { exec } from "child_process";
import * as fs from "fs";
import DatabaseConfiguration from "../types/config.type";

export default class DBAutoBackup {
  private dialect: string;
  private host: string;
  private port: string | number;
  private username: string;
  private password: string;
  private database: string;

  constructor(config: DatabaseConfiguration) {
    this.dialect = config.dialect;
    this.host = config.host;
    this.port = config.port;
    this.username = config.username;
    this.password = config.password;
    this.database = config.database;
  }

  private runCommand(command: string, fileNameWithPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(command, (error: any, stdout, stderr) => {
        if (error) {
          reject(new Error(`exec error: ${error}`));
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);

        fs.access(fileNameWithPath, fs.constants.F_OK, (err) => {
          if (err) {
            reject(new Error(`File not found: ${fileNameWithPath}`));
          } else {
            console.log(
              `Database dump was successful and saved to ${fileNameWithPath}`
            );
            resolve();
          }
        });
      });
    });
  }

  public runBackup(fileNameWithPath: string): Promise<void> {
    let command: string | null = null;
    switch (this.dialect) {
      case "mysql":
      case "mariadb":
        command = `mysqldump -h ${this.host} -P ${this.port} -u ${this.username} -p${this.password} ${this.database} > ${fileNameWithPath}`;
        break;
      case "oracle":
        command = `expdp ${this.username}/${this.password}@${this.host}:${this.port}/${this.database} directory=DATA_PUMP_DIR dumpfile=${fileNameWithPath}`;
        break;
      default:
        return Promise.reject(new Error("Unsupported database dialect"));
    }

    return this.runCommand(command, fileNameWithPath);
  }
  public migration(fileNameWithPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 데이터베이스 생성 쿼리
      const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS ${this.database};`;

      // 데이터베이스 생성 쿼리를 먼저 실행
      exec(
        `mysql -h ${this.host} -P ${this.port} -u ${this.username} -p${this.password} -e "${createDatabaseQuery}"`,
        (error: any, stdout, stderr) => {
          if (error) {
            reject(new Error(`Database creation error: ${error}`));
            return;
          }

          console.log(`Database created or already exists.`);

          // 이후에 덤프 파일을 실행하여 데이터베이스에 마이그레이션
          exec(
            `mysql -h ${this.host} -P ${this.port} -u ${this.username} -p${this.password} ${this.database} < ${fileNameWithPath}`,
            (error: any, stdout, stderr) => {
              if (error) {
                reject(new Error(`Migration error: ${error}`));
                return;
              }
              console.log(`Migration completed successfully.`);
              resolve();
            }
          );
        }
      );
    });
  }
}
