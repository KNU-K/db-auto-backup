type DatabaseConfiguration = {
  dialect: "mysql" | "oracle" | "mariadb";
  host: string;
  port: string | number;
  username: string;
  password: string;
  database: string;
};

export default DatabaseConfiguration;
