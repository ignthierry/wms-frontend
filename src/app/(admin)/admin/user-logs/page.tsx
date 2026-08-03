"use client";

import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { 
  FileText, Search, RefreshCw, Download, 
  Monitor, Smartphone, Tablet, Globe, User, Activity
} from "lucide-react";

interface UserLog {
  id: number;
  user_id: number | null;
  username: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  platform: string | null;
  activity: string | null;
  method: string | null;
  endpoint: string | null;
  description: string | null;
  created_at: string;
  user?: { id: number; username: string; name: string } | null;
}

interface Stats {
  total_logs: number;
  today_logs: number;
  unique_users: number;
  total_logins: number;
}

const ACTIVITY_COLORS: Record<string, string> = {
  LOGIN: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  LOGOUT: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  CREATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  UPDATE: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  VIEW: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const METHOD_COLORS: Record<string, string> = {
  GET: "text-blue-600 dark:text-blue-400",
  POST: "text-green-600 dark:text-green-400",
  PUT: "text-amber-600 dark:text-amber-400",
  PATCH: "text-amber-600 dark:text-amber-400",
  DELETE: "text-red-600 dark:text-red-400",
};

function DeviceIcon({ type }: { type: string | null }) {
  if (type === "mobile") return <Smartphone className="w-4 h-4 text-purple-500" />;
  if (type === "tablet") return <Tablet className="w-4 h-4 text-indigo-500" />;
  return <Monitor className="w-4 h-4 text-gray-500" />;
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function UserLogPage() {
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get("auth_token");
      const params = new URLSearchParams({
        per_page: "20",
        page: currentPage.toString(),
      });
      if (search) params.append("search", search);
      if (activityFilter) params.append("activity", activityFilter);
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);

      const res = await fetch(`${apiUrl}/user-logs?${params}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || []);
        setLastPage(data.last_page || 1);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching user logs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, search, activityFilter, dateFrom, dateTo, currentPage]);

  const fetchStats = useCallback(async () => {
    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(`${apiUrl}/user-logs/stats`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleReset = () => {
    setSearch("");
    setActivityFilter("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const header = ["Waktu", "User", "Aktivitas", "Method", "Endpoint", "Deskripsi", "IP", "Browser", "Platform", "Perangkat"];
    const rows = logs.map((l) => [
      formatDate(l.created_at),
      l.username || "-",
      l.activity || "-",
      l.method || "-",
      l.endpoint || "-",
      (l.description || "-").replace(/"/g, '""'),
      l.ip_address || "-",
      l.browser || "-",
      l.platform || "-",
      l.device_type || "-",
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user-log-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { label: "Total Log", value: stats?.total_logs ?? 0, icon: <FileText className="w-5 h-5" />, color: "text-brand-500 bg-brand-50 dark:bg-brand-500/10" },
    { label: "Log Hari Ini", value: stats?.today_logs ?? 0, icon: <Activity className="w-5 h-5" />, color: "text-green-600 bg-green-50 dark:bg-green-500/10" },
    { label: "User Aktif", value: stats?.unique_users ?? 0, icon: <User className="w-5 h-5" />, color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10" },
    { label: "Total Login", value: stats?.total_logins ?? 0, icon: <Globe className="w-5 h-5" />, color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-500" />
          Report User Log
        </h1>
        <p className="text-sm text-gray-500">
          Riwayat aktivitas pengguna: siapa login, dari IP mana, perangkat apa, dan kegiatan apa yang dilakukan.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white p-4 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${card.color}`}>{card.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 items-end">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari user / IP / endpoint / deskripsi..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <select
            value={activityFilter}
            onChange={(e) => { setActivityFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none text-sm"
          >
            <option value="">Semua Aktivitas</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="VIEW">VIEW</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none text-sm"
            title="Dari tanggal"
          />
          <span className="text-gray-400 text-sm">s/d</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none text-sm"
            title="Sampai tanggal"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-white flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-gray-50 dark:bg-gray-800/50">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada data log.</p>
            <p className="text-sm mt-1">Log akan muncul saat user login atau melakukan aktivitas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Waktu</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">User</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Aktivitas</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Endpoint</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Deskripsi</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">IP Address</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Perangkat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold">
                          {(log.username || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{log.username || "-"}</p>
                          {log.user?.name && (
                            <p className="text-xs text-gray-500">{log.user.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ACTIVITY_COLORS[log.activity || ""] || ACTIVITY_COLORS.VIEW}`}>
                        {log.activity || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs ${METHOD_COLORS[log.method || ""] || ""}`}>{log.method}</span>{" "}
                      <span className="text-gray-600 dark:text-gray-300 font-mono text-xs">{log.endpoint || "-"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-xs truncate" title={log.description || ""}>
                      {log.description || "-"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                      {log.ip_address || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <DeviceIcon type={log.device_type} />
                        <span>
                          {log.browser || "Unknown"} / {log.platform || "Unknown"}
                        </span>
                        <span className="text-gray-400">({log.device_type || "desktop"})</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && logs.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500">
              Menampilkan {logs.length} dari {total} log
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 dark:border-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300">
                Hal {currentPage} / {lastPage}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                disabled={currentPage >= lastPage}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 dark:border-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
