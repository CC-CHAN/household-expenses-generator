import moduleAlias from "module-alias";
moduleAlias.addAlias("@", __dirname.replace("src", "dist"));
//
import init from "@/init";
import Fastify from "fastify";
import _ from "lodash";
import ejs from "ejs";
import config from "@/config";
import { readAll, upsert } from "@/tools/hist-manager";
import { draw } from "@/tools/draw";
import { isDrawableNow } from "@/tools/validator";
import { formatDate, getNextMonthFirstDay } from "@/tools/date";
import DrawResult from "@/types/draw-result";
import DrawHist from "@/types/draw-hist";
import DrawState from "@/types/draw-state";

const server = Fastify({
  logger: true,
});

let TEMPLATE_MAP: Record<string, string> = {};
let COMPONENT_MAP: Record<string, string> = {};

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

server.get("/", async (req, res) => {
  const { drawState, lastDraw } = await isDrawableNow();
  const params: Record<string, string> = {};
  if (drawState !== DrawState.DRAWABLE) {
    const { score, total } = lastDraw;
    params.score = score;
    params.total = total;
    if (drawState === DrawState.PAID) {
      params.nextDraw = formatDate(
        getNextMonthFirstDay(new Date()),
        "yyyy-MM-dd"
      );
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
  return res.redirect("/");
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

server.get("/admin/static", async (req, res) => {
  const [min, max] = [
    draw(config.model.minWeight, config.model.minRandomSmall),
    draw(config.model.maxWeight, config.model.maxRandomSmall),
  ];
  return { min, max };
});

server.get("/admin/toPaid", async (req, res) => {
  const { drawState, lastDraw } = await isDrawableNow();
  if (drawState !== DrawState.PENDING) {
    throw Error("Incorrect state to pay");
  }
  const affected = await upsert({ ...lastDraw, isPaid: true });
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
    const { componentMap, templateMap } = await init(server.log);
    COMPONENT_MAP = componentMap;
    TEMPLATE_MAP = templateMap;
    await server.listen({ port: config.server.port });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
