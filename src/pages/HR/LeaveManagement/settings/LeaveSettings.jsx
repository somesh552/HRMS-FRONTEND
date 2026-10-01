import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  initialAllocations,
  initialHolidays,
  initialLeavePeriods,
  initialLeaveTypes,
} from "./leaveSettingsData";
import { readSetting } from "./leaveSettingsStorage";

import styles from "./LeaveSettings.module.css";

const settingsItems = [
  {
    title: "Leave Types",
    description:
      "Configure leave policies, maximum days, carry-forward and encashment rules.",
    path: "/hr/leave-management/settings/leave-types",
    key: "leaveTypes",
  },
  {
    title: "Leave Period",
    description: "Define the active leave cycle and its start and end dates.",
    path: "/hr/leave-management/settings/leave-period",
    key: "leavePeriods",
  },
  {
    title: "Holiday List",
    description: "Manage organization holidays used during leave validation.",
    path: "/hr/leave-management/settings/holidays",
    key: "holidays",
  },
  {
    title: "Leave Allocations",
    description:
      "Allocate leave quotas to employees for the active leave period.",
    path: "/hr/leave-management/settings/allocations",
    key: "allocations",
  },
];

const LeaveSettings = () => {
  const [stats, setStats] = useState({
    leaveTypes: initialLeaveTypes.length,
    activePeriod: "Leave Period 2026",
    holidays: initialHolidays.length,
    allocations: initialAllocations.length,
  });

  useEffect(() => {
    const periods = readSetting("leavePeriods", initialLeavePeriods);

    setStats({
      leaveTypes: readSetting("leaveTypes", initialLeaveTypes).length,
      activePeriod:
        periods.find((period) => period.isActive)?.periodName ||
        "No active period",
      holidays: readSetting("holidays", initialHolidays).length,
      allocations: readSetting("allocations", initialAllocations).length,
    });
  }, []);

  const countFor = (key) => {
    if (key === "leaveTypes") return `${stats.leaveTypes} configured`;
    if (key === "leavePeriods") return stats.activePeriod;
    if (key === "holidays") return `${stats.holidays} configured`;
    return `${stats.allocations} employee records`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>LEAVE MANAGEMENT</span>
          <h1>Leave Settings</h1>
        </div>

        <Link
          to="/hr/leave-management"
          className={styles.navigationButton}
          aria-label="Back to Leave Management"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          <span>Back to Leave Management</span>
        </Link>
      </div>

      <div className={styles.intro}>
        <div>
          <h2>Configure your leave system</h2>
          <p>
            Set the policies, active period, holidays and employee allocations
            used by Leave Management.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {settingsItems.map((item) => (
          <Link key={item.path} to={item.path} className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.icon}>{item.title.charAt(0)}</div>
              <span className={styles.arrow}>→</span>
            </div>

            <h2>{item.title}</h2>
            <p>{item.description}</p>

            <span className={styles.meta}>{countFor(item.key)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LeaveSettings;
