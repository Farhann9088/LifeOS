
import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Plus, Trash2, Edit2, X, BookOpen, Clock3,
  Target, Award, TrendingUp, CheckCircle2,
  Code2, ChevronDown, ChevronUp
} from "lucide-react";

type Skill = {
  id: number;
  name: string;
  category?: string;
  description?: string;
  current_level: string;
  target_level: string;
  activities: Activity[];
};

type Activity = {
  id: number;
  title: string;
  activity_type: string;
  description?: string;
  hours_spent: number;
};

type Milestone = {
  id: number;
  title: string;
  description?: string;
  target_date?: string;
  completed: boolean;
};

type Analytics = {
  total_skills: number;
  total_learning_activities: number;
  total_learning_hours: number;
  total_career_milestones: number;
  completed_career_milestones: number;
  milestone_completion_percentage: number;
};

const emptySkill = {
  name: "",
  category: "",
  description: "",
  current_level: "beginner",
  target_level: "advanced",
};

const emptyActivity = {
  title: "",
  activity_type: "course",
  description: "",
  hours_spent: 0,
};

const emptyMilestone = {
  title: "",
  description: "",
  target_date: "",
};

export default function Career() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [skillModal, setSkillModal] = useState(false);
  const [activityModal, setActivityModal] = useState(false);
  const [milestoneModal, setMilestoneModal] = useState(false);

  const [editingSkill, setEditingSkill] = useState<number | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [expandedSkill, setExpandedSkill] = useState<number | null>(null);

  const [skillForm, setSkillForm] = useState(emptySkill);
  const [activityForm, setActivityForm] = useState(emptyActivity);
  const [milestoneForm, setMilestoneForm] = useState(emptyMilestone);

  const loadData = async () => {
    try {
      setError("");
      const [skillsRes, milestonesRes, analyticsRes] = await Promise.all([
        api.get("/career/skills"),
        api.get("/career/milestones"),
        api.get("/career/analytics"),
      ]);

      setSkills(skillsRes.data);
      setMilestones(milestonesRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Could not load career data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveSkill = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSkill) {
        await api.patch(`/career/skills/${editingSkill}`, skillForm);
      } else {
        await api.post("/career/skills", skillForm);
      }

      setSkillModal(false);
      setEditingSkill(null);
      setSkillForm(emptySkill);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Unable to save skill.");
    }
  };

  const editSkill = (skill: Skill) => {
    setEditingSkill(skill.id);
    setSkillForm({
      name: skill.name,
      category: skill.category || "",
      description: skill.description || "",
      current_level: skill.current_level,
      target_level: skill.target_level,
    });
    setSkillModal(true);
  };

  const deleteSkill = async (id: number) => {
    if (!confirm("Delete this skill and its associated activities?")) return;

    try {
      await api.delete(`/career/skills/${id}`);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Unable to delete skill.");
    }
  };

  const saveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkill) return;

    try {
      await api.post(
        `/career/skills/${selectedSkill}/activities`,
        activityForm
      );

      setActivityModal(false);
      setActivityForm(emptyActivity);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Unable to save activity.");
    }
  };

  const deleteActivity = async (skillId: number, activityId: number) => {
    if (!confirm("Delete this learning activity?")) return;

    try {
      await api.delete(
        `/career/skills/${skillId}/activities/${activityId}`
      );
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Unable to delete activity.");
    }
  };

  const saveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/career/milestones", {
        ...milestoneForm,
        target_date: milestoneForm.target_date || null,
      });

      setMilestoneModal(false);
      setMilestoneForm(emptyMilestone);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Unable to save milestone.");
    }
  };

  const toggleMilestone = async (milestone: Milestone) => {
    try {
      await api.patch(`/career/milestones/${milestone.id}`, {
        completed: !milestone.completed,
      });
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Unable to update milestone.");
    }
  };

  const deleteMilestone = async (id: number) => {
    if (!confirm("Delete this career milestone?")) return;

    try {
      await api.delete(`/career/milestones/${id}`);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Unable to delete milestone.");
    }
  };

  if (loading) {
    return <div className="career-page"><p>Loading career progress...</p></div>;
  }

  return (
    <div className="career-page">
      <div className="career-header">
        <div>
          <span className="page-eyebrow">PERSONAL DEVELOPMENT</span>
          <h1>Career Progress</h1>
          <p>Build skills, track what you learn, and move toward your goals.</p>
        </div>
        <button className="primary-btn" onClick={() => {
          setEditingSkill(null);
          setSkillForm(emptySkill);
          setSkillModal(true);
        }}>
          <Plus size={18} /> Add Skill
        </button>
      </div>

      {error && <div className="career-error">{error}</div>}

      <div className="career-stats">
        <div className="career-stat">
          <div className="career-stat-icon"><Code2 /></div>
          <span>Total Skills</span>
          <strong>{analytics?.total_skills ?? 0}</strong>
        </div>
        <div className="career-stat">
          <div className="career-stat-icon"><BookOpen /></div>
          <span>Learning Activities</span>
          <strong>{analytics?.total_learning_activities ?? 0}</strong>
        </div>
        <div className="career-stat">
          <div className="career-stat-icon"><Clock3 /></div>
          <span>Learning Hours</span>
          <strong>{analytics?.total_learning_hours ?? 0}</strong>
        </div>
        <div className="career-stat">
          <div className="career-stat-icon"><Target /></div>
          <span>Milestones Completed</span>
          <strong>
            {analytics?.completed_career_milestones ?? 0}/
            {analytics?.total_career_milestones ?? 0}
          </strong>
        </div>
      </div>

      <div className="career-content-grid">
        <section className="career-panel">
          <div className="career-section-heading">
            <div>
              <h2>My Skills</h2>
              <p>Track your technical and professional abilities.</p>
            </div>
            <button className="icon-btn" onClick={() => {
              setEditingSkill(null);
              setSkillForm(emptySkill);
              setSkillModal(true);
            }}>
              <Plus size={19} />
            </button>
          </div>

          {skills.length === 0 ? (
            <div className="career-empty">
              <Code2 size={30} />
              <h3>No skills added yet</h3>
              <p>Start by adding a skill you want to develop.</p>
            </div>
          ) : (
            <div className="career-skill-list">
              {skills.map((skill) => (
                <div className="career-skill-card" key={skill.id}>
                  <div className="career-skill-top">
                    <div>
                      <h3>{skill.name}</h3>
                      <span>{skill.category || "General"}</span>
                    </div>
                    <div className="career-actions">
                      <button className="icon-btn" onClick={() => editSkill(skill)}>
                        <Edit2 size={15} />
                      </button>
                      <button className="icon-btn danger" onClick={() => deleteSkill(skill.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {skill.description && <p className="career-description">{skill.description}</p>}

                  <div className="career-levels">
                    <span>Current: <b>{skill.current_level}</b></span>
                    <span>Target: <b>{skill.target_level}</b></span>
                  </div>

                  <button
                    className="career-expand-btn"
                    onClick={() => setExpandedSkill(
                      expandedSkill === skill.id ? null : skill.id
                    )}
                  >
                    <span>{skill.activities?.length || 0} learning activities</span>
                    {expandedSkill === skill.id
                      ? <ChevronUp size={17} />
                      : <ChevronDown size={17} />}
                  </button>

                  {expandedSkill === skill.id && (
                    <div className="career-activities">
                      <button
                        className="text-action"
                        onClick={() => {
                          setSelectedSkill(skill.id);
                          setActivityForm(emptyActivity);
                          setActivityModal(true);
                        }}
                      >
                        <Plus size={15} /> Log activity
                      </button>

                      {skill.activities?.length ? skill.activities.map((activity) => (
                        <div className="career-activity" key={activity.id}>
                          <div>
                            <b>{activity.title}</b>
                            <span>{activity.activity_type} · {activity.hours_spent} hrs</span>
                          </div>
                          <button className="icon-btn danger" onClick={() => deleteActivity(skill.id, activity.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )) : (
                        <p className="career-muted">No activities logged for this skill.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="career-panel">
          <div className="career-section-heading">
            <div>
              <h2>Career Milestones</h2>
              <p>Keep track of important career achievements.</p>
            </div>
            <button className="icon-btn" onClick={() => setMilestoneModal(true)}>
              <Plus size={19} />
            </button>
          </div>

          <div className="career-milestone-progress">
            <div className="progress-heading">
              <span>Overall progress</span>
              <b>{analytics?.milestone_completion_percentage ?? 0}%</b>
            </div>
            <div className="career-progress-track">
              <div style={{
                width: `${analytics?.milestone_completion_percentage ?? 0}%`
              }} />
            </div>
          </div>

          {milestones.length === 0 ? (
            <div className="career-empty">
              <Award size={30} />
              <h3>No milestones yet</h3>
              <p>Add a career milestone to track your progress.</p>
            </div>
          ) : (
            <div className="career-milestone-list">
              {milestones.map((milestone) => (
                <div className="career-milestone" key={milestone.id}>
                  <button
                    className={`milestone-check ${milestone.completed ? "completed" : ""}`}
                    onClick={() => toggleMilestone(milestone)}
                    title="Toggle completion"
                  >
                    {milestone.completed && <CheckCircle2 size={17} />}
                  </button>
                  <div className="milestone-details">
                    <h3 className={milestone.completed ? "completed-text" : ""}>
                      {milestone.title}
                    </h3>
                    {milestone.description && <p>{milestone.description}</p>}
                    {milestone.target_date && (
                      <span>Target: {milestone.target_date}</span>
                    )}
                  </div>
                  <button className="icon-btn danger" onClick={() => deleteMilestone(milestone.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="career-summary">
            <TrendingUp size={19} />
            <div>
              <b>Keep moving forward</b>
              <p>Small, consistent improvements build long-term career growth.</p>
            </div>
          </div>
        </section>
      </div>

      {skillModal && (
        <div className="modal-overlay" onClick={() => setSkillModal(false)}>
          <form className="career-modal" onSubmit={saveSkill} onClick={(e) => e.stopPropagation()}>
            <div className="modal-heading">
              <h2>{editingSkill ? "Edit Skill" : "Add New Skill"}</h2>
              <button type="button" className="icon-btn" onClick={() => setSkillModal(false)}><X /></button>
            </div>
            <label>Skill Name</label>
            <input required placeholder="e.g. Java, React, Python" value={skillForm.name} onChange={e => setSkillForm({...skillForm, name: e.target.value})} />
            <label>Category</label>
            <input placeholder="e.g. Programming, Design" value={skillForm.category} onChange={e => setSkillForm({...skillForm, category: e.target.value})} />
            <label>Description</label>
            <textarea placeholder="What do you want to learn?" value={skillForm.description} onChange={e => setSkillForm({...skillForm, description: e.target.value})} />
            <div className="career-form-row">
              <div>
                <label>Current Level</label>
                <select value={skillForm.current_level} onChange={e => setSkillForm({...skillForm, current_level: e.target.value})}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label>Target Level</label>
                <select value={skillForm.target_level} onChange={e => setSkillForm({...skillForm, target_level: e.target.value})}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <button className="primary-btn modal-submit" type="submit">
              {editingSkill ? "Save Changes" : "Create Skill"}
            </button>
          </form>
        </div>
      )}

      {activityModal && (
        <div className="modal-overlay" onClick={() => setActivityModal(false)}>
          <form className="career-modal" onSubmit={saveActivity} onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <h2>Log Learning Activity</h2>
              <button type="button" className="icon-btn" onClick={() => setActivityModal(false)}><X /></button>
            </div>
            <label>Activity Title</label>
            <input required placeholder="e.g. Completed React course" value={activityForm.title} onChange={e => setActivityForm({...activityForm, title: e.target.value})} />
            <label>Activity Type</label>
            <select value={activityForm.activity_type} onChange={e => setActivityForm({...activityForm, activity_type: e.target.value})}>
              <option value="course">Course</option>
              <option value="project">Project</option>
              <option value="practice">Practice</option>
              <option value="certification">Certification</option>
              <option value="reading">Reading</option>
            </select>
            <label>Hours Spent</label>
            <input type="number" min="0" step="0.5" value={activityForm.hours_spent} onChange={e => setActivityForm({...activityForm, hours_spent: Number(e.target.value)})} />
            <label>Description</label>
            <textarea placeholder="What did you work on?" value={activityForm.description} onChange={e => setActivityForm({...activityForm, description: e.target.value})} />
            <button className="primary-btn modal-submit" type="submit">Save Activity</button>
          </form>
        </div>
      )}

      {milestoneModal && (
        <div className="modal-overlay" onClick={() => setMilestoneModal(false)}>
          <form className="career-modal" onSubmit={saveMilestone} onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <h2>Add Career Milestone</h2>
              <button type="button" className="icon-btn" onClick={() => setMilestoneModal(false)}><X /></button>
            </div>
            <label>Milestone Title</label>
            <input required placeholder="e.g. Get my first developer job" value={milestoneForm.title} onChange={e => setMilestoneForm({...milestoneForm, title: e.target.value})} />
            <label>Description</label>
            <textarea placeholder="Describe this milestone..." value={milestoneForm.description} onChange={e => setMilestoneForm({...milestoneForm, description: e.target.value})} />
            <label>Target Date</label>
            <input type="date" value={milestoneForm.target_date} onChange={e => setMilestoneForm({...milestoneForm, target_date: e.target.value})} />
            <button className="primary-btn modal-submit" type="submit">Create Milestone</button>
          </form>
        </div>
      )}
    </div>
  );
}
