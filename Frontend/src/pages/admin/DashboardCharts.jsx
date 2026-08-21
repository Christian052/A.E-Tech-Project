import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

// Brand palette pulled from tailwind.config.js so charts match the site.
const TEAL = "#1c9791";
const TEAL_LIGHT = "#5cd3cb";
const NAVY = "#294876";
const NAVY_LIGHT = "#7f9bc9";
const AMBER = "#e0a13c";
const RED = "#dc6b6b";

const STATUS_COLORS = {
  unread: RED,
  new: RED,
  read: AMBER,
  reviewed: AMBER,
  responded: TEAL,
  accepted: TEAL,
  rejected: "#a8a29e",
};

function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div className={`card ${className}`}>
      <div className="mb-4">
        <h3 className="font-semibold text-navy-800">{title}</h3>
        {subtitle && <p className="text-xs text-navy-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// Buckets a list of docs (with createdAt) into counts per day for the last `days` days.
function buildDailySeries(items, days = 14) {
  const now = new Date();
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    buckets.push({ date: d, label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), count: 0 });
  }
  items.forEach((item) => {
    if (!item.createdAt) return;
    const created = new Date(item.createdAt);
    created.setHours(0, 0, 0, 0);
    const bucket = buckets.find((b) => b.date.getTime() === created.getTime());
    if (bucket) bucket.count += 1;
  });
  return buckets.map(({ label, count }) => ({ label, count }));
}

function buildStatusBreakdown(items) {
  const counts = {};
  items.forEach((i) => {
    counts[i.status] = (counts[i.status] || 0) + 1;
  });
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

export function InquiriesTrendChart({ inquiries }) {
  const data = buildDailySeries(inquiries, 14);
  return (
    <ChartCard title="Inquiries last 14 days" subtitle="New contact-form submissions per day" className="lg:col-span-2">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="inquiryFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={TEAL} stopOpacity={0.35} />
              <stop offset="100%" stopColor={TEAL} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f8" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#7f9bc9" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#7f9bc9" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{ borderRadius: 8, borderColor: "#d5dfee", fontSize: 12 }}
            labelStyle={{ color: "#162748", fontWeight: 600 }}
          />
          <Area type="monotone" dataKey="count" name="Inquiries" stroke={TEAL} strokeWidth={2} fill="url(#inquiryFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function StatusBreakdownChart({ title, subtitle, items }) {
  const data = buildStatusBreakdown(items);
  const total = items.length;

  if (total === 0) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <div className="grid h-[220px] place-items-center text-sm text-navy-400">No data yet</div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || NAVY_LIGHT} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 8, borderColor: "#d5dfee", fontSize: 12 }}
            formatter={(value, name) => [`${value} (${Math.round((value / total) * 100)}%)`, name]}
          />
          <Legend
            verticalAlign="bottom"
            height={28}
            iconType="circle"
            formatter={(value) => <span className="text-xs capitalize text-navy-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ServicesBySlotChart({ services }) {
  const active = services.filter((s) => s.isActive).length;
  const inactive = services.length - active;
  const data = [
    { name: "Active", count: active, fill: TEAL },
    { name: "Inactive", count: inactive, fill: NAVY_LIGHT },
  ];

  return (
    <ChartCard title="Services status" subtitle={`${services.length} total service line${services.length === 1 ? "" : "s"}`}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f8" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#7f9bc9" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#7f9bc9" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#d5dfee", fontSize: 12 }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ProgramSeatsChart({ programs }) {
  const data = programs
    .filter((p) => p.isActive)
    .map((p) => ({ name: p.title.length > 18 ? `${p.title.slice(0, 18)}…` : p.title, seats: p.seatsAvailable || 0 }));

  if (data.length === 0) {
    return (
      <ChartCard title="Open seats by program" subtitle="Active training programs" className="lg:col-span-2">
        <div className="grid h-[220px] place-items-center text-sm text-navy-400">No active programs yet</div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Open seats by program" subtitle="Active training programs" className="lg:col-span-2">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f8" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#7f9bc9" }} axisLine={false} tickLine={false} interval={0} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#7f9bc9" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#d5dfee", fontSize: 12 }} />
          <Bar dataKey="seats" name="Seats available" fill={NAVY} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}