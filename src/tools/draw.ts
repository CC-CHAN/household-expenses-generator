import _ from "lodash";
import config from "@/config";
import DrawResult from "@/types/draw-result";

const getLuckPercentage = (weight: number): number => {
  const onePercentRange = weight / 100;
  return config.model.basePercentage + onePercentRange;
};

const getPayByLuck = (percentage: number): number => {
  return percentage * config.model.monthlySalary + config.model.base;
};

const addBonus = (weight: number) => {
  const threshold = config.model.bonusThreshold;

  if (weight <= threshold) {
    return 0;
  }

  return config.model.base * norm(weight, threshold, config.model.maxWeight);
};

const norm = (value: number, min: number, max: number): number =>
  (value - min) / (max - min);

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

export { draw };
