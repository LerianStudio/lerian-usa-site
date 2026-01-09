import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { ArrowDown01, TrendingUp, Star } from "lucide-react";

export type SortOption = "newest" | "popular" | "rating";

interface SortSelectorProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function SortSelector({ selectedSort, onSortChange }: SortSelectorProps) {
  const { t } = useI18n();

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: "newest", label: t("common.newest") || "Mais Recentes", icon: <ArrowDown01 className="h-4 w-4" /> },
    { value: "popular", label: t("common.popular") || "Populares", icon: <TrendingUp className="h-4 w-4" /> },
    { value: "rating", label: t("common.rating") || "Melhor Avaliação", icon: <Star className="h-4 w-4" /> },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {sortOptions.map((option) => (
        <Button
          key={option.value}
          variant={selectedSort === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange(option.value)}
          className="flex items-center gap-2"
        >
          {option.icon}
          <span className="hidden sm:inline">{option.label}</span>
        </Button>
      ))}
    </div>
  );
}
