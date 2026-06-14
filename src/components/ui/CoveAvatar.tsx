"use client";

const BG = "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf";

interface Props {
  name: string;
  size: number;
  src?: string;  // kept for call-site compat; name drives the URL
  className?: string;
}

export default function CoveAvatar({ name, size, className }: Props) {
  const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}&backgroundColor=${BG}`;
  return (
    <img
      src={url}
      width={size}
      height={size}
      alt={name}
      className={className}
      style={{ display: "block", width: size, height: size }}
    />
  );
}
