/**
 *
 */
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
  private makeChildProcess() {
    if (this.dialect == "mysql") {
      // 명령어 실행
      const mysqlDumpCommand: string = `mysqldump -h ${this.host} -P ${this.port} -u ${this.username} -p${this.password} ${this.database} > ${this.fileNameWithPath}`;

      // 명령어 실행
      exec(mysqlDumpCommand, (error: any, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);

        // 덤프 파일이 생성되었는지 확인
        fs.access(this.fileNameWithPath, fs.constants.F_OK, (err) => {
          if (err) {
            console.error(`File not found: ${this.fileNameWithPath}`);
          } else {
            console.log(
              `Database dump was successful and saved to ${this.fileNameWithPath}`
            );
          }
        });
      });
    }
  }
  public runBackup() {
    this.makeChildProcess();
  }
}
export default DBAutoBackup;
