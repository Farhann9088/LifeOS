
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Trash2,
  Pencil,
  X,
  CalendarDays,
  ListTodo,
} from "lucide-react";

import api from "../services/api";

interface Task {
  id: number;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  due_date?: string | null;
}

const emptyForm = {
  title: "",
  description: "",
  priority: "medium" as "high" | "medium" | "low",
  due_date: "",
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadTasks() {
    try {
      setError("");
      const response = await api.get("/tasks/");
      setTasks(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Could not load your tasks."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function openCreateModal() {
    setEditingTask(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      due_date: task.due_date
        ? task.due_date.slice(0, 10)
        : "",
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      description: form.description || null,
      priority: form.priority,
      due_date: form.due_date
        ? `${form.due_date}T23:59:00`
        : null,
    };

    try {
      if (editingTask) {
        await api.patch(`/tasks/${editingTask.id}`, payload);
      } else {
        await api.post("/tasks/", payload);
      }

      setShowModal(false);
      setForm(emptyForm);
      setEditingTask(null);
      await loadTasks();
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Unable to save task."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: Task) {
    try {
      await api.patch(`/tasks/${task.id}`, {
        completed: !task.completed,
      });
      await loadTasks();
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Could not update task."
      );
    }
  }

  async function deleteTask(id: number) {
    if (!window.confirm("Delete this task permanently?")) return;

    try {
      await api.delete(`/tasks/${id}`);
      await loadTasks();
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Could not delete task."
      );
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "pending" && !task.completed) ||
        (filter === "completed" && task.completed) ||
        (filter === task.priority);

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  const pending = tasks.filter((task) => !task.completed).length;
  const completed = tasks.filter((task) => task.completed).length;

  return (
    <div className="module-page">
      <section className="module-heading">
        <div>
          <span className="eyebrow">YOUR DAILY WORKSPACE</span>
          <h1>My Tasks<span className="greeting-dot">.</span></h1>
          <p>Small steps, meaningful progress. Keep things moving.</p>
        </div>

        <button className="primary-button module-add" onClick={openCreateModal}>
          <Plus size={18} />
          New task
        </button>
      </section>

      <section className="task-summary">
        <div className="task-summary-card">
          <span>Total tasks</span>
          <strong>{tasks.length}</strong>
        </div>
        <div className="task-summary-card">
          <span>Pending</span>
          <strong>{pending}</strong>
        </div>
        <div className="task-summary-card">
          <span>Completed</span>
          <strong>{completed}</strong>
        </div>
      </section>

      <section className="task-workspace">
        <div className="task-toolbar">
          <div className="task-search">
            <Search size={17} />
            <input
              placeholder="Search your tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
        </div>

        {error && <div className="form-error task-error">{error}</div>}

        {loading ? (
          <div className="empty-state">Loading your tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <ListTodo size={34} />
            <strong>No tasks found</strong>
            <span>Create a task or change your filters.</span>
            <button className="secondary-button" onClick={openCreateModal}>
              <Plus size={16} /> Create your first task
            </button>
          </div>
        ) : (
          <div className="task-list">
            {filteredTasks.map((task) => (
              <article className="task-item" key={task.id}>
                <button
                  className={`task-toggle ${task.completed ? "done" : ""}`}
                  onClick={() => toggleTask(task)}
                  title="Toggle completion"
                >
                  {task.completed
                    ? <CheckCircle2 size={21} />
                    : <Circle size={21} />}
                </button>

                <div className="task-item-content">
                  <strong className={task.completed ? "task-strikethrough" : ""}>
                    {task.title}
                  </strong>
                  {task.description && <p>{task.description}</p>}
                  <span className="task-due">
                    <CalendarDays size={13} />
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString()
                      : "No deadline"}
                  </span>
                </div>

                <span className={`priority ${task.priority}`}>
                  {task.priority}
                </span>

                <div className="task-actions">
                  <button onClick={() => openEditModal(task)} title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => deleteTask(task.id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <section className="task-modal">
            <div className="modal-heading">
              <div>
                <span className="eyebrow">
                  {editingTask ? "UPDATE TASK" : "NEW TASK"}
                </span>
                <h2>{editingTask ? "Edit task" : "Create a task"}</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <label>Task title</label>
              <input
                required
                placeholder="What needs to get done?"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <label>Description</label>
              <textarea
                placeholder="Add a little detail..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <div className="form-row">
                <div>
                  <label>Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value as typeof form.priority,
                      })
                    }
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label>Due date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) =>
                      setForm({ ...form, due_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="primary-button" disabled={saving}>
                  {saving ? "Saving..." : editingTask ? "Save changes" : "Create task"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
