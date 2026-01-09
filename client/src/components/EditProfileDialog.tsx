import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import { UserAvatar } from "@/components/UserAvatar";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentJobTitle?: string;
  currentCompany?: string;
  currentLinkedin?: string;
  currentPhotoUrl?: string;
}

export default function EditProfileDialog({
  open,
  onOpenChange,
  currentJobTitle = "",
  currentCompany = "",
  currentLinkedin = "",
  currentPhotoUrl = "",
}: EditProfileDialogProps) {
  const { t } = useI18n();
  const utils = trpc.useUtils();

  const [jobTitle, setJobTitle] = useState(currentJobTitle);
  const [company, setCompany] = useState(currentCompany);
  const [linkedin, setLinkedin] = useState(currentLinkedin);
  // Sincronizar estados quando o diálogo abre
  useEffect(() => {
    if (open) {
      setJobTitle(currentJobTitle);
      setCompany(currentCompany);
      setLinkedin(currentLinkedin);
    }
  }, [open, currentJobTitle, currentCompany, currentLinkedin]);

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(t("profile.updated"));
      utils.auth.me.invalidate();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobTitle.trim()) {
      toast.error(t("profile.jobTitleRequired"));
      return;
    }

    updateProfile.mutate({
      jobTitle: jobTitle.trim(),
      company: company.trim() || undefined,
      linkedin: linkedin.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("profile.editProfile")}</DialogTitle>
          <DialogDescription>
            {t("profile.editProfileDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">
              {t("profile.jobTitle")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder={t("profile.jobTitlePlaceholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">{t("profile.company")}</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={t("profile.companyPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">{t("profile.linkedin")}</Label>
            <Input
              id="linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/seu-perfil"
              type="url"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={updateProfile.isPending}
              className="bg-primary-green hover:bg-primary-green/90"
            >
              {updateProfile.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
