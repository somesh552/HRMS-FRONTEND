
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Download,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { designationApi } from "../../services/api/designation.api";

import styles from "./DesignationTable.module.css";

const DesignationTable = () => {
  const navigate = useNavigate();
  const [designations, setDesignations] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch designations from backend
  useEffect(() => {
    const loadDesignations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await designationApi.getAll();

        setDesignations(response.data);
      } catch (error) {
        console.error("Failed to load designations:", error);
        setError("Failed to load designations.");
      } finally {
        setLoading(false);
      }
    };

    loadDesignations();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this designation?"
    );

    if (!confirmed) return;

    try {
      await designationApi.remove(id);

      setDesignations((prev) =>
        prev.filter((designation) => designation.id !== id)
      );

      alert("Designation deleted successfully!");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to delete designation";

      alert(message);
    }
  };

  // Search
  const filteredData = designations.filter((designation) => {
    const searchText = search.toLowerCase();

    return (
      String(designation.id).includes(searchText) ||
      designation.designation_name
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  // Loading state
  if (loading) {
    return (
      <div className={styles["designation-table-container"]}>
        <p>Loading designations...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles["designation-table-container"]}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles["designation-table-container"]}>

      {/* ==========================
          TOOLBAR
      ========================== */}

      <div className={styles["designation-toolbar"]}>

        <div className={styles["designation-search"]}>
          <Search size={18} />

          <input
            type="text"
            placeholder="Search designations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles["designation-toolbar-right"]}>

          <div className={styles["status-select"]}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>

            <ChevronDown size={17} />
          </div>

          <button
            className={styles["filter-btn"]}
            title="Filter"
          >
            <SlidersHorizontal size={18} />
          </button>

          <button
            className={styles["export-btn"]}
            type="button"
          >
            <Download size={17} />
            Export
          </button>

        </div>
      </div>

      {/* ==========================
          TABLE
      ========================== */}

      <div className={styles["designation-table-wrapper"]}>

        <table className={styles["designation-table"]}>

          <thead>
            <tr>
              <th>DESIGNATION ID</th>
              <th>DESIGNATION NAME</th>
              <th>DEPARTMENT</th>
              
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>

            {filteredData.length > 0 ? (
              filteredData.map((designation) => (
                <tr key={designation.id}>

                  <td>{designation.id}</td>

                  <td>
                    {designation.designation_name}
                  </td>

                  {/* Not currently provided by backend */}
               
                  <td>
                    {designation.department_name || "—"}
                  </td>
         

                  <td>
                    <div className={styles["designation-actions"]}>
                      <button
                        title="View"
                        onClick={() => navigate(`/hr/designations/view/${designation.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                  
                    <button
                      title="Edit"
                      type="button"
                      onClick={() =>
                        navigate(`/hr/designations/edit/${designation.id}`)
                      }
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      title="Delete"
                      type="button"
                      onClick={() => handleDelete(designation.id)}
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                </td>

                </tr>
          ))
          ) : (
          <tr>
            <td
              colSpan="7"
              className={styles["no-designations"]}
            >
              No designations found
            </td>
          </tr>
            )}

        </tbody>

      </table>

    </div>

      {/* ==========================
          FOOTER
      ========================== */}

  <div className={styles["designation-table-footer"]}>

    <span>
      Showing 1 to {filteredData.length} of{" "}
      {designations.length} designations
    </span>

    <div className={styles["pagination"]}>

      <button
        title="Previous"
        type="button"
        disabled
      >
        <ChevronLeft size={17} />
      </button>

      <button
        className={styles["active-page"]}
        type="button"
      >
        1
      </button>

      <button
        title="Next"
        type="button"
        disabled
      >
        <ChevronRight size={17} />
      </button>

    </div>

  </div>

    </div >
  );
};

export default DesignationTable;