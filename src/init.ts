import { promises as fs } from "fs";
import path from "path";
import { FastifyBaseLogger } from "fastify";
import config from "@/config";
import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

let TEMPLATE_MAP: Record<string, string>;
let COMPONENT_MAP: Record<string, string>;
let MAILER: Transporter<SMTPTransport.SentMessageInfo> | undefined;

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

  const initMailer = async () => {
    if (config.notification.enableMailer !== true) {
      return undefined;
    }
    log.info("init mailer...");
    const mailer = nodemailer.createTransport(config.notification.mailerConfig);
    await mailer.verify();
    log.info("mailer is initiated");
    return mailer;
  };

  TEMPLATE_MAP = await initTemplates(config.server.templatePath);
  COMPONENT_MAP = await initTemplates(
    path.join(config.server.templatePath, "components")
  );
  MAILER = await initMailer();
};

export default init;
export { MAILER, TEMPLATE_MAP, COMPONENT_MAP };
