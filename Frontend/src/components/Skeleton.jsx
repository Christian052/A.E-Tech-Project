// Skeleton screen primitives — shimmering placeholders shown while content loads,
// so layout doesn't jump and the page never shows a bare "Loading…" string.

function Shimmer({ className = "", style }) {
  return <div className={`animate-pulse rounded-md bg-navy-100 ${className}`} style={style} />;
}

export function SkeletonLine({ width = "100%", className = "" }) {
  return <Shimmer className={`h-3.5 ${className}`} style={{ width }} />;
}

// Mirrors ServiceCard: icon block, title line, 2 body lines, "learn more" line.
export function SkeletonServiceCard() {
  return (
    <div className="card flex flex-col">
      <Shimmer className="mb-4 h-12 w-12 rounded-lg" />
      <Shimmer className="mb-3 h-4 w-3/4" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-5/6" />
        <Shimmer className="h-3 w-2/3" />
      </div>
      <Shimmer className="mt-4 h-3 w-24" />
    </div>
  );
}

export function SkeletonServiceCardGrid({ count = 6 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonServiceCard key={i} />
      ))}
    </div>
  );
}

// Mirrors the Services page's detail rows: numbered badge + title + paragraph.
export function SkeletonServiceRow() {
  return (
    <div className="card flex flex-col gap-4 sm:flex-row">
      <Shimmer className="h-14 w-14 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-3">
        <Shimmer className="h-4 w-1/3" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-11/12" />
        <Shimmer className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonServiceRowList({ count = 6 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonServiceRow key={i} />
      ))}
    </div>
  );
}

// Mirrors a gallery photo tile: image block + caption line.
export function SkeletonGalleryTile() {
  return (
    <div className="overflow-hidden rounded-xl border border-navy-100 bg-navy-50">
      <Shimmer className="h-56 w-full rounded-none" />
      <div className="p-3">
        <Shimmer className="h-3.5 w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonGalleryGrid({ count = 6 }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonGalleryTile key={i} />
      ))}
    </div>
  );
}

// Mirrors a training-program card.
export function SkeletonProgramCard() {
  return (
    <div className="card">
      <Shimmer className="h-4 w-2/3" />
      <div className="mt-3 space-y-2">
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-5/6" />
      </div>
      <div className="mt-4 flex gap-3">
        <Shimmer className="h-5 w-20 rounded-full" />
        <Shimmer className="h-5 w-28 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonProgramList({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProgramCard key={i} />
      ))}
    </div>
  );
}

// Mirrors an admin data-table row with a given number of columns.
export function SkeletonTableRows({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <Shimmer className="h-3.5 w-full max-w-[10rem]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Mirrors an Overview KPI card.
export function SkeletonStatCard() {
  return (
    <div className="card">
      <Shimmer className="h-3 w-24" />
      <Shimmer className="mt-3 h-8 w-16" />
    </div>
  );
}

export default Shimmer;

// Mirrors an Overview chart card (title + chart area).
export function SkeletonChartCard({ className = "" }) {
  return (
    <div className={`card ${className}`}>
      <Shimmer className="h-3.5 w-40" />
      <Shimmer className="mt-1.5 h-3 w-28" />
      <Shimmer className="mt-4 h-[220px] w-full rounded-lg" />
    </div>
  );
}


