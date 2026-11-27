
import { useEffect, useState } from "react";
import {
  Plus,
  Target,
  CalendarDays,
  CheckCircle2,
  Circle,
  Trash2,
  Pencil,
  X,
  ChevronDown,
  ChevronUp,
  Flag,
} from "lucide-react";

import api from "../services/api";

interface Milestone {
  id: number;
  title: string;
  completed: boolean;
  goal_id: number;
}

interface Goal {
  id: number;
  title: string;
  description?: string;
  category?: string;
  target_date?: string;
  status: "active" | "completed" | "paused";
  progress: number;
  total_milestones: number;
  completed_milestones: number;
  milestones: Milestone[];
}

const emptyForm = {
  title: "",
  description: "",
  category: "Personal",
  target_date: "",
};

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [expandedGoal, setExpandedGoal] = useState<number | null>(null);
  const [milestoneInput, setMilestoneInput] = useState("");
  const [addingMilestone, setAddingMilestone] = useState<number | null>(null);

  async function loadGoals() {
    try {
      setError("");
      const response = await api.get("/goals/");
      setGoals(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Unable to load goals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoals();
  }, []);

  function openCreateModal() {
    setEditingGoal(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(goal: Goal) {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      description: goal.description || "",
      category: goal.category || "Personal",
      target_date: goal.target_date || "",
    });
    setShowModal(true);
  }

  async function saveGoal(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      description: form.description || null,
      category: form.category || null,
      target_date: form.target_date || null,
    };

    try {
      if (editingGoal) {
        await api.patch(`/goals/${editingGoal.id}`, payload);
      } else {
        await api.post("/goals/", payload);
      }

      setShowModal(false);
      setForm(emptyForm);
      setEditingGoal(null);
      await loadGoals();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Unable to save goal.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteGoal(id: number) {
    if (!window.confirm("Delete this goal and all its milestones?")) return;

    try {
      await api.delete(`/goals/${id}`);
      await loadGoals();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Unable to delete goal.");
    }
  }

  async function addMilestone(goalId: number) {
    if (!milestoneInput.trim()) return;

    try {
      await api.post(`/goals/${goalId}/milestones`, {
        title: milestoneInput.trim(),
      });

      setMilestoneInput("");
      setAddingMilestone(null);
      await loadGoals();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Unable to add milestone.");
    }
  }

  async function toggleMilestone(milestone: Milestone) {
    try {
      await api.patch(
        `/goals/${milestone.goal_id}/milestones/${milestone.id}`,
        { completed: !milestone.completed }
      );

      await loadGoals();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Unable to update milestone.");
    }
  }

  async function deleteMilestone(goalId: number, milestoneId: number) {
    try {
      await api.delete(
        `/goals/${goalId}/milestones/${milestoneId}`
      );
      await loadGoals();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Unable to delete milestone.");
    }
  }

  async function changeStatus(goal: Goal, status: Goal["status"]) {
    try {
      await api.patch(`/goals/${goal.id}`, { status });
      await loadGoals();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Unable to update goal.");
    }
  }

  const filteredGoals = goals.filter((goal) => {
    if (filter === "all") return true;
    return goal.status === filter;
  });

  const activeCount = goals.filter((g) => g.status === "active").length;
  const completedCount = goals.filter((g) => g.status === "completed").length;

  return (
    <div className="module-page">
      <section className="module-heading">
        <div>
          <span className="eyebrow">THINK BIGGER, START SMALLER</span>
          <h1>Goals & Milestones<span className="greeting-dot">.</span></h1>
          <p>Turn the things you want into things you accomplish.</p>
        </div>

        <button className="primary-button module-add" onClick={openCreateModal}>
          <Plus size={18} /> New goal
        </button>
      </section>

      <section className="task-summary">
        <div className="task-summary-card">
          <span>Total goals</span>
          <strong>{goals.length}</strong>
        </div>
        <div className="task-summary-card">
          <span>Active goals</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="task-summary-card">
          <span>Completed goals</span>
          <strong>{completedCount}</strong>
        </div>
      </section>

      <section className="goals-workspace">
        <div className="goals-toolbar">
          <div>
            <span className="eyebrow">YOUR JOURNEY</span>
            <h2>All your goals</h2>
          </div>

          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All goals</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        {error && <div className="form-error task-error">{error}</div>}

        {loading ? (
          <div className="empty-state">Loading your goals...</div>
        ) : filteredGoals.length === 0 ? (
          <div className="empty-state">
            <Target size={35} />
            <strong>No goals found</strong>
            <span>Start with something you want to achieve.</span>
            <button className="secondary-button" onClick={openCreateModal}>
              <Plus size={16} /> Create your first goal
            </button>
          </div>
        ) : (
          <div className="goals-list">
            {filteredGoals.map((goal) => (
              <article className="goal-card" key={goal.id}>
                <div className="goal-card-top">
                  <div className="goal-icon">
                    <Target size={21} />
                  </div>

                  <div className="goal-main-info">
                    <div className="goal-title-row">
                      <h3>{goal.title}</h3>
                      <span className={`goal-status ${goal.status}`}>
                        {goal.status}
                      </span>
                    </div>

                    <p>{goal.description || "No description added."}</p>

                    <div className="goal-meta">
                      {goal.category && <span><Flag size={13} /> {goal.category}</span>}
                      <span>
                        <CalendarDays size={13} />
                        {goal.target_date
                          ? new Date(goal.target_date + "T00:00:00").toLocaleDateString()
                          : "No deadline"}
                      </span>
                    </div>
                  </div>

                  <div className="goal-card-actions">
                    <button title="Edit goal" onClick={() => openEditModal(goal)}>
                      <Pencil size={16} />
                    </button>
                    <button title="Delete goal" onClick={() => deleteGoal(goal.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="goal-progress-section">
                  <div className="goal-progress-label">
                    <span>Overall progress</span>
                    <strong>{goal.progress}%</strong>
                  </div>

                  <div className="progress-track goal-progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  <span className="milestone-count">
                    {goal.completed_milestones} of {goal.total_milestones} milestones completed
                  </span>
                </div>

                <div className="goal-footer">
                  <button
                    className="milestone-expand"
                    onClick={() =>
                      setExpandedGoal(
                        expandedGoal === goal.id ? null : goal.id
                      )
                    }
                  >
                    {expandedGoal === goal.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    Milestones ({goal.total_milestones})
                  </button>

                  <select
                    aria-label="Goal status"
                    value={goal.status}
                    onChange={(e) =>
                      changeStatus(goal, e.target.value as Goal["status"])
                    }
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {expandedGoal === goal.id && (
                  <div className="milestone-section">
                    {goal.milestones.length === 0 ? (
                      <p className="milestone-empty">
                        No milestones yet. Break this goal into smaller steps.
                      </p>
                    ) : (
                      goal.milestones.map((milestone) => (
                        <div className="milestone-row" key={milestone.id}>
                          <button
                            className={`milestone-toggle ${milestone.completed ? "done" : ""}`}
                            onClick={() => toggleMilestone(milestone)}
                          >
                            {milestone.completed
                              ? <CheckCircle2 size={19} />
                              : <Circle size={19} />}
                          </button>

                          <span className={milestone.completed ? "task-strikethrough" : ""}>
                            {milestone.title}
                          </span>

                          <button
                            className="milestone-delete"
                            title="Delete milestone"
                            onClick={() => deleteMilestone(goal.id, milestone.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))
                    )}

                    {addingMilestone === goal.id ? (
                      <form
                        className="milestone-add-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          addMilestone(goal.id);
                        }}
                      >
                        <input
                          autoFocus
                          placeholder="Enter milestone title..."
                          value={milestoneInput}
                          onChange={(e) => setMilestoneInput(e.target.value)}
                          required
                        />
                        <button className="primary-button">Add</button>
                        <button
                          type="button"
                          className="modal-close"
                          onClick={() => {
                            setAddingMilestone(null);
                            setMilestoneInput("");
                          }}
                        >
                          <X size={17} />
                        </button>
                      </form>
                    ) : (
                      <button
                        className="add-milestone-button"
                        onClick={() => setAddingMilestone(goal.id)}
                      >
                        <Plus size={15} /> Add milestone
                      </button>
                    )}
                  </div>
                )}
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
                  {editingGoal ? "UPDATE YOUR GOAL" : "SET A NEW DIRECTION"}
                </span>
                <h2>{editingGoal ? "Edit goal" : "Create a goal"}</h2>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveGoal}>
              <label>Goal title</label>
              <input
                required
                maxLength={200}
                placeholder="What do you want to achieve?"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <label>Description</label>
              <textarea
                placeholder="Describe your goal..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              <div className="form-row">
                <div>
                  <label>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option>Personal</option>
                    <option>Career</option>
                    <option>Education</option>
                    <option>Health</option>
                    <option>Finance</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label>Target date</label>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={(e) => setForm({ ...form, target_date: e.target.value })}
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
                  {saving ? "Saving..." : editingGoal ? "Save changes" : "Create goal"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
