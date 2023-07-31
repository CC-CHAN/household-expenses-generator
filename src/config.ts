import path from "path";
import fs from "fs";

const CONFIG_PATH = path.join(
  __dirname,
  process.env.CONFIG_PATH ?? "../default.json"
);

type Config = {
  appName: string;
  server: {
    port: number;
    urlPrefix: string;
    histPath: string;
    templatePath: string;
  };
  model: {
    base: number;
    monthlySalary: number;
    basePercentage: number;
    minRandomSmall: number;
    maxRandomSmall: number;
    minWeight: number;
    maxWeight: number;
    bonusThreshold: number;
  };
  notification: {
    enableMailer: boolean;
    mailerConfig: any;
    toEmail: string;
    bccEmail: string | undefined;
  };
};
const config: Config = JSON.parse(
  fs.readFileSync(CONFIG_PATH, { encoding: "utf-8" })
);
config.server.histPath = path.join(__dirname, config.server.histPath);
config.server.templatePath = path.join(__dirname, config.server.templatePath);
config.server.urlPrefix = config.server.urlPrefix ?? "";

export default config;
