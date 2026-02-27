"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { fetchIncidents, markIncidentAttended } from "@/lib/api";
import type { IncidentListItem } from "@/lib/api";

const TYPE_LABELS: Record<string, string> = {
  fire: "Fire",
  medical: "Medical",
  road_accident: "Road Accident",
  road_damage: "Road Damage",
  garbage: "Garbage",
  public_safety: "Public Safety",
  theft: "Theft",
  suspicious: "Suspicious",
  public_disturbance: "Public Disturbance",
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchIncidents();
      setIncidents(data.incidents);
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load]);

  const handleMarkAttended = async (id: string) => {
    setMarkingId(id);
    try {
      await markIncidentAttended(id);
      setIncidents((prev) =>
        prev.map((i) => (i.id === id ? { ...i, attended: true, status: "attended" } : i)),
      );
    } catch (err) {
      console.error("Failed to mark attended:", err);
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#1a1d21]">
      <div className="border-b border-[#2d3238] px-4 py-3">
        <h1 className="text-lg font-semibold text-white">Incidents</h1>
        <p className="text-sm text-white/60">All reported incidents from Telegram and web</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-white/60">Loading…</p>
        ) : incidents.length === 0 ? (
          <div className="space-y-2">
            <p className="text-white/60">No incidents yet.</p>
            <p className="text-xs text-white/40">
              Ensure the backend is running on port 8000.{" "}
              <button
                type="button"
                onClick={() => load()}
                className="text-amber-400 hover:underline"
              >
                Retry
              </button>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="rounded-lg border border-[#2d3238] bg-[#252a31] p-4"
              >
                <div className="flex gap-4">
                  {inc.photo_url ? (
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded">
                      <Image
                        src={inc.photo_url}
                        alt="Incident"
                        width={96}
                        height={96}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded bg-[#2d3238] text-2xl">
                      📍
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-medium text-white">
                          {TYPE_LABELS[inc.type] ?? inc.type}
                        </span>
                        {inc.report_id && (
                          <span className="ml-2 text-xs text-white/50">({inc.report_id})</span>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded px-2 py-0.5 text-xs ${
                          inc.attended
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {inc.attended ? "Attended" : inc.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white/70">
                      {inc.latitude.toFixed(5)}, {inc.longitude.toFixed(5)}
                      {inc.hex_id && ` · ${inc.hex_id}`}
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      {new Date(inc.created_at).toLocaleString()} · {inc.source}
                    </p>
                    {!inc.attended && (
                      <button
                        type="button"
                        onClick={() => handleMarkAttended(inc.id)}
                        disabled={markingId === inc.id}
                        className="mt-2 rounded bg-amber-500/20 px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/30 disabled:opacity-50"
                      >
                        {markingId === inc.id ? "Marking…" : "Mark as attended"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
