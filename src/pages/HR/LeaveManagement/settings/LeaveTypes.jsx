import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Settings, Plus } from "lucide-react";

import { leaveTypesApi } from "../../../../services/api/leaveTypes.api";

import styles from "./LeaveTypes.module.css";

const emptyForm = {
  leave_type_name: "",
  max_days_allowed: "",
  is_paid: true,
  is_carry_forward: false,
  max_carry_forward_days: "0",
  is_encashable: false,
  applicable_after_days: "0",
};

const LeaveTypes = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // Load leave types from backend
  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      setLoading(true);

      const data = await leaveTypesApi.getAll();

      setLeaveTypes(data || []);
    } catch (error) {
      console.error("Failed to load leave types:", error);

      alert(
        error.response?.data?.message ||
        "Failed to load leave types",
      );
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setSelected(null);
    setErrors({});
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (item) => {
    setSelected(null);
    setEditingId(item.id);
    setErrors({});
    setIsFormOpen(true);

    setForm({
      leave_type_name: item.leave_type_name || "",
      max_days_allowed: String(item.max_days_allowed ?? ""),
      is_paid: Boolean(item.is_paid),
      is_carry_forward: Boolean(item.is_carry_forward),
      max_carry_forward_days: String(
        item.max_carry_forward_days ?? "0",
      ),
      is_encashable: Boolean(item.is_encashable),
      applicable_after_days: String(
        item.applicable_after_days ?? "0",
      ),
    });
  };

  const closeForm = () => {
    setEditingId(null);
    setErrors({});
    setForm(emptyForm);
    setIsFormOpen(false);
  };

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

  const validate = () => {
    const next = {};

    const normalizedName = form.leave_type_name
      .trim()
      .toLowerCase();

    if (!form.leave_type_name.trim()) {
      next.leave_type_name = "Leave type name is required.";
    }

    if (!editingId) {
      const exists = leaveTypes.some(
        (item) =>
          item.leave_type_name?.trim().toLowerCase() ===
          normalizedName,
      );

      if (exists) {
        next.leave_type_name = "This leave type already exists.";
      }
    }

    if (
      !form.max_days_allowed ||
      Number(form.max_days_allowed) <= 0
    ) {
      next.max_days_allowed = "Enter a value greater than 0.";
    }

    if (
      form.is_carry_forward &&
      (!form.max_carry_forward_days ||
        Number(form.max_carry_forward_days) < 0)
    ) {
      next.max_carry_forward_days =
        "Enter a valid carry-forward limit.";
    }

    if (Number(form.applicable_after_days) < 0) {
      next.applicable_after_days = "Cannot be negative.";
    }

    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const data = {
      leave_type_name: form.leave_type_name.trim(),
      max_days_allowed: Number(form.max_days_allowed),
      is_paid: form.is_paid,
      is_carry_forward: form.is_carry_forward,
      max_carry_forward_days: form.is_carry_forward
        ? Number(form.max_carry_forward_days)
        : 0,
      is_encashable: form.is_encashable,
      applicable_after_days: Number(form.applicable_after_days),
    };

    try {
      if (editingId) {
        await leaveTypesApi.update(editingId, data);
      } else {
        await leaveTypesApi.create(data);
      }

      await loadLeaveTypes();

      closeForm();
    } catch (error) {
      console.error("Failed to save leave type:", error);

      alert(
        error.response?.data?.message ||
        "Failed to save leave type",
      );
    }
  };

  const deleteType = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.leave_type_name}"? Existing allocations may reference this leave type.`,
    );

    if (!confirmed) return;

    try {
      await leaveTypesApi.delete(item.id);

      await loadLeaveTypes();

      setSelected(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to delete leave type:", error);

      alert(
        error.response?.data?.message ||
        "Failed to delete leave type",
      );
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>SETTINGS</span>
          <h1>Leave Types</h1>
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
            className={styles.navigationButton}
            onClick={openAdd}
            title="Add Leave Type"
            aria-label="Add Leave Type"
          >
            <Plus size={18} strokeWidth={2} />
            <span>Add Leave Type</span>
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Leave policies</h2>
            <p>
              Define the rules used when leave is allocated and applied.
            </p>
          </div>

          <span className={styles.count}>
            {leaveTypes.length} Types
          </span>
        </div>

        {loading ? (
          <div className={styles.emptyState}>
            <strong>Loading leave types...</strong>
          </div>
        ) : leaveTypes.length ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Max Days</th>
                  <th>Paid</th>
                  <th>Carry Forward</th>
                  <th>Encashable</th>
                  <th>Applicable After</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {leaveTypes.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.leave_type_name}</strong>
                    </td>

                    <td>
                      {item.max_days_allowed} days
                    </td>

                    <td>
                      <span
                        className={
                          item.is_paid
                            ? styles.yes
                            : styles.no
                        }
                      >
                        {item.is_paid ? "Yes" : "No"}
                      </span>
                    </td>

                    <td>
                      {item.is_carry_forward
                        ? `${item.max_carry_forward_days} days`
                        : "No"}
                    </td>

                    <td>
                      <span
                        className={
                          item.is_encashable
                            ? styles.yes
                            : styles.no
                        }
                      >
                        {item.is_encashable ? "Yes" : "No"}
                      </span>
                    </td>

                    <td>
                      {item.applicable_after_days} days
                    </td>

                    <td className={styles.actionCell}>
                      <button
                        type="button"
                        className={styles.viewButton}
                        onClick={() => setSelected(item)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <strong>No leave types configured</strong>

            <p>
              Add the first leave policy to continue.
            </p>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={openAdd}
            >
              + Add Leave Type
            </button>
          </div>
        )}
      </div>

      {(selected || isFormOpen) && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
          >
            {selected ? (
              <>
                <div className={styles.modalHeader}>
                  <div>
                    <span className={styles.eyebrow}>
                      POLICY
                    </span>

                    <h2>
                      {selected.leave_type_name}
                    </h2>

                    <p>Leave Type Configuration</p>
                  </div>

                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={() => setSelected(null)}
                  >
                    ×
                  </button>
                </div>

                <div className={styles.detailsGrid}>
                  <div>
                    <span>Maximum Days</span>
                    <strong>
                      {selected.max_days_allowed} days
                    </strong>
                  </div>

                  <div>
                    <span>Paid Leave</span>
                    <strong>
                      {selected.is_paid ? "Yes" : "No"}
                    </strong>
                  </div>

                  <div>
                    <span>Carry Forward</span>
                    <strong>
                      {selected.is_carry_forward
                        ? "Allowed"
                        : "Not Allowed"}
                    </strong>
                  </div>

                  <div>
                    <span>Maximum Carry Forward</span>
                    <strong>
                      {selected.max_carry_forward_days} days
                    </strong>
                  </div>

                  <div>
                    <span>Encashable</span>
                    <strong>
                      {selected.is_encashable
                        ? "Yes"
                        : "No"}
                    </strong>
                  </div>

                  <div>
                    <span>Applicable After</span>
                    <strong>
                      {selected.applicable_after_days} days
                    </strong>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.dangerButton}
                    onClick={() => deleteType(selected)}
                  >
                    Delete
                  </button>

                  <span className={styles.actionSpacer} />

                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setSelected(null)}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => openEdit(selected)}
                  >
                    Edit
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <div>
                    <span className={styles.eyebrow}>
                      SETTINGS
                    </span>

                    <h2>
                      {editingId
                        ? "Edit Leave Type"
                        : "Add Leave Type"}
                    </h2>

                    <p>
                      Configure the leave policy for this type.
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
                    <div className={styles.field}>
                      <label htmlFor="leave_type_name">
                        Leave Type Name
                      </label>

                      <input
                        id="leave_type_name"
                        name="leave_type_name"
                        value={form.leave_type_name}
                        onChange={handleChange}
                        placeholder="e.g. Casual Leave"
                      />

                      {errors.leave_type_name && (
                        <span className={styles.error}>
                          {errors.leave_type_name}
                        </span>
                      )}
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="max_days_allowed">
                        Maximum Days Allowed
                      </label>

                      <input
                        id="max_days_allowed"
                        name="max_days_allowed"
                        type="number"
                        min="1"
                        value={form.max_days_allowed}
                        onChange={handleChange}
                        placeholder="e.g. 12"
                      />

                      {errors.max_days_allowed && (
                        <span className={styles.error}>
                          {errors.max_days_allowed}
                        </span>
                      )}
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="applicable_after_days">
                        Applicable After Days
                      </label>

                      <input
                        id="applicable_after_days"
                        name="applicable_after_days"
                        type="number"
                        min="0"
                        value={form.applicable_after_days}
                        onChange={handleChange}
                      />

                      {errors.applicable_after_days && (
                        <span className={styles.error}>
                          {errors.applicable_after_days}
                        </span>
                      )}
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="max_carry_forward_days">
                        Maximum Carry Forward Days
                      </label>

                      <input
                        id="max_carry_forward_days"
                        name="max_carry_forward_days"
                        type="number"
                        min="0"
                        value={form.max_carry_forward_days}
                        onChange={handleChange}
                        disabled={!form.is_carry_forward}
                      />

                      {errors.max_carry_forward_days && (
                        <span className={styles.error}>
                          {errors.max_carry_forward_days}
                        </span>
                      )}
                    </div>

                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          name="is_paid"
                          checked={form.is_paid}
                          onChange={handleChange}
                        />{" "}
                        Paid Leave
                      </label>

                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          name="is_carry_forward"
                          checked={form.is_carry_forward}
                          onChange={handleChange}
                        />{" "}
                        Allow Carry Forward
                      </label>

                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          name="is_encashable"
                          checked={form.is_encashable}
                          onChange={handleChange}
                        />{" "}
                        Allow Encashment
                      </label>
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <span className={styles.actionSpacer} />

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
                        ? "Update Leave Type"
                        : "Save Leave Type"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveTypes;

