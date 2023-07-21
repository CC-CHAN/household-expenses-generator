import moduleAlias from "module-alias";
moduleAlias.addAlias("@", __dirname.replace("src", "dist"));
//
import init from "@/init";
import fastify from "fastify";
import _ from "lodash";
import ejs from "ejs";
import config from "@/config";
import { DrawHist, readAll, upsert } from "@/tools/hist-manager";
import { DrawResult, draw } from "@/tools/draw";
import { isDrawableNow } from "@/tools/validator";
import { formatDate, getNextMonthFirstDay } from "./tools/date";

const server = fastify({
  logger: true,
});

let TEMPLATE_MAP: Record<string, string> = {};

const getHtml = (name: string, params = {}): string => {
  const inner = ejs.render(TEMPLATE_MAP[name], params);
  const container = ejs.render(TEMPLATE_MAP["container"], {
    container: inner,
  });
  return container;
};

// state: drawable, pending, paid
server.get("/play", async (req, res) => {
  const isDrawable = await isDrawableNow();
  return { isDrawable };
});

// state: drawable, pending, paid
server.get("/", async (req, res) => {
  const { isDrawable, lastDraw } = await isDrawableNow();
  const params: Record<string, string> = {};
  if (isDrawable) {
    params.state = "drawable";
    return res.type("text/html").send(getHtml("draw", params));
  }
  const { isPaid, score, total } = lastDraw;
  params.score = score;
  params.total = total;
  if (isPaid) {
    params.state = "paid";
    params.nextDraw = formatDate(
      getNextMonthFirstDay(new Date()),
      "yyyy-MM-dd"
    );
  } else {
    params.state = "pending";
  }
  return res.type("text/html").send(getHtml("draw", params));
});

server.get("/draw", async (req, res) => {
  const isDrawable = await isDrawableNow();
  if (!isDrawable) {
    return res.redirect("/");
  }
  const now = new Date();
  const result = resultToDraw(draw(), now);
  await upsert(result);
  return res.redirect("/");
});

const resultToDraw = (result: DrawResult, dt: Date): DrawHist => {
  return {
    date: formatDate(dt),
    total: result.total.toFixed(2),
    score: "" + Math.floor(result.weight * 100),
    isPaid: false,
    updatedDt: new Date(),
    detail: {
      raw: result.raw,
      randomSmall: result.randomSmall,
      pay: result.pay,
      bonus: result.bonus,
      weight: result.weight,
    },
  };
};

server.post("/gen", async (req, res) => {
  return res.redirect("/");
});

server.get("/static", async (req, res) => {
  const [min, max] = [
    draw(config.model.minWeight, config.model.minRandomSmall),
    draw(config.model.maxWeight, config.model.maxRandomSmall),
  ];
  return { min, max };
});

// static pages
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
  const html = getHtml("rule");
  return res.type("text/html").send(html);
});

// Run the server!
const start = async () => {
  try {
    TEMPLATE_MAP = await init(server.log);
    await server.listen({ port: config.server.port });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
