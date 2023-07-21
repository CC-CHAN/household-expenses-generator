import { promises as fs } from "fs";
import path from "path";
import { FastifyBaseLogger } from "fastify";
import config from "@/config";

const init = async (log: FastifyBaseLogger) => {
  const initTemplates = async () => {
    const templateMap: Record<string, string> = {};

    const files = await fs.readdir(config.server.templatePath);
    for (const f of files) {
      const fileName = f.substring(0, f.indexOf("."));
      const filePath = path.join(config.server.templatePath, f);
      log.info(`load template ${fileName} from ${filePath}`);
      templateMap[fileName] = await fs.readFile(filePath, {
        encoding: "utf-8",
      });
    }
    return templateMap;
  };

  return initTemplates();
};

export default init;
