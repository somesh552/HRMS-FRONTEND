
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

import styles from "./LeaveAllocations.module.css";

const API_URL = "http://localhost:3000/leave-allocations";

/*
 * Leave Types
 * IDs should match your database
 */
const leaveTypes = [
  {
    id: 1,
    name: "Casual Leave",
  },
  {
    id: 2,
    name: "Sick Leave",
  },
  {
    id: 3,
    name: "Earned Leave",
  },
];

/*
 * Employees
 * IDs should match your database
 */
const employees = [
  {
    id: 1,
    employeeCode: "EMP-125",
    name: "Ravi Kumar",
  },
  {
    id: 2,
    employeeCode: "EMP-124",
    name: "Priya Sharma",
  },
  {
    id: 3,
    employeeCode: "EMP-123",
    name: "Arjun Reddy",
  },
];

/*
 * Initial Form
 *
 * These names are exactly the same
 * as your backend fields.
 */
const initialForm = {
  employee_id: "",
  leave_type_id: "",
  leave_period_id: 1,
  total_leaves_allocated: "",
  carry_forward_leaves: "0",
};

const LeaveAllocations = () => {
  const [allocations, setAllocations] = useState([]);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [form, setForm] = useState(initialForm);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  /*
   * GET ALL LEAVE ALLOCATIONS
   */
  const fetchAllocations = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(API_URL);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to fetch leave allocations"
        );
      }

      const backendData = result.data || [];

      /*
       * Convert backend data into the
       * format required by the table.
       */
      const formattedData = backendData.map(
        (allocation) => {
          const employee = employees.find(
            (item) =>
              item.id ===
              Number(allocation.employee_id)
          );

          const leaveType = leaveTypes.find(
            (item) =>
              item.id ===
              Number(allocation.leave_type_id)
          );

          return {
            id: allocation.id,

            employeeId:
              employee?.employeeCode ||
              `EMP-${allocation.employee_id}`,

            employee:
              employee?.name ||
              `Employee ${allocation.employee_id}`,

            leaveType:
              leaveType?.name ||
              `Leave Type ${allocation.leave_type_id}`,

            period: `Leave Period ${allocation.leave_period_id}`,

            allocated: Number(
              allocation.total_leaves_allocated
            ),

            carryForward: Number(
              allocation.carry_forward_leaves
            ),

            used: Number(
              allocation.used_leaves
            ),

            remaining: Number(
              allocation.remaining_leaves
            ),
          };
        }
      );

      setAllocations(formattedData);
    } catch (error) {
      console.error(
        "Error fetching allocations:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load leave allocations."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * GET DATA WHEN PAGE OPENS
   */
  useEffect(() => {
    fetchAllocations();
  }, []);

  /*
   * FORM CHANGE
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setErrorMessage("");
  };

  /*
   * SUBMIT FORM
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    /*
     * Employee validation
     */
    if (!form.employee_id) {
      nextErrors.employee_id =
        "Employee is required.";
    }

    /*
     * Leave type validation
     */
    if (!form.leave_type_id) {
      nextErrors.leave_type_id =
        "Leave type is required.";
    }

    /*
     * Allocation validation
     */
    if (!form.total_leaves_allocated) {
      nextErrors.total_leaves_allocated =
        "Allocation is required.";
    } else if (
      Number(form.total_leaves_allocated) <= 0
    ) {
      nextErrors.total_leaves_allocated =
        "Allocation must be greater than 0.";
    }

    /*
     * Carry forward validation
     */
    if (
      Number(form.carry_forward_leaves) < 0
    ) {
      nextErrors.carry_forward_leaves =
        "Carry-forward cannot be negative.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setSaving(true);

      setErrorMessage("");
      setSuccessMessage("");

      /*
       * Request body uses EXACT backend names.
       */
      const requestBody = {
        employee_id: Number(
          form.employee_id
        ),

        leave_type_id: Number(
          form.leave_type_id
        ),

        leave_period_id: Number(
          form.leave_period_id
        ),

        total_leaves_allocated: Number(
          form.total_leaves_allocated
        ),

        carry_forward_leaves: Number(
          form.carry_forward_leaves || 0
        ),
      };

      console.log(
        "Sending request:",
        requestBody
      );

      /*
       * POST API
       */
      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      console.log(
        "Backend response:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to allocate leave"
        );
      }

      /*
       * Success
       */
      setSuccessMessage(
        "Leave allocated successfully."
      );

      /*
       * Reset form
       */
      setForm(initialForm);

      setErrors({});

      /*
       * Close modal
       */
      setIsFormOpen(false);

      /*
       * Reload table from database
       */
      await fetchAllocations();

      /*
       * Remove success message
       */
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Error creating leave allocation:",
        error
      );

      setErrorMessage(
        error.message ||
          "Failed to allocate leave."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}

      <div className={styles.header}>
        <div>
          <h1>Leave Allocations</h1>
        </div>

        <div className={styles.headerActions}>
          <Link
            to="/hr/leave-management/settings"
            className={styles.navigationButton}
            aria-label="Back to Settings"
          >
            <Settings
              size={16}
              strokeWidth={2}
            />

            <span>
              Back to Settings
            </span>
          </Link>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              setForm(initialForm);
              setErrors({});
              setErrorMessage("");
              setIsFormOpen(true);
            }}
          >
            + Allocate Leave
          </button>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "15px",
            background: "#e8f7ee",
            color: "#1f7a45",
            borderRadius: "8px",
          }}
        >
          {successMessage}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {errorMessage && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "15px",
            background: "#fdecec",
            color: "#c62828",
            borderRadius: "8px",
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* TABLE */}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>
              Employee Leave Allocations
            </h2>

            <p>
              Leave quota assigned to employees
              for the active leave period.
            </p>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Period</th>
                <th>Allocated</th>
                <th>Carry Forward</th>
                <th>Used</th>
                <th>Remaining</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : allocations.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    No leave allocations found.
                  </td>
                </tr>
              ) : (
                allocations.map(
                  (allocation) => (
                    <tr
                      key={allocation.id}
                    >
                      <td>
                        <strong>
                          {allocation.employee}
                        </strong>

                        <small>
                          {allocation.employeeId}
                        </small>
                      </td>

                      <td>
                        {allocation.leaveType}
                      </td>

                      <td>
                        {allocation.period}
                      </td>

                      <td>
                        {allocation.allocated}
                      </td>

                      <td>
                        {allocation.carryForward}
                      </td>

                      <td>
                        {allocation.used}
                      </td>

                      <td>
                        <strong>
                          {allocation.remaining}
                        </strong>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}

      {isFormOpen && (
        <div
          className={styles.overlay}
          onMouseDown={() =>
            setIsFormOpen(false)
          }
        >
          <div
            className={styles.modal}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}

            <div className={styles.modalHeader}>
              <div>
                <h2>
                  Allocate Leave
                </h2>

                <p>
                  Assign leave quota to an
                  employee.
                </p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() =>
                  setIsFormOpen(false)
                }
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                {/* EMPLOYEE */}

                <div className={styles.field}>
                  <label htmlFor="employee_id">
                    Employee
                  </label>

                  <select
                    id="employee_id"
                    name="employee_id"
                    value={
                      form.employee_id
                    }
                    onChange={handleChange}
                  >
                    <option value="">
                      Select employee
                    </option>

                    {employees.map(
                      (employee) => (
                        <option
                          key={employee.id}
                          value={employee.id}
                        >
                          {employee.name} (
                          {
                            employee.employeeCode
                          }
                          )
                        </option>
                      )
                    )}
                  </select>

                  {errors.employee_id && (
                    <span
                      className={
                        styles.error
                      }
                    >
                      {
                        errors.employee_id
                      }
                    </span>
                  )}
                </div>

                {/* LEAVE TYPE */}

                <div className={styles.field}>
                  <label htmlFor="leave_type_id">
                    Leave Type
                  </label>

                  <select
                    id="leave_type_id"
                    name="leave_type_id"
                    value={
                      form.leave_type_id
                    }
                    onChange={handleChange}
                  >
                    <option value="">
                      Select leave type
                    </option>

                    {leaveTypes.map(
                      (leaveType) => (
                        <option
                          key={leaveType.id}
                          value={leaveType.id}
                        >
                          {leaveType.name}
                        </option>
                      )
                    )}
                  </select>

                  {errors.leave_type_id && (
                    <span
                      className={
                        styles.error
                      }
                    >
                      {
                        errors.leave_type_id
                      }
                    </span>
                  )}
                </div>

                {/* ALLOCATED LEAVES */}

                <div className={styles.field}>
                  <label
                    htmlFor="total_leaves_allocated"
                  >
                    Allocated Leaves
                  </label>

                  <input
                    id="total_leaves_allocated"
                    name="total_leaves_allocated"
                    type="number"
                    min="0"
                    step="0.5"
                    value={
                      form.total_leaves_allocated
                    }
                    onChange={handleChange}
                  />

                  {errors.total_leaves_allocated && (
                    <span
                      className={
                        styles.error
                      }
                    >
                      {
                        errors.total_leaves_allocated
                      }
                    </span>
                  )}
                </div>

                {/* CARRY FORWARD */}

                <div className={styles.field}>
                  <label
                    htmlFor="carry_forward_leaves"
                  >
                    Carry Forward
                  </label>

                  <input
                    id="carry_forward_leaves"
                    name="carry_forward_leaves"
                    type="number"
                    min="0"
                    step="0.5"
                    value={
                      form.carry_forward_leaves
                    }
                    onChange={handleChange}
                  />

                  {errors.carry_forward_leaves && (
                    <span
                      className={
                        styles.error
                      }
                    >
                      {
                        errors.carry_forward_leaves
                      }
                    </span>
                  )}
                </div>
              </div>

              {/* ACTIONS */}

              <div className={styles.actions}>
                <button
                  type="button"
                  className={
                    styles.secondaryButton
                  }
                  onClick={() =>
                    setIsFormOpen(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    styles.primaryButton
                  }
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Allocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveAllocations;
