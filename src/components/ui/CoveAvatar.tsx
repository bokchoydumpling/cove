"use client";

interface Props {
  src?: string;
  name?: string;
  size: number;
  className?: string;
}

export default function CoveAvatar({ src, name, size, className }: Props) {
  const url =
    src ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name ?? "default")}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  return (
    <img
      src={url}
      width={size}
      height={size}
      alt={name ?? ""}
      className={className}
      style={{ display: "block", width: size, height: size }}
    />
  );
}
