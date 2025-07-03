import React, { useEffect, useState } from 'react';

import { StatisticsSchema } from '../../types/statistics';

export type StatisticsComponentProps = {
  endpoint?: string;
  data?: StatisticsSchema;
  children: (data: StatisticsSchema) => React.ReactNode;
};

export const StatisticsComponent: React.FC<StatisticsComponentProps> = ({
  endpoint,
  data: staticData,
  children,
}) => {
  const [data, setData] = useState<StatisticsSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (staticData) {
      setData(staticData);
      return;
    }

    if (!endpoint) {
      setError('endpoint 또는 data가 필요합니다.');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:3000/trpc/${endpoint}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result.result?.data || result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : '데이터를 불러오는데 실패했습니다.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, staticData]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>에러: {error}</div>;
  }

  if (!data) {
    return <div>데이터가 없습니다.</div>;
  }

  return <>{children(data)}</>;
};

/**
 * Usage Examples:
 *
 * // 1. API 엔드포인트로 데이터 fetch
 * <StatisticsComponent endpoint="statistics.getPageVisits">
 *   {(data) => (
 *     <LineChart
 *       data={data.data}
 *       legends={data.legends}
 *       xAxisKey="name"
 *     />
 *   )}
 * </StatisticsComponent>
 *
 * // 2. 정적 데이터 사용
 * <StatisticsComponent data={staticStatisticsData}>
 *   {(data) => (
 *     <BarChart
 *       data={data.data}
 *       legends={data.legends}
 *       xAxisKey="name"
 *     />
 *   )}
 * </StatisticsComponent>
 *
 * // 3. 여러 차트 타입 동적 렌더링
 * <StatisticsComponent endpoint="statistics.getUserActivity">
 *   {(data) => (
 *     <div>
 *       <h3>사용자 활동 통계</h3>
 *       <LineChart data={data.data} legends={data.legends} />
 *       <PieChart
 *         data={data.data}
 *         valueKey={data.legends[0].key}
 *         nameKey="name"
 *       />
 *     </div>
 *   )}
 * </StatisticsComponent>
 *
 * // 4. 커스텀 UI 렌더링
 * <StatisticsComponent endpoint="statistics.getSummary">
 *   {(data) => (
 *     <div className="statistics-grid">
 *       {data.legends.map(legend => (
 *         <div key={legend.key} className="stat-card">
 *           <h4>{legend.name}</h4>
 *           <p>{data.data.reduce((sum, item) => sum + (item[legend.key] as number), 0)}</p>
 *         </div>
 *       ))}
 *     </div>
 *   )}
 * </StatisticsComponent>
 */
