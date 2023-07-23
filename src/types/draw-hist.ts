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

export default DrawHist;
