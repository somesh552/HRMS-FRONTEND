import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LeaveManagementCard from "./LeaveManagementChart";
import LeaveManagementGraph from "./LeaveManagementGraph";
import LeaveManagementTable from "./LeaveManagementTable";
import { employeeApi } from "../../../services/api/employee.api";
import styles from "./LeaveManagement.module.css";

const leaveTypes = [
  {
    name: "Casual Leave",
    maxDays: 3,
  },
  {
    name: "Sick Leave",
    maxDays: 5,
  },
  {
    name: "Earned Leave",
    maxDays: 18,
  },
];

const existingRequests = [
  {
    employeeId: "EMP-125",
    from: "2025-05-15",
    to: "2025-05-16",
    status: "Pending",
  },
  {
    employeeId: "EMP-124",
    from: "2025-05-14",
    to: "2025-05-16",
    status: "Approved",
  },
];

const initialForm = {
  employeeId: "",
  leaveType: "",
  fromDate: "",
  toDate: "",
  reason: "",
};

const LeaveManagement = () => {
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState("");
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setEmployeeLoading(true);
        setEmployeeError("");

        const response = await employeeApi.getAll();

        setEmployees(response.data ?? []);
      } catch (error) {
        console.error("Failed to load employees:", error);
        setEmployeeError("Unable to load employees.");
      } finally {
        setEmployeeLoading(false);
      }
    };

    loadEmployees();
  }, []);
  const isEmployeeView = true;
  const currentEmployee = employees[0] ?? null;
  const selectedEmployee = employees.find(
    (employee) => employee.id === form.employeeId,
  );

  const selectedLeaveType = leaveTypes.find(
    (leaveType) => leaveType.name === form.leaveType,
  );

  const currentBalance =
    selectedEmployee && form.leaveType
      ? (selectedEmployee.balances[form.leaveType] ?? 0)
      : 0;

  const numberOfDays =
    form.fromDate && form.toDate
      ? Math.floor(
          (new Date(form.toDate) - new Date(form.fromDate)) /
            (1000 * 60 * 60 * 24),
        ) + 1
      : 0;

  const openApplyLeave = () => {
    if (isEmployeeView && !currentEmployee) {
      return;
    }

    setForm(
      isEmployeeView
        ? {
            ...initialForm,
            employeeId: currentEmployee.id,
          }
        : initialForm,
    );

    setErrors({});
    setIsApplyOpen(true);
  };

  const closeApplyLeave = () => {
    setIsApplyOpen(false);
    setErrors({});
  };

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
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.employeeId) {
      nextErrors.employeeId = "Employee is required.";
    }

    if (!form.leaveType) {
      nextErrors.leaveType = "Leave type is required.";
    }

    if (!form.fromDate) {
      nextErrors.fromDate = "From date is required.";
    }

    if (!form.toDate) {
      nextErrors.toDate = "To date is required.";
    }

    if (!form.reason.trim()) {
      nextErrors.reason = "Reason is required.";
    }

    if (
      form.fromDate &&
      form.toDate &&
      new Date(form.fromDate) > new Date(form.toDate)
    ) {
      nextErrors.toDate = "To date cannot be before from date.";
    }

    if (selectedLeaveType && numberOfDays > selectedLeaveType.maxDays) {
      nextErrors.toDate = `This leave type allows a maximum of ${selectedLeaveType.maxDays} days.`;
    }

    if (numberOfDays > currentBalance) {
      nextErrors.toDate = "You don't have enough leave balance.";
    }

    const hasOverlap = existingRequests.some((request) => {
      if (request.employeeId !== form.employeeId) {
        return false;
      }

      if (!["Pending", "Approved"].includes(request.status)) {
        return false;
      }

      if (!form.fromDate || !form.toDate) {
        return false;
      }

      return (
        new Date(form.fromDate) <= new Date(request.to) &&
        new Date(form.toDate) >= new Date(request.from)
      );
    });

    if (hasOverlap) {
      nextErrors.fromDate =
        "An existing leave request overlaps with the selected dates.";
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // UI-only for now.
    // API integration will be added after the backend contract is ready.
    console.log("Leave application:", {
      ...form,
      numberOfDays,
      currentBalance,
    });

    closeApplyLeave();
  };

  return (
    <div className={styles["leave-management-content"]}>
      <div className={styles["leave-page-header"]}>
        <div>
          <h1>Leave Management</h1>
        </div>

        <div className={styles["leave-page-actions"]}>
          <button
            type="button"
            className={styles["settings-btn"]}
            onClick={() => navigate("/hr/leave-management/settings")}
          >
            Settings
          </button>

          <button
            type="button"
            className={styles["apply-leave-btn"]}
            onClick={openApplyLeave}
          >
            + Apply Leave
          </button>
        </div>
      </div>

      <LeaveManagementCard />

      <LeaveManagementGraph />

      <LeaveManagementTable />

      {isApplyOpen && (
        <div
          className={styles["leave-modal-overlay"]}
          onMouseDown={closeApplyLeave}
        >
          <div
            className={styles["leave-modal"]}
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-leave-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles["leave-modal-header"]}>
              <div>
                <h2 id="apply-leave-title">Apply Leave</h2>
                <p>Submit a leave application for an employee.</p>
              </div>

              <button
                type="button"
                className={styles["leave-modal-close"]}
                onClick={closeApplyLeave}
                aria-label="Close apply leave form"
              >
                ×
              </button>
            </div>

            <form className={styles["leave-form"]} onSubmit={handleSubmit}>
              <div className={styles["leave-form-grid"]}>
                <div className={styles["leave-form-field"]}>
                  <label htmlFor="employeeId">Employee</label>

                  {isEmployeeView ? (
                    <input
                      id="employeeId"
                      name="employeeId"
                      value={
                        currentEmployee
                          ? `${currentEmployee.first_name} ${currentEmployee.last_name} (${currentEmployee.employee_code})`
                          : "Loading employee..."
                      }
                      readOnly
                      aria-readonly="true"
                    />
                  ) : (
                    <select
                      id="employeeId"
                      name="employeeId"
                      value={form.employeeId}
                      onChange={handleChange}
                    >
                      <option value="">Select employee</option>

                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} ({employee.id})
                        </option>
                      ))}
                    </select>
                  )}

                  {errors.employeeId && (
                    <span className={styles["leave-form-error"]}>
                      {errors.employeeId}
                    </span>
                  )}
                </div>

                <div className={styles["leave-form-field"]}>
                  <label htmlFor="leaveType">Leave Type</label>

                  <select
                    id="leaveType"
                    name="leaveType"
                    value={form.leaveType}
                    onChange={handleChange}
                  >
                    <option value="">Select leave type</option>

                    {leaveTypes.map((leaveType) => (
                      <option key={leaveType.name} value={leaveType.name}>
                        {leaveType.name}
                      </option>
                    ))}
                  </select>

                  {errors.leaveType && (
                    <span className={styles["leave-form-error"]}>
                      {errors.leaveType}
                    </span>
                  )}
                </div>

                <div className={styles["leave-form-field"]}>
                  <label htmlFor="fromDate">From Date</label>

                  <input
                    id="fromDate"
                    name="fromDate"
                    type="date"
                    value={form.fromDate}
                    onChange={handleChange}
                  />

                  {errors.fromDate && (
                    <span className={styles["leave-form-error"]}>
                      {errors.fromDate}
                    </span>
                  )}
                </div>

                <div className={styles["leave-form-field"]}>
                  <label htmlFor="toDate">To Date</label>

                  <input
                    id="toDate"
                    name="toDate"
                    type="date"
                    value={form.toDate}
                    onChange={handleChange}
                  />

                  {errors.toDate && (
                    <span className={styles["leave-form-error"]}>
                      {errors.toDate}
                    </span>
                  )}
                </div>

                <div className={styles["leave-form-field"]}>
                  <label>Number of Days</label>

                  <div className={styles["leave-form-readonly"]}>
                    {numberOfDays > 0 ? numberOfDays : "—"}
                  </div>
                </div>

                <div className={styles["leave-form-field"]}>
                  <label>Current Balance</label>

                  <div className={styles["leave-form-balance"]}>
                    {form.leaveType
                      ? `${currentBalance} days`
                      : "Select leave type"}
                  </div>
                </div>

                <div
                  className={`${styles["leave-form-field"]} ${styles["leave-form-full"]}`}
                >
                  <label htmlFor="reason">Reason</label>

                  <textarea
                    id="reason"
                    name="reason"
                    rows="4"
                    value={form.reason}
                    onChange={handleChange}
                    placeholder="Enter reason for leave"
                  />

                  {errors.reason && (
                    <span className={styles["leave-form-error"]}>
                      {errors.reason}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles["leave-form-actions"]}>
                <button
                  type="button"
                  className={styles["leave-cancel-btn"]}
                  onClick={closeApplyLeave}
                >
                  Cancel
                </button>

                <button type="submit" className={styles["leave-submit-btn"]}>
                  Submit Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
