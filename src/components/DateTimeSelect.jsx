// src/components/DateTimeSelect.jsx
import { useEffect, useMemo, useState } from "react";

const pad = (n) => String(n).padStart(2, "0");

const MONTHS = [
  { value: "1", label: "Jan" },
  { value: "2", label: "Feb" },
  { value: "3", label: "Mar" },
  { value: "4", label: "Apr" },
  { value: "5", label: "May" },
  { value: "6", label: "Jun" },
  { value: "7", label: "Jul" },
  { value: "8", label: "Aug" },
  { value: "9", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

export default function DateTimeSelect({ value, onChange, withTime = false }) {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("00:00:00");

  /* -----------------------------
   * INIT FROM SERVER VALUE
   * ----------------------------- */
  useEffect(() => {
    if (!value) return;

    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d)) return;

    setYear(String(d.getFullYear()));
    setMonth(String(d.getMonth() + 1));
    setDay(String(d.getDate()));
    setTime(
      `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    );
  }, [value]);

  // useEffect(() => {
  //   if (!value) return;

  //   const d = value instanceof Date ? value : new Date(value);
  //   if (isNaN(d)) return;

  //   setYear(String(d.getFullYear()));
  //   setMonth(String(d.getMonth() + 1));
  //   setDay(String(d.getDate()));
  //   setTime(
  //     `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
  //   );
  // }, [value]);

  /* -----------------------------
   * YEARS
   * ----------------------------- */
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 120 }, (_, i) => String(now - i));
  }, []);

  /* -----------------------------
   * DAYS IN MONTH
   * ----------------------------- */
  const daysInMonth = useMemo(() => {
    if (!year || !month) return 31;
    return new Date(Number(year), Number(month), 0).getDate();
  }, [year, month]);

  /* -----------------------------
   * EMIT ISO (ONLY WHEN COMPLETE)
   * ----------------------------- */
  /* -----------------------------
   * EMIT DATE OBJECT (ONLY WHEN COMPLETE)
   * ----------------------------- */
  useEffect(() => {
    if (!year) {
      onChange(null);
      return;
    }

    // YEAR only
    if (year && !month && !day) {
      onChange(new Date(Number(year), 0, 1));
      return;
    }

    // YEAR + MONTH
    if (year && month && !day) {
      onChange(new Date(Number(year), Number(month) - 1, 1));
      return;
    }

    // FULL DATE
    if (year && month && day) {
      const [hh, mm, ss] = time.split(":").map(Number);

      const d = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        withTime ? hh : 0,
        withTime ? mm : 0,
        withTime ? ss : 0,
      );

      onChange(d);
    }
  }, [year, month, day, time, withTime]);

  return (
    <div className="flex gap-2 items-center justify-between text-slate-500">
      {/* YEAR */}
      <select
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="date-select"
      >
        <option value="">YYYY</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {/* MONTH */}
      <select
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="date-select"
      >
        <option value="">MM</option>
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      {/* DAY */}
      <select
        value={day}
        onChange={(e) => setDay(e.target.value)}
        className="date-select"
      >
        <option value="">DD</option>
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
          <option key={d} value={String(d)}>
            {pad(d)}
          </option>
        ))}
      </select>

      {/* OPTIONAL TIME */}
      {withTime && (
        <input
          type="time"
          step="1"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="time-input"
        />
      )}
    </div>
  );
}
