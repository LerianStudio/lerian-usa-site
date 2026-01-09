import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { ContentAnalytics, BaseContentMetrics } from './ContentAnalytics';

// ✅ HIGH-1 FIX: Refatorado para usar ContentAnalytics genérico

export function AdminAnalyticsAcademy() {
  const [metrics, setMetrics] = useState<BaseContentMetrics | null>(null);
  const { data, isLoading: isFetching } = trpc.analytics.getAcademyMetrics.useQuery();

  useEffect(() => {
    if (data) {
      // Mapear dados específicos de academy para o formato genérico
      setMetrics({
        totalItems: data.totalVideos,
        itemsByCategory: data.videosByCategory,
        averageRating: data.averageRating,
        mostRatedItem: data.mostRatedVideo,
        leastRatedItem: data.leastRatedVideo,
        totalComments: data.totalComments,
        averageCommentsPerItem: data.averageCommentsPerVideo,
        mostCommentedItem: data.mostCommentedVideo,
        engagementRate: data.engagementRate,
      });
    }
  }, [data]);

  return (
    <ContentAnalytics
      metrics={metrics}
      isLoading={!data}
      isFetching={isFetching}
      contentType="academy"
      categoryLabel="Vídeos por Categoria"
      itemLabel="Vídeo"
    />
  );
}
