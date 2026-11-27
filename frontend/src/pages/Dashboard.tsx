
import { useEffect, useState } from "react";
import {
  CheckSquare,
  Target,
  BriefcaseBusiness,
  Clock3,
  ArrowUpRight,
  Sparkles,
  CircleCheck,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/common/StatCard";

interface DashboardData {
  tasks: any[];
  goals: any[];
  skills: any[];
  career: any;
}

function formatDueDate(value?: string) {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return `Due ${new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)}`;
}

export default function Dashboard() {
  const { user } = useAuth();

  const [data, setData] = useState<DashboardData>({
    tasks: [],
    goals: [],
    skills: [],
    career: {},
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [tasks, goals, skills, career] = await Promise.all([
          api.get("/tasks/"),
          api.get("/goals/"),
          api.get("/career/skills"),
          api.get("/career/analytics"),
        ]);

        setData({
          tasks: tasks.data,
          goals: goals.data,
          skills: skills.data,
          career: career.data,
        });
      } catch (error) {
        console.error("Dashboard loading failed:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const pendingTasks = data.tasks.filter(
    (task) => !task.completed
  );

  const completedTasks = data.tasks.filter(
    (task) => task.completed
  );

  const activeGoals = data.goals.filter(
    (goal) => goal.status === "active"
  );

  const firstName = user?.name?.split(" ")[0] || "there";

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <section className="welcome-section">
        <div>
          <h1>Good to see you, {firstName}<span className="greeting-dot">.</span></h1>
          <p>Your life is a work in progress. Let's make today count.</p>
        </div>

      </section>

      <section className="stat-grid">
        <StatCard
          label="Pending tasks"
          value={pendingTasks.length}
          subtitle={`${completedTasks.length} tasks completed`}
          icon={<CheckSquare size={20} />}
        />

        <StatCard
          label="Active goals"
          value={activeGoals.length}
          subtitle={`${data.goals.length} total goals`}
          icon={<Target size={20} />}
        />

        <StatCard
          label="Skills tracked"
          value={data.skills.length}
          subtitle="Across your career journey"
          icon={<BriefcaseBusiness size={20} />}
        />

        <StatCard
          label="Learning hours"
          value={data.career.total_learning_hours ?? 0}
          subtitle="Time invested in growth"
          icon={<Clock3 size={20} />}
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel tasks-panel">
          <div className="panel-heading">
            <div>
              <h2>Upcoming priorities</h2>
            </div>
            <a href="/tasks" className="text-link">
              All tasks <ArrowUpRight size={15} />
            </a>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="empty-state">
              <CircleCheck size={30} />
              <strong>You're all caught up.</strong>
              <span>No pending tasks right now.</span>
            </div>
          ) : (
            pendingTasks.slice(0, 5).map((task) => (
              <div className="task-row" key={task.id}>
                <div className="task-check">
                  <CheckSquare size={18} />
                </div>
                <div className="task-details">
                  <strong>{task.title}</strong>
                  <span>{formatDueDate(task.due_date)}</span>
                </div>
                <span className={`priority ${task.priority}`}>
                  {task.priority}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="panel goals-panel">
          <div className="panel-heading">
            <div>
              <h2>Your goals</h2>
            </div>
            <a href="/goals" className="text-link">
              View all <ArrowUpRight size={15} />
            </a>
          </div>

          {data.goals.length === 0 ? (
            <div className="empty-state goals-empty">
              <div className="empty-icon"><Target size={27} /></div>
              <strong>Your next big thing starts here.</strong>
              <span>Turn an idea into a goal and start tracking your progress.</span>
              <a href="/goals" className="empty-action">Create your first goal <ArrowUpRight size={15} /></a>
            </div>
          ) : (
            data.goals.slice(0, 4).map((goal) => (
              <div className="goal-row" key={goal.id}>
                <div className="goal-heading">
                  <strong>{goal.title}</strong>
                  <span>{goal.progress}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="nova-banner">
        <div className="nova-symbol">
          <Sparkles size={25} />
        </div>
        <div className="nova-banner-copy">
          <h2>Need a little direction?</h2>
          <p>NOVA can help you prioritize, plan and make progress.</p>
        </div>
        <a href="/nova" className="nova-action">
          Talk to NOVA <ArrowUpRight size={17} />
        </a>
      </section>
    </div>
  );
}
