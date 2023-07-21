import _ from "lodash";
import config from "@/config";

const getLuckPercentage = (weight: number): number => {
  const onePercentRange = weight / 100;
  return config.model.basePercentage + onePercentRange;
};

const getPayByLuck = (percentage: number): number => {
  return percentage * config.model.monthlySalary + config.model.base;
};

const addBonus = (weight: number) => {
  const threshold = 0.8;

  if (weight <= threshold) {
    return 0;
  }

  // const factor = (0.01 / (1 - threshold)) * 100;
  // return BASE * factor * (weight - threshold);
  return config.model.base * weight;
};

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

const draw = (
  weight: number = _.random(config.model.minWeight, config.model.maxWeight),
  randomSmall: number = _.random(
    config.model.minRandomSmall,
    config.model.maxRandomSmall
  )
): DrawResult => {
  const totalPercentage = getLuckPercentage(weight);
  const pay = getPayByLuck(totalPercentage);
  const bonus = addBonus(weight);

  return {
    total: pay + bonus + randomSmall,
    randomSmall: randomSmall,
    pay: pay,
    bonus: bonus,
    weight: weight,
    raw: {
      base: config.model.base,
      monthlySalary: config.model.monthlySalary,
      basePercentage: config.model.basePercentage,
    },
  };
};

export { draw, DrawResult };
