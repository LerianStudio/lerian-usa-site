import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { Search, Calendar, FileText, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

export function GlobalSearch() {
  const { t, language } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const dateLocale = language === "pt" ? ptBR : enUS;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = trpc.search.global.useQuery(
    { query: debouncedQuery, language },
    { enabled: debouncedQuery.length > 0 }
  );

  const hasResults =
    results &&
    (results.events.length > 0 ||
      results.blogPosts.length > 0 ||
      results.videos.length > 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">{t("search.placeholder")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>{t("search.title")}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[50vh] mt-4">
          {isLoading && (
            <div className="text-center text-muted-foreground py-8">
              {t("common.loading")}
            </div>
          )}

          {!isLoading && query && !hasResults && (
            <div className="text-center text-muted-foreground py-8">
              {t("search.noResults")}
            </div>
          )}

          {!isLoading && hasResults && (
            <div className="space-y-6">
              {/* Events Results */}
              {results.events.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {t("search.events")} ({results.events.length})
                  </h3>
                  <div className="space-y-2">
                    {results.events.map((event) => (
                      <a
                        key={event.id}
                        href="/"
                        onClick={() => setOpen(false)}
                        className="block p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="font-medium">
                          {language === "pt" ? event.titlePt : event.titleEn}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {format(new Date(event.eventDate), "PPP", {
                            locale: dateLocale,
                          })}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Blog Posts Results */}
              {results.blogPosts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {t("search.blog")} ({results.blogPosts.length})
                  </h3>
                  <div className="space-y-2">
                    {results.blogPosts.map((post) => (
                      <a
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        onClick={() => setOpen(false)}
                        className="block p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="font-medium">
                          {language === "pt" ? post.titlePt : post.titleEn}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {language === "pt"
                            ? post.contentPt.substring(0, 150)
                            : post.contentEn.substring(0, 150)}
                          ...
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos Results */}
              {results.videos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    {t("search.videos")} ({results.videos.length})
                  </h3>
                  <div className="space-y-2">
                    {results.videos.map((video) => (
                      <a
                        key={video.id}
                        href={`/academy/${video.id}`}
                        onClick={() => setOpen(false)}
                        className="block p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="font-medium">
                          {language === "pt" ? video.titlePt : video.titleEn}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {language === "pt"
                            ? video.descriptionPt
                            : video.descriptionEn}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
