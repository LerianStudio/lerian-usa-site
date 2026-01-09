import { useState, useRef } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormError } from "@/components/FormError";
import { useFormValidation } from "@/hooks/useFormValidation";
import { Pagination } from "@/components/Pagination";
import { AdminAcademyCategories } from "./AdminAcademyCategories";

export function AdminVideos() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const { data: videos, isLoading } = trpc.academy.getAllVideos.useQuery();
  const [activeTab, setActiveTab] = useState("videos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { data: categories } = trpc.academy.getCategories.useQuery();

  const { errors, validateField, validateForm, clearAllErrors } = useFormValidation({
    rules: {
      titlePt: [
        {
          validate: (v) => v && v.trim().length > 0,
          message: "Título em português é obrigatório",
        },
      ],
      titleEn: [
        {
          validate: (v) => v && v.trim().length > 0,
          message: "Title in English is required",
        },
      ],
      descriptionPt: [
        {
          validate: (v) => v && v.trim().length > 0,
          message: "Descrição em português é obrigatória",
        },
      ],
      descriptionEn: [
        {
          validate: (v) => v && v.trim().length > 0,
          message: "Description in English is required",
        },
      ],
      duration: [
        {
          validate: (v) => v && parseInt(v) > 0,
          message: "Duração deve ser maior que 0",
        },
      ],
      categoryId: [
        {
          validate: (v) => v && !isNaN(parseInt(v)),
          message: "Categoria é obrigatória",
        },
      ],
    },
  });

  const uploadMutation = trpc.academy.uploadVideo.useMutation();

  const createMutation = trpc.academy.createVideo.useMutation({
    onSuccess: () => {
      utils.academy.getAllVideos.invalidate();
      utils.academy.getVideos.invalidate();
      toast.success(t("common.success"));
      setDialogOpen(false);
      setEditingVideo(null);
      setUploadedVideoUrl("");
    },
  });

  const updateMutation = trpc.academy.updateVideo.useMutation({
    onSuccess: () => {
      utils.academy.getAllVideos.invalidate();
      utils.academy.getVideos.invalidate();
      toast.success(t("common.success"));
      setDialogOpen(false);
      setEditingVideo(null);
      setUploadedVideoUrl("");
    },
  });

  const deleteMutation = trpc.academy.deleteVideo.useMutation({
    onSuccess: () => {
      utils.academy.getAllVideos.invalidate();
      utils.academy.getVideos.invalidate();
      toast.success(t("common.success"));
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (16MB limit)
    if (file.size > 16 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo: 16MB");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(",")[1];

        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64Data,
          contentType: file.type,
        });

        setUploadedVideoUrl(result.url);
        toast.success("Upload concluído!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erro no upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const formValues = {
      titlePt: formData.get("titlePt") as string,
      titleEn: formData.get("titleEn") as string,
      descriptionPt: formData.get("descriptionPt") as string,
      descriptionEn: formData.get("descriptionEn") as string,
      duration: formData.get("duration") as string,
      categoryId: formData.get("categoryId") as string,
    };

    // Validate form
    if (!validateForm(formValues)) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }
    
    const videoUrl = uploadedVideoUrl || (formData.get("videoUrl") as string);
    if (!videoUrl) {
      toast.error("URL do vídeo é obrigatória");
      return;
    }

    const published = formData.get("published") === "on";
    const categoryId = formData.get("categoryId") as string;
    const data = {
      titlePt: formData.get("titlePt") as string,
      titleEn: formData.get("titleEn") as string,
      descriptionPt: formData.get("descriptionPt") as string,
      descriptionEn: formData.get("descriptionEn") as string,
      videoUrl,
      thumbnailUrl: formData.get("thumbnailUrl") as string,
      duration: parseInt(formData.get("duration") as string) || undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      published,
    };

    if (editingVideo) {
      updateMutation.mutate({ id: editingVideo.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingVideo(null);
      setUploadedVideoUrl("");
      setSelectedCategoryId("");
    }
  };

  const handleDelete = (id: number) => {
    setVideoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (videoToDelete) {
      deleteMutation.mutate({ id: videoToDelete });
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">{t("admin.videos")}</h2>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>
          
          <TabsContent value="videos" className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gerenciar Vídeos</h3>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingVideo(null);
              setUploadedVideoUrl("");
              setSelectedCategoryId("");
            }}>
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.create")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? t("admin.edit") : t("admin.create")} Vídeo
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titlePt">Título (PT)</Label>
                  <Input
                    id="titlePt"
                    name="titlePt"
                    defaultValue={editingVideo?.titlePt}
                    required
                    onBlur={(e) => validateField("titlePt", e.target.value)}
                    className={errors.titlePt ? "border-red-500" : ""}
                  />
                  <FormError message={errors.titlePt} />
                </div>
                <div>
                  <Label htmlFor="titleEn">Title (EN)</Label>
                  <Input
                    id="titleEn"
                    name="titleEn"
                    defaultValue={editingVideo?.titleEn}
                    required
                    onBlur={(e) => validateField("titleEn", e.target.value)}
                    className={errors.titleEn ? "border-red-500" : ""}
                  />
                  <FormError message={errors.titleEn} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="descriptionPt">Descrição (PT)</Label>
                  <Textarea
                    id="descriptionPt"
                    name="descriptionPt"
                    defaultValue={editingVideo?.descriptionPt}
                    rows={3}
                    onBlur={(e) => validateField("descriptionPt", e.target.value)}
                    className={errors.descriptionPt ? "border-red-500" : ""}
                  />
                  <FormError message={errors.descriptionPt} />
                </div>
                <div>
                  <Label htmlFor="descriptionEn">Description (EN)</Label>
                  <Textarea
                    id="descriptionEn"
                    name="descriptionEn"
                    defaultValue={editingVideo?.descriptionEn}
                    rows={3}
                    onBlur={(e) => validateField("descriptionEn", e.target.value)}
                    className={errors.descriptionEn ? "border-red-500" : ""}
                  />
                  <FormError message={errors.descriptionEn} />
                </div>
              </div>

              <div className="space-y-6">
                <Label>Upload de Vídeo (máx 16MB)</Label>
                <div className="flex gap-4">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
                </div>
                {uploadedVideoUrl && (
                  <p className="text-xs text-primary">✓ Upload concluído</p>
                )}
              </div>

              <div>
                <Label htmlFor="videoUrl">URL do Vídeo (ou use upload acima)</Label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  defaultValue={editingVideo?.videoUrl || uploadedVideoUrl}
                  placeholder="https://..."
                  value={uploadedVideoUrl || undefined}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="thumbnailUrl">URL da Thumbnail</Label>
                  <Input
                    id="thumbnailUrl"
                    name="thumbnailUrl"
                    defaultValue={editingVideo?.thumbnailUrl}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duração (segundos)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    defaultValue={editingVideo?.duration}
                    placeholder="120"
                    onBlur={(e) => validateField("duration", e.target.value)}
                    className={errors.duration ? "border-red-500" : ""}
                  />
                  <FormError message={errors.duration} />
                </div>
                <div>
                  <Label htmlFor="categoryId">Categoria</Label>
                  <Select 
                    value={selectedCategoryId || editingVideo?.categoryId?.toString() || ""}
                    onValueChange={(v) => {
                      setSelectedCategoryId(v);
                      validateField("categoryId", v);
                    }}
                  >
                    <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.namePt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormError message={errors.categoryId} />
                  {/* Hidden input to submit categoryId with form */}
                  <input type="hidden" name="categoryId" value={selectedCategoryId} />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Switch id="published" name="published" defaultChecked={editingVideo?.published} />
                <Label htmlFor="published">{t("admin.published")}</Label>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={createMutation.isPending || updateMutation.isPending || uploading}>
                  {t("admin.cancel")}
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || uploading}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      {editingVideo ? "Atualizando..." : "Criando..."}
                    </>
                  ) : (
                    t("admin.save")
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : videos && videos.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-4">
            {videos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((video) => (
            <Card key={video.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <CardTitle>{video.titlePt}</CardTitle>
                      {video.published ? (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {t("admin.published")}
                        </span>
                      ) : (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {t("admin.draft")}
                        </span>
                      )}
                    </div>
                    {video.duration && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Duração: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingVideo(video);
                        setSelectedCategoryId(video.categoryId?.toString() || "");
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(video.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {video.descriptionPt && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{video.descriptionPt}</p>
                </CardContent>
              )}
            </Card>
            ))}
          </div>
          {videos.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(videos.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
            />
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhum vídeo cadastrado.</p>
      )}

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir vídeo?"
        description="Esta ação não pode ser desfeita. O vídeo será permanentemente excluído."
      />
          </TabsContent>
          
          <TabsContent value="categories">
            <AdminAcademyCategories />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
