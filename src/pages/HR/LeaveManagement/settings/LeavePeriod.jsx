import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

import { leavePeriodsApi } from "../../../../services/api/leavePeriods.api";

import styles from "./LeavePeriod.module.css";

const emptyForm = {
  period_name: "",
  start_date: "",
  end_date: "",
  company: "",
  is_active: true,
};

const LeavePeriod = () => {
  const [periods, setPeriods] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // =========================
  // GET LEAVE PERIODS
  // =========================
  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    try {
      setLoading(true);

      const data = await leavePeriodsApi.getAll();

      setPeriods(data || []);
    } catch (error) {
      console.error("Failed to load leave periods:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load leave periods"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ADD
  // =========================
  const openAdd = () => {
    setEditingId(null);
    setErrors({});
    setForm({ ...emptyForm });
    setIsFormOpen(true);
  };

  // =========================
  // EDIT
  // =========================
  const openEdit = (period) => {
    setEditingId(period.id);
    setErrors({});
    setIsFormOpen(true);

    setForm({
      period_name: period.period_name || "",
      start_date: period.start_date
        ? String(period.start_date).substring(0, 10)
        : "",
      end_date: period.end_date
        ? String(period.end_date).substring(0, 10)
        : "",
      company: period.company || "",
      is_active: Boolean(period.is_active),
    });
  };

  // =========================
  // CLOSE FORM
  // =========================
  const closeForm = () => {
    setEditingId(null);
    setErrors({});
    setForm({ ...emptyForm });
    setIsFormOpen(false);
  };

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  // =========================
  // VALIDATION
  // =========================
  const validate = () => {
    const next = {};

    if (!form.period_name.trim()) {
      next.period_name = "Period name is required.";
    }

    if (!form.company.trim()) {
      next.company = "Company is required.";
    }

    if (!form.start_date) {
      next.start_date = "Start date is required.";
    }

    if (!form.end_date) {
      next.end_date = "End date is required.";
    }

    if (
      form.start_date &&
      form.end_date &&
      form.start_date >= form.end_date
    ) {
      next.end_date =
        "End date must be after the start date.";
    }

    return next;
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const data = {
      period_name: form.period_name.trim(),
      start_date: form.start_date,
      end_date: form.end_date,
      company: form.company.trim(),
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        await leavePeriodsApi.update(editingId, data);
      } else {
        await leavePeriodsApi.create(data);
      }

      await loadPeriods();

      closeForm();
    } catch (error) {
      console.error(
        "Failed to save leave period:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to save leave period"
      );
    }
  };

  // =========================
  // ACTIVATE PERIOD
  // =========================
  const activatePeriod = async (period) => {
    try {
      await leavePeriodsApi.update(period.id, {
        period_name: period.period_name,
        start_date: String(period.start_date).substring(0, 10),
        end_date: String(period.end_date).substring(0, 10),
        company: period.company,
        is_active: true,
      });

      await loadPeriods();
    } catch (error) {
      console.error(
        "Failed to activate leave period:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to activate leave period"
      );
    }
  };

  return (
    <div className={styles.page}>
      {/* ================= HEADER ================= */}
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            SETTINGS
          </span>

          <h1>Leave Period</h1>
        </div>

        <div className={styles.headerActions}>
          <Link
            to="/hr/leave-management/settings"
            className={styles.navigationButton}
            aria-label="Back to Settings"
          >
            <Settings size={16} strokeWidth={2} />
            <span>Back to Settings</span>
          </Link>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={openAdd}
          >
            + Add Leave Period
          </button>
        </div>
      </div>

      {/* ================= ACTIVE PERIOD ================= */}
      <div className={styles.infoBanner}>
        <strong>
          {periods.find(
            (period) => period.is_active
          )?.period_name ||
            "No active leave period"}
        </strong>

        <span>
          Only one leave period can be active at a time.
        </span>
      </div>

      {/* ================= TABLE ================= */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Leave periods</h2>

            <p>
              Define the cycles used for leave allocation
              and processing.
            </p>
          </div>

          <span className={styles.count}>
            {periods.length} Periods
          </span>
        </div>

        {loading ? (
          <div className={styles.emptyState}>
            Loading leave periods...
          </div>
        ) : periods.length === 0 ? (
          <div className={styles.emptyState}>
            No leave periods found.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {periods.map((period) => (
                  <tr key={period.id}>
                    <td>
                      <strong>
                        {period.period_name}
                      </strong>
                    </td>

                    <td>
                      {String(period.start_date).substring(
                        0,
                        10
                      )}
                    </td>

                    <td>
                      {String(period.end_date).substring(
                        0,
                        10
                      )}
                    </td>

                    <td>{period.company}</td>

                    <td>
                      <span
                        className={
                          period.is_active
                            ? styles.active
                            : styles.inactive
                        }
                      >
                        {period.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className={styles.actionCell}>
                      {!period.is_active && (
                        <button
                          type="button"
                          className={
                            styles.activateButton
                          }
                          onClick={() =>
                            activatePeriod(period)
                          }
                        >
                          Activate
                        </button>
                      )}

                      <button
                        type="button"
                        className={styles.viewButton}
                        onClick={() =>
                          openEdit(period)
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {isFormOpen && (
        <div className={styles.overlay}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.eyebrow}>
                  SETTINGS
                </span>

                <h2>
                  {editingId
                    ? "Edit Leave Period"
                    : "Add Leave Period"}
                </h2>

                <p>
                  Define the start and end dates for the
                  leave cycle.
                </p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                {/* PERIOD NAME */}
                <div className={styles.field}>
                  <label htmlFor="period_name">
                    Period Name
                  </label>

                  <input
                    id="period_name"
                    name="period_name"
                    value={form.period_name}
                    onChange={handleChange}
                    placeholder="e.g. Leave Period 2027"
                  />

                  {errors.period_name && (
                    <span className={styles.error}>
                      {errors.period_name}
                    </span>
                  )}
                </div>

                {/* COMPANY */}
                <div className={styles.field}>
                  <label htmlFor="company">
                    Company
                  </label>

                  <input
                    id="company"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Company name"
                  />

                  {errors.company && (
                    <span className={styles.error}>
                      {errors.company}
                    </span>
                  )}
                </div>

                {/* START DATE */}
                <div className={styles.field}>
                  <label htmlFor="start_date">
                    Start Date
                  </label>

                  <input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={handleChange}
                  />

                  {errors.start_date && (
                    <span className={styles.error}>
                      {errors.start_date}
                    </span>
                  )}
                </div>

                {/* END DATE */}
                <div className={styles.field}>
                  <label htmlFor="end_date">
                    End Date
                  </label>

                  <input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={handleChange}
                  />

                  {errors.end_date && (
                    <span className={styles.error}>
                      {errors.end_date}
                    </span>
                  )}
                </div>

                {/* ACTIVE */}
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                  />

                  Set as active leave period
                </label>
              </div>

              {/* ACTIONS */}
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.primaryButton}
                >
                  {editingId
                    ? "Update Period"
                    : "Save Period"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavePeriod;