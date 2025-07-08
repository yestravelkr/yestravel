export interface StatisticsLegend {
  name: string;
  key: string;
}

export interface StatisticsDataItem {
  name: string;
  [key: string]: string | number;
}

export interface StatisticsSchema {
  legends: StatisticsLegend[];
  data: StatisticsDataItem[];
}
