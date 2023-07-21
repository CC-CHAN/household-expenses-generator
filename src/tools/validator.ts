import { DrawHist, getLast } from "@/tools/hist-manager";
import { getMonthFirstDay, formatDate } from "@/tools/date";

type DrawableState =
  | {
      isDrawable: true;
      lastDraw: DrawHist | undefined;
    }
  | {
      isDrawable: false;
      lastDraw: DrawHist;
    };

const isDrawableNow = async (): Promise<DrawableState> => {
  const lastDraw = await getLast();
  if (!lastDraw) {
    return { isDrawable: true, lastDraw: undefined };
  }
  const monthFirstDay = getMonthFirstDay(new Date());
  const isDrawable = lastDraw.date !== formatDate(monthFirstDay);
  return { isDrawable, lastDraw };
};

export { isDrawableNow };
