import * as d3 from "d3";
import { InputData, InputDatas } from "./types/InputDatas.js";
import { ChartingConfiguration } from "./types/charingConfiguration.js";

export function draw(document: Document, inputs: InputDatas): Document {
  const width = 600;
  const height = 600;

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
    .data(pie(inputs.inputDatas))
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
  for (const row of inputs.inputDatas) {
    drawLegend(svgDonutsLegend, row, index);
    index++;
  }

  return document;
}

// 凡例を描画する関数
function drawLegend(
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
