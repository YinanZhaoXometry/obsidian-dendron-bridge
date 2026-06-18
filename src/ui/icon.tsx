import { useEffect, useRef, MouseEvent as ReactMouseEvent } from "react";
import { getIcon } from "obsidian";

interface IconProps {
  name: string;
  className?: string;
  onClick?: (e: ReactMouseEvent) => void;
}

// Replaces the Svelte `use:icon` action: append an Obsidian SVG icon into a div.
export function Icon({ name, className, onClick }: IconProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.replaceChildren();
    const icon = getIcon(name);
    if (icon) el.appendChild(icon);
  }, [name]);

  return <div ref={ref} className={className} onClick={onClick} />;
}
