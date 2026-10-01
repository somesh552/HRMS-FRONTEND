import React from "react";
import { CalendarDays, CheckCircle2, Clock3, XCircle } from "lucide-react";

import { leaveRequests } from "./leaveMockData";

import styles from "./LeaveManagementChart.module.css";

const LeaveManagementCard = () => {
  const totalRequests = leaveRequests.length;

  const approved = leaveRequests.filter(
    (request) => request.status === "Approved",
  ).length;

  const pending = leaveRequests.filter(
    (request) => request.status === "Pending",
  ).length;

  const rejected = leaveRequests.filter(
    (request) => request.status === "Rejected",
  ).length;

  return (
    <div className={styles["leave-management-cards"]}>
      {/* TOTAL REQUESTS */}
      <div className={styles["leave-card"]}>
        <div
          className={[
            styles["leave-card-icon"],
            styles["total-leave-icon"],
          ].join(" ")}
        >
          <CalendarDays size={28} />
        </div>

        <div className={styles["leave-card-info"]}>
          <p>Total Requests</p>
          <h2>{totalRequests}</h2>
          <span>All leave requests</span>
        </div>
      </div>

      {/* APPROVED */}
      <div className={styles["leave-card"]}>
        <div
          className={[
            styles["leave-card-icon"],
            styles["approved-leave-icon"],
          ].join(" ")}
        >
          <CheckCircle2 size={28} />
        </div>

        <div className={styles["leave-card-info"]}>
          <p>Approved</p>
          <h2>{approved}</h2>
          <span>Approved leaves</span>
        </div>
      </div>

      {/* PENDING */}
      <div className={styles["leave-card"]}>
        <div
          className={[
            styles["leave-card-icon"],
            styles["pending-leave-icon"],
          ].join(" ")}
        >
          <Clock3 size={28} />
        </div>

        <div className={styles["leave-card-info"]}>
          <p>Pending</p>
          <h2>{pending}</h2>
          <span>Awaiting approval</span>
        </div>
      </div>

      {/* REJECTED */}
      <div className={styles["leave-card"]}>
        <div
          className={[
            styles["leave-card-icon"],
            styles["rejected-leave-icon"],
          ].join(" ")}
        >
          <XCircle size={28} />
        </div>

        <div className={styles["leave-card-info"]}>
          <p>Rejected</p>
          <h2>{rejected}</h2>
          <span>Rejected leaves</span>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagementCard;
