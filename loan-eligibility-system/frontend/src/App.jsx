"use client";

import { useEffect, useMemo, useState } from "react";

const API = "http://127.0.0.1:8000";

const initialForm = {
  full_name: "",
  mobile: "",
  email: "",
  date_of_birth: "",
  city: "",
  pincode: "",
  loan_type: "Home Loan",
  employment_type: "Salaried",
  monthly_income: "",
  loan_amount: "",
  property_value: "",
  consent: false,
};

function App() {
  // Page and authentication state
  const [page, setPage] = useState("customer");
  const [token, setToken] = useState("");

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("admin_token");

      if (savedToken) {
        setToken(savedToken);
      }
    } catch (error) {
      console.error("Unable to read admin token:", error);
    }
  }, []);

  // Customer form state
  const [formData, setFormData] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Admin login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin data
  const [leads, setLeads] = useState([]);
  const [rules, setRules] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pageNumber, setPageNumber] = useState(1);

  const leadsPerPage = 10;

  // BRE rule form
  const [ruleForm, setRuleForm] = useState({
    field_name: "credit_score",
    operator: ">=",
    value: "",
    active: true,
    description: "",
  });

  const [editingRuleId, setEditingRuleId] = useState(null);
  const [adminError, setAdminError] = useState("");

  // Handle customer form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit the loan application
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    if (!formData.consent) {
      setError(
        "Please give consent before submitting the application."
      );
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      monthly_income: Number(formData.monthly_income),
      loan_amount: Number(formData.loan_amount),
      property_value: Number(formData.property_value),
    };

    try {
      const response = await fetch(`${API}/api/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError(
            "A lead with this mobile number already exists."
          );
        } else if (response.status === 422) {
          setError(
            "Please check the information entered in the form."
          );
        } else {
          setError(
            data.detail ||
              "Something went wrong. Please try again."
          );
        }

        return;
      }

      setResult(data);
      setFormData(initialForm);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle admin login
  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(
          data.detail || "Invalid username or password."
        );
        return;
      }

      const accessToken = data.access_token;

      if (!accessToken) {
        setLoginError(
          "Login successful but no access token was received."
        );
        return;
      }

      try {
        localStorage.setItem("admin_token", accessToken);
      } catch (error) {
        console.error("Unable to save admin token:", error);
      }

      setToken(accessToken);

      setUsername("");
      setPassword("");
      setLoginError("");

      setPage("dashboard");
    } catch (err) {
      console.error(err);

      setLoginError(
        "Unable to connect to the server. Please make sure backend is running."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // Clear the admin session
  const logout = () => {
    try {
      localStorage.removeItem("admin_token");
    } catch (error) {
      console.error("Unable to remove admin token:", error);
    }

    setToken("");
    setPage("customer");
    setLeads([]);
    setRules([]);
    setAdminError("");
    setSearch("");
    setStatusFilter("All");
    setPageNumber(1);
  };

  // Send authenticated requests to the backend
  const adminFetch = async (url, options = {}) => {
    if (!token) {
      throw new Error("Please login again.");
    }

    const response = await fetch(`${API}${url}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      logout();
      throw new Error("Session expired. Please login again.");
    }

    return response;
  };

  // Fetch leads from the backend
  const loadLeads = async () => {
    if (!token) return;

    try {
      setAdminError("");

      const response = await adminFetch("/api/leads");
      const data = await response.json();

      if (!response.ok) {
        setAdminError(
          data.detail || "Unable to load leads."
        );
        return;
      }

      const leadData = Array.isArray(data)
        ? data
        : data.leads || data.items || [];

      setLeads(leadData);
      setPageNumber(1);
    } catch (err) {
      console.error(err);

      setAdminError(
        err.message || "Unable to load leads."
      );
    }
  };

  // Fetch BRE rules from the backend
  const loadRules = async () => {
    if (!token) return;

    try {
      setAdminError("");

      const response = await adminFetch("/api/rules");
      const data = await response.json();

      if (!response.ok) {
        setAdminError(
          data.detail || "Unable to load rules."
        );
        return;
      }

      const ruleData = Array.isArray(data)
        ? data
        : data.rules || data.items || [];

      setRules(ruleData);
    } catch (err) {
      console.error(err);

      setAdminError(
        err.message || "Unable to load rules."
      );
    }
  };

  // Load data when the admin page changes
  useEffect(() => {
    if (token && page === "dashboard") {
      loadLeads();
    }
  }, [token, page]);

  useEffect(() => {
    if (token && page === "rules") {
      loadRules();
    }
  }, [token, page]);

  // Calculate dashboard statistics
  const dashboard = useMemo(() => {
    const total = leads.length;

    const eligible = leads.filter(
      (lead) =>
        String(lead.bre_status || "")
          .toLowerCase() === "eligible"
    ).length;

    const rejected = leads.filter(
      (lead) =>
        String(lead.bre_status || "")
          .toLowerCase() === "not eligible"
    ).length;

    const scores = leads
      .map((lead) => Number(lead.credit_score))
      .filter((score) => !Number.isNaN(score));

    const average =
      scores.length > 0
        ? Math.round(
            scores.reduce(
              (sum, score) => sum + score,
              0
            ) / scores.length
          )
        : 0;

    return {
      total,
      eligible,
      rejected,
      average,
    };
  }, [leads]);

  // Search and filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const searchText = search.trim().toLowerCase();

      const leadId = String(
        lead.id ?? lead.lead_id ?? ""
      ).toLowerCase();

      const customerName = String(
        lead.full_name ||
          lead.customer_name ||
          ""
      ).toLowerCase();

      const mobile = String(
        lead.mobile || ""
      ).toLowerCase();

      const matchesSearch =
        leadId.includes(searchText) ||
        customerName.includes(searchText) ||
        mobile.includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        String(lead.bre_status || "")
          .toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  // Calculate pagination
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredLeads.length / leadsPerPage
    )
  );

  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [pageNumber, totalPages]);

  const paginatedLeads = filteredLeads.slice(
    (pageNumber - 1) * leadsPerPage,
    pageNumber * leadsPerPage
  );

  // Handle BRE rule form changes
  const handleRuleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setRuleForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // Reset the rule form
  const resetRuleForm = () => {
    setRuleForm({
      field_name: "credit_score",
      operator: ">=",
      value: "",
      active: true,
      description: "",
    });

    setEditingRuleId(null);
    setAdminError("");
  };

  // Create or update a BRE rule
  const saveRule = async (e) => {
    e.preventDefault();

    setAdminError("");

    if (!ruleForm.value) {
      setAdminError(
        "Please enter a rule value."
      );
      return;
    }

    const payload = {
      field_name: ruleForm.field_name,
      operator: ruleForm.operator,
      value: Number(ruleForm.value),
      active: ruleForm.active,
      description:
        ruleForm.description || null,
    };

    try {
      const url = editingRuleId
        ? `/api/rules/${editingRuleId}`
        : "/api/rules";

      const method = editingRuleId
        ? "PUT"
        : "POST";

      const response = await adminFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setAdminError(
          data.detail ||
            "Unable to save rule."
        );
        return;
      }

      resetRuleForm();

      await loadRules();
    } catch (err) {
      console.error(err);

      setAdminError(
        err.message ||
          "Unable to save rule."
      );
    }
  };

  // Load a rule into the form for editing
  const editRule = (rule) => {
    setEditingRuleId(rule.id);

    setRuleForm({
      field_name: rule.field_name,
      operator: rule.operator,
      value: rule.value,
      active: rule.active,
      description: rule.description || "",
    });

    setAdminError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete a BRE rule
  const deleteRule = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this rule?"
    );

    if (!confirmed) return;

    try {
      setAdminError("");

      const response = await adminFetch(
        `/api/rules/${id}`,
        {
          method: "DELETE",
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setAdminError(
          data.detail ||
            "Unable to delete rule."
        );
        return;
      }

      await loadRules();
    } catch (err) {
      console.error(err);

      setAdminError(
        err.message ||
          "Unable to delete rule."
      );
    }
  };

  // Admin login page
  if (page === "login") {
    return (
      <div className="page">
        <div className="container login-container">
          <h1>Admin Login</h1>

          <p className="subtitle">
            Login to manage leads and business rules.
          </p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>

              <input
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            {loginError && (
              <div className="error-message">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
            >
              {loginLoading
                ? "Logging in..."
                : "Login"}
            </button>
          </form>

          <button
            className="secondary-button"
            onClick={() =>
              setPage("customer")
            }
          >
            Back to Customer Application
          </button>
        </div>
      </div>
    );
  }

  // Admin dashboard
  if (
    page === "dashboard" &&
    token
  ) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>

            <p>
              Loan Eligibility & Lead Management
            </p>
          </div>

          <div className="admin-actions">
            <button
              onClick={() =>
                setPage("dashboard")
              }
            >
              Dashboard
            </button>

            <button
              onClick={() =>
                setPage("rules")
              }
            >
              BRE Rules
            </button>

            <button
              onClick={() =>
                setPage("customer")
              }
            >
              Customer Form
            </button>

            <button
              onClick={logout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        </div>

        {adminError && (
          <div className="error-message admin-error">
            {adminError}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <span>Total Leads</span>

            <strong>
              {dashboard.total}
            </strong>
          </div>

          <div className="stat-card">
            <span>Eligible Leads</span>

            <strong>
              {dashboard.eligible}
            </strong>
          </div>

          <div className="stat-card">
            <span>Rejected Leads</span>

            <strong>
              {dashboard.rejected}
            </strong>
          </div>

          <div className="stat-card">
            <span>
              Average Credit Score
            </span>

            <strong>
              {dashboard.average}
            </strong>
          </div>
        </div>

        <div className="admin-card">
          <div className="table-header">
            <h2>Lead Management</h2>

            <button onClick={loadLeads}>
              Refresh
            </button>
          </div>

          <div className="filters">
            <input
              type="text"
              placeholder="Search by name, mobile or ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageNumber(1);
              }}
            />

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(
                  e.target.value
                );
                setPageNumber(1);
              }}
            >
              <option value="All">
                All Status
              </option>

              <option value="Eligible">
                Eligible
              </option>

              <option value="Not Eligible">
                Not Eligible
              </option>
            </select>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Lead ID</th>
                  <th>Customer Name</th>
                  <th>Mobile</th>
                  <th>Loan Type</th>
                  <th>Credit Score</th>
                  <th>BRE Status</th>
                  <th>Created Date</th>
                </tr>
              </thead>

              <tbody>
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="empty-table"
                    >
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map(
                    (lead, index) => {
                      // Display serial number is separate from the database ID
                      const serialNumber =
                        (pageNumber - 1) *
                          leadsPerPage +
                        index +
                        1;

                      const databaseLeadId =
                        lead.id ??
                        lead.lead_id ??
                        "-";

                      const breStatus =
                        String(
                          lead.bre_status ||
                            ""
                        );

                      const isEligible =
                        breStatus
                          .toLowerCase()
                          .includes(
                            "eligible"
                          ) &&
                        !breStatus
                          .toLowerCase()
                          .includes(
                            "not"
                          );

                      return (
                        <tr
                          key={
                            databaseLeadId !==
                            "-"
                              ? databaseLeadId
                              : `lead-${serialNumber}`
                          }
                        >
                          <td>
                            <strong>
                              {serialNumber}
                            </strong>
                          </td>

                          <td>
                            {databaseLeadId}
                          </td>

                          <td>
                            {lead.full_name ||
                              lead.customer_name ||
                              "-"}
                          </td>

                          <td>
                            {lead.mobile ||
                              "-"}
                          </td>

                          <td>
                            {lead.loan_type ||
                              "-"}
                          </td>

                          <td>
                            {lead.credit_score ??
                              "-"}
                          </td>

                          <td>
                            <span
                              className={
                                isEligible
                                  ? "status eligible"
                                  : "status rejected"
                              }
                            >
                              {lead.bre_status ||
                                "-"}
                            </span>
                          </td>

                          <td>
                            {lead.created_at
                              ? new Date(
                                  lead.created_at
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              disabled={
                pageNumber === 1
              }
              onClick={() =>
                setPageNumber(
                  (p) => p - 1
                )
              }
            >
              Previous
            </button>

            <span>
              Page {pageNumber} of{" "}
              {totalPages}
            </span>

            <button
              disabled={
                pageNumber ===
                totalPages
              }
              onClick={() =>
                setPageNumber(
                  (p) => p + 1
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  // BRE management page
  if (
    page === "rules" &&
    token
  ) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <h1>BRE Management</h1>

            <p>
              Configure eligibility
              rules dynamically.
            </p>
          </div>

          <div className="admin-actions">
            <button
              onClick={() =>
                setPage("dashboard")
              }
            >
              Dashboard
            </button>

            <button
              onClick={() =>
                setPage("customer")
              }
            >
              Customer Form
            </button>

            <button
              onClick={logout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        </div>

        {adminError && (
          <div className="error-message admin-error">
            {adminError}
          </div>
        )}

        <div className="admin-card">
          <h2>
            {editingRuleId
              ? "Edit BRE Rule"
              : "Add BRE Rule"}
          </h2>

          <form onSubmit={saveRule}>
            <div className="form-grid">
              <div className="form-group">
                <label>Field</label>

                <select
                  name="field_name"
                  value={
                    ruleForm.field_name
                  }
                  onChange={
                    handleRuleChange
                  }
                >
                  <option value="age">
                    Age
                  </option>

                  <option value="monthly_income">
                    Monthly Income
                  </option>

                  <option value="credit_score">
                    Credit Score
                  </option>

                  <option value="loan_amount">
                    Loan Amount
                  </option>

                  <option value="loan_to_property_ratio">
                    Loan to Property Ratio
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Operator</label>

                <select
                  name="operator"
                  value={
                    ruleForm.operator
                  }
                  onChange={
                    handleRuleChange
                  }
                >
                  <option value=">">
                    &gt;
                  </option>

                  <option value=">=">
                    &gt;=
                  </option>

                  <option value="<">
                    &lt;
                  </option>

                  <option value="<=">
                    &lt;=
                  </option>

                  <option value="=">
                    =
                  </option>

                  <option value="==">
                    ==
                  </option>

                  <option value="!=">
                    !=
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Value</label>

                <input
                  type="number"
                  name="value"
                  placeholder="Enter rule value"
                  value={
                    ruleForm.value
                  }
                  onChange={
                    handleRuleChange
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>

                <input
                  type="text"
                  name="description"
                  placeholder="Example: Credit score minimum requirement"
                  value={
                    ruleForm.description
                  }
                  onChange={
                    handleRuleChange
                  }
                />
              </div>
            </div>

            <label className="consent">
              <input
                type="checkbox"
                name="active"
                checked={
                  ruleForm.active
                }
                onChange={
                  handleRuleChange
                }
              />

              <span>
                Rule Active
              </span>
            </label>

            <button type="submit">
              {editingRuleId
                ? "Update Rule"
                : "Add Rule"}
            </button>

            {editingRuleId && (
              <button
                type="button"
                className="secondary-button"
                onClick={
                  resetRuleForm
                }
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="admin-card">
          <div className="table-header">
            <h2>Existing Rules</h2>

            <button
              onClick={loadRules}
            >
              Refresh
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Rule ID</th>
                  <th>Field</th>
                  <th>Operator</th>
                  <th>Value</th>
                  <th>Active</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {rules.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="empty-table"
                    >
                      No rules found.
                    </td>
                  </tr>
                ) : (
                  rules.map(
                    (rule, index) => {
                      // Show a simple serial number separately from the rule ID
                      const serialNumber =
                        index + 1;

                      return (
                        <tr
                          key={
                            rule.id ??
                            `rule-${serialNumber}`
                          }
                        >
                          <td>
                            <strong>
                              {serialNumber}
                            </strong>
                          </td>

                          <td>
                            {rule.id ?? "-"}
                          </td>

                          <td>
                            {rule.field_name}
                          </td>

                          <td>
                            {rule.operator}
                          </td>

                          <td>
                            {rule.value}
                          </td>

                          <td>
                            {rule.active
                              ? "Yes"
                              : "No"}
                          </td>

                          <td>
                            {rule.description ||
                              "-"}
                          </td>

                          <td>
                            <div className="action-buttons">
                              <button
                                onClick={() =>
                                  editRule(
                                    rule
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="delete-button"
                                onClick={() =>
                                  deleteRule(
                                    rule.id
                                  )
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Customer application page
  return (
    <div className="page">
      <div className="top-navigation">
        <div>
          <strong>MoneyBeing</strong>
        </div>

        <button
          className="admin-login-button"
          onClick={() => {
            if (token) {
              setPage("dashboard");
            } else {
              setPage("login");
            }
          }}
        >
          {token
            ? "Admin Dashboard"
            : "Admin Login"}
        </button>
      </div>

      <div className="container">
        <h1>
          Loan Eligibility Check
        </h1>

        <p className="subtitle">
          Check your loan eligibility
          by entering your details.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                name="full_name"
                placeholder="Enter your full name"
                value={
                  formData.full_name
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>

              <input
                type="tel"
                name="mobile"
                placeholder="Enter mobile number"
                value={
                  formData.mobile
                }
                onChange={
                  handleChange
                }
                minLength="10"
                maxLength="15"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>

              <input
                type="date"
                name="date_of_birth"
                value={
                  formData.date_of_birth
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="form-group">
              <label>City</label>

              <input
                type="text"
                name="city"
                placeholder="Enter your city"
                value={
                  formData.city
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Pincode</label>

              <input
                type="text"
                name="pincode"
                placeholder="Enter pincode"
                value={
                  formData.pincode
                }
                onChange={
                  handleChange
                }
                minLength="6"
                maxLength="6"
                required
              />
            </div>

            <div className="form-group">
              <label>Loan Type</label>

              <select
                name="loan_type"
                value={
                  formData.loan_type
                }
                onChange={
                  handleChange
                }
              >
                <option value="Home Loan">
                  Home Loan
                </option>

                <option value="Loan Against Property (LAP)">
                  Loan Against Property (LAP)
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Employment Type</label>

              <select
                name="employment_type"
                value={
                  formData.employment_type
                }
                onChange={
                  handleChange
                }
              >
                <option value="Salaried">
                  Salaried
                </option>

                <option value="Self Employed">
                  Self Employed
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Monthly Income</label>

              <input
                type="number"
                name="monthly_income"
                placeholder="Enter monthly income"
                value={
                  formData.monthly_income
                }
                onChange={
                  handleChange
                }
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Loan Amount</label>

              <input
                type="number"
                name="loan_amount"
                placeholder="Enter loan amount"
                value={
                  formData.loan_amount
                }
                onChange={
                  handleChange
                }
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Property Value</label>

              <input
                type="number"
                name="property_value"
                placeholder="Enter property value"
                value={
                  formData.property_value
                }
                onChange={
                  handleChange
                }
                min="1"
                required
              />
            </div>
          </div>

          <label className="consent">
            <input
              type="checkbox"
              name="consent"
              checked={
                formData.consent
              }
              onChange={
                handleChange
              }
            />

            <span>
              I agree that my information
              can be shared with lending
              partners for loan processing.
            </span>
          </label>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Checking..."
              : "Check Eligibility"}
          </button>
        </form>

        {result && (
          <div className="result-card">
            <h2>
              Loan Eligibility Result
            </h2>

            <p>
              <strong>
                Lead ID:
              </strong>{" "}
              {result.lead_id ||
                "-"}
            </p>

            <p>
              <strong>
                Credit Score:
              </strong>{" "}
              {result.credit_score ??
                "-"}
            </p>

            <p>
              <strong>
                Status:
              </strong>{" "}
              {result.bre_status ||
                "-"}
            </p>

            {result.bre_status ===
            "Eligible" ? (
              <p className="success-message">
                Congratulations!
                You are eligible for
                this loan.
              </p>
            ) : (
              <div className="rejection">
                <strong>
                  Reasons for rejection:
                </strong>

                {result.reasons &&
                result.reasons.length >
                  0 ? (
                  <ul>
                    {result.reasons.map(
                      (
                        reason,
                        index
                      ) => (
                        <li
                          key={
                            index
                          }
                        >
                          {reason}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>
                    No rejection
                    reason provided.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;