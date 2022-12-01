export class InputData {
  readonly label: string;
  readonly color: string;
  readonly proportion: number;

  constructor(label: string, color: string, proportion: number) {
    this.label = label;
    this.color = color;
    this.proportion = proportion;
  }
}
