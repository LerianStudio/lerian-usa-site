import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import { UserAvatar } from "@/components/UserAvatar";

export default function ProfileOnboarding() {
  const { t } = useI18n();
  const utils = trpc.useUtils();

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [linkedin, setLinkedin] = useState("");


  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(t("profile.updated"));
      utils.auth.me.invalidate();
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t("profile.completeProfile")}</CardTitle>
          <CardDescription>{t("profile.completeProfileDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">{t("profile.jobTitle")} *</Label>
              <Input
                id="jobTitle"
                type="text"
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
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={t("profile.companyPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">{t("profile.linkedin")}</Label>
              <Input
                id="linkedin"
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/seu-perfil"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? t("common.saving") : t("profile.continue")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
