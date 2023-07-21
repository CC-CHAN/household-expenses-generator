import _ from "lodash";
import { promises as fs } from "fs";
import config from "@/config";

type DrawHist = {
  date: string;
  total: string;
  score: string;
  isPaid: boolean;
  updatedDt: Date;
  detail: {
    raw: { base: number; monthlySalary: number; basePercentage: number };
    randomSmall: number;
    pay: number;
    bonus: number;
    weight: number;
  };
};

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

const upsert = async (draw: DrawHist): Promise<void> => {
  let matched = false;
  const draws = await readAll();
  _.forEach(draws, (x) => {
    if (x.date === draw.date) {
      x = _.merge(x, draw);
      matched = true;
    }
  });
  if (!matched) {
    draws.push(draw);
  }
  await fs.writeFile(config.server.histPath, JSON.stringify(draws));
};

export { readAll, getLast, upsert, DrawHist };
