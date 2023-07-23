import { getLast } from "@/tools/hist-manager";
import { getMonthFirstDay, formatDate } from "@/tools/date";
import DrawableState from "@/types/drawable-state";

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
