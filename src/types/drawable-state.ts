import DrawHist from "./draw-hist";

type DrawableState =
  | {
      isDrawable: true;
      lastDraw: DrawHist | undefined;
    }
  | {
      isDrawable: false;
      lastDraw: DrawHist;
    };
export default DrawableState;
