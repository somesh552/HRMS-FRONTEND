import { useEffect, useState } from "react";
import { employeeApi } from "../../../services/api/employee.api";
import { useNavigate } from "react-router-dom";

import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import styles from "./EmployeeManagement.module.css";
import { departmentApi } from "../../../services/api/department.api";
import { designationApi } from "../../../services/api/designation.api";

function EmployeeManagement() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [designation, setDesignation] = useState("All Designations");
  const [status, setStatus] = useState("All Status");
  const [page, setPage] = useState(1);

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [filterError, setFilterError] = useState("");

  const employeesPerPage = 8;

  const handleView = (id) => {
    navigate(`/hr/employees/${id}`);
  };

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await employeeApi.getAll();

        const employeeList = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : Array.isArray(response.data?.data?.employees)
              ? response.data.data.employees
              : Array.isArray(response.data?.employees)
                ? response.data.employees
                : Array.isArray(response.data?.value)
                  ? response.data.value
                  : [];

        setEmployees(employeeList);
      } catch (err) {
        console.error("Failed to load employees:", err);

        setError(
          err?.response?.data?.message ||
            "Failed to load employees."
        );

        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, []);

  // Load departments and designations
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setIsLoadingFilters(true);
        setFilterError("");

        const [departmentResponse, designationResponse] =
          await Promise.all([
            departmentApi.getAll(),
            designationApi.getAll(),
          ]);

        const departmentData = departmentResponse.data;
        const designationData = designationResponse.data;

        // Normalize API responses so state always contains arrays.
        const departmentList = Array.isArray(departmentData)
          ? departmentData
          : Array.isArray(departmentData?.data)
            ? departmentData.data
            : Array.isArray(departmentData?.value)
              ? departmentData.value
              : [];

        const designationList = Array.isArray(designationData)
          ? designationData
          : Array.isArray(designationData?.data)
            ? designationData.data
            : Array.isArray(designationData?.value)
              ? designationData.value
              : [];

        setDepartments(departmentList);
        setDesignations(designationList);
      } catch (err) {
        console.error(
          "Failed to load department/designation filters:",
          err
        );

        setFilterError(
          err?.response?.data?.message ||
            "Failed to load departments and designations."
        );
      } finally {
        setIsLoadingFilters(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
    const fullName =
      `${employee.first_name || ""} ${employee.last_name || ""}`.trim();

    const searchTerm = search.trim().toLowerCase();

    const searchMatch =
      fullName.toLowerCase().includes(searchTerm) ||
      (employee.employee_code || "")
        .toLowerCase()
        .includes(searchTerm) ||
      (employee.email || "")
        .toLowerCase()
        .includes(searchTerm);

    const departmentMatch =
      department === "All Departments" ||
      String(
        employee.department_id ?? employee.departmentId ?? ""
      ) === String(department);

    const designationMatch =
      designation === "All Designations" ||
      String(
        employee.designation_id ?? employee.designationId ?? ""
      ) === String(designation);

    // Normalize status values for comparison
    const employeeStatus = String(employee.status || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");

    const selectedStatus = status
      .toLowerCase()
      .replace(/[\s_-]+/g, "");

    const statusMatch =
      status === "All Status" ||
      employeeStatus === selectedStatus;

    return (
      searchMatch &&
      departmentMatch &&
      designationMatch &&
      statusMatch
    );
  });

  // Pagination
  const totalPages = Math.ceil(
    filteredEmployees.length / employeesPerPage
  );

  const startIndex = (page - 1) * employeesPerPage;

  const currentEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + employeesPerPage
  );

  // Keep the page valid when the number of filtered employees changes
  useEffect(() => {
    const lastPage = Math.max(
      1,
      Math.ceil(filteredEmployees.length / employeesPerPage)
    );

    if (page > lastPage) {
      setPage(lastPage);
    }
  }, [page, filteredEmployees.length]);

  return (
    <section className={styles["employee-page"]}>
      <h1>Employee Management</h1>

      {/* Search and Filters */}
      <div className={styles["filter-card"]}>
        {/* Search */}
        <div className={styles["search-box"]}>
          <Search />

          <input
            type="text"
            placeholder="Search employees"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Department Filter */}
        <div className={styles["select-box"]}>
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setDesignation("All Designations");
              setPage(1);
            }}
            disabled={isLoadingFilters}
          >
            <option value="All Departments">
              {isLoadingFilters
                ? "Loading Departments..."
                : "All Departments"}
            </option>

            {!isLoadingFilters &&
              departments.map((dept) => (
                <option key={dept.id} value={String(dept.id)}>
                  {dept.department_name}
                </option>
              ))}
          </select>

          <ChevronDown />
        </div>

        {/* Designation Filter */}
        <div className={styles["select-box"]}>
          <select
            value={designation}
            onChange={(e) => {
              setDesignation(e.target.value);
              setPage(1);
            }}
            disabled={isLoadingFilters}
          >
            <option value="All Designations">
              {isLoadingFilters
                ? "Loading Designations..."
                : "All Designations"}
            </option>

            {!isLoadingFilters &&
              designations
                .filter(
                  (desig) =>
                    department === "All Departments" ||
                    String(desig.department_id) === String(department)
                )
                .map((desig) => (
                  <option key={desig.id} value={String(desig.id)}>
                    {desig.designation_name}
                  </option>
                ))}
          </select>

          <ChevronDown />
        </div>

        {/* Employee Status Filter - Replaces Export */}
        <div className={styles["select-box"]}>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            aria-label="Filter employees by status"
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="InActive">InActive</option>
            <option value="Resigned">Resigned</option>
          </select>

          <ChevronDown />
        </div>

        {/* Add Employee */}
        <button
          type="button"
          className={styles["add-button"]}
          onClick={() => navigate("/hr/employee-registration")}
        >
          <span>+</span>
          Add Employee
        </button>
      </div>

      {/* Employee List Heading */}
      <div className={styles["employee-cards"]}>
        <h2>Employee List</h2>
      </div>

      {/* Filter Error */}
      {filterError && (
        <div className={styles["no-data"]}>
          {filterError}
        </div>
      )}

      {/* Employee Table */}
      <div className={styles["employee-card"]}>
        <div className={styles["table-wrapper"]}>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joining Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10" className={styles["no-data"]}>
                    Loading employees...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="10" className={styles["no-data"]}>
                    {error}
                  </td>
                </tr>
              ) : currentEmployees.length > 0 ? (
                currentEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.employee_code}</td>

                    <td>
                      <div className={styles["employee-avatar"]}>
                        {`${
                          employee.first_name?.[0] || ""
                        }${employee.last_name?.[0] || ""}`}
                      </div>
                    </td>

                    <td>
                      {employee.first_name} {employee.last_name}
                    </td>

                    <td>
                      <span className={styles["department-text"]}>
                        {employee.department_name}
                      </span>
                    </td>

                    <td>{employee.designation_name}</td>

                    <td>{employee.email}</td>

                    <td>{employee.phone}</td>

                    <td>
                      <span
                        className={[
                          styles["status"],
                          String(employee.status || "")
                            .toLowerCase()
                            .replace(/[\s_]+/g, "-"),
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {employee.status || "Unknown"}
                      </span>
                    </td>

                    <td>{employee.joining_date}</td>

                    <td>
                      <div className={styles["action-buttons"]}>
                        <button
                          type="button"
                          className={styles["view-button"]}
                          onClick={() => handleView(employee.id)}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className={styles["no-data"]}>
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading &&
          !error &&
          filteredEmployees.length > 0 && (
            <div className={styles["pagination-container"]}>
              <button
                type="button"
                className={styles["pagination-arrow"]}
                onClick={() =>
                  setPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={page === 1}
                aria-label="Previous page"
              >
                <ChevronLeft />
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((number) => (
                <button
                  type="button"
                  key={number}
                  className={[
                    styles["page-number"],
                    page === number ? styles["selected"] : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setPage(number)}
                  aria-current={page === number ? "page" : undefined}
                >
                  {number}
                </button>
              ))}

              <button
                type="button"
                className={styles["pagination-arrow"]}
                onClick={() =>
                  setPage((prev) =>
                    Math.min(prev + 1, totalPages)
                  )
                }
                disabled={page === totalPages}
                aria-label="Next page"
              >
                <ChevronRight />
              </button>

              <div className={styles["pagination-spacer"]} />

              <span>
                Showing {startIndex + 1}–
                {Math.min(
                  startIndex + employeesPerPage,
                  filteredEmployees.length
                )}{" "}
                of {filteredEmployees.length} employees
              </span>

              <button
                type="button"
                className={styles["previous-button"]}
                onClick={() =>
                  setPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={page === 1}
              >
                Previous
              </button>

              <button
                type="button"
                className={styles["next-button"]}
                onClick={() =>
                  setPage((prev) =>
                    Math.min(prev + 1, totalPages)
                  )
                }
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
      </div>

      {/* Footer */}
      <footer className={styles["footer"]}>
        <span>Copyright 2026 HRMS</span>

        <div>
          <span>Privacy Policy</span>
          <b>|</b>
          <span>Terms and Conditions</span>
        </div>
      </footer>
    </section>
  );
}

export default EmployeeManagement;