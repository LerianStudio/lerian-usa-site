import { Badge } from "@/components/ui/badge";

const categoryColors: Record<string, { bg: string; text: string }> = {
  "Tecnologia": { bg: "bg-blue-500/20", text: "text-blue-400" },
  "Produto": { bg: "bg-purple-500/20", text: "text-purple-400" },
  "Regulatório": { bg: "bg-orange-500/20", text: "text-orange-400" },
  "Casos de Uso": { bg: "bg-green-500/20", text: "text-green-400" },
  "Technology": { bg: "bg-blue-500/20", text: "text-blue-400" },
  "Product": { bg: "bg-purple-500/20", text: "text-purple-400" },
  "Regulatory": { bg: "bg-orange-500/20", text: "text-orange-400" },
  "Use Cases": { bg: "bg-green-500/20", text: "text-green-400" },
};

interface CategoryBadgeProps {
  name: string;
  variant?: "default" | "outline";
}

export function CategoryBadge({ name, variant = "default" }: CategoryBadgeProps) {
  const colors = categoryColors[name] || { bg: "bg-gray-500/20", text: "text-gray-400" };

  if (variant === "outline") {
    return (
      <Badge variant="outline" className={`${colors.text} border-current`}>
        {name}
      </Badge>
    );
  }

  return (
    <div className={`${colors.bg} ${colors.text} px-2 py-1 rounded-full text-xs font-medium`}>
      {name}
    </div>
  );
}
