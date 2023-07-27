import { addMonths, startOfMonth, format as formatter } from "date-fns";

const formatDate = (date: Date, format = "yyyy-MM"): string => {
  return formatter(date, format);
};

const getMonthFirstDay = (date: Date): Date => {
  return startOfMonth(new Date(date.toDateString()));
};

const getNextMonthFirstDay = (date: Date): Date => {
  return addMonths(getMonthFirstDay(date), 1);
};

export { formatDate, getMonthFirstDay, getNextMonthFirstDay };
