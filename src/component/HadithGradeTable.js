"use client";
import { useState, useRef, useCallback, useEffect } from "react";

const GRADES = [
  { key: "sahih", label: "Sahih", color: "#6B222D" },
  { key: "hasan", label: "Hasan", color: "#B06A70" },
  { key: "daif", label: "Daif", color: "#C79EA0" },
  { key: "difficult", label: "Difficult", color: "#DCC6C6" },
  { key: "fabricated", label: "Fabricated", color: "#8E8078" },
  { key: "notHadith", label: "Not hadith", color: "#E8DEDC" },
];

const DEFAULT_DATA = [
  {
    name: "Malik",
    sahih: 1369,
    hasan: 45,
    daif: 322,
    difficult: 119,
    fabricated: 0,
    notHadith: 97,
  },
  {
    name: "Ahmad",
    sahih: 19620,
    hasan: 2562,
    daif: 3822,
    difficult: 1790,
    fabricated: 0,
    notHadith: 0,
  },
  {
    name: "Bukhari",
    sahih: 7344,
    hasan: 0,
    daif: 0,
    difficult: 100,
    fabricated: 0,
    notHadith: 0,
  },
  {
    name: "Muslim",
    sahih: 7422,
    hasan: 0,
    daif: 0,
    difficult: 141,
    fabricated: 0,
    notHadith: 0,
  },
  {
    name: "Ibn Majah",
    sahih: 2383,
    hasan: 838,
    daif: 1089,
    difficult: 0,
    fabricated: 33,
    notHadith: 0,
  },
  {
    name: "Abu Dawud",
    sahih: 2942,
    hasan: 1091,
    daif: 1245,
    difficult: 0,
    fabricated: 0,
    notHadith: 0,
  },
  {
    name: "Tirmidhi",
    sahih: 2278,
    hasan: 822,
    daif: 874,
    difficult: 0,
    fabricated: 3,
    notHadith: 0,
  },
  {
    name: "Nasai",
    sahih: 4774,
    hasan: 654,
    daif: 336,
    difficult: 0,
    fabricated: 0,
    notHadith: 0,
  },
  {
    name: "Azami",
    sahih: 12197,
    hasan: 4349,
    daif: 0,
    difficult: 0,
    fabricated: 0,
    notHadith: 0,
    secondary: true,
  },
];

const WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];
const toWord = (n) => WORDS[n] || String(n);

const rowTotal = (row) => GRADES.reduce((sum, g) => sum + (row[g.key] || 0), 0);
const fmtCount = (n) => n.toLocaleString();
const fmtPct = (part, whole) => {
  if (whole === 0) return "0%";
  const pct = (part / whole) * 100;
  return pct > 0 && pct < 1 ? pct.toFixed(1) + "%" : Math.round(pct) + "%";
};

function Toggle({ options, value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="flex gap-1">
      {options.map((opt) => {
        const on = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(opt.value)}
            className={
              "rounded-md border px-3 py-1.5 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 " +
              (on
                ? "border-neutral-400 bg-neutral-100 text-neutral-900"
                : "border-neutral-200 bg-transparent text-neutral-500 hover:border-neutral-300")
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function HadithGradeTable({
  data = DEFAULT_DATA,
  className = "",
}) {
  const [view, setView] = useState("table");
  const [mode, setMode] = useState("counts");
  const [sort, setSort] = useState("date");
  const [tip, setTip] = useState(null);
  const wrapRef = useRef(null);
  const prevCombo = useRef({ view, mode });
  // What the sort was before distribution+percent forced it to "sahih".
  const sortBeforeAuto = useRef(null);

  useEffect(() => {
    const wasIn =
      prevCombo.current.view === "distribution" &&
      prevCombo.current.mode === "percent";
    const isIn = view === "distribution" && mode === "percent";

    if (isIn && !wasIn) {
      // Remember what the user had, so the switch is reversible.
      sortBeforeAuto.current = sort;
      setSort("sahih");
    } else if (!isIn && wasIn && sortBeforeAuto.current !== null) {
      // Put it back. Without this the forced "sahih" survived the trip
      // out of distribution+percent, so returning to the table showed
      // rows ordered by sahih count rather than the order they're
      // declared in.
      setSort(sortBeforeAuto.current);
      sortBeforeAuto.current = null;
    }

    prevCombo.current = { view, mode };
  }, [view, mode]);

  const secondary = data.filter((r) => r.secondary);
  const primary = data
    .filter((r) => !r.secondary)
    .sort((a, b) => {
      if (sort === "date") return 0;
      if (sort === "total") return rowTotal(b) - rowTotal(a);
      return mode === "percent"
        ? (b[sort] || 0) / rowTotal(b) - (a[sort] || 0) / rowTotal(a)
        : (b[sort] || 0) - (a[sort] || 0);
    });
  const maxTotal = Math.max(...primary.map(rowTotal), 1);

  const totals = GRADES.reduce((acc, g) => {
    acc[g.key] = primary.reduce((sum, r) => sum + (r[g.key] || 0), 0);
    return acc;
  }, {});
  const grandTotal = GRADES.reduce((sum, g) => sum + totals[g.key], 0);

  const showTip = useCallback((event, row, grade, value) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const seg = event.currentTarget.getBoundingClientRect();
    const box = wrap.getBoundingClientRect();
    setTip({
      key: row.name + grade.key,
      name: row.name,
      grade: grade.label,
      value,
      pct: fmtPct(value, rowTotal(row)),
      x: seg.left - box.left + seg.width / 2,
      y: seg.top - box.top,
    });
  }, []);

  const hideTip = useCallback(() => setTip(null), []);

  const CYCLE = ["sahih", "daif", "date"];
  const SORT_LABELS = {
    date: "Date",
    total: "Total",
    ...Object.fromEntries(GRADES.map((g) => [g.key, g.label])),
  };

  const CycleSort = () => {
    const next = CYCLE[(CYCLE.indexOf(sort) + 1) % CYCLE.length];
    return (
      <button
        type="button"
        onClick={() => setSort(next)}
        aria-label={`Sorted by ${SORT_LABELS[sort]}. Click to sort by ${SORT_LABELS[next]}`}
        className="hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Sort by {SORT_LABELS[sort].toLowerCase()}
      </button>
    );
  };

  const SortBy = ({ field, label }) => {
    const on = sort === field;
    return (
      <button
        type="button"
        onClick={() => setSort(on ? "date" : field)}
        aria-label={
          on ? `Sorted by ${label}, click to sort by date` : `Sort by ${label}`
        }
        className="hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {label}
        {on ? " ↓" : ""}
      </button>
    );
  };

  const TableRow = ({ row, muted }) => {
    const total = rowTotal(row);
    const tone = muted ? "text-neutral-500" : "text-neutral-900";
    return (
      <tr className="border-b border-neutral-200">
        <td className={`py-2.5 pr-2 ${tone}`}>{row.name}</td>
        {GRADES.map((g) => {
          const value = row[g.key] || 0;
          return (
            <td key={g.key} className={`px-2 py-2.5 text-right ${tone}`}>
              {value === 0 ? (
                <span className="text-neutral-300">—</span>
              ) : mode === "counts" ? (
                fmtCount(value)
              ) : (
                fmtPct(value, total)
              )}
            </td>
          );
        })}
        <td className={`py-2.5 pl-2 text-right font-medium ${tone}`}>
          {mode === "counts" ? fmtCount(total) : "100%"}
        </td>
      </tr>
    );
  };

  const BarRow = ({ row, muted }) => {
    const total = rowTotal(row);
    const width = mode === "counts" ? (total / maxTotal) * 100 : 100;
    return (
      <div className={`mb-4 ${muted ? "opacity-70" : ""}`}>
        <div className="mb-1.5 text-sm font-medium text-neutral-900">
          {row.name}
        </div>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div
              style={{
                width: `${width.toFixed(2)}%`,
                minWidth: "3%",
              }}
            >
              <div className="flex h-5 gap-px overflow-hidden rounded-sm">
                {GRADES.map((g) => {
                  const value = row[g.key] || 0;
                  if (value === 0) return null;
                  const dimmed =
                    tip &&
                    tip.name === row.name &&
                    tip.key !== row.name + g.key;
                  return (
                    <button
                      key={g.key}
                      type="button"
                      aria-label={`${row.name}, ${g.label}: ${fmtCount(value)} (${fmtPct(value, total)})`}
                      onMouseEnter={(e) => showTip(e, row, g, value)}
                      onMouseLeave={hideTip}
                      onFocus={(e) => showTip(e, row, g, value)}
                      onBlur={hideTip}
                      onClick={(e) =>
                        tip && tip.key === row.name + g.key
                          ? hideTip()
                          : showTip(e, row, g, value)
                      }
                      className="block h-full cursor-default transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      style={{
                        width: `${((value / total) * 100).toFixed(2)}%`,
                        background: g.color,
                        opacity: dimmed ? 0.35 : 1,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <span className="shrink-0 text-sm font-medium tabular-nums text-neutral-900">
            {fmtCount(total)}
          </span>
        </div>
        <div className="mt-1.5" />
      </div>
    );
  };

  return (
    <div className={`w-full text-neutral-900 ${className}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Toggle
          label="View"
          value={view}
          onChange={setView}
          options={[
            { value: "table", label: "Table" },
            { value: "distribution", label: "Distribution" },
          ]}
        />
        <span className="mx-1 h-4 w-px bg-neutral-200" aria-hidden="true" />
        <Toggle
          label="Number format"
          value={mode}
          onChange={setMode}
          options={[
            { value: "counts", label: "Counts" },
            { value: "percent", label: "Percent" },
          ]}
        />
      </div>

      <div ref={wrapRef} className="relative">
        {view === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm tabular-nums">
              <thead>
                <tr className="border-b border-neutral-300">
                  <th className="py-2 pr-2 text-left text-xs font-medium text-neutral-500">
                    <span className="sr-only">Compiler</span>
                  </th>
                  {GRADES.map((g) => (
                    <th
                      key={g.key}
                      className="px-2 py-2 text-right text-xs font-medium text-neutral-500"
                    >
                      <SortBy field={g.key} label={g.label} />
                    </th>
                  ))}
                  <th className="py-2 pl-2 text-right text-xs font-medium text-neutral-500">
                    <SortBy field="total" label="Total" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {primary.map((row) => (
                  <TableRow key={row.name} row={row} muted={false} />
                ))}
                <tr className="border-t border-neutral-300">
                  <td className="py-2.5 pr-2 font-medium">All primary</td>
                  {GRADES.map((g) => (
                    <td
                      key={g.key}
                      className="px-2 py-2.5 text-right font-medium"
                    >
                      {mode === "counts"
                        ? fmtCount(totals[g.key])
                        : fmtPct(totals[g.key], grandTotal)}
                    </td>
                  ))}
                  <td className="py-2.5 pl-2 text-right font-medium">
                    {mode === "counts" ? fmtCount(grandTotal) : "100%"}
                  </td>
                </tr>
                {secondary.length > 0 && (
                  <tr>
                    <td
                      colSpan={GRADES.length + 2}
                      className="border-t-2 border-neutral-400 p-0"
                    />
                  </tr>
                )}
                {secondary.map((row) => (
                  <TableRow key={row.name} row={row} muted />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-end border-b border-neutral-300 pb-2 text-xs font-medium text-neutral-500">
              <span className="flex items-center gap-4">
                {mode === "percent" && <CycleSort />}
                <SortBy field="total" label="Total" />
              </span>
            </div>
            {primary.map((row) => (
              <BarRow key={row.name} row={row} muted={false} />
            ))}
            {secondary.length > 0 && (
              <div className="mb-4 border-t-2 border-neutral-400" />
            )}
            {secondary.map((row) => (
              <BarRow key={row.name} row={row} muted />
            ))}
          </div>
        )}

        {tip && (
          <div
            role="status"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs whitespace-nowrap shadow-sm"
            style={{ left: tip.x, top: tip.y - 6 }}
          >
            {tip.grade}{" "}
            <span className="font-medium">{fmtCount(tip.value)}</span>{" "}
            <span className="text-neutral-500">({tip.pct})</span>
          </div>
        )}
      </div>

      <p className="mt-3.5 text-xs leading-relaxed text-neutral-500">
        Totals cover the {toWord(primary.length)} primary collections (
        {fmtCount(grandTotal)} hadith). Azami&apos;s <em>Jami al-Kamil</em> is
        listed separately as a secondary collection. It is a complete collection
        of sahih and hasan hadith. It may have fewer narrations because it
        excludes multiple chains and different versions of essentially the same
        hadith. In addition, it focuses exclusively on direct Prophetic{" "}
        <span lang="ar">ﷺ</span> narrations rather than Companion and Successor
        reports.
      </p>
    </div>
  );
}