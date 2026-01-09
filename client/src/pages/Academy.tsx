import { useState, useMemo } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/Pagination";
import { getLoginUrl } from "@/const";
import { Play, Clock } from "lucide-react";
import { Link } from "wouter";
import { TopRatedBadge } from "@/components/TopRatedBadge";
import { useAuth } from "@/_core/hooks/useAuth";
import { CategoryBadge } from "@/components/CategoryBadge";
import { SortSelector, type SortOption } from "@/components/SortSelector";

const ITEMS_PER_PAGE = 9;

function formatDuration(seconds?: number) {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function Academy() {
  const { t, language } = useI18n();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: categories } = trpc.academy.getCategories.useQuery();
  const { data: videosData, isLoading } = trpc.academy.getVideos.useQuery({
    categoryId: selectedCategoryId || undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  }, {
    enabled: isAuthenticated,
  });
  // Extract videos and total from response
  const videos = videosData?.videos || [];
  const total = videosData?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // ✅ MEDIUM-7: Memoizar ordenação de vídeos
  const filteredVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "popular") return (b.views || 0) - (a.views || 0);
      if (sortBy === "rating") {
        const ratingA = parseFloat((a.averageRating as any) || "0");
        const ratingB = parseFloat((b.averageRating as any) || "0");
        return ratingB - ratingA;
      }
      return 0;
    });
  }, [videos, sortBy]);

  // Reset to page 1 when category changes
  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="py-20">
            <div className="container max-w-2xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {t("academy.title")}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {t("academy.subtitle")}
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                {t("academy.login.required")}
              </p>
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>{t("nav.login")}</a>
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-background via-background to-primary/5 py-8">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("academy.title")}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t("academy.description")}
            </p>
          </div>
        </section>

        {/* Videos Grid */}
        <section className="py-8">
          <div className="container">
            {/* Category Filter */}
            {categories && categories.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{t("academy.filter.label")}</h3>
                  {selectedCategoryId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCategoryChange(null)}
                    >
                      {t("academy.filter.clear")}
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => {
                    const count = (category as { videoCount?: number }).videoCount || 0;
                    const isSelected = selectedCategoryId === category.id;
                    return (
                      <Button
                        key={category.id}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() =>
                          handleCategoryChange(
                            isSelected ? null : category.id
                          )
                        }
                        className="relative"
                      >
                        {language === "pt" ? category.namePt : category.nameEn}
                        {count > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-primary/20">
                            {count}
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sort Selector */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">{t("common.sort") || "Ordenar por"}</h3>
              <SortSelector selectedSort={sortBy} onSortChange={setSortBy} />
            </div>

            {isLoading ? (
              <div className="text-center text-muted-foreground">
                {t("common.loading")}
              </div>
            ) : filteredVideos && filteredVideos.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredVideos.map((video) => (
                    <Card key={video.id} className="flex flex-col hover:shadow-lg transition-shadow group">
                      <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={language === "pt" ? video.titlePt : video.titleEn}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <Play className="h-16 w-16 text-primary" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                        {video.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(video.duration)}
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="line-clamp-2 flex-1">
                            {language === "pt" ? video.titlePt : video.titleEn}
                          </CardTitle>
                          {video.averageRating && video.ratingCount > 0 && (
                            <TopRatedBadge rating={video.averageRating} />
                          )}
                        </div>
                        {video.categoryId && categories ? (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {categories
                              .filter((cat) => cat.id === video.categoryId)
                              .map((cat) => (
                                <CategoryBadge
                                  key={cat.id}
                                  name={language === "pt" ? cat.namePt : cat.nameEn}
                                />
                              ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-xs text-muted-foreground">Sem categoria</span>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                          {language === "pt" ? video.descriptionPt : video.descriptionEn}
                        </p>
                        <Link href={`/academy/${video.id}`}>
                          <Button className="w-full">
                            <Play className="mr-2 h-4 w-4" />
                            {t("academy.watch")}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                {t("academy.empty")}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
