import path from "path";
import fs from "fs";

const CONFIG_PATH = path.join(__dirname, "../config.json");

type Config = {
  server: {
    port: number;
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
  };
};
const config: Config = JSON.parse(
  fs.readFileSync(CONFIG_PATH, { encoding: "utf-8" })
);
config.server.histPath = path.join(__dirname, config.server.histPath);
config.server.templatePath = path.join(__dirname, config.server.templatePath);

export default config;
