import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { FormError } from "@/components/FormError";
import { useFormValidation } from "@/hooks/useFormValidation";
import { Pagination } from "@/components/Pagination";
import { format } from "date-fns";

export function AdminEvents() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const { data: events, isLoading } = trpc.events.getAll.useQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      eventDate: [
        {
          validate: (v) => v && v.trim().length > 0,
          message: "Data do evento é obrigatória",
        },
        {
          validate: (v) => !v || new Date(v) > new Date(),
          message: "Data do evento deve ser no futuro",
        },
      ],
      location: [
        {
          validate: (v) => v && v.trim().length > 0,
          message: "Local do evento é obrigatório",
        },
      ],
    },
  });

  const createMutation = trpc.events.create.useMutation({
    onSuccess: () => {
      utils.events.getAll.invalidate();
      utils.events.getUpcoming.invalidate();
      toast.success(t("common.success"));
      setDialogOpen(false);
      setEditingEvent(null);
    },
  });

  const updateMutation = trpc.events.update.useMutation({
    onSuccess: () => {
      utils.events.getAll.invalidate();
      utils.events.getUpcoming.invalidate();
      toast.success(t("common.success"));
      setDialogOpen(false);
      setEditingEvent(null);
    },
  });

  const deleteMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      utils.events.getAll.invalidate();
      utils.events.getUpcoming.invalidate();
      toast.success(t("common.success"));
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Upload failed");
      
      const data = await response.json();
      return data.url;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const formValues = {
      titlePt: formData.get("titlePt") as string,
      titleEn: formData.get("titleEn") as string,
      eventDate: formData.get("eventDate") as string,
      location: formData.get("location") as string,
    };

    // Validate form
    if (!validateForm(formValues)) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }
    
    let imageUrl = editingEvent?.imageUrl;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }
    
    const data = {
      titlePt: formData.get("titlePt") as string,
      titleEn: formData.get("titleEn") as string,
      descriptionPt: formData.get("descriptionPt") as string,
      descriptionEn: formData.get("descriptionEn") as string,
      eventType: formData.get("eventType") as "webinar" | "workshop" | "conference" | "networking" | "other",
      location: formData.get("location") as string,
      eventUrl: formData.get("eventUrl") as string,
      eventDate: new Date(formData.get("eventDate") as string),
      imageUrl,
    };

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    setEventToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (eventToDelete !== null) {
      deleteMutation.mutate({ id: eventToDelete });
      setEventToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("admin.events")}</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingEvent(null)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.create")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? t("admin.edit") : t("admin.create")} Evento
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titlePt">Título (PT)</Label>
                  <Input
                    id="titlePt"
                    name="titlePt"
                    defaultValue={editingEvent?.titlePt}
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
                    defaultValue={editingEvent?.titleEn}
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
                    defaultValue={editingEvent?.descriptionPt}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="descriptionEn">Description (EN)</Label>
                  <Textarea
                    id="descriptionEn"
                    name="descriptionEn"
                    defaultValue={editingEvent?.descriptionEn}
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Local</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={editingEvent?.location}
                    onBlur={(e) => validateField("location", e.target.value)}
                    className={errors.location ? "border-red-500" : ""}
                  />
                  <FormError message={errors.location} />
                </div>
                <div>
                  <Label htmlFor="eventDate">Data do Evento</Label>
                  <Input
                    id="eventDate"
                    name="eventDate"
                    onBlur={(e) => validateField("eventDate", e.target.value)}
                    className={errors.eventDate ? "border-red-500" : ""}
                    type="datetime-local"
                    defaultValue={
                      editingEvent?.eventDate
                        ? format(new Date(editingEvent.eventDate), "yyyy-MM-dd'T'HH:mm")
                        : ""
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventType">Tipo de Evento</Label>
                  <select
                    id="eventType"
                    name="eventType"
                    defaultValue={editingEvent?.eventType || "other"}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="webinar">Webinar</option>
                    <option value="workshop">Workshop</option>
                    <option value="conference">Conferência</option>
                    <option value="networking">Networking</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="eventUrl">Link do Evento</Label>
                  <Input
                    id="eventUrl"
                    name="eventUrl"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    defaultValue={editingEvent?.eventUrl}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="eventImage">Imagem do Evento</Label>
                <Input
                  id="eventImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {(imagePreview || editingEvent?.imageUrl) && (
                  <div className="mt-2">
                    <img
                      src={imagePreview || editingEvent?.imageUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={createMutation.isPending || updateMutation.isPending || uploadingImage}>
                  {t("admin.cancel")}
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || uploadingImage}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      {editingEvent ? "Atualizando..." : "Criando..."}
                    </>
                  ) : uploadingImage ? (
                    "Enviando..."
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
      ) : events && events.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-4">
            {events.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{event.titlePt}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(event.eventDate), "PPP")}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingEvent(event);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <span className="inline-block animate-spin">⏳</span>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {event.descriptionPt && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{event.descriptionPt}</p>
                </CardContent>
              )}
            </Card>
            ))}
          </div>
          {events.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(events.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
            />
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhum evento cadastrado.</p>
      )}

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir evento?"
        description="Esta ação não pode ser desfeita. O evento será permanentemente excluído."
      />
    </div>
  );
}
