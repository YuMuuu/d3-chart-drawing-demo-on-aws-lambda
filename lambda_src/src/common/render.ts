import { existsSync } from "node:fs";
import { writeFile, readFile } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";

export interface RenderOptions {
  fontSrcPath: string;
  fontFamily: string;
  backgroundColor: string;
  inputDir: string;
  outputDir: string;
}

export class DefaultRenderOptions implements RenderOptions {
  fontSrcPath = "/var/task/resources/fonts/NotoSansJP-Regular.ttf";
  fontFamily = "Noto Sans JP";
  backgroundColor = "rgba(255, 255, 255, .9)";
  inputDir = "/tmp";
  outputDir = "/tmp";
}

export class RenderChart {
  options: RenderOptions = new DefaultRenderOptions();

  private async readSvg(fileName: string) {
    if (!existsSync(`${this.options.inputDir}/${fileName}.svg`)) {
      throw new Error(
        `指定されたファイルパス: ${this.options.inputDir}/${fileName}.svg にファイルが存在しませんでした.`
      );
    } else {
      return await readFile(`${this.options.inputDir}/${fileName}.svg`);
    }
  }

  async saveAsPngFile(fileName: string): Promise<void> {
    if (fileName.includes(".")) {
      throw new Error(
        `fileName: ${fileName} contains '.' . fileName should not contain '.'.`
      );
    } else {
      const svg = await this.readSvg(fileName);
      const opts = {
        background: this.options.backgroundColor,
        font: {
          fontFiles: [this.options.fontSrcPath],
          loadSystemFonts: false,
          defaultFontFamily: this.options.fontFamily,
        },
      };
      const resvg = new Resvg(svg, opts);
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();
      await writeFile(`${this.options.outputDir}/${fileName}.png`, pngBuffer);
    }
  }
}
