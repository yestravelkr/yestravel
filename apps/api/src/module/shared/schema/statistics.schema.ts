import { z } from 'zod';

export const StatisticsLegendSchema = z.object({
  name: z.string().describe('한국어 범례명'),
  key: z.string().describe('데이터에서 추출할 key값'),
});

export const StatisticsDataItemSchema = z
  .object({
    name: z.string().describe('데이터 포인트명 (날짜 등)'),
  })
  .catchall(z.union([z.string(), z.number()]));

export const StatisticsSchema = z.object({
  legends: z.array(StatisticsLegendSchema).describe('Y축 범례 정보'),
  data: z.array(StatisticsDataItemSchema).describe('차트 데이터'),
});

export function createStatisticsSchema(keys: string[]) {
  const dynamicProperties = keys.reduce(
    (acc, key) => {
      acc[key] = z.union([z.string(), z.number()]);
      return acc;
    },
    {} as Record<string, z.ZodUnion<[z.ZodString, z.ZodNumber]>>
  );

  const StatisticsDataItemWithKeysSchema = z.object({
    name: z.string().describe('데이터 포인트명 (날짜 등)'),
    ...dynamicProperties,
  });

  return z.object({
    legends: z.array(StatisticsLegendSchema).describe('Y축 범례 정보'),
    data: z.array(StatisticsDataItemWithKeysSchema).describe('차트 데이터'),
  });
}

export function createStatisticsSchemaFromLegends(
  legends: { name: string; key: string }[]
) {
  return createStatisticsSchema(legends.map(legend => legend.key));
}

export type StatisticsLegend = z.infer<typeof StatisticsLegendSchema>;
export type StatisticsResponse = z.infer<typeof StatisticsSchema>;
