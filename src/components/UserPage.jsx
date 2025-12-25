import React, { useEffect, useMemo, useState } from "react";
import { Search, Trash2, Edit2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Backend } from "../services/api";
import Confirm from "../components/Confirm";
import LoadingOverlay from "../components/LoadingOverlay";
import { useToast } from "../components/Toast";


const RoleBadge = ({ role }) => {
  const map = {
    admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    manager: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    user: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  };
  return (
    <span className={`px-3 py-1 border rounded-full text-xs ${map[role] || map.user}`}>
      {role}
    </span>
  );
};

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [data, setData] = useState({ items: [], total: 0, totalPages: 1, page: 1, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState("user");
  const toast = useToast();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);

  const [saving, setSaving] = useState(false); // edit save
  const [deleting, setDeleting] = useState(false); // delete

  const params = useMemo(
    () => ({
      page,
      limit,
      q: q || undefined,
      role: role || undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    [page, limit, q, role]
  );

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await Backend.users(params);
      setData(res);
    } catch (e) {
      setErr(e?.response?.data?.message || "Users load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [params]); // eslint-disable-line

  const openEdit = (u) => {
    setEditUser(u);
    setEditRole(u.role);
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await Backend.updateUser(editUser._id, { role: editRole });
      toast.success("User updated");
      setEditUser(null);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };


  const del = (u) => {
    setDeleteUser(u);
    setConfirmOpen(true);
  };


  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div>
          <h2 className="text-xl font-bold">Users</h2>
          <p className="text-sm text-gray-400">Search, filter, edit roles</p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={q}
              onChange={(e) => { setPage(1); setQ(e.target.value); }}
              placeholder="Search name/email..."
              className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={role}
            onChange={(e) => { setPage(1); setRole(e.target.value); }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
          >
            <option value="">All roles</option>
            <option value="admin">admin</option>
            <option value="manager">manager</option>
            <option value="user">user</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {loading ? "Loading..." : `Total: ${data.total}`}
          </div>
          {err && <div className="text-sm text-red-400">{err}</div>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/40 text-gray-400">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((u) => (
                <tr key={u._id} className="border-t border-slate-700/40 hover:bg-slate-900/30">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-300">{u.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3 text-gray-300">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(u)} className="p-2 hover:bg-slate-700 rounded-lg">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => del(u)} className="p-2 hover:bg-red-500/20 text-red-300 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && data.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between">
          <div className="text-gray-400 text-sm">
            Page {data.page} / {data.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-40 hover:bg-slate-700 flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-40 hover:bg-slate-700 flex items-center gap-1"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full">
            <div className="p-5 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Edit User Role</h3>
                <p className="text-sm text-gray-400">{editUser.email}</p>
              </div>
              <button onClick={() => setEditUser(null)} className="p-2 hover:bg-slate-700 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <label className="text-sm text-gray-300">Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-purple-500"
              >
                <option value="admin">admin</option>
                <option value="manager">manager</option>
                <option value="user">user</option>
              </select>

              <div className="flex gap-3 pt-2">
                <button
                  disabled={saving}
                  onClick={saveEdit}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditUser(null)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Confirm
        open={confirmOpen}
        title="Delete user?"
        desc={deleteUser ? `Delete user: ${deleteUser.name} (${deleteUser.email})` : ""}
        okText="Delete"
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteUser(null);
        }}
        onOk={async () => {
          if (!deleteUser) return;
          setDeleting(true);
          try {
            await Backend.deleteUser(deleteUser._id);
            toast.success("User deleted");
            setConfirmOpen(false);
            setDeleteUser(null);
            await load();
          } catch (e) {
            toast.error(e?.response?.data?.message || "Delete failed");
          } finally {
            setDeleting(false);
          }
        }}
      />
      <LoadingOverlay open={deleting} text="Deleting user..." />
      <LoadingOverlay open={saving} text="Saving changes..." />

    </div>
  );
}
