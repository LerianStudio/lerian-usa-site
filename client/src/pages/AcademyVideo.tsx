import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Star, Trash2 } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { useRoute, Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useState } from "react";

export default function AcademyVideo() {
  const { t, language } = useI18n();
  const [, params] = useRoute("/academy/:id");
  const [, setLocation] = useLocation();
  const videoId = params?.id ? parseInt(params.id) : 0;
  
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: video, isLoading } = trpc.academy.getVideoById.useQuery(
    { id: videoId },
    { enabled: isAuthenticated && videoId > 0 }
  );

  if (authLoading || isLoading) {
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
    setLocation("/academy");
    return null;
  }

  if (!video) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Vídeo não encontrado</p>
            <Link href="/academy">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("common.back")}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8 max-w-6xl">
          <Link href="/academy">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.back")}
            </Button>
          </Link>

          <div className="space-y-6">
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be') ? (
                <iframe
                  className="w-full h-full"
                  src={video.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title={language === "pt" ? video.titlePt : video.titleEn}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  controls
                  className="w-full h-full"
                  src={video.videoUrl}
                  poster={video.thumbnailUrl || undefined}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {/* Video Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {language === "pt" ? video.titlePt : video.titleEn}
              </h1>
              
              {(video.descriptionPt || video.descriptionEn) && (
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <p className="text-lg text-muted-foreground">
                    {language === "pt" ? video.descriptionPt : video.descriptionEn}
                  </p>
                </div>
              )}
            </div>

            {/* Rating Section */}
            <VideoRating videoId={videoId} />

            {/* Comments Section */}
            <VideoComments videoId={videoId} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


// Star Rating Component
function VideoRating({ videoId }: { videoId: number }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const utils = trpc.useUtils();
  
  const { data: ratingData } = trpc.academy.getVideoRating.useQuery({ videoId });
  const { data: userRating } = trpc.academy.getUserVideoRating.useQuery(
    { videoId },
    { enabled: !!user }
  );
  
  const rateMutation = trpc.academy.rateVideo.useMutation({
    onSuccess: () => {
      utils.academy.getVideoRating.invalidate({ videoId });
      utils.academy.getUserVideoRating.invalidate({ videoId });
    },
  });

  const handleRate = (rating: number) => {
    if (!user) return;
    rateMutation.mutate({ videoId, rating });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("academy.rating.title") || "Avaliação"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Average Rating Display */}
        {ratingData && ratingData.count > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${
                    star <= Math.round(ratingData.average)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {ratingData.average.toFixed(1)} ({ratingData.count} {ratingData.count === 1 ? t("academy.rating.average") : t("academy.rating.averages")})
            </div>
          </div>
        )}

        {/* User Rating Input */}
        {user && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {userRating ? t("academy.rating.your") : t("academy.rating.rate")}
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className="transition-transform hover:scale-110"
                  disabled={rateMutation.isPending}
                >
                  <Star
                    className={`h-8 w-8 cursor-pointer ${
                      star <= (userRating || 0)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Comments Component
function VideoComments({ videoId }: { videoId: number }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const [comment, setComment] = useState("");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  const { data: comments = [] } = trpc.academy.getComments.useQuery({ 
    videoId,
    orderBy: sortOrder 
  });
  
  const addCommentMutation = trpc.academy.addComment.useMutation({
    onSuccess: () => {
      setComment("");
      utils.academy.getComments.invalidate({ videoId });
    },
  });

  const deleteCommentMutation = trpc.academy.deleteComment.useMutation({
    onSuccess: () => {
      utils.academy.getComments.invalidate({ videoId });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;
    addCommentMutation.mutate({ videoId, comment: comment.trim() });
  };

  const handleDelete = (commentId: number) => {
    if (confirm(t("academy.comments.delete.confirm"))) {
      deleteCommentMutation.mutate({ commentId });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("academy.comments.title") || "Comentários"} ({comments.length})</CardTitle>
          {comments.length > 0 && (
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'desc' | 'asc')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">{t("blog.comments.newest")}</SelectItem>
                <SelectItem value="asc">{t("blog.comments.oldest")}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {user && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("academy.comments.placeholder")}
              className="min-h-[100px]"
              maxLength={1000}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {comment.length}/1000
              </span>
              <Button
                type="submit"
                disabled={!comment.trim() || addCommentMutation.isPending}
              >
                {addCommentMutation.isPending ? t("academy.comments.submitting") : t("academy.comments.submit")}
              </Button>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t("academy.comments.empty")}
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="border-b border-border pb-4 last:border-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <UserAvatar
                      userName={c.userName || "Usuário"}
                      size="sm"
                    />
                    <div>
                      <p className="font-semibold text-sm">{c.userName || "Usuário"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  {user?.role === "admin" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(c.id)}
                      disabled={deleteCommentMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap ml-11">{c.comment}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
