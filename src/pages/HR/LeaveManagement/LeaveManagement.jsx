import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import LeaveManagementCard from "./LeaveManagementChart";
import LeaveManagementGraph from "./LeaveManagementGraph";
import LeaveManagementTable from "./LeaveManagementTable";

import { employeeApi } from "../../../services/api/employee.api";
import { leaveTypesApi } from "../../../services/api/leaveTypes.api";
import { leaveAllocationsApi } from "../../../services/api/leaveAllocations.api";
import { leaveApplicationsApi } from "../../../services/api/leaveApplications.api";
import styles from "./LeaveManagement.module.css";

const initialForm = {
  employeeId: "",
  leaveType: "",
  fromDate: "",
  toDate: "",
  reason: "",
  isHalfDay: false,
  halfDayDate: "",
};
const LeaveManagement = () => {
  const navigate = useNavigate();

  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [employeeSearch, setEmployeeSearch] = useState("");

  const [errors, setErrors] = useState({});

  const [employees, setEmployees] = useState([]);

  const [leaveTypes, setLeaveTypes] = useState([]);

  const [allocations, setAllocations] = useState([]);
  const [leaveApplications, setLeaveApplications] =
    useState([]);

  const [applicationsLoading, setApplicationsLoading] =
    useState(false);

  const [applicationsError, setApplicationsError] =
    useState("");

  const [employeeLoading, setEmployeeLoading] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [employeeError, setEmployeeError] =
    useState("");

  const [submitError, setSubmitError] =
    useState("");

  /*
   * ==========================================
   * LOAD EMPLOYEES
   * ==========================================
   */

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setEmployeeLoading(true);
        setEmployeeError("");

        const response =
          await employeeApi.getAll();

        console.log(
          "Employees API response:",
          response.data
        );

        setEmployees(
          Array.isArray(response.data)
            ? response.data
            : response.data?.data || []
        );
      } catch (error) {
        console.error(
          "Failed to load employees:",
          error
        );

        setEmployeeError(
          error?.response?.data?.message ||
          "Unable to load employees."
        );
      } finally {
        setEmployeeLoading(false);
      }
    };

    loadEmployees();
  }, []);
  useEffect(() => {
    const loadLeaveApplications = async () => {
      try {
        setApplicationsLoading(true);
        setApplicationsError("");

        const response =
          await leaveApplicationsApi.getAll();

        console.log(
          "Leave Applications:",
          response
        );

        const data = Array.isArray(response)
          ? response
          : response?.data || [];

        setLeaveApplications(data);
      } catch (error) {
        console.error(
          "Failed to load leave applications:",
          error
        );

        setApplicationsError(
          error?.response?.data?.message ||
          "Unable to load leave requests."
        );
      } finally {
        setApplicationsLoading(false);
      }
    };

    loadLeaveApplications();
  }, []);

  /*
   * ==========================================
   * CURRENT EMPLOYEE
   * ==========================================
   *
   * Currently employee view is enabled.
   * Therefore we use the first employee.
   */

  const isEmployeeView = true;

  const currentEmployee =
    employees[0] || null;

  /*
   * ==========================================
   * SELECTED EMPLOYEE
   * ==========================================
   */

  const selectedEmployee =
    employees.find(
      (employee) =>
        String(employee.id) ===
        String(form.employeeId)
    ) || null;
  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.first_name || ""} ${employee.last_name || ""
      }`.toLowerCase();

    const employeeCode = (
      employee.employee_code || ""
    ).toLowerCase();

    const search = employeeSearch.toLowerCase().trim();

    return (
      fullName.includes(search) ||
      employeeCode.includes(search)
    );
  });

  const selectedEmployeeName = selectedEmployee
    ? `${selectedEmployee.first_name || ""} ${selectedEmployee.last_name || ""
    } (${selectedEmployee.employee_code || ""})`
    : "";

  const showEmployeeResults =
    employeeSearch.trim() !== "" &&
    employeeSearch !== selectedEmployeeName;

  /*
   * ==========================================
   * LOAD LEAVE TYPES + ALLOCATIONS
   * ==========================================
   */

  useEffect(() => {
    const loadLeaveData = async () => {
      try {
        setLoading(true);

        /*
         * Load Leave Types
         */
        const leaveTypesResponse =
          await leaveTypesApi.getAll();

        console.log(
          "Leave Types API response:",
          leaveTypesResponse
        );

        setLeaveTypes(
          Array.isArray(
            leaveTypesResponse
          )
            ? leaveTypesResponse
            : []
        );

        /*
         * Load Leave Allocations
         */
        const allocationsResponse =
          await leaveAllocationsApi.getAll();

        console.log(
          "Leave Allocations API response:",
          allocationsResponse
        );

        /*
         * Your API returns response.data.
         * Backend may return either:
         *
         * []
         *
         * OR
         *
         * { data: [] }
         */

        const allocationData =
          Array.isArray(
            allocationsResponse
          )
            ? allocationsResponse
            : allocationsResponse?.data || [];

        setAllocations(
          allocationData
        );
      } catch (error) {
        console.error(
          "Failed to load leave data:",
          error
        );

        setSubmitError(
          error?.response?.data?.message ||
          "Unable to load leave types or leave allocations."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLeaveData();
  }, []);

  /*
   * ==========================================
   * SELECTED LEAVE TYPE
   * ==========================================
   */

  const selectedLeaveType =
    leaveTypes.find(
      (leaveType) =>
        String(leaveType.id) ===
        String(form.leaveType)
    ) || null;

  /*
   * ==========================================
   * SELECTED ALLOCATION
   * ==========================================
   */

  const selectedAllocation =
    allocations.find(
      (allocation) =>
        String(
          allocation.employee_id
        ) === String(form.employeeId) &&
        String(
          allocation.leave_type_id
        ) === String(form.leaveType)
    ) || null;

  /*
   * ==========================================
   * CURRENT BALANCE
   * ==========================================
   */

  const currentBalance =
    selectedAllocation
      ? Number(
        selectedAllocation.remaining_leaves ??
        selectedAllocation.remainingLeaves ??
        0
      )
      : 0;

  /*
   * ==========================================
   * NUMBER OF DAYS
   * ==========================================
   */
  const calculateWorkingDays = (fromDate, toDate) => {
    if (!fromDate || !toDate) {
      return 0;
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (start > end) {
      return 0;
    }

    let days = 0;
    const current = new Date(start);

    while (current <= end) {
      const day = current.getDay();

      // Sunday = 0
      // Saturday = 6
      if (day !== 0 && day !== 6) {
        days++;
      }

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const numberOfDays = calculateWorkingDays(
    form.fromDate,
    form.toDate
  );


  /*
   * ==========================================
   * OPEN APPLY LEAVE
   * ==========================================
   */

  const openApplyLeave = () => {
    if (
      isEmployeeView &&
      !currentEmployee
    ) {
      setSubmitError(
        "Employee information is not available."
      );

      return;
    }
    setForm(initialForm);
    setEmployeeSearch("");

    setErrors({});
    setSubmitError("");

    setIsApplyOpen(true);
  };

  /*
   * ==========================================
   * CLOSE APPLY LEAVE
   * ==========================================
   */

  const closeApplyLeave = () => {
    if (isSubmitting) {
      return;
    }

    setIsApplyOpen(false);

    setErrors({});

    setSubmitError("");
  };

  /*
   * ==========================================
   * INPUT CHANGE
   * ==========================================
   */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setSubmitError("");
  };

  /*
   * ==========================================
   * VALIDATION
   * ==========================================
   */

  const validateForm = () => {
    const nextErrors = {};

    if (!form.employeeId) {
      nextErrors.employeeId =
        "Employee is required.";
    }

    if (!form.leaveType) {
      nextErrors.leaveType =
        "Leave type is required.";
    }

    if (!form.fromDate) {
      nextErrors.fromDate =
        "From date is required.";
    }

    if (!form.toDate) {
      nextErrors.toDate =
        "To date is required.";
    }

    if (!form.reason.trim()) {
      nextErrors.reason =
        "Reason is required.";
    }

    /*
     * Date validation
     */

    if (
      form.fromDate &&
      form.toDate &&
      new Date(form.fromDate) >
      new Date(form.toDate)
    ) {
      nextErrors.toDate =
        "To date cannot be before from date.";
    }

    /*
     * Leave type maximum days
     *
     * Supports both:
     * max_days_allowed
     * maxDays
     */

    const maxDays =
      Number(
        selectedLeaveType?.max_days_allowed ??
        selectedLeaveType?.maxDays ??
        0
      );

    if (
      maxDays > 0 &&
      numberOfDays > maxDays
    ) {
      nextErrors.toDate =
        `This leave type allows a maximum of ${maxDays} days.`;
    }

    /*
     * Leave balance validation
     */

    if (
      selectedAllocation &&
      numberOfDays > currentBalance
    ) {
      nextErrors.toDate =
        "You don't have enough leave balance.";
    }


    // HALF DAY VALIDATION

    if (form.isHalfDay && !form.halfDayDate) {
      nextErrors.halfDayDate =
        "Please select the half day date.";
    }

    if (
      form.isHalfDay &&
      form.halfDayDate &&
      form.fromDate &&
      form.toDate
    ) {
      const halfDayDate =
        new Date(form.halfDayDate);

      const fromDate =
        new Date(form.fromDate);

      const toDate =
        new Date(form.toDate);

      if (
        halfDayDate < fromDate ||
        halfDayDate > toDate
      ) {
        nextErrors.halfDayDate =
          "Half day date must be within the leave period.";
      }
    }

    return nextErrors;
  };

  /*
   * ==========================================
   * SUBMIT LEAVE
   * ==========================================
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setSubmitError("");
    setErrors({});

    // Run frontend validation first
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Make sure employee is available
    if (!form.employeeId) {
      setSubmitError("Employee information is not available.");
      return;
    }

    // Find selected leave type
    const selectedType = leaveTypes.find(
      (type) =>
        String(type.id) === String(form.leaveType)
    );

    if (!selectedType) {
      setSubmitError("Leave type not found.");
      return;
    }

    // Make sure allocation exists
    if (!selectedAllocation) {
      setSubmitError(
        "Leave allocation not found for this employee and leave type."
      );
      return;
    }

    // Final balance check
    if (numberOfDays <= 0) {
      setSubmitError(
        "Please select valid leave dates."
      );
      return;
    }

    if (numberOfDays > currentBalance) {
      setSubmitError(
        "You don't have enough leave balance."
      );
      return;
    }

    // Data sent to backend
    const requestData = {
      employee_id: Number(form.employeeId),

      leave_type_id: Number(selectedType.id),

      from_date: form.fromDate,

      to_date: form.toDate,

      reason: form.reason.trim(),
      is_half_day: form.isHalfDay,

      half_day_date: form.isHalfDay
        ? form.halfDayDate
        : null,
    };

    console.log(
      "Submitting Leave Application:",
      requestData
    );

    try {
      setIsSubmitting(true);

      /*
       * Use your existing leaveApplicationsApi.
       *
       * If your API file has:
       * create(data)
       *
       * this will call:
       * POST /leave-applications
       */
      const response =
        await leaveApplicationsApi.create(
          requestData
        );

      console.log(
        "Leave Application Response:",
        response
      );
      const applications =
        await leaveApplicationsApi.getAll();

      const applicationData =
        Array.isArray(applications)
          ? applications
          : applications?.data || [];

      setLeaveApplications(applicationData);

      // Success message
      alert(
        response?.message ||
        "Leave applied successfully!"
      );

      // Reset form
      setForm({
        ...initialForm,
        employeeId: currentEmployee?.id || "",
      });

      setErrors({});
      setSubmitError("");

      // Close modal
      setIsApplyOpen(false);

    } catch (error) {
      console.error(
        "Apply Leave API Error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to apply leave. Please try again.";

      setSubmitError(message);

      alert(message);

    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <div
      className={
        styles[
        "leave-management-content"
        ]
      }
    >
      <div
        className={
          styles["leave-page-header"]
        }
      >
        <div>
          <h1>
            Leave Management
          </h1>
        </div>

        <div
          className={
            styles["leave-page-actions"]
          }
        >
          <button
            type="button"
            className={
              styles["settings-btn"]
            }
            onClick={() =>
              navigate(
                "/hr/leave-management/settings"
              )
            }
          >
            Settings
          </button>

          <button
            type="button"
            className={
              styles[
              "apply-leave-btn"
              ]
            }
            onClick={
              openApplyLeave
            }
          >
            + Apply Leave
          </button>
        </div>
      </div>
      <LeaveManagementCard leaveRequests={leaveApplications} />

      <LeaveManagementGraph leaveRequests={leaveApplications} />

      <LeaveManagementTable
        leaveApplications={leaveApplications}
        loading={applicationsLoading}
        error={applicationsError}
      />
      {isApplyOpen && (
        <div
          className={
            styles[
            "leave-modal-overlay"
            ]
          }
          onMouseDown={
            closeApplyLeave
          }
        >
          <div
            className={
              styles["leave-modal"]
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-leave-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className={
                styles[
                "leave-modal-header"
                ]
              }
            >
              <div>
                <h2
                  id="apply-leave-title"
                >
                  Apply Leave
                </h2>

                <p>
                  Submit a leave
                  application for an
                  employee.
                </p>
              </div>

              <button
                type="button"
                className={
                  styles[
                  "leave-modal-close"
                  ]
                }
                onClick={
                  closeApplyLeave
                }
                disabled={
                  isSubmitting
                }
              >
                ×
              </button>
            </div>

            {submitError && (
              <div
                style={{
                  margin:
                    "12px 20px",
                  padding:
                    "10px 12px",
                  borderRadius:
                    "6px",
                  background:
                    "#ffecec",
                  color:
                    "#c62828",
                  fontSize:
                    "14px",
                }}
              >
                {submitError}
              </div>
            )}

            {employeeError && (
              <div
                style={{
                  margin:
                    "12px 20px",
                  padding:
                    "10px 12px",
                  borderRadius:
                    "6px",
                  background:
                    "#ffecec",
                  color:
                    "#c62828",
                  fontSize:
                    "14px",
                }}
              >
                {employeeError}
              </div>
            )}

            {loading && (
              <div
                style={{
                  margin:
                    "12px 20px",
                  fontSize:
                    "14px",
                }}
              >
                Loading leave types
                and leave balances...
              </div>
            )}

            <form
              className={
                styles["leave-form"]
              }
              onSubmit={
                handleSubmit
              }
            >
              <div
                className={
                  styles[
                  "leave-form-grid"
                  ]
                }
              >
                {/* EMPLOYEE */}

                <div
                  className={
                    styles[
                    "leave-form-field"
                    ]
                  }
                >
                  <label htmlFor="employeeId">
                    Employee
                  </label>
                  <div className={styles["employee-search-wrapper"]}>
                    <input
                      type="text"
                      id="employeeSearch"
                      value={employeeSearch}
                      placeholder={
                        employeeLoading
                          ? "Loading employees..."
                          : "Search employee name..."
                      }
                      disabled={isSubmitting || employeeLoading}
                      onChange={(e) => {
                        const value = e.target.value;

                        setEmployeeSearch(value);

                        // Clear previously selected employee
                        setForm((current) => ({
                          ...current,
                          employeeId: "",
                        }));

                        setErrors((current) => ({
                          ...current,
                          employeeId: "",
                        }));

                        setSubmitError("");
                      }}
                    />

                    {showEmployeeResults && (
                      <div className={styles["employee-search-results"]}>
                        {filteredEmployees.length > 0 ? (
                          filteredEmployees.slice(0, 10).map((employee) => (
                            <div
                              key={employee.id}
                              className={styles["employee-search-item"]}
                              onMouseDown={(e) => {
                                e.preventDefault();

                                const name = `${employee.first_name || ""} ${employee.last_name || ""
                                  }`;

                                setForm((current) => ({
                                  ...current,
                                  employeeId: employee.id,
                                }));

                                setEmployeeSearch(
                                  `${name} (${employee.employee_code})`
                                );

                                setErrors((current) => ({
                                  ...current,
                                  employeeId: "",
                                }));
                              }}
                            >
                              <strong>
                                {employee.first_name} {employee.last_name}
                              </strong>

                              <span>
                                {employee.employee_code}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className={styles["employee-no-results"]}>
                            No employee found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {errors.employeeId && (
                    <span
                      className={
                        styles[
                        "leave-form-error"
                        ]
                      }
                    >
                      {
                        errors.employeeId
                      }
                    </span>
                  )}
                </div>

                {/* LEAVE TYPE */}

                <div
                  className={
                    styles[
                    "leave-form-field"
                    ]
                  }
                >
                  <label htmlFor="leaveType">
                    Leave Type
                  </label>

                  <select
                    id="leaveType"
                    name="leaveType"
                    value={
                      form.leaveType
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      isSubmitting ||
                      loading
                    }
                  >
                    <option value="">
                      Select leave type
                    </option>

                    {leaveTypes.map(
                      (leaveType) => (
                        <option
                          key={
                            leaveType.id
                          }
                          value={
                            leaveType.id
                          }
                        >
                          {
                            leaveType.leave_type_name ||
                            leaveType.name ||
                            leaveType.type_name
                          }
                        </option>
                      )
                    )}
                  </select>

                  {errors.leaveType && (
                    <span
                      className={
                        styles[
                        "leave-form-error"
                        ]
                      }
                    >
                      {
                        errors.leaveType
                      }
                    </span>
                  )}
                </div>

                {/* FROM DATE */}

                <div
                  className={
                    styles[
                    "leave-form-field"
                    ]
                  }
                >
                  <label htmlFor="fromDate">
                    From Date
                  </label>

                  <input
                    id="fromDate"
                    name="fromDate"
                    type="date"
                    value={
                      form.fromDate
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      isSubmitting
                    }
                  />

                  {errors.fromDate && (
                    <span
                      className={
                        styles[
                        "leave-form-error"
                        ]
                      }
                    >
                      {
                        errors.fromDate
                      }
                    </span>
                  )}
                </div>

                {/* TO DATE */}

                <div
                  className={
                    styles["leave-form-field"]
                  }
                >
                  <label htmlFor="toDate">
                    To Date
                  </label>

                  <input
                    id="toDate"
                    name="toDate"
                    type="date"
                    value={form.toDate}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />

                  {errors.toDate && (
                    <span
                      className={
                        styles["leave-form-error"]
                      }
                    >
                      {errors.toDate}
                    </span>
                  )}
                </div>


                {/* HALF DAY */}

                <div
                  className={
                    styles["leave-form-field"]
                  }
                >
                  <label htmlFor="isHalfDay">
                    Half Day
                  </label>

                  <label className={styles["toggle-switch"]}>
                    <input
                      id="isHalfDay"
                      name="isHalfDay"
                      type="checkbox"
                      checked={form.isHalfDay}
                      onChange={(event) => {
                        const checked = event.target.checked;

                        setForm((current) => ({
                          ...current,
                          isHalfDay: checked,
                          halfDayDate: checked ? current.fromDate : "",
                        }));

                        setErrors((current) => ({
                          ...current,
                          halfDayDate: "",
                        }));
                      }}
                      disabled={isSubmitting}
                    />

                    <span className={styles["toggle-slider"]}></span>
                  </label>
                </div>


                {/* HALF DAY DATE */}

                {form.isHalfDay && (
                  <div
                    className={
                      styles["leave-form-field"]
                    }
                  >
                    <label htmlFor="halfDayDate">
                      Half Day Date
                    </label>

                    <input
                      id="halfDayDate"
                      name="halfDayDate"
                      type="date"
                      value={form.halfDayDate}
                      min={form.fromDate}
                      max={form.toDate}
                      onChange={handleChange}
                      disabled={
                        isSubmitting ||
                        !form.fromDate ||
                        !form.toDate
                      }
                    />

                    {errors.halfDayDate && (
                      <span
                        className={
                          styles["leave-form-error"]
                        }
                      >
                        {errors.halfDayDate}
                      </span>
                    )}
                  </div>
                )}


                {/* NUMBER OF DAYS */}

                <div
                  className={
                    styles["leave-form-field"]
                  }
                >
                  <label>
                    Number of Days
                  </label>

                  <div
                    className={
                      styles["leave-form-readonly"]
                    }
                  >
                    {numberOfDays > 0
                      ? numberOfDays
                      : "—"}
                  </div>
                </div>

                {/* CURRENT BALANCE */}

                <div
                  className={
                    styles[
                    "leave-form-field"
                    ]
                  }
                >
                  <label>
                    Current Balance
                  </label>

                  <div
                    className={
                      styles[
                      "leave-form-balance"
                      ]
                    }
                  >
                    {form.leaveType
                      ? `${currentBalance} days`
                      : "Select leave type"}
                  </div>
                </div>



                {/* REASON */}

                <div
                  className={`${styles["leave-form-field"]} ${styles["leave-form-full"]}`}
                >
                  <label htmlFor="reason">
                    Reason
                  </label>

                  <textarea
                    id="reason"
                    name="reason"
                    rows="4"
                    value={
                      form.reason
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter reason for leave"
                    disabled={
                      isSubmitting
                    }
                  />

                  {errors.reason && (
                    <span
                      className={
                        styles[
                        "leave-form-error"
                        ]
                      }
                    >
                      {
                        errors.reason
                      }
                    </span>
                  )}
                </div>
              </div>

              <div
                className={
                  styles[
                  "leave-form-actions"
                  ]
                }
              >
                <button
                  type="button"
                  className={
                    styles[
                    "leave-cancel-btn"
                    ]
                  }
                  onClick={
                    closeApplyLeave
                  }
                  disabled={
                    isSubmitting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    styles[
                    "leave-submit-btn"
                    ]
                  }
                  disabled={
                    isSubmitting ||
                    employeeLoading ||
                    loading
                  }
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Submit Leave"}
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