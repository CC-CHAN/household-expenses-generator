import _ from "lodash";
import { promises as fs } from "fs";
import config from "@/config";
import DrawHist from "@/types/draw-hist";

const readAll = async (): Promise<DrawHist[]> => {
  let data: DrawHist[] = [];
  try {
    data = JSON.parse(
      await fs.readFile(config.server.histPath, { encoding: "utf-8" })
    );
  } catch (e) {}
  const records = _.chain(data)
    .sortBy((x) => x.date)
    .reverse()
    .value();
  return records;
};

const getLast = async (): Promise<DrawHist | undefined> => {
  const [draw] = await readAll();
  return draw;
};

const upsert = async (draw: Omit<DrawHist, "updatedDt">): Promise<number> => {
  let matched = false;
  const draws = await readAll();
  const upsertedDraw: DrawHist = { ...draw, updatedDt: new Date() };
  _.forEach(draws, (x) => {
    if (x.date === draw.date) {
      x = _.merge(x, upsertedDraw);
      matched = true;
    }
  });
  if (!matched) {
    draws.push(upsertedDraw);
  }

  try {
    await fs.writeFile(config.server.histPath, JSON.stringify(draws));
    return 1;
  } catch (e) {
    return 0;
  }
};

export { readAll, getLast, upsert };
