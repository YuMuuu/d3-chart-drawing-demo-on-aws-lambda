import type { Meta, StoryObj } from "@storybook/html";
import { ArgParser } from "./ArgParser.js";
import type { Raw } from "./types/Raws.js";
import { draw } from "./HtmlDrawer.js";

interface ChartProps {
  text: string;
}

const defaultJsonString = `[
    { "label": "20代", "proportion": "0.15", "color": "#d53e4f" },
    { "label": "30代", "proportion": "0.23", "color": "#fc8d59" },
    { "label": "40代", "proportion": "0.21", "color": "#fee08b" },
    { "label": "50代", "proportion": "0.18", "color": "#ffffbf" },
    { "label": "60代", "proportion": "0.15", "color": "#e6f598" },
    { "label": "70代以上", "proportion": "0.08", "color": "#99d594" }
  ]`;

const meta: Meta<ChartProps> = {
  title: "DonutsChartHtml",
  render: (args) => {
    return createGraph(args);
  },
  argTypes: {
    text: {
      description: "json",
      control: "text",
      defaultValue: defaultJsonString,
    },
  },
};

export default meta;

function createGraph({ text }: ChartProps): Element {
    const rawAssetAllocation = JSON.parse(text) as Raw[];
    const argParser = new ArgParser();
    const inputdatas = argParser.parse(rawAssetAllocation);
  
    //更新前のdocumentに残っているchartのdivを削除する
    const elements = document.getElementsByClassName("donuts-chart");
    for (let i = 0; i < elements.length; i++) {
      elements[i].remove();
    }
  
    const baseDocument = draw(document, inputdatas);
    const chartElement = baseDocument.getElementsByClassName(
      "donuts-chart"
    )[0];
    return document.body.appendChild(chartElement);
  }
  
  export const ChartElement: StoryObj = {
    args: {
      text: defaultJsonString,
    },
  };
  