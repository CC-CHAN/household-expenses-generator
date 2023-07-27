import { getLast, readAll } from "@/tools/hist-manager";
import { getMonthFirstDay, formatDate } from "@/tools/date";
import DrawableState from "@/types/drawable-state";
import DrawState from "@/types/draw-state";
import DrawHist from "@/types/draw-hist";
import _ from "lodash";

const getDrawStateByHist = (hist: DrawHist): DrawState => {
  return hist.isPaid ? DrawState.PAID : DrawState.PENDING;
};

const isDrawableNow = async (): Promise<DrawableState> => {
  const lastDraw = await getLast();
  if (!lastDraw) {
    return { drawState: DrawState.DRAWABLE, lastDraw: undefined };
  }
  const monthFirstDay = getMonthFirstDay(new Date());
  const isDrawable = lastDraw.date !== formatDate(monthFirstDay);
  return {
    drawState: isDrawable ? DrawState.DRAWABLE : getDrawStateByHist(lastDraw),
    lastDraw,
  };
};

const findFirstPayable = async (): Promise<DrawHist | undefined> => {
  const draws = await readAll();
  return _.findLast(draws, (x) => x.isPaid === false);
};

export { isDrawableNow, findFirstPayable };
