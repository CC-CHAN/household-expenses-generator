import moduleAlias from "module-alias";
moduleAlias.addAlias("@", __dirname.replace("src", "dist"));
//
import init, { TEMPLATE_MAP, COMPONENT_MAP, EMAIL_MAP } from "@/init";
import Fastify from "fastify";
import _ from "lodash";
import ejs from "ejs";
import config from "@/config";
import { readAll, upsert } from "@/tools/hist-manager";
import { draw } from "@/tools/draw";
import { findFirstPayable, isDrawableNow } from "@/tools/validator";
import { formatDate, getNextMonthFirstDay } from "@/tools/date";
import DrawResult from "@/types/draw-result";
import DrawHist from "@/types/draw-hist";
import DrawState from "@/types/draw-state";
import { sendMail } from "@/tools/mailer";

const server = Fastify({
  logger: true,
});

const getHtml = (name: string, params = {}): string => {
  const inner = ejs.render(TEMPLATE_MAP[name], {
    ...params,
    ...COMPONENT_MAP,
  });
  const container = ejs.render(TEMPLATE_MAP["container"], {
    container: inner,
    appName: config.appName,
  });
  return container;
};

const getEmailHtml = (name: string, params = {}): string => {
  return ejs.render(EMAIL_MAP[name], params);
};

const resultToDraw = (
  result: DrawResult,
  dt: Date
): Omit<DrawHist, "updatedDt"> => {
  return {
    date: formatDate(dt, false),
    total: result.total.toFixed(2),
    score: "" + Math.floor(result.weight * 100),
    isPaid: false,
    detail: {
      raw: result.raw,
      randomSmall: result.randomSmall,
      pay: result.pay,
      bonus: result.bonus,
      weight: result.weight,
    },
  };
};

server.get("/", async (req, res) => {
  const { drawState, lastDraw } = await isDrawableNow();
  const params: Record<string, string> = {};
  if (drawState !== DrawState.DRAWABLE) {
    const { score, total } = lastDraw;
    params.score = score;
    params.total = total;
    if (drawState === DrawState.PAID) {
      params.nextDraw = formatDate(getNextMonthFirstDay(new Date()), true);
    }
  }
  params.state = drawState;
  return res.type("text/html").send(getHtml("draw", params));
});

server.get("/draw", async (req, res) => {
  const isDrawable = await isDrawableNow();
  if (!isDrawable) {
    return res.redirect("/");
  }
  const now = new Date();
  const result = resultToDraw(draw(), now);
  const affected = await upsert(result);
  if (affected !== 1) {
    throw Error("Failed to update draw result");
  }
  if (config.notification.enableMailer === true) {
    const emailRes = await sendMail(
      config.notification.toEmail,
      `[${config.appName}] 已完成每月抽獎 (${result.date})`,
      getEmailHtml("new", {
        appName: config.appName,
        date: result.date,
        score: result.score,
        total: result.total,
      }),
      config.notification.bccEmail
    );
    server.log.info(emailRes);
  }
  return res.redirect("/");
});

server.get("/hist", async (req, res) => {
  const records = await readAll();
  const map_records = _.map(records, (x) => {
    x.isPaid = (x.isPaid ? "是" : "否") as any;
    return x;
  });

  const html = getHtml("hist", {
    records: map_records,
  });
  return res.type("text/html").send(html);
});

server.get("/rule", async (req, res) => {
  const min = draw(config.model.minWeight, config.model.minRandomSmall).total;
  const max = draw(config.model.maxWeight, config.model.maxRandomSmall).total;
  const html = getHtml("rule", { min, max });
  return res.type("text/html").send(html);
});

// admin pages
server.get("/admin/benchmark/:times", async (req, res) => {
  const times = (req.params as any).times ?? 100;

  const totals = [];
  for (let i = 0; i < times; i++) {
    const { total, weight } = draw();
    totals.push(total);
  }
  const mean = _.mean(totals);
  return {
    min: draw(config.model.minWeight, config.model.minRandomSmall),
    max: draw(config.model.maxWeight, config.model.maxRandomSmall),
    mean: mean,
    median: totals.sort()[totals.length / 2],
    yearly: mean * 12,
    totalDraw: times,
  };
});

server.get("/admin/pay", async (req, res) => {
  const payableDraw = await findFirstPayable();
  const params: Record<string, string> = { state: DrawState.PAID };
  if (payableDraw && payableDraw.isPaid === false) {
    params.total = payableDraw.total;
    params.date = payableDraw.date;
    params.state = DrawState.PENDING;
  }
  return res.type("text/html").send(getHtml("pay", params));
});

server.get("/admin/paid", async (req, res) => {
  const payableDraw = await findFirstPayable();
  if (!payableDraw) {
    throw Error("Incorrect state to pay");
  }
  const affected = await upsert({ ...payableDraw, isPaid: true });
  if (affected !== 1) {
    throw Error("Failed to update draw result");
  }
  if (config.notification.enableMailer === true) {
    const emailRes = await sendMail(
      config.notification.toEmail,
      `[${config.appName}] 每月抽獎已經存入 (${payableDraw.date})`,
      getEmailHtml("deposit", {
        appName: config.appName,
        nextDraw: formatDate(getNextMonthFirstDay(new Date()), true),
        date: payableDraw.date,
        total: payableDraw.total,
      }),
      config.notification.bccEmail
    );
    server.log.info(emailRes);
  }
  return res.redirect("/");
});

server.setErrorHandler((err, req, res) => {
  server.log.error(err);
  return res.type("text/html").send(getHtml("error", { errorCode: 500 }));
});

server.setNotFoundHandler((req, res) => {
  return res.type("text/html").send(getHtml("error", { errorCode: 404 }));
});

// Run the server!
const start = async () => {
  try {
    await init(server.log);
    await server.listen({ port: config.server.port, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
