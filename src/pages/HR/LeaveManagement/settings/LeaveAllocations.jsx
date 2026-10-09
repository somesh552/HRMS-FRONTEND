import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { employeeApi } from "../../../../services/api/employee.api";
import { leaveTypesApi } from "../../../../services/api/leaveTypes.api";
import { leavePeriodsApi } from "../../../../services/api/leavePeriods.api";
import { leaveAllocationsApi } from "../../../../services/api/leaveAllocations.api";

import styles from "./LeaveAllocations.module.css";

const initialForm = {
  employee_id: "",
  leave_type_id: "",
  leave_period_id: "",
  total_leaves_allocated: "",
  carry_forward_leaves: "0",
};

const LeaveAllocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leavePeriods, setLeavePeriods] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        allocationsResponse,
        employeesResponse,
        leaveTypesResponse,
        leavePeriodsResponse,
      ] = await Promise.all([
        leaveAllocationsApi.getAll(),
        employeeApi.getAll(),
        leaveTypesApi.getAll(),
        leavePeriodsApi.getAll(),
      ]);

      console.log(
        "Allocations Response:",
        allocationsResponse
      );

      console.log(
        "Employees Response:",
        employeesResponse
      );

      console.log(
        "Leave Types Response:",
        leaveTypesResponse
      );

      console.log(
        "Leave Periods Response:",
        leavePeriodsResponse
      );

      // Convert all responses into arrays
      const allocationsData =
        getArray(allocationsResponse);

      const employeesData =
        getArray(employeesResponse);

      const leaveTypesData =
        getArray(leaveTypesResponse);

      const leavePeriodsData =
        getArray(leavePeriodsResponse);

      console.log(
        "FINAL ALLOCATIONS:",
        allocationsData
      );

      console.log(
        "FINAL EMPLOYEES:",
        employeesData
      );

      console.log(
        "FINAL LEAVE TYPES:",
        leaveTypesData
      );

      console.log(
        "FINAL LEAVE PERIODS:",
        leavePeriodsData
      );

      setAllocations(allocationsData);
      setEmployees(employeesData);
      setLeaveTypes(leaveTypesData);
      setLeavePeriods(leavePeriodsData);

    } catch (error) {
      console.error(
        "Failed to load leave allocation data:",
        error
      );

      alert(
        error?.response?.data?.message ||
        "Failed to load leave allocation data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // HANDLE API RESPONSE
  // ==========================================

  const getArray = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.value)) {
      return response.value;
    }

    return [];
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

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

  // ==========================================
  // VALIDATION
  // ==========================================

  const validate = () => {
    const nextErrors = {};

    if (!form.employee_id) {
      nextErrors.employee_id = "Employee is required.";
    }

    if (!form.leave_type_id) {
      nextErrors.leave_type_id = "Leave type is required.";
    }

    if (!form.leave_period_id) {
      nextErrors.leave_period_id = "Leave period is required.";
    }

    if (!form.total_leaves_allocated) {
      nextErrors.total_leaves_allocated =
        "Allocated leaves are required.";
    } else if (
      Number(form.total_leaves_allocated) <= 0
    ) {
      nextErrors.total_leaves_allocated =
        "Allocated leaves must be greater than 0.";
    }

    if (Number(form.carry_forward_leaves) < 0) {
      nextErrors.carry_forward_leaves =
        "Carry forward cannot be negative.";
    }

    return nextErrors;
  };

  // ==========================================
  // CREATE / UPDATE ALLOCATION
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);

      // ==========================================
      // UPDATE
      // ==========================================

      if (editingId) {
        const existingAllocation = allocations.find(
          (item) =>
            Number(item.id) === Number(editingId)
        );

        const updatePayload = {
          employee_id: Number(form.employee_id),

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

          used_leaves: Number(
            existingAllocation?.used_leaves || 0
          ),
        };

        console.log(
          "Updating allocation:",
          editingId,
          updatePayload
        );

        await leaveAllocationsApi.update(
          editingId,
          updatePayload
        );

        alert(
          "Leave allocation updated successfully."
        );
      }

      // ==========================================
      // CREATE
      // ==========================================

      else {
        const createPayload = {
          employee_id: Number(form.employee_id),

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
          "Creating allocation:",
          createPayload
        );

        await leaveAllocationsApi.create(
          createPayload
        );

        alert(
          "Leave allocated successfully."
        );
      }

      // Refresh table
      await loadData();

      // Close modal
      closeForm();
    } catch (error) {
      console.error(
        editingId
          ? "Update allocation error:"
          : "Create allocation error:",
        error
      );

      alert(
        error?.response?.data?.message ||
        (
          editingId
            ? "Failed to update leave allocation."
            : "Failed to create leave allocation."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // OPEN EDIT
  // ==========================================

  const openEdit = (allocation) => {
    setEditingId(allocation.id);

    setForm({
      employee_id: String(
        allocation.employee_id
      ),

      leave_type_id: String(
        allocation.leave_type_id
      ),

      leave_period_id: String(
        allocation.leave_period_id
      ),

      total_leaves_allocated: String(
        allocation.total_leaves_allocated ?? ""
      ),

      carry_forward_leaves: String(
        allocation.carry_forward_leaves ?? 0
      ),
    });

    setErrors({});
    setIsFormOpen(true);
  };

  // ==========================================
  // OPEN ADD
  // ==========================================

  const openAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setErrors({});
    setIsFormOpen(true);
  };

  // ==========================================
  // CLOSE FORM
  // ==========================================

  const closeForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setErrors({});
    setIsFormOpen(false);
  };

  // ==========================================
  // DISPLAY HELPERS
  // ==========================================

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(
      (item) =>
        Number(item.id) === Number(employeeId)
    );

    if (!employee) {
      return `Employee ${employeeId}`;
    }

    const fullName =
      `${employee.first_name || ""} ${employee.last_name || ""
        }`.trim();

    return (
      fullName ||
      employee.name ||
      employee.employee_name ||
      employee.employee_code ||
      `Employee ${employeeId}`
    );
  };

  const getEmployeeCode = (employeeId) => {
    const employee = employees.find(
      (item) =>
        Number(item.id) === Number(employeeId)
    );

    return (
      employee?.employee_code ||
      employeeId
    );
  };


  const filteredEmployees = employees.filter((employee) => {
    const name =
      `${employee.first_name || ""} ${employee.last_name || ""}`
        .toLowerCase();

    const code =
      (employee.employee_code || "").toLowerCase();

    const search =
      employeeSearch.toLowerCase().trim();

    return (
      name.includes(search) ||
      code.includes(search)
    );
  });
  const getLeaveTypeName = (leaveTypeId) => {
    const leaveType = leaveTypes.find(
      (item) =>
        Number(item.id ?? item.leave_type_id) ===
        Number(leaveTypeId)
    );

    return (
      leaveType?.leave_type_name ||
      leaveType?.name ||
      `Leave Type ${leaveTypeId}`
    );
  };

  const getPeriodName = (periodId) => {
    const period = leavePeriods.find(
      (item) =>
        Number(item.id ?? item.leave_period_id) ===
        Number(periodId)
    );

    return (
      period?.period_name ||
      period?.periodName ||
      period?.name ||
      `Period ${periodId}`
    );
  };

  // ==========================================
  // UI
  // ==========================================

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
            onClick={openAdd}
          >
            + Allocate Leave
          </button>

        </div>
      </div>

      {/* TABLE */}

      <div className={styles.card}>

        <div className={styles.cardHeader}>

          <div>
            <h2>
              Employee Leave Allocations
            </h2>

            <p>
              Leave quota assigned to
              employees for the leave
              period.
            </p>
          </div>

          <span className={styles.count}>
            {allocations.length} Allocations
          </span>

        </div>

        {loading ? (
          <div className={styles.emptyState}>
            Loading allocations...
          </div>
        ) : allocations.length === 0 ? (
          <div className={styles.emptyState}>

            <strong>
              No leave allocations found
            </strong>

            <p>
              Click "Allocate Leave" to
              create one.
            </p>

          </div>
        ) : (
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
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {allocations.map(
                  (allocation) => {

                    const allocated =
                      Number(
                        allocation.total_leaves_allocated ||
                        0
                      );

                    const carryForward =
                      Number(
                        allocation.carry_forward_leaves ||
                        0
                      );

                    const used =
                      Number(
                        allocation.used_leaves ||
                        0
                      );

                    const remaining =
                      Number(
                        allocation.remaining_leaves ??
                        allocated +
                        carryForward -
                        used
                      );

                    return (
                      <tr
                        key={allocation.id}
                      >

                        <td>
                          <strong>
                            {getEmployeeName(allocation.employee_id)}
                          </strong>
                        </td>

                        <td>
                          {getLeaveTypeName(
                            allocation.leave_type_id
                          )}
                        </td>

                        <td>
                          {getPeriodName(
                            allocation.leave_period_id
                          )}
                        </td>

                        <td>
                          {allocated}
                        </td>

                        <td>
                          {carryForward}
                        </td>

                        <td>
                          {used}
                        </td>

                        <td>
                          <strong>
                            {remaining}
                          </strong>
                        </td>

                        <td>
                          <button
                            type="button"
                            className={
                              styles.editButton
                            }
                            onClick={() =>
                              openEdit(
                                allocation
                              )
                            }
                          >
                            Edit
                          </button>
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* MODAL */}

      {isFormOpen && (
        <div
          className={styles.overlay}
          onMouseDown={closeForm}
        >

          <div
            className={styles.modal}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div
              className={
                styles.modalHeader
              }
            >

              <div>

                <h2>
                  {editingId
                    ? "Edit Leave Allocation"
                    : "Allocate Leave"}
                </h2>

                <p>
                  {editingId
                    ? "Update employee leave quota."
                    : "Assign leave quota to an employee."}
                </p>

              </div>

              <button
                type="button"
                className={
                  styles.closeButton
                }
                onClick={closeForm}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
            >

              <div
                className={
                  styles.formGrid
                }
              >

                {/* EMPLOYEE */}

                {/* EMPLOYEE */}
                <div className={styles.field}>
                  <label htmlFor="employeeSearch">Employee</label>

                  <div className={styles.employeeSearchWrapper}>
                    <input
                      id="employeeSearch"
                      type="text"
                      value={
                        form.employee_id
                          ? getEmployeeName(form.employee_id)
                          : employeeSearch
                      }
                      placeholder="Search employee name..."
                      autoComplete="off"
                      onFocus={() => {
                        setEmployeeSearch("");
                        setShowEmployeeDropdown(true);
                      }}
                      onChange={(e) => {
                        setEmployeeSearch(e.target.value);

                        setForm((current) => ({
                          ...current,
                          employee_id: "",
                        }));

                        setErrors((current) => ({
                          ...current,
                          employee_id: "",
                        }));

                        setShowEmployeeDropdown(true);
                      }}
                    />

                    {showEmployeeDropdown && !form.employee_id && (
                      <div className={styles.employeeDropdown}>
                        <input
                          type="text"
                          className={styles.employeeDropdownSearch}
                          placeholder="Search employees..."
                          value={employeeSearch}
                          autoComplete="off"
                          onChange={(e) => {
                            setEmployeeSearch(e.target.value);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                        />

                        {filteredEmployees.length > 0 ? (
                          filteredEmployees.map((employee) => (
                            <div
                              key={employee.id}
                              className={styles.employeeOption}
                              onMouseDown={(e) => {
                                e.preventDefault();

                                setForm((current) => ({
                                  ...current,
                                  employee_id: String(employee.id),
                                }));

                                setEmployeeSearch("");
                                setShowEmployeeDropdown(false);

                                setErrors((current) => ({
                                  ...current,
                                  employee_id: "",
                                }));
                              }}
                            >
                              <strong>
                                {employee.first_name} {employee.last_name}
                              </strong>

                              <small>{employee.employee_code}</small>
                            </div>
                          ))
                        ) : (
                          <div className={styles.noEmployee}>
                            No employee found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {errors.employee_id && (
                    <span className={styles.error}>
                      {errors.employee_id}
                    </span>
                  )}
                </div>
                {/* LEAVE TYPE */}

                <div
                  className={
                    styles.field
                  }
                >

                  <label htmlFor="leave_type_id">
                    Leave Type
                  </label>

                  <select
                    id="leave_type_id"
                    name="leave_type_id"
                    value={form.leave_type_id}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select leave type
                    </option>

                    {leaveTypes.map((type) => {
                      const typeId =
                        type.id ?? type.leave_type_id;

                      return (
                        <option
                          key={typeId}
                          value={typeId}
                        >
                          {type.leave_type_name ||
                            type.name ||
                            `Leave Type ${typeId}`}
                        </option>
                      );
                    })}
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

                {/* LEAVE PERIOD */}

                <div
                  className={
                    styles.field
                  }
                >

                  <label htmlFor="leave_period_id">
                    Leave Period
                  </label>
                  <select
                    id="leave_period_id"
                    name="leave_period_id"
                    value={form.leave_period_id}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select leave period
                    </option>

                    {leavePeriods.map((period) => {
                      const periodId =
                        period.id ?? period.leave_period_id;

                      return (
                        <option
                          key={periodId}
                          value={periodId}
                        >
                          {period.period_name ||
                            period.periodName ||
                            period.name ||
                            `Period ${periodId}`}
                        </option>
                      );
                    })}
                  </select>

                  {errors.leave_period_id && (
                    <span
                      className={
                        styles.error
                      }
                    >
                      {
                        errors.leave_period_id
                      }
                    </span>
                  )}

                </div>

                {/* ALLOCATED */}

                <div
                  className={
                    styles.field
                  }
                >

                  <label htmlFor="total_leaves_allocated">
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
                    onChange={
                      handleChange
                    }
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

                <div
                  className={
                    styles.field
                  }
                >

                  <label htmlFor="carry_forward_leaves">
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
                    onChange={
                      handleChange
                    }
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

              <div
                className={
                  styles.actions
                }
              >

                <button
                  type="button"
                  className={
                    styles.secondaryButton
                  }
                  onClick={closeForm}
                  disabled={saving}
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
                    : editingId
                      ? "Update Allocation"
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