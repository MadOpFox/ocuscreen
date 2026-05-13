import { cn } from "@/lib/utils";
import type { EyeRegion } from "../types/screening";

export interface RegionBox {
  region: EyeRegion;
  label: string;
  /** Normalized 0–1 relative to image dimensions */
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RegionOverlayProps {
  /** Boxes defined as normalized [0,1] fractions of image size */
  regions: RegionBox[];
  /** Container className */
  className?: string;
  showLegend?: boolean;
}

const REGION_STYLES: Record<
  EyeRegion,
  { stroke: string; fill: string; legendBg: string; label: string }
> = {
  sclera: {
    stroke: "stroke-primary",
    fill: "fill-primary/10",
    legendBg: "bg-primary",
    label: "Sclera",
  },
  conjunctiva: {
    stroke: "stroke-secondary",
    fill: "fill-secondary/10",
    legendBg: "bg-secondary",
    label: "Conjunctiva",
  },
  cornea: {
    stroke: "stroke-accent",
    fill: "fill-accent/10",
    legendBg: "bg-accent",
    label: "Cornea",
  },
};

export default function RegionOverlay({
  regions,
  className,
  showLegend = true,
}: RegionOverlayProps) {
  const visibleRegions = regions.filter((r) => r.region !== "sclera");
  const presentRegions = visibleRegions.map((r) => r.region);

  return (
    <div className={cn("relative", className)}>
      {/* SVG overlay — absolute fill over parent */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {visibleRegions.map((box, i) => {
          const styles = REGION_STYLES[box.region];
          return (
            <g key={`${box.region}-${i}`}>
              <rect
                x={box.x * 100}
                y={box.y * 100}
                width={box.width * 100}
                height={box.height * 100}
                className={cn(styles.fill, styles.stroke)}
                strokeWidth="0.5"
                rx="1"
              />
              <text
                x={box.x * 100 + 1}
                y={box.y * 100 + 4}
                className="fill-foreground"
                style={{
                  fontSize: "4px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                }}
              >
                {box.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      {showLegend && presentRegions.length > 0 && (
        <div className="absolute bottom-2 right-2 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2 flex flex-col gap-1.5">
          {presentRegions.map((region) => {
            const styles = REGION_STYLES[region];
            return (
              <div key={region} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-sm shrink-0",
                    styles.legendBg,
                  )}
                />
                <span className="text-xs font-medium text-foreground whitespace-nowrap">
                  {styles.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
