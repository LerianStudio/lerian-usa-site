import { useState, useMemo, memo } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/Pagination";

import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { Link } from "wouter";
import { TopRatedBadge } from "@/components/TopRatedBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { SortSelector, type SortOption } from "@/components/SortSelector";

const ITEMS_PER_PAGE = 9;

export default function Blog() {
  const { t, language } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: categories } = trpc.blog.getCategories.useQuery();
  const { data: postsData, isLoading } = trpc.blog.getPosts.useQuery({ 
    categoryId: selectedCategory,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });
  // Extract posts and total from response
  const posts = postsData?.posts || [];
  const total = postsData?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  
  // ✅ MEDIUM-7: Memoizar ordenação de posts
  const filteredPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "popular") return (b.views || 0) - (a.views || 0);
      if (sortBy === "rating") {
        const ratingA = parseFloat((a.averageRating as any) || "0");
        const ratingB = parseFloat((b.averageRating as any) || "0");
        return ratingB - ratingA;
      }
      return 0;
    });
  }, [posts, sortBy]);
  
  const dateLocale = language === "pt" ? ptBR : enUS;
  
  // Reset to page 1 when category changes
  const handleCategoryChange = (categoryId: number | undefined) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-background via-background to-primary/5 py-8">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("blog.title")}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t("blog.subtitle")}
            </p>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8">
          <div className="container">
            {/* Category Filter */}
            {categories && categories.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{t("blog.filter.label")}</h3>
                  {selectedCategory && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCategoryChange(undefined)}
                    >
                      {t("blog.filter.clear")}
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => {
                    // Usar postCount retornado pelo backend
                    const count = (category as { postCount?: number }).postCount || 0;
                    const isSelected = selectedCategory === category.id;
                    return (
                      <Button
                        key={category.id}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() =>
                          handleCategoryChange(
                            isSelected ? undefined : category.id
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
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-12 border-t">
          <div className="container">
            {isLoading ? (
              <div className="text-center text-muted-foreground">
                {t("common.loading")}
              </div>
            ) : filteredPosts && filteredPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="flex flex-col hover:shadow-lg transition-shadow">
                      {post.coverImageUrl && (
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={post.coverImageUrl}
                            alt={language === "pt" ? post.titlePt : post.titleEn}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="line-clamp-2 flex-1">
                            {language === "pt" ? post.titlePt : post.titleEn}
                          </CardTitle>
                          {post.averageRating && post.ratingCount > 0 && (
                            <TopRatedBadge rating={post.averageRating} />
                          )}
                        </div>
                        {post.publishedAt && (
                          <CardDescription>
                            {t("blog.published")} {format(new Date(post.publishedAt), "PPP", { locale: dateLocale })}
                          </CardDescription>
                        )}
                        {post.categoryId && categories && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {categories
                              .filter((cat) => cat.id === post.categoryId)
                              .map((cat) => (
                                <CategoryBadge
                                  key={cat.id}
                                  name={language === "pt" ? cat.namePt : cat.nameEn}
                                />
                              ))}
                          </div>
                        )}
                        {!post.categoryId && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-xs text-muted-foreground">Sem categoria</span>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                          {language === "pt" ? post.excerptPt : post.excerptEn}
                        </p>
                        <Link href={`/blog/${post.slug}`}>
                          <Button variant="outline" className="w-full">
                            {t("blog.read.more")}
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
                {t("blog.empty")}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
