import { IModifier } from "src/services/pointEvents/pointEventsSlice";
import { Positions } from "./types";
import React from "react";
import { AxisOptions } from "react-charts";

export const fillChartWithValues = (
  chart: Positions[],
  position: IModifier
) => {
  const beginHour = +position?.BeginDate?.split("T")?.[1]?.split(":")?.[0];
  const endHour = +position?.EndDate?.split("T")?.[1]?.split(":")?.[0];
  for (let i = beginHour; i <= endHour; i++) {
    chart.push({ value: position?.Value, date: i });
  }
};

export const fillChartWithZeros = (chart: Positions[]) => {
  for (let i = 1; i <= 24; i++) {
    if (!chart.find((el) => el.date === i)) {
      chart.push({ value: 0, date: i });
    }
  }
  chart.sort((a, b) => a.date - b.date);
};

export const primaryAxis: AxisOptions<Positions> =({
    getValue: (datum) => datum.date,
    show: false,
    showDatumElements: false,
  })

export const secondaryAxes: AxisOptions<Positions>[] = [
    {
      getValue: (datum) => datum.value,
      show: false,
      showDatumElements: false,
    },
  ]
