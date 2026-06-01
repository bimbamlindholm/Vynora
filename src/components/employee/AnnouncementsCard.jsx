import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { fetchAnnouncements } from "../../utils/supabaseAnnouncements";
import { EmptyState } from "./employeeComponents";

export default function AnnouncementsCard({ workspaceId }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(() => !!workspaceId);
  const [prevWorkspaceId, setPrevWorkspaceId] = useState(workspaceId);

  if (workspaceId !== prevWorkspaceId) {
    setPrevWorkspaceId(workspaceId);
    setLoading(true);
  }

  useEffect(() => {
    if (!workspaceId) return;
    fetchAnnouncements(workspaceId)
      .then(setAnnouncements)
      .catch((err) => console.error("Failed to load announcements:", err))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  return (
    <section className="glass-panel min-w-0 rounded-2xl p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <Bell className="text-cyan-300 shrink-0" size={18} />
        <h2 className="text-xl font-black text-white">Announcements</h2>
      </div>
      <div className="mt-4 grid gap-3">
        {loading ? (
          <p className="text-sm text-slate-400">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <EmptyState text="No announcements yet." />
        ) : (
          announcements.map((announcement) => (
            <div
              className="rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] p-3"
              key={announcement.id}
            >
              <p className="font-black text-white">{announcement.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">{announcement.body}</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                {new Date(announcement.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
