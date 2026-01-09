import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { ContentAnalytics, BaseContentMetrics } from './ContentAnalytics';

// ✅ HIGH-1 FIX: Refatorado para usar ContentAnalytics genérico

export function AdminAnalyticsBlog() {
  const [metrics, setMetrics] = useState<BaseContentMetrics | null>(null);
  const { data, isLoading: isFetching } = trpc.analytics.getBlogMetrics.useQuery();

  useEffect(() => {
    if (data) {
      // Mapear dados específicos de blog para o formato genérico
      setMetrics({
        totalItems: data.totalPosts,
        itemsByCategory: data.postsByCategory,
        averageRating: data.averageRating,
        mostRatedItem: data.mostRatedPost,
        leastRatedItem: data.leastRatedPost,
        totalComments: data.totalComments,
        averageCommentsPerItem: data.averageCommentsPerPost,
        mostCommentedItem: data.mostCommentedPost,
        engagementRate: data.engagementRate,
      });
    }
  }, [data]);

  return (
    <ContentAnalytics
      metrics={metrics}
      isLoading={!data}
      isFetching={isFetching}
      contentType="blog"
      categoryLabel="Posts por Categoria"
      itemLabel="Post"
    />
  );
}
