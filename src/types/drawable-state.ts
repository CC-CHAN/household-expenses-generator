import DrawHist from "./draw-hist";
import DrawState from "./draw-state";

type DrawableState =
  | {
      drawState: DrawState.DRAWABLE;
      lastDraw: DrawHist | undefined;
    }
  | {
      drawState: DrawState.PAID | DrawState.PENDING;
      lastDraw: DrawHist;
    };
export default DrawableState;
