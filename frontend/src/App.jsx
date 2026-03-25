import { useEffect, useMemo, useState } from "react";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState(localStorage.getItem("access_token") || "");

  const [mode, setMode] = useState("login");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewJobForm, setShowNewJobForm] = useState(false);

  const [newJobPosition, setNewJobPosition] = useState("");
  const [newJobCompany, setNewJobCompany] = useState("");
  const [newJobStatus, setNewJobStatus] = useState("Applied");
  const [editingAppId, setEditingAppId] = useState(null);
  const [newJobDate, setNewJobDate] = useState("");
  const [newJobLink, setNewJobLink] = useState("");
  const [newJobNotes, setNewJobNotes] = useState("");
  const [newJobResumeFile, setNewJobResumeFile] = useState(null);

  useEffect(() => {
    if (token) {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      applied: applications.filter((app) => app.status === "Applied").length,
      interview: applications.filter((app) => app.status === "Interview").length,
      offer: applications.filter((app) => app.status === "Offer").length,
      rejected: applications.filter((app) => app.status === "Rejected").length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const filtered = applications.filter((app) => {
      const search = searchTerm.toLowerCase();

      return (
        app.company?.toLowerCase().includes(search) ||
        app.position?.toLowerCase().includes(search)
      );
    });

    filtered.sort((a, b) => {
      if (!a.applied_date && !b.applied_date) return 0;
      if (!a.applied_date) return 1;
      if (!b.applied_date) return -1;

      return new Date(b.applied_date) - new Date(a.applied_date);
    });

    return filtered;
  }, [applications, searchTerm]);

  const tryLoginForm = async () => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error("Form login failed");
    }

    return response.json();
  };

  const tryLoginJson = async () => {
    const response = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      throw new Error("JSON login failed");
    }

    return response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      let data;

      try {
        data = await tryLoginForm();
      } catch {
        data = await tryLoginJson();
      }

      localStorage.setItem("access_token", data.access_token);
      setToken(data.access_token);
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      let response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
        }),
      });

      if (!response.ok) {
        response = await fetch("http://localhost:8000/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: regName,
            email: regEmail,
            password: regPassword,
          }),
        });
      }

      if (!response.ok) {
        response = await fetch("http://localhost:8000/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: regEmail,
            email: regEmail,
            password: regPassword,
          }),
        });
      }

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      setSuccessMessage("Account created successfully. Please login.");
      setMode("login");
      setRegName("");
      setRegEmail("");
      setRegPassword("");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setToken("");
    setApplications([]);
    setStatusFilter("");
    setSearchTerm("");
  };

  const fetchApplications = async (filter = "") => {
    setAppsError("");
    setAppsLoading(true);

    try {
      const params = filter ? `?status_filter=${encodeURIComponent(filter)}` : "";
      const response = await fetch(`http://localhost:8000/applications${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setAppsError(err.message || "Error loading applications");
    } finally {
      setAppsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    fetchApplications(value);
  };

  const resetJobForm = () => {
    setEditingAppId(null);
    setNewJobCompany("");
    setNewJobPosition("");
    setNewJobStatus("Applied");
    setNewJobDate("");
    setNewJobLink("");
    setNewJobNotes("");
    setNewJobResumeFile(null);
  };

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (!newJobPosition.trim() || !newJobCompany.trim()) {
      setAppsError("Please fill in both position and company.");
      return;
    }

    setAppsError("");
    setSuccessMessage("");

    try {
      const isEditing = editingAppId !== null;

      const response = await fetch(
        isEditing
          ? `http://localhost:8000/applications/${editingAppId}`
          : "http://localhost:8000/applications",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            position: newJobPosition.trim(),
            company: newJobCompany.trim(),
            status: newJobStatus,
            applied_date: newJobDate || null,
            job_link: newJobLink.trim() || null,
            notes: newJobNotes.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error(isEditing ? "Failed to update application" : "Failed to create application");
      }

      const savedApp = await response.json();

      if (!editingAppId && newJobResumeFile) {
        const formData = new FormData();
        formData.append("file", newJobResumeFile);

        const uploadResponse = await fetch(
          `http://localhost:8000/applications/${savedApp.id}/upload-resume`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error("Job saved, but resume upload failed");
        }
      }

      resetJobForm();
      setShowNewJobForm(false);
      setSuccessMessage(isEditing ? "Job updated successfully" : "Job added successfully");

      await fetchApplications(statusFilter);
    } catch (err) {
      setAppsError(err.message || "Error saving application");
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    const confirmed = window.confirm("Are you sure you want to delete this job?");
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:8000/applications/${applicationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete application");
      }

      setSuccessMessage("Job deleted successfully");
      await fetchApplications(statusFilter);
    } catch (err) {
      setAppsError(err.message || "Error deleting application");
    }
  };

  const handleEditApplication = (app) => {
    setEditingAppId(app.id);
    setNewJobCompany(app.company || "");
    setNewJobPosition(app.position || "");
    setNewJobStatus(app.status || "Applied");
    setNewJobDate(app.applied_date ? app.applied_date.split("T")[0] : "");
    setNewJobLink(app.job_link || "");
    setNewJobNotes(app.notes || "");
    setShowNewJobForm(true);
  };

  const handleUpdateStatus = async (app, selectedStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/applications/${app.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          position: app.position,
          company: app.company,
          status: selectedStatus,
          applied_date: app.applied_date || null,
          job_link: app.job_link || null,
          notes: app.notes || null,
          resume_name: app.resume_name || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update application");
      }

      await fetchApplications(statusFilter);
    } catch (err) {
      setAppsError(err.message || "Error updating application");
    }
  };

  const handleResumeUpload = async (applicationId, selectedFile) => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `http://localhost:8000/applications/${applicationId}/upload-resume`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload resume");
      }

      setSuccessMessage("Resume uploaded successfully");
      await fetchApplications(statusFilter);
    } catch (err) {
      setAppsError(err.message || "Error uploading resume");
    }
  };

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-left">
          <div className="login-logo">JobTracker</div>

          <h1 className="login-heading">
            Apply to jobs in minutes.
            <br />
            Power your entire job search.
          </h1>

          <p className="login-text">
            Keep all of your applications in one place, follow up at the right
            time, and stay organized during your job hunt.
          </p>

          <div className="login-subtext">
            Browse roles, track interviews, and never miss a follow-up.
          </div>

          <ul className="login-bullets">
            <li>See every application status at a glance</li>
            <li>Track interviews, offers, and rejections</li>
            <li>Save the resume you used for each job</li>
          </ul>
        </div>

        <div className="login-right">
          <h2 className="login-title">
            {mode === "login" ? "Login to your account" : "Create your account"}
          </h2>

          <p className="login-subtitle">
            {mode === "login"
              ? "Login with your email and password."
              : "Create an account to start tracking your job applications."}
          </p>

          {mode === "login" ? (
            <form onSubmit={handleSubmit} className="form login-form">
              <label className="label">
                Email Address
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                />
              </label>

              <label className="label">
                Password
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </label>

              {error && <p className="error-text">{error}</p>}
              {successMessage && <p className="success-text">{successMessage}</p>}

              <button type="submit" className="button" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <p className="hint">
                Don&apos;t have an account?{" "}
                <span
                  style={{ color: "#0284c7", cursor: "pointer", fontWeight: 600 }}
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setSuccessMessage("");
                  }}
                >
                  Register
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="form login-form">
              <label className="label">
                Full Name
                <input
                  type="text"
                  className="input"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Full name"
                  required
                />
              </label>

              <label className="label">
                Email Address
                <input
                  type="email"
                  className="input"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Email address"
                  required
                />
              </label>

              <label className="label">
                Password
                <input
                  type="password"
                  className="input"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </label>

              {error && <p className="error-text">{error}</p>}
              {successMessage && <p className="success-text">{successMessage}</p>}

              <button type="submit" className="button" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </button>

              <p className="hint">
                Already have an account?{" "}
                <span
                  style={{ color: "#0284c7", cursor: "pointer", fontWeight: 600 }}
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccessMessage("");
                  }}
                >
                  Login
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div>
            <h1 className="dashboard-title">Job Application Tracker</h1>
            <p className="dashboard-subtitle">
              Track every job, status, link, notes, and resume in one place.
            </p>
          </div>

          <div className="topbar-actions">
            <button
              className="secondary-button"
              onClick={() => {
                setShowNewJobForm((prev) => !prev);
                if (showNewJobForm) {
                  resetJobForm();
                }
              }}
            >
              {showNewJobForm ? "Close form" : "Add job"}
            </button>

            <button className="secondary-button" onClick={() => fetchApplications(statusFilter)}>
              Refresh
            </button>

            <button className="secondary-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total</span>
            <strong className="stat-value">{stats.total}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Applied</span>
            <strong className="stat-value">{stats.applied}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Interview</span>
            <strong className="stat-value">{stats.interview}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Offer</span>
            <strong className="stat-value">{stats.offer}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Rejected</span>
            <strong className="stat-value">{stats.rejected}</strong>
          </div>
        </div>

        <div className="toolbar-row">
          <label className="label toolbar-label">
            Status filter
            <select
              className="select"
              value={statusFilter}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </label>

          <label className="label toolbar-label">
            Search
            <input
              className="input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company or role"
            />
          </label>
        </div>

        {showNewJobForm && (
          <form onSubmit={handleCreateApplication} className="job-form-card">
            <div className="job-form-grid">
              <label className="label">
                Company
                <input
                  className="input"
                  value={newJobCompany}
                  onChange={(e) => setNewJobCompany(e.target.value)}
                  placeholder="e.g. Caterpillar"
                  required
                />
              </label>

              <label className="label">
                Role
                <input
                  className="input"
                  value={newJobPosition}
                  onChange={(e) => setNewJobPosition(e.target.value)}
                  placeholder="e.g. DevOps Engineer"
                  required
                />
              </label>

              <label className="label">
                Status
                <select
                  className="select"
                  value={newJobStatus}
                  onChange={(e) => setNewJobStatus(e.target.value)}
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </label>

              <label className="label">
                Date Applied
                <input
                  type="date"
                  className="input"
                  value={newJobDate}
                  onChange={(e) => setNewJobDate(e.target.value)}
                />
              </label>

              <label className="label">
                Job Link
                <input
                  className="input"
                  value={newJobLink}
                  onChange={(e) => setNewJobLink(e.target.value)}
                  placeholder="https://company.com/job"
                />
              </label>

              <label className="label">
                Upload Resume (PDF)
                <input
                  type="file"
                  accept=".pdf"
                  className="input"
                  onChange={(e) => setNewJobResumeFile(e.target.files?.[0] || null)}
                />
              </label>

              <label className="label notes-field">
                Notes
                <textarea
                  className="textarea"
                  value={newJobNotes}
                  onChange={(e) => setNewJobNotes(e.target.value)}
                  placeholder="Any notes about recruiter, round, salary, location..."
                  rows="4"
                />
              </label>
            </div>

            <div className="job-form-actions">
              <button type="submit" className="button">
                {editingAppId ? "Update job" : "Save job"}
              </button>
            </div>
          </form>
        )}

        {appsLoading && <p className="info-text">Loading applications...</p>}
        {appsError && <p className="error-text">{appsError}</p>}
        {successMessage && <p className="success-text">{successMessage}</p>}

        {!appsLoading && applications.length === 0 && !appsError && (
          <div className="empty-state">
            <p>No applications found yet. Add your first job above.</p>
          </div>
        )}

        {!appsLoading && applications.length > 0 && (
          <div className="table-wrapper">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Date Applied</th>
                  <th>Job Link</th>
                  <th>Notes</th>
                  <th>Resume</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.company}</td>
                    <td>{app.position}</td>
                    <td>
                      <span className={`status-pill status-${app.status?.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      {app.applied_date
                        ? new Date(app.applied_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      {app.job_link ? (
                        <a
                          href={app.job_link}
                          target="_blank"
                          rel="noreferrer"
                          className="job-link"
                        >
                          Open link
                        </a>
                      ) : (
                        <span className="muted-text">-</span>
                      )}
                    </td>
                    <td>
                      {app.notes ? app.notes : <span className="muted-text">-</span>}
                    </td>
                    <td>
                      <div className="resume-cell">
                        <div>
                          {app.resume_name ? (
                            <span>{app.resume_name}</span>
                          ) : (
                            <span className="muted-text">No resume</span>
                          )}
                        </div>

                        <div className="resume-actions">
                          <label className="upload-button">
                            Upload
                            <input
                              type="file"
                              accept=".pdf"
                              className="hidden-file-input"
                              onChange={(e) => handleResumeUpload(app.id, e.target.files?.[0])}
                            />
                          </label>

                          {app.resume_name && (
                            <>
                              <a
                                href={`http://localhost:8000/uploads/${app.resume_name}`}
                                target="_blank"
                                rel="noreferrer"
                                className="view-button"
                              >
                                View
                              </a>

                              <a
                                href={`http://localhost:8000/uploads/${app.resume_name}`}
                                download
                                className="download-button"
                              >
                                Download
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="row-actions">
                        <select
                          className="table-select"
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app, e.target.value)}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Interview">Interview</option>
                          <option value="Offer">Offer</option>
                          <option value="Rejected">Rejected</option>
                        </select>

                        <button
                          className="table-action"
                          onClick={() => handleEditApplication(app)}
                        >
                          Edit
                        </button>

                        <button
                          className="table-action danger-action"
                          onClick={() => handleDeleteApplication(app.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;