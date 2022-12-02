import * as d3 from "d3";
import { writeFileSync, createReadStream } from "node:fs";
import { JSDOM } from "jsdom";
import winston from "winston";
import {
  GetObjectCommandInput,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { InputData } from "./types/inputData.js";
import { ChartingConfiguration } from "./types/charingConfiguration.js";
import { PutS3Item } from "./parseS3Event.js";
import { ReadInputFromS3 } from "./common/s3Reader.js";
import { saveChartAsPng } from "./common/render.js";
import { WriteFileToS3 } from "./common/s3Writer.js";

export interface RawInputData {
  label: string;
  color: string;
  proportion: number;
}

export class DrawDonutsChart {
  env: string;
  outDir: string;
  logger: winston.Logger;
  item: PutS3Item;
  constructor(
    env: string,
    outDir: string,
    logger: winston.Logger,
    item: PutS3Item
  ) {
    this.env = env;
    this.outDir = outDir;
    this.logger = logger;
    this.item = item;
  }

  initInputData(rawInputData: RawInputData[]): InputData[] {
    return rawInputData.map(
      (v) => new InputData(v.label, v.color, Number(v.proportion))
    );
  }
  async readRawInputFromS3(item: PutS3Item): Promise<InputData[]> {
    const s3Params: GetObjectCommandInput = {
      Bucket: item.Bucket,
      Key: item.Key,
    };
    const maybeAssets = await ReadInputFromS3(s3Params, this.logger);
    const parsedRawAssets = (
      maybeAssets: string | undefined
    ): RawInputData[] => {
      if (typeof maybeAssets == "string") {
        return JSON.parse(maybeAssets);
      } else {
        throw new Error(
          `cannot fetch valid input from ${s3Params.Bucket}/${s3Params.Key}`
        );
      }
    };
    return this.initInputData(parsedRawAssets(maybeAssets));
  }
  // 凡例を描画する関数
  drawLegend(
    svgElement: d3.Selection<SVGGElement, unknown, null, undefined>,
    row: {
      label: string;
      color: string;
      proportion: number;
    },
    i: number
  ) {
    const margin = 20;
    const firstLegendHeight = 20;
    // 凡例用のテキストの描画

    const ChartLegendGroup = svgElement
      .append("g")
      .attr(
        "transform",
        "translate(20," + (firstLegendHeight + i * margin) + ")"
      );

    ChartLegendGroup.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", row.color);

    ChartLegendGroup.append("text")
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .attr("x", margin)
      .attr("y", 0)
      .attr("dy", 9)
      .text(row.label);
  }

  public async build(): Promise<void> {
    const document = new JSDOM().window.document;

    const width = 600;
    const height = 600;

    const inputs = await this.readRawInputFromS3(this.item);

    const svgDonuts = d3
      .select(document.body)
      .append("svg")
      .attr("class", "donuts-chart")
      .attr("width", width)
      .attr("height", height)
      .attr("xmlns", "http://www.w3.org/2000/svg");

    const g = svgDonuts
      .append("g")
      .attr("class", "DonutsChart")
      .attr(
        "transform",
        "translate(" +
          ChartingConfiguration.width / 2 +
          "," +
          ChartingConfiguration.height / 2 +
          ")"
      );

    // ドーナツチャート本体の描画
    const pie = d3.pie<InputData>().value((d) => {
      return d.proportion;
    });
    const path = d3
      .arc<d3.PieArcDatum<InputData>>()
      .outerRadius(ChartingConfiguration.radius)
      .innerRadius(ChartingConfiguration.innerRadius);

    const arc = g
      .selectAll(".arc")
      .data(pie(inputs))
      .enter()
      .append("g")
      .attr("class", "arc");

    arc
      .append("path")
      .attr("d", path)
      .attr("fill", function (d) {
        return d.data.color;
      });

    // 凡例
    const svgDonutsLegend = svgDonuts
      .append("g")
      .attr("class", "ChartLegend")
      .attr("font-family", "Noto Sans JP")
      .attr("font-size", 10);

    let index = 0;
    for (const row of inputs) {
      this.drawLegend(svgDonutsLegend, row, index);
      index++;
    }
    // 結果をsvgファイルに出力する.
    const outSvgFileName = `${this.outDir}/donuts.svg`;
    writeFileSync(outSvgFileName, document.body.innerHTML);
    this.logger.info("save svg chart was finished.");
    // 結果をpngに変換する
    await saveChartAsPng(
      document.body,
      ChartingConfiguration.width,
      ChartingConfiguration.height,
      this.outDir
    );
    this.logger.info("save png chart was finished.");
    // 結果ファイルをS3にアップロードする
    const uploadParams: PutObjectCommandInput = {
      Bucket: this.item.Bucket,
      Key: this.item.Key.replace(".json", ".png"),
      Body: createReadStream(`${this.outDir}/donuts.png`),
    };
    await WriteFileToS3(uploadParams);
    this.logger.info("Upload Chart to S3 finish!");
  }
}
