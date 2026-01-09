import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

interface CategoryMultiSelectProps {
  type: "academy" | "blog";
  selectedIds?: number[];
  onChange: (ids: number[]) => void;
}

export function CategoryMultiSelect({
  type,
  selectedIds = [],
  onChange,
}: CategoryMultiSelectProps) {
  const { t, language } = useI18n();
  const [selected, setSelected] = useState<number[]>(selectedIds);

  // Fetch categories based on type
  const { data: categories, isLoading } = trpc.academy.getCategories.useQuery(
    undefined,
    { enabled: type === "academy" }
  );

  const { data: blogCategories, isLoading: blogLoading } = trpc.blog.getCategories.useQuery(
    undefined,
    { enabled: type === "blog" }
  );

  const cats = type === "academy" ? categories : blogCategories;
  const loading = type === "academy" ? isLoading : blogLoading;

  useEffect(() => {
    setSelected(selectedIds);
  }, [selectedIds]);

  const handleToggle = (id: number) => {
    const newSelected = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    setSelected(newSelected);
    onChange(newSelected);
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-3">
      <Label>{t("admin.categories")}</Label>
      <Card className="p-4 space-y-3">
        {cats && cats.length > 0 ? (
          cats.map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selected.includes(category.id)}
                onCheckedChange={() => handleToggle(category.id)}
              />
              <Label
                htmlFor={`category-${category.id}`}
                className="cursor-pointer font-normal"
              >
                {language === "pt" ? category.namePt : category.nameEn}
              </Label>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{t("admin.no_categories")}</p>
        )}
      </Card>
    </div>
  );
}
