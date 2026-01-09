import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useRoute, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Star, Trash2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { UserAvatar } from "@/components/UserAvatar";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BlogPost() {
  const { t, language } = useI18n();
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  
  const { data: post, isLoading } = trpc.blog.getPostBySlug.useQuery({ slug });
  
  const dateLocale = language === "pt" ? ptBR : enUS;

  if (isLoading) {
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

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Post não encontrado</p>
            <Link href="/blog">
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
        <article className="py-12">
          <div className="container max-w-4xl">
            <Link href="/blog">
              <Button variant="ghost" className="mb-8">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("common.back")}
              </Button>
            </Link>

            {post.coverImageUrl && (
              <div className="aspect-video overflow-hidden rounded-lg mb-8">
                <img
                  src={post.coverImageUrl}
                  alt={language === "pt" ? post.titlePt : post.titleEn}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === "pt" ? post.titlePt : post.titleEn}
            </h1>

            {post.publishedAt && (
              <p className="text-muted-foreground mb-8">
                {t("blog.published")} {format(new Date(post.publishedAt), "PPP", { locale: dateLocale })}
              </p>
            )}

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {language === "pt" ? post.contentPt : post.contentEn}
              </ReactMarkdown>
            </div>

            {/* Author Section */}
            {post.authorName && (
              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {t("blog.author")}{" "}
                  {post.authorLinkedIn ? (
                    <a
                      href={post.authorLinkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      {post.authorName}
                    </a>
                  ) : (
                    <span className="font-medium">{post.authorName}</span>
                  )}
                </p>
              </div>
            )}

            {/* Rating and Comments Section */}
            <div className="mt-12 pt-12 border-t border-border">
              <PostRating postId={post.id} />
              <PostComments postId={post.id} />
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}


// Post Rating Component
function PostRating({ postId }: { postId: number }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: ratingData } = trpc.blog.getPostRating.useQuery({ postId });
  const { data: userRating } = trpc.blog.getUserPostRating.useQuery(
    { postId },
    { enabled: !!user }
  );

  const ratePost = trpc.blog.ratePost.useMutation({
    onSuccess: () => {
      utils.blog.getPostRating.invalidate({ postId });
      utils.blog.getUserPostRating.invalidate({ postId });
    },
  });

  const handleRate = (rating: number) => {
    if (!user) return;
    ratePost.mutate({ postId, rating });
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">{t("blog.rating.title")}</h3>
      
      {ratingData && ratingData.count > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(ratingData.average)
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {ratingData.average.toFixed(1)} ({ratingData.count} {t("blog.rating.ratings")})
          </span>
        </div>
      )}

      {user ? (
        <div>
          <p className="text-sm text-muted-foreground mb-2">{t("blog.rating.yourRating")}</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 ${
                    userRating && star <= userRating
                      ? "fill-primary text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("blog.rating.loginToRate")}</p>
      )}
    </div>
  );
}

// Post Comments Component
function PostComments({ postId }: { postId: number }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [comment, setComment] = useState("");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const { data: comments = [] } = trpc.blog.getPostComments.useQuery({ 
    postId,
    orderBy: sortOrder 
  });

  const addComment = trpc.blog.addPostComment.useMutation({
    onSuccess: () => {
      setComment("");
      utils.blog.getPostComments.invalidate({ postId });
    },
  });

  const deleteComment = trpc.blog.deletePostComment.useMutation({
    onSuccess: () => {
      utils.blog.getPostComments.invalidate({ postId });
    },
  });

  const handleSubmit = () => {
    if (!comment.trim() || !user) return;
    addComment.mutate({ postId, comment: comment.trim() });
  };

  const handleDelete = (commentId: number) => {
    if (confirm(t("blog.comments.confirmDelete"))) {
      deleteComment.mutate({ commentId });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">
          {t("blog.comments.title")} ({comments.length})
        </h3>
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

      {user ? (
        <div className="mb-6">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("blog.comments.placeholder")}
            maxLength={1000}
            className="mb-2"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {comment.length}/1000
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!comment.trim() || addComment.isPending}
            >
              {t("blog.comments.submit")}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-6">{t("blog.comments.loginToComment")}</p>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {t("blog.comments.empty")}
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <UserAvatar
                    userName={c.userName || "Anonymous"}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium text-sm">{c.userName || "Anonymous"}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(c.createdAt), "PPp", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                {user?.role === "admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(c.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-foreground whitespace-pre-wrap ml-11">{c.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
