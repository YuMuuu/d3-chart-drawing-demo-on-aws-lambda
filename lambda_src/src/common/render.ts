import * as fs from "fs";
import { DOMParser } from "@xmldom/xmldom";
import * as canvas from "canvas";
import fetch from "node-fetch";
import { Canvg, presets } from "canvg";

export const saveChartAsPng = async (
  svgElement: HTMLElement,
  width: number,
  height: number,
  outDir: string
) => {
  const preset = presets.node({
    DOMParser,
    canvas,
    fetch,
  });
  const canvasElement = new canvas.Canvas(width, height);
  // 日本語化するための設定
  canvas.registerFont("/var/task/resources/fonts/NotoSansJP-Regular.ttf", {
    family: "Noto Sans JP",
  });
  const ctx = canvasElement.getContext("2d");
  const svgData = svgElement.innerHTML;
  const v = Canvg.fromString(ctx, svgData, preset);
  await v.render();
  const png = canvasElement.toBuffer();
  fs.writeFileSync(`${outDir}/donuts.png`, png);
};
