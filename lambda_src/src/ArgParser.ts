import { InputData, InputDatas } from "./types/InputDatas.js";
import type { Raw } from "./types/Raws.js";

export class ArgParser {
  parse(raws: Raw[]): InputDatas {
    return new InputDatas(
      raws.map((raw) => {
        return new InputData(raw.label, raw.color, raw.proportion);
      })
    );
  }
}
