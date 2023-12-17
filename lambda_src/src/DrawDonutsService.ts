import {
  GetObjectCommandInput,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { PutS3Item } from "./parseS3Event.js";
import { ArgParser } from "./ArgParser.js";
import { createReadStream, writeFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { draw } from "./HtmlDrawer.js";
import { InputDatas } from "./types/InputDatas";
import { ReadInputFromS3 } from "./common/s3Reader.js";
import winston from "winston";
import { Raw } from "./types/Raws.js";
import { WriteFileToS3 } from "./common/s3Writer.js";
import { RenderChart } from "./common/render.js";

export class DrawDonutsService {
  logger: winston.Logger;
  render: RenderChart;

  constructor(logger: winston.Logger) {
    this.logger = logger;
    this.render = new RenderChart
  }

  outDir = process.env["OUT_DIR_LOCAL"] || "/tmp";
  fileName = `${this.outDir}/donuts.svg`;

  argParser = new ArgParser();

  async run(item: PutS3Item): Promise<void> {
    const s3Params: GetObjectCommandInput = {
      Bucket: item.Bucket,
      Key: item.Key,
    };

    const input: InputDatas = await this.formatInputData(s3Params);

    const baseDocument = new JSDOM().window.document;
    const document = draw(baseDocument, input);

    this.logger.info("チャート生成が完了しました");
    await this.saveChart(document.body.innerHTML);
    this.logger.info("生成したチャートをsvgとして保存しました");
    await this.render.saveAsPngFile(this.fileName);
    this.logger.info("チャートファイルのpng化が完了しました");
    await this.uploadChart(item);
  }

  async formatInputData(s3Params: GetObjectCommandInput): Promise<InputDatas> {
    const maybeAssets = await ReadInputFromS3(s3Params, this.logger);
    const parsedRawAssets = (maybeAssets: string | undefined): Raw[] => {
      if (typeof maybeAssets === "string") {
        this.logger.info(
          `S3からJSON( s3://${s3Params.Bucket}/${s3Params.Key} ) が取得できました`
        );
        return JSON.parse(maybeAssets);
      } else {
        throw new Error(
          `S3からJSON( s3://${s3Params.Bucket}/${s3Params.Key} )の取得に失敗しました`
        );
      }
    };
    const raws = parsedRawAssets(maybeAssets);
    return this.argParser.parse(raws);
  }

  async saveChart(svg: string): Promise<void> {
    const saveFilePath = `${this.outDir}/${this.fileName}.svg`;
    writeFileSync(saveFilePath, svg);
    this.logger.info(
      `チャートをローカルに保存しました。 saveFilePath=${saveFilePath}`
    );
  }

  async uploadChart(item: PutS3Item): Promise<void> {
    const uploadS3Params: PutObjectCommandInput = {
      Bucket: item.Bucket,
      Key: item.Key.replace(".json", ".png"),
      Body: createReadStream(`${this.outDir}/donuts.png`),
    };
    await WriteFileToS3(uploadS3Params)

    this.logger.info(
      `チャートファイルをS3にアップロードしました。s3 path: s3://${uploadS3Params.Bucket}/${uploadS3Params.Key}`
    );
  }
}
