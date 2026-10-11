import { useEffect, useState } from "react";
import { employeeApi } from "../../../services/api/employee.api";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Download,
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
  const [page, setPage] = useState(1);

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [filterError, setFilterError] = useState("");

  const handleView = (id) => {
    navigate(`/hr/employees/${id}`);
  };

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await employeeApi.getAll();

        const employeeList =
          Array.isArray(response.data)
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

  // =====================================================
  // LOAD DEPARTMENTS + DESIGNATIONS
  // =====================================================

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setIsLoadingFilters(true);
        setFilterError("");

        const [departmentResponse, designationResponse] = await Promise.all([
          departmentApi.getAll(),
          designationApi.getAll(),
        ]);

        const departmentList = Array.isArray(departmentResponse.data)
          ? departmentResponse.data
          : departmentResponse.data?.value || [];

        const designationList = Array.isArray(designationResponse.data)
          ? designationResponse.data
          : designationResponse.data?.value || [];

        setDepartments(departmentList);
        setDesignations(designationList);
      } catch (error) {
        console.error("Failed to load department/designation filters:", error);

        setFilterError(
          error?.response?.data?.message ||
          "Failed to load departments and designations.",
        );
      } finally {
        setIsLoadingFilters(false);
      }
    };

    loadFilterOptions();
  }, []);

  // =====================================================
  // FILTER EMPLOYEES
  // =====================================================

  const filteredEmployees = employees.filter((employee) => {
    const fullName =
      `${employee.first_name || ""} ${employee.last_name || ""}`.trim();

    const searchTerm = search.trim().toLowerCase();

    const searchMatch =
      fullName.toLowerCase().includes(searchTerm) ||
      (employee.employee_code || "").toLowerCase().includes(searchTerm) ||
      (employee.email || "").toLowerCase().includes(searchTerm);

    const departmentMatch =
      department === "All Departments" ||
      String(employee.department_id ?? employee.departmentId ?? "") === String(department);

    const designationMatch =
      designation === "All Designations" ||
      String(employee.designation_id ?? employee.designationId ?? "") === String(designation);

    return searchMatch && departmentMatch && designationMatch;
  });


  // =====================================================
  // UI
  // =====================================================

  return (
    <section className={styles["employee-page"]}>
      <h1>Employee Management</h1>

      {/* Search / Filter */}
      <div className={styles["filter-card"]}>
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

        {/* Department */}
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
              {isLoadingFilters ? "Loading Departments..." : "All Departments"}
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

        {/* Designation */}
        {/* Designation */}
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
              {isLoadingFilters ? "Loading Designations..." : "All Designations"}
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


        <button className={styles["export-button"]}>
          <Download />
          Export
        </button>

        <button
          className={styles["add-button"]}
          onClick={() => navigate("/hr/employee-registration")}
        >
          <span>+</span>
          Add Employee
        </button>
      </div>
      {/* Employee Table */}
      <div className={styles["employee-cards"]}>
        <h2>Employee List</h2>
      </div>


      {/* Filter error */}
      {filterError && <div className={styles["no-data"]}>{filterError}</div>}

      {/* Employee Table */}
      <div className={styles["employee-card"]}>
        {/* <h2>Employee List</h2> */}

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
              {/* Loading */}
              {isLoading ? (
                <tr>
                  <td colSpan="10" className={styles["no-data"]}>
                    Loading employees...
                  </td>
                </tr>
              ) : error ? (
                /* API Error */
                <tr>
                  <td colSpan="10" className={styles["no-data"]}>
                    {error}
                  </td>
                </tr>
              ) : filteredEmployees.length > 0 ? (
                /* Employees */
                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.employee_code}</td>

                    <td>
                      <div className={styles["employee-avatar"]}>
                        {`${employee.first_name?.[0] || ""}${employee.last_name?.[0] || ""
                          }`}
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
                        className={[styles["status"], (employee.status?.toLowerCase().replace(/\s+/g, "-") ||
                          "")].filter(Boolean).join(" ")}
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
                /* No Results */
                <tr>
                  <td colSpan="10" className={styles["no-data"]}>
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {filteredEmployees.length > 0 && (
          <div className={styles["pagination-container"]}>
            <button className={styles["pagination-arrow"]}>
              <ChevronLeft />
            </button>

            {[1, 2, 3, 4, 5].map((number) => (
              <button
                key={number}
                className={[styles["page-number"], (page === number ? styles["selected"] : "")].filter(Boolean).join(" ")}
                onClick={() => setPage(number)}
              >
                {number}
              </button>
            ))}

            <button className={styles["pagination-arrow"]}>
              <ChevronRight />
            </button>

            <div className={styles["pagination-spacer"]} />

            <button className={styles["previous-button"]}>Previous</button>

            <button className={styles["next-button"]}>Next</button>
          </div>
        )}
      </div>

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
