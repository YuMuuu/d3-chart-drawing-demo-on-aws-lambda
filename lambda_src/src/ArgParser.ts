import { InputData, InputDatas } from "./types/InputDatas";
import type { Raw } from "./types/Raws";

export class ArgParser {
  parse(raws: Raw[]): InputDatas {
    return new InputDatas(
      raws.map((raw) => {
        return new InputData(raw.label, raw.color, raw.proportion);
      })
    );
  }
}
