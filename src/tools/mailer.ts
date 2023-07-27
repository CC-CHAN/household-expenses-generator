import { MAILER } from "@/init";

const verify = async () => {
  if (MAILER == null) {
    return false;
  }
  return MAILER.verify();
};

const sendMail = async (
  to: string,
  subject: string,
  html: string,
  bcc: string | undefined
) => {
  if ((await verify()) === false) {
    throw new Error("Error with mail client");
  }
  return MAILER!.sendMail({
    to: to,
    bcc: bcc,
    subject: subject,
    html: html,
  });
};

export { verify, sendMail };
