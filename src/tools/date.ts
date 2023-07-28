import { addMonths, startOfMonth, format as formatter } from "date-fns";

const yyyyMMFormatter = "yyyy年MM月";
const yyyyMMddFormatter = "yyyy年MM月dd日";

const formatDate = (date: Date, withDay: boolean): string => {
  const format = withDay ? yyyyMMddFormatter : yyyyMMFormatter;
  return formatter(date, format);
};

const getMonthFirstDay = (date: Date): Date => {
  return startOfMonth(new Date(date.toDateString()));
};

const getNextMonthFirstDay = (date: Date): Date => {
  return addMonths(getMonthFirstDay(date), 1);
};

export {
  formatDate,
  getMonthFirstDay,
  getNextMonthFirstDay,
  yyyyMMddFormatter,
};
