"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Globe, Plus, X } from "lucide-react";
import { useWebsites } from "@/hooks/useWebsites";
import axios from "axios";
import { API_BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs";

type Tick = { id: string; createdAt: string; status: string; latency: number };

function normalizeStatus(status: string): "up" | "down" | "unknown" {
  const normalized = status.trim().toLowerCase();
  if (normalized === "bad" || normalized === "down") return "down";
  if (normalized === "good" || normalized === "up") return "up";
  return "unknown";
}

// Aggregate ticks into 3-minute windows
function aggregateTicks(ticks: Tick[]) {
  if (!ticks || ticks.length === 0) return [];

  // Sort ticks by createdAt ascending
  const sorted = [...ticks].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const windowMs = 3 * 60 * 1000; // 3 minutes in ms
  const windows: {
    windowStart: Date;
    status: "up" | "down";
    avgLatency: number;
    count: number;
  }[] = [];

  if (sorted.length === 0) return windows;

  const firstTime = new Date(sorted[0].createdAt).getTime();
  const lastTime = new Date(sorted[sorted.length - 1].createdAt).getTime();

  // Build windows from first to last tick
  let windowStart = firstTime;
  while (windowStart <= lastTime) {
    const windowEnd = windowStart + windowMs;
    const inWindow = sorted.filter((t) => {
      const t_ms = new Date(t.createdAt).getTime();
      return t_ms >= windowStart && t_ms < windowEnd;
    });

    if (inWindow.length > 0) {
      const downCount = inWindow.filter((t) => normalizeStatus(t.status) === "down").length;
      const avgLatency = Math.round(inWindow.reduce((sum, t) => sum + t.latency, 0) / inWindow.length);
      windows.push({
        windowStart: new Date(windowStart),
        status: downCount > inWindow.length / 2 ? "down" : "up",
        avgLatency,
        count: inWindow.length,
      });
    }

    windowStart += windowMs;
  }

  return windows;
}

function getUptimePercentage(ticks: { status: string }[]) {
  if (!ticks || ticks.length === 0) return null;
  const upCount = ticks.filter((t) => normalizeStatus(t.status) === "up").length;
  return parseFloat(((upCount / ticks.length) * 100).toFixed(1));
}

function getLastChecked(ticks: { createdAt: string }[]) {
  if (!ticks || ticks.length === 0) return null;
  const sorted = [...ticks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const lastDate = new Date(sorted[0].createdAt);
  const diffMs = Date.now() - lastDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins === 1) return "1 minute ago";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
}

export default function Dashboard() {
  const { getToken } = useAuth();
  const { websites, refreshWebsites } = useWebsites();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCreateWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");

    const rawUrl = url.trim();
    if (!rawUrl) {
      setCreateError("Please enter a website URL.");
      return;
    }

    let urlToSave = rawUrl;
    if (!/^https?:\/\//i.test(urlToSave)) {
      urlToSave = `https://${urlToSave}`;
    }

    try {
      setCreating(true);
      const token = await getToken();

      await axios.post(
        `${API_BACKEND_URL}/api/v1/website`,
        { url: urlToSave },
        {
          headers: {
            Authorization: token ?? undefined,
          },
        }
      );

      setUrl("");
      setIsModalOpen(false);
      await refreshWebsites();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setCreateError(err.response?.data?.message ?? "Failed to create website monitor.");
      } else {
        setCreateError("Failed to create website monitor.");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f5f7",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        padding: "0",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "48px 24px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Globe size={28} color="#2563eb" strokeWidth={2} />
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#111827",
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              Uptime Monitor
            </h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "9px 18px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1d4ed8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2563eb")}
          >
            <Plus size={16} />
            Add Website
          </button>
        </div>

        {/* Website List */}
        {websites.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #e5e7eb",
              padding: "64px 24px",
              textAlign: "center",
            }}
          >
            <Globe size={48} color="#d1d5db" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "#6b7280", fontSize: 16, margin: 0 }}>
              No monitors yet. Add your first website to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {websites.map((website: { id: string; url: string; ticks: Tick[] }) => {
              const isExpanded = expandedId === website.id;
              const uptime = getUptimePercentage(website.ticks);
              const lastChecked = getLastChecked(website.ticks);
              const aggregated = aggregateTicks(website.ticks);
              const currentStatus =
                website.ticks.length === 0
                  ? "unknown"
                  : website.ticks.sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )[0].status;
              const normalizedCurrentStatus =
                currentStatus === "unknown" ? "unknown" : normalizeStatus(currentStatus);
              const statusColor =
                normalizedCurrentStatus === "unknown"
                  ? "#9ca3af"
                  : normalizedCurrentStatus === "up"
                  ? "#22c55e"
                  : "#ef4444";
              const statusGlow =
                normalizedCurrentStatus === "unknown"
                  ? "0 0 0 3px rgba(156,163,175,0.2)"
                  : normalizedCurrentStatus === "up"
                  ? "0 0 0 3px rgba(34,197,94,0.18)"
                  : "0 0 0 3px rgba(239,68,68,0.18)";

              return (
                <div
                  key={website.id}
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    transition: "box-shadow 0.15s",
                  }}
                >
                  {/* Row header */}
                  <button
                    onClick={() => toggleExpand(website.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      padding: "20px 24px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      gap: 14,
                    }}
                  >
                    {/* Status dot */}
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: statusColor,
                        flexShrink: 0,
                        boxShadow: statusGlow,
                      }}
                    />
                    {/* Name + URL + inline status bar */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#111827",
                          marginBottom: 2,
                        }}
                      >
                        {website.url.replace(/^https?:\/\//, "").split("/")[0]}
                      </div>
                      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
                        {website.url}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          alignItems: "center",
                        }}
                      >
                        {(aggregated.length > 0
                          ? aggregated.slice(-10).map((w, i) => (
                              <div
                                key={i}
                                title={`${w.windowStart.toLocaleTimeString()} • ${w.avgLatency}ms • ${w.count} check${w.count > 1 ? "s" : ""}`}
                                style={{
                                  width: 28,
                                  height: 10,
                                  borderRadius: 3,
                                  background: w.status === "up" ? "#22c55e" : "#ef4444",
                                  opacity: 0.9,
                                }}
                              />
                            ))
                          : Array.from({ length: 10 }, (_, i) => (
                              <div
                                key={`placeholder-${i}`}
                                title="No validated checks yet"
                                style={{
                                  width: 28,
                                  height: 10,
                                  borderRadius: 3,
                                  background: "#d1d5db",
                                  opacity: 0.95,
                                }}
                              />
                            )))}
                      </div>
                    </div>
                    {/* Uptime */}
                    <div
                      style={{
                        fontSize: 14,
                        color: "#374151",
                        fontWeight: 600,
                        marginRight: 8,
                      }}
                    >
                      {uptime === null ? "No data yet" : `${uptime}% uptime`}
                    </div>
                    {/* Chevron */}
                    {isExpanded ? (
                      <ChevronUp size={18} color="#9ca3af" />
                    ) : (
                      <ChevronDown size={18} color="#9ca3af" />
                    )}
                  </button>

                  {/* Expanded section */}
                  {isExpanded && (
                    <div
                      style={{
                        borderTop: "1px solid #f3f4f6",
                        padding: "16px 24px 20px",
                        background: "#fafafa",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#374151",
                          marginBottom: 10,
                        }}
                      >
                        Last 30 minutes status:
                      </div>

                      {aggregated.length === 0 ? (
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            flexWrap: "wrap",
                            alignItems: "center",
                            padding: "4px 0",
                          }}
                        >
                          {Array.from({ length: 10 }, (_, i) => (
                            <div
                              key={`expanded-placeholder-${i}`}
                              title="No validated checks yet"
                              style={{
                                width: 34,
                                height: 14,
                                borderRadius: 4,
                                background: "#d1d5db",
                                opacity: 0.95,
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          {aggregated.map((w, i) => (
                            <div
                              key={i}
                              title={`${w.windowStart.toLocaleTimeString()} • ${w.avgLatency}ms • ${w.count} check${w.count > 1 ? "s" : ""}`}
                              style={{
                                width: 34,
                                height: 14,
                                borderRadius: 4,
                                background: w.status === "up" ? "#22c55e" : "#ef4444",
                                cursor: "default",
                                transition: "opacity 0.15s",
                                opacity: 0.9,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.opacity = "1")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.opacity = "0.9")
                              }
                            />
                          ))}
                        </div>
                      )}
                      {aggregated.length === 0 && (
                        <div style={{ fontSize: 13, color: "#9ca3af", paddingTop: 8 }}>
                          No data has been validated yet.
                        </div>
                      )}

                      {lastChecked && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#9ca3af",
                            marginTop: 10,
                          }}
                        >
                          Last checked: {lastChecked}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
          onClick={() => {
            if (creating) return;
            setCreateError("");
            setIsModalOpen(false);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 24,
              width: "100%",
              maxWidth: 420,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#111827",
                  margin: 0,
                }}
              >
                Add Website Monitor
              </h2>
              <button
                onClick={() => {
                  if (creating) return;
                  setCreateError("");
                  setIsModalOpen(false);
                }}
                disabled={creating}
                aria-label="Close modal"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: creating ? "not-allowed" : "pointer",
                  color: "#6b7280",
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWebsite}>
              <label
                htmlFor="website-url"
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "#374151",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Website URL
              </label>

              <input
                id="website-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com or https://example.com"
                disabled={creating}
                style={{
                  width: "100%",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 14,
                  color: "#111827",
                  outline: "none",
                  marginBottom: 12,
                }}
              />

              {createError && (
                <div
                  style={{
                    background: "#fef2f2",
                    color: "#b91c1c",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    fontSize: 13,
                    padding: "8px 10px",
                    marginBottom: 12,
                  }}
                >
                  {createError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    if (creating) return;
                    setCreateError("");
                    setIsModalOpen(false);
                  }}
                  disabled={creating}
                  style={{
                    flex: 1,
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: creating ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    flex: 1,
                    background: creating ? "#93c5fd" : "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: creating ? "not-allowed" : "pointer",
                  }}
                >
                  {creating ? "Creating..." : "Create Monitor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
