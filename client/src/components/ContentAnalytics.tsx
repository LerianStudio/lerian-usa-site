import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// ✅ MEDIUM-8: Componente genérico com type-safety aprimorado

// Tipos base para métricas de conteúdo
export interface BaseContentMetrics {
  totalItems: number;
  itemsByCategory: Array<{ category: string | null; count: number }>;
  averageRating: number;
  mostRatedItem: { title: string; rating: number } | null;
  leastRatedItem: { title: string; rating: number } | null;
  totalComments: number;
  averageCommentsPerItem: number;
  mostCommentedItem: { title: string; commentCount: number } | null;
  engagementRate: number;
}

// ✅ MEDIUM-8: Tipos específicos para cada tipo de conteúdo
export interface BlogMetrics extends BaseContentMetrics {
  contentType: 'blog';
}

export interface AcademyMetrics extends BaseContentMetrics {
  contentType: 'academy';
}

// Union type para métricas
export type ContentMetrics = BlogMetrics | AcademyMetrics;

// Type guard para verificar tipo de métrica
export function isBlogMetrics(metrics: ContentMetrics): metrics is BlogMetrics {
  return metrics.contentType === 'blog';
}

export function isAcademyMetrics(metrics: ContentMetrics): metrics is AcademyMetrics {
  return metrics.contentType === 'academy';
}

// ✅ MEDIUM-8: Props com generic para type-safety
interface ContentAnalyticsProps<T extends 'blog' | 'academy'> {
  metrics: BaseContentMetrics | null;
  isLoading: boolean;
  isFetching: boolean;
  contentType: T;
  categoryLabel?: string;
  itemLabel?: string;
}

export function ContentAnalytics<T extends 'blog' | 'academy'>({
  metrics,
  isLoading,
  isFetching,
  contentType,
  categoryLabel,
  itemLabel = contentType === 'blog' ? 'Post' : 'Vídeo',
}: ContentAnalyticsProps<T>) {
  const [displayMetrics, setDisplayMetrics] = useState<BaseContentMetrics | null>(null);

  // ✅ MEDIUM-8: Memoizar labels para evitar recalcular a cada render
  const labels = useMemo(() => ({
    totalLabel: contentType === 'blog' ? 'Total de Posts' : 'Total de Vídeos',
    categoryPlural: contentType === 'blog' ? 'Posts' : 'Vídeos',
    mostRatedLabel: `${itemLabel} Mais Avaliado`,
    leastRatedLabel: `${itemLabel} Menos Avaliado`,
    mostCommentedLabel: `${itemLabel} Mais Comentado`,
    defaultCategoryLabel: categoryLabel || `${contentType === 'blog' ? 'Posts' : 'Vídeos'} por Categoria`,
  }), [contentType, itemLabel, categoryLabel]);

  useEffect(() => {
    if (metrics) {
      setDisplayMetrics(metrics);
    }
  }, [metrics]);

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!displayMetrics) {
    return <div className="text-center py-12 text-gray-400">Nenhum dado disponível</div>;
  }

  // Labels memoizados acima

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-slate-900 border-slate-700">
          <div className="text-sm text-gray-400 mb-2">{labels.totalLabel}</div>
          <div className="text-3xl font-bold text-yellow-500">{displayMetrics.totalItems}</div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-700">
          <div className="text-sm text-gray-400 mb-2">Avaliação Média</div>
          <div className="text-3xl font-bold text-yellow-500">
            {displayMetrics.averageRating.toFixed(1)} ⭐
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-700">
          <div className="text-sm text-gray-400 mb-2">Total de Comentários</div>
          <div className="text-3xl font-bold text-yellow-500">{displayMetrics.totalComments}</div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-700">
          <div className="text-sm text-gray-400 mb-2">Taxa de Engajamento</div>
          <div className="text-3xl font-bold text-yellow-500">
            {displayMetrics.engagementRate.toFixed(1)}
          </div>
        </Card>
      </div>

      {/* Itens por Categoria */}
      {displayMetrics.itemsByCategory.length > 0 && (
        <Card className="p-6 bg-slate-900 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">{labels.defaultCategoryLabel}</h3>
          <div className="space-y-2">
            {displayMetrics.itemsByCategory.map((cat) => (
              <div key={cat.category} className="flex justify-between items-center">
                <span className="text-gray-300">{cat.category || 'Sem categoria'}</span>
                <span className="text-yellow-500 font-semibold">{cat.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Conteúdo com Melhor e Pior Desempenho */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayMetrics.mostRatedItem && (
          <Card className="p-6 bg-slate-900 border-slate-700">
            <h3 className="text-sm text-gray-400 mb-2">{labels.mostRatedLabel}</h3>
            <div className="text-white font-semibold mb-2 line-clamp-2">
              {displayMetrics.mostRatedItem.title}
            </div>
            <div className="text-yellow-500 text-lg">
              {displayMetrics.mostRatedItem.rating.toFixed(1)} ⭐
            </div>
          </Card>
        )}

        {displayMetrics.leastRatedItem && (
          <Card className="p-6 bg-slate-900 border-slate-700">
            <h3 className="text-sm text-gray-400 mb-2">{labels.leastRatedLabel}</h3>
            <div className="text-white font-semibold mb-2 line-clamp-2">
              {displayMetrics.leastRatedItem.title}
            </div>
            <div className="text-yellow-500 text-lg">
              {displayMetrics.leastRatedItem.rating.toFixed(1)} ⭐
            </div>
          </Card>
        )}
      </div>

      {/* Conteúdo Mais Comentado */}
      {displayMetrics.mostCommentedItem && (
        <Card className="p-6 bg-slate-900 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">{labels.mostCommentedLabel}</h3>
          <div className="text-white font-semibold mb-2 line-clamp-2">
            {displayMetrics.mostCommentedItem.title}
          </div>
          <div className="text-yellow-500 text-lg">
            {displayMetrics.mostCommentedItem.commentCount} comentários
          </div>
        </Card>
      )}

      {/* Estatísticas Adicionais */}
      <Card className="p-6 bg-slate-900 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Estatísticas Adicionais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-2">Média de Comentários por {itemLabel}</div>
            <div className="text-2xl font-bold text-yellow-500">
              {displayMetrics.averageCommentsPerItem.toFixed(2)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
