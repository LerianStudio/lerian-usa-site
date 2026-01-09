import { useI18n } from "@/contexts/I18nContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFilterProps {
  categories: Array<{ 
    id: number; 
    name?: string; 
    namePt?: string; 
    nameEn?: string;
  }>;
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  placeholder?: string;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onCategoryChange,
  placeholder,
}: CategoryFilterProps) {
  const { t, language } = useI18n();

  const getCategoryName = (category: CategoryFilterProps['categories'][0]) => {
    if (category.name) return category.name;
    return language === 'pt' ? category.namePt : category.nameEn;
  };

  return (
    <div className="w-full md:w-64">
      <Select
        value={selectedCategoryId?.toString() || "all"}
        onValueChange={(value) => {
          onCategoryChange(value === "all" ? null : parseInt(value));
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder || t("common.allCategories")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("common.allCategories")}</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id.toString()}>
              {getCategoryName(category)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
