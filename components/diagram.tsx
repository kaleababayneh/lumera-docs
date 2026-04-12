import {
  type BoxElement,
  type ArrowElement,
  type TextElement,
  type DiagramElement,
  diagrams,
} from "@/lib/diagrams";

const c = {
  boxFill: "transparent",
  boxStroke: "hsl(var(--fd-primary))",
  innerFill: "transparent",
  accentFill: "transparent",
  text: "hsl(var(--fd-foreground))",
  mutedText: "hsl(var(--fd-muted-foreground))",
  arrow: "hsl(var(--fd-muted-foreground))",
};

const font = "var(--font-shantell), 'Shantell Sans', sans-serif";

interface DiagramSettings {
  labelSize: number;
  itemSize: number;
  arrowLabelSize: number;
  labelLineHeight: number;
  itemLineHeight: number;
  itemGap: number;
  pad: number;
  borderRadius: number;
  strokeWidth: number;
  arrowWidth: number;
}

function boxFill(variant?: string) {
  if (variant === "inner") return c.innerFill;
  if (variant === "accent") return c.accentFill;
  return c.boxFill;
}

function renderBox(el: BoxElement, s: DiagramSettings) {
  const fill = boxFill(el.variant);
  const lines = el.label.split("\n");
  const hasItems = el.items && el.items.length > 0;

  const labelY = hasItems
    ? el.y + s.labelSize + 6
    : el.y + el.h / 2 - ((lines.length - 1) * s.labelLineHeight) / 2;

  return (
    <g key={el.id}>
      <rect
        x={el.x - s.pad}
        y={el.y - s.pad}
        width={el.w + s.pad * 2}
        height={el.h + s.pad * 2}
        rx={s.borderRadius}
        ry={s.borderRadius}
        fill={fill}
        stroke={c.boxStroke}
        strokeWidth={el.dashed ? s.strokeWidth * 0.75 : s.strokeWidth}
        strokeDasharray={el.dashed ? "6 4" : undefined}
      />
      {lines.map((line: string, i: number) => (
        <text
          key={`${el.id}-l${i}`}
          x={el.x + el.w / 2}
          y={labelY + i * s.labelLineHeight}
          fill={c.text}
          fontSize={s.labelSize}
          fontWeight={400}
          fontFamily={font}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {line}
        </text>
      ))}
      {el.items?.map((item: string, i: number) => (
        <text
          key={`${el.id}-i${i}`}
          x={el.x + el.w / 2}
          y={labelY + lines.length * s.labelLineHeight + s.itemGap + i * s.itemLineHeight}
          fill={c.mutedText}
          fontSize={s.itemSize}
          fontFamily={font}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {item}
        </text>
      ))}
    </g>
  );
}

function renderArrow(el: ArrowElement, diagramId: string, s: DiagramSettings) {
  const mid = `ah-${diagramId}-${el.id}`;
  const [start, ...rest] = el.points;
  const d = `M ${start[0]} ${start[1]} ${rest.map((p: [number, number]) => `L ${p[0]} ${p[1]}`).join(" ")}`;

  return (
    <g key={el.id}>
      <defs>
        <marker
          id={mid}
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto-start-reverse"
        >
          <polygon points="0 0, 10 5, 0 10" fill={c.arrow} />
        </marker>
        {el.bidirectional && (
          <marker
            id={`${mid}-s`}
            viewBox="0 0 10 10"
            refX={1}
            refY={5}
            markerWidth={6}
            markerHeight={6}
            orient="auto-start-reverse"
          >
            <polygon points="10 0, 0 5, 10 10" fill={c.arrow} />
          </marker>
        )}
      </defs>
      <path
        d={d}
        fill="none"
        stroke={c.arrow}
        strokeWidth={s.arrowWidth}
        strokeDasharray={el.dashed ? "6 4" : undefined}
        markerEnd={`url(#${mid})`}
        markerStart={el.bidirectional ? `url(#${mid}-s)` : undefined}
      />
      {el.label && el.labelPos && (
        <text
          x={el.labelPos[0]}
          y={el.labelPos[1]}
          fill={c.mutedText}
          fontSize={s.arrowLabelSize}
          fontFamily={font}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {el.label}
        </text>
      )}
    </g>
  );
}

function renderText(el: TextElement) {
  const lines = el.text.split("\n");
  const sz = el.size ? el.size + 3 : 16;
  const lh = sz + 4;
  const startY = el.y - ((lines.length - 1) * lh) / 2;

  return (
    <g key={el.id}>
      {lines.map((line: string, i: number) => (
        <text
          key={`${el.id}-t${i}`}
          x={el.x}
          y={startY + i * lh}
          fill={el.muted ? c.mutedText : c.text}
          fontSize={sz}
          fontWeight={el.bold ? 700 : 400}
          fontFamily={font}
          textAnchor={el.anchor || "middle"}
          dominantBaseline="middle"
          letterSpacing={el.bold && sz <= 12 ? "0.06em" : undefined}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

export function Diagram({ name }: { name: string }) {
  const def = diagrams[name];
  if (!def) return null;

  const s: DiagramSettings = {
    labelSize:       def.labelSize       ?? 16,
    itemSize:        def.itemSize        ?? 14,
    arrowLabelSize:  def.arrowLabelSize  ?? 13,
    labelLineHeight: def.labelLineHeight ?? (def.labelSize ?? 16) + 6,
    itemLineHeight:  def.itemLineHeight  ?? (def.itemSize ?? 14) + 5,
    itemGap:         def.itemGap         ?? 6,
    pad:             def.pad             ?? 10,
    borderRadius:    def.borderRadius    ?? 16,
    strokeWidth:     def.strokeWidth     ?? 1.3,
    arrowWidth:      def.arrowWidth      ?? 1.3,
  };

  return (
    <figure
      className="my-6 not-prose mx-auto"
      style={def.maxWidth ? { maxWidth: def.maxWidth } : undefined}
    >
      <svg
        viewBox={def.viewBox}
        className="w-full mx-auto"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={def.title || name}
      >
        {def.elements.map((el: DiagramElement) => {
          switch (el.type) {
            case "box":
              return renderBox(el, s);
            case "arrow":
              return renderArrow(el, name, s);
            case "text":
              return renderText(el);
          }
        })}
      </svg>
    </figure>
  );
}
