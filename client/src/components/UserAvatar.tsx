import { cn } from "@/lib/utils";

interface UserAvatarProps {
  photoUrl?: string;
  userName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({
  photoUrl,
  userName = "U",
  size = "md",
  className,
}: UserAvatarProps) {
  // Extrair iniciais do nome
  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  // Gerar cor consistente baseada no nome
  const getColorFromName = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-orange-500",
      "bg-cyan-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={userName}
        className={cn(
          "rounded-full object-cover border border-border",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white border border-border",
        getColorFromName(userName),
        sizeClasses[size],
        className
      )}
      title={userName}
    >
      {initials}
    </div>
  );
}
