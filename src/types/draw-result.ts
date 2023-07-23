type DrawResult = {
  total: number;
  randomSmall: number;
  pay: number;
  bonus: number;
  weight: number;
  raw: {
    base: number;
    monthlySalary: number;
    basePercentage: number;
  };
};

export default DrawResult;
