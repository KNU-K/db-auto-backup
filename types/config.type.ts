type DatabaseConfiguration = {
  dialect: string;
  host: string;
  port: string | number;
  username: string;
  password: string;
  database: string;
};

export default DatabaseConfiguration;
