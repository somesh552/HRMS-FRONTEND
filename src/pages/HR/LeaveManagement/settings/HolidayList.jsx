import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

import { holidayListsApi } from "../../../../services/api/holidayLists.api";

import styles from "./HolidayList.module.css";

const emptyForm = {
  holiday_date: "",
  holiday_name: "",
  holiday_type: "Public",
};

const formatDate = (date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
};

const HolidayList = () => {
  const [holidayLists, setHolidayLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState("");

  const [holidays, setHolidays] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [errors, setErrors] = useState({});

  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [saving, setSaving] = useState(false);

  const [year, setYear] = useState("All");

  // =====================================================
  // GET HOLIDAY LISTS
  // =====================================================

  useEffect(() => {
    fetchHolidayLists();
  }, []);

  const fetchHolidayLists = async () => {
    try {
      setLoadingLists(true);

      const response = await holidayListsApi.getAllLists();

      const lists = Array.isArray(response)
        ? response
        : [];

      setHolidayLists(lists);

      if (lists.length > 0) {
        setSelectedListId(String(lists[0].id));
      }
    } catch (error) {
      console.error(
        "Failed to load holiday lists:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load holiday lists"
      );
    } finally {
      setLoadingLists(false);
    }
  };

  // =====================================================
  // GET HOLIDAYS FOR SELECTED LIST
  // =====================================================

  useEffect(() => {
    if (!selectedListId) {
      setHolidays([]);
      return;
    }

    fetchHolidays(selectedListId);
  }, [selectedListId]);

  const fetchHolidays = async (listId) => {
    try {
      setLoadingHolidays(true);

      const response =
        await holidayListsApi.getHolidays(listId);

      const holidayData = Array.isArray(response)
        ? response
        : [];

      setHolidays(holidayData);
    } catch (error) {
      console.error(
        "Failed to load holidays:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load holidays"
      );
    } finally {
      setLoadingHolidays(false);
    }
  };

  // =====================================================
  // ADD HOLIDAY
  // =====================================================

  const openAdd = () => {
    setForm(emptyForm);
    setErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setForm(emptyForm);
    setErrors({});
    setIsFormOpen(false);
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

  // =====================================================
  // VALIDATION
  // =====================================================

  const validate = () => {
    const nextErrors = {};

    if (!form.holiday_date) {
      nextErrors.holiday_date =
        "Holiday date is required.";
    }

    if (!form.holiday_name.trim()) {
      nextErrors.holiday_name =
        "Holiday name is required.";
    }

    const duplicate = holidays.some((holiday) => {
      const holidayDate = String(
        holiday.holiday_date || ""
      ).substring(0, 10);

      return holidayDate === form.holiday_date;
    });

    if (duplicate) {
      nextErrors.holiday_date =
        "A holiday already exists on this date.";
    }

    return nextErrors;
  };

  // =====================================================
  // SAVE HOLIDAY
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!selectedListId) {
      alert("Please select a holiday list.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        holiday_date: form.holiday_date,
        holiday_name: form.holiday_name.trim(),
        holiday_type: form.holiday_type,
      };

      await holidayListsApi.addHoliday(
        selectedListId,
        payload
      );

      await fetchHolidays(selectedListId);

      closeForm();
    } catch (error) {
      console.error(
        "Failed to save holiday:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to save holiday"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE HOLIDAY
  // =====================================================

  const deleteHoliday = async (holiday) => {
    const holidayName =
      holiday.holiday_name || "this holiday";

    if (
      !window.confirm(
        `Delete "${holidayName}"?`
      )
    ) {
      return;
    }

    try {
      await holidayListsApi.deleteHoliday(
        selectedListId,
        holiday.id
      );

      await fetchHolidays(selectedListId);
    } catch (error) {
      console.error(
        "Failed to delete holiday:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete holiday"
      );
    }
  };

  // =====================================================
  // YEAR FILTER
  // =====================================================

  const years = useMemo(() => {
    return [
      ...new Set(
        holidays
          .map((holiday) =>
            String(
              holiday.holiday_date || ""
            ).substring(0, 4)
          )
          .filter(Boolean)
      ),
    ].sort();
  }, [holidays]);

  const visibleHolidays = holidays
    .filter((holiday) => {
      if (year === "All") {
        return true;
      }

      return String(
        holiday.holiday_date || ""
      ).startsWith(year);
    })
    .slice()
    .sort((a, b) =>
      String(a.holiday_date).localeCompare(
        String(b.holiday_date)
      )
    );

  // =====================================================
  // SELECTED HOLIDAY LIST
  // =====================================================

  const selectedList = holidayLists.find(
    (list) =>
      String(list.id) ===
      String(selectedListId)
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className={styles.page}>

      {/* ================= HEADER ================= */}

      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            SETTINGS
          </span>

          <h1>Holiday List</h1>
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
            onClick={openAdd}
            disabled={!selectedListId}
          >
            + Add Holiday
          </button>
        </div>
      </div>

      {/* ================= HOLIDAY LIST ================= */}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>
              Holiday List
            </h2>

            <p>
              Select the organization holiday
              list.
            </p>
          </div>

          {loadingLists ? (
            <span>
              Loading...
            </span>
          ) : (
            <select
              value={selectedListId}
              onChange={(event) => {
                setSelectedListId(
                  event.target.value
                );
                setYear("All");
              }}
              aria-label="Select holiday list"
            >
              <option value="">
                Select Holiday List
              </option>

              {holidayLists.map((list) => (
                <option
                  key={list.id}
                  value={list.id}
                >
                  {list.list_name}
                  {list.year
                    ? ` (${list.year})`
                    : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedList && (
          <p>
            <strong>
              {selectedList.list_name}
            </strong>

            {selectedList.year && (
              <>
                {" "}
                - {selectedList.year}
              </>
            )}
          </p>
        )}
      </div>

      {/* ================= HOLIDAYS ================= */}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>
              Organization holidays
            </h2>

            <p>
              These dates can be used by leave
              validation to exclude holidays.
            </p>
          </div>

          <div className={styles.headerTools}>
            <select
              value={year}
              onChange={(event) =>
                setYear(event.target.value)
              }
              aria-label="Filter by year"
            >
              <option value="All">
                All years
              </option>

              {years.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

            <span className={styles.count}>
              {visibleHolidays.length} Holidays
            </span>
          </div>
        </div>

        {/* LOADING */}

        {loadingHolidays ? (
          <div className={styles.emptyState}>
            <strong>
              Loading holidays...
            </strong>
          </div>
        ) : visibleHolidays.length ? (

          /* TABLE */

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Holiday</th>
                  <th>Type</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {visibleHolidays.map(
                  (holiday) => (
                    <tr key={holiday.id}>

                      <td>
                        <strong>
                          {formatDate(
                            String(
                              holiday.holiday_date
                            ).substring(
                              0,
                              10
                            )
                          )}
                        </strong>
                      </td>

                      <td>
                        {holiday.holiday_name}
                      </td>

                      <td>
                        <span
                          className={
                            styles.type
                          }
                        >
                          {
                            holiday.holiday_type
                          }
                        </span>
                      </td>

                      <td
                        className={
                          styles.actionCell
                        }
                      >
                        <button
                          type="button"
                          className={
                            styles.deleteButton
                          }
                          onClick={() =>
                            deleteHoliday(
                              holiday
                            )
                          }
                        >
                          Delete
                        </button>
                      </td>

                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

        ) : (

          /* EMPTY */

          <div className={styles.emptyState}>
            <strong>
              No holidays found
            </strong>

            <p>
              Add a holiday to this holiday
              list.
            </p>
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

            <div
              className={
                styles.modalHeader
              }
            >
              <div>
                <span
                  className={
                    styles.eyebrow
                  }
                >
                  SETTINGS
                </span>

                <h2>
                  Add Holiday
                </h2>

                <p>
                  Add a holiday to the
                  selected holiday list.
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

                {/* DATE */}

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="holiday_date">
                    Date
                  </label>

                  <input
                    id="holiday_date"
                    name="holiday_date"
                    type="date"
                    value={
                      form.holiday_date
                    }
                    onChange={
                      handleChange
                    }
                  />

                  {errors.holiday_date && (
                    <span
                      className={
                        styles.error
                      }
                    >
                      {
                        errors.holiday_date
                      }
                    </span>
                  )}
                </div>

                {/* TYPE */}

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="holiday_type">
                    Holiday Type
                  </label>

                  <select
                    id="holiday_type"
                    name="holiday_type"
                    value={
                      form.holiday_type
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="Public">
                      Public
                    </option>

                    <option value="Company">
                      Company
                    </option>

                    <option value="Optional">
                      Optional
                    </option>
                  </select>
                </div>

                {/* NAME */}

                <div
                  className={`${styles.field} ${styles.fullWidth}`}
                >
                  <label htmlFor="holiday_name">
                    Holiday Name
                  </label>

                  <input
                    id="holiday_name"
                    name="holiday_name"
                    value={
                      form.holiday_name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Republic Day"
                  />

                  {errors.holiday_name && (
                    <span
                      className={
                        styles.error
                      }
                    >
                      {
                        errors.holiday_name
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
                    : "Save Holiday"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayList;