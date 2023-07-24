import { promises as fs } from "fs";
import path from "path";
import { FastifyBaseLogger } from "fastify";
import config from "@/config";

const init = async (log: FastifyBaseLogger) => {
  const initTemplates = async (initPath: string) => {
    const files = await fs.readdir(initPath, {
      withFileTypes: true,
    });

    const map: Record<string, string> = {};

    for (const f of files) {
      if (f.isDirectory()) {
        continue;
      }
      const filePath = path.join(initPath, f.name);
      const fileName = `${f.name.substring(0, f.name.lastIndexOf("."))}`;
      log.info(`load template ${fileName} from ${filePath}`);
      map[fileName] = await fs.readFile(filePath, {
        encoding: "utf-8",
      });
    }
    return map;
  };

  const templateMap: Record<string, string> = await initTemplates(
    config.server.templatePath
  );
  const componentMap: Record<string, string> = await initTemplates(
    path.join(config.server.templatePath, "components")
  );

  return { templateMap, componentMap };
};

export default init;
