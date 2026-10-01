import React from "react";

import { leaveRequests } from "./leaveMockData";

import styles from "./LeaveManagementGraph.module.css";

const LeaveManagementGraph = () => {
  // ==========================
  // LEAVE USAGE
  // ==========================

  const casualLeave = leaveRequests
    .filter((request) => request.leaveType === "Casual Leave")
    .reduce((total, request) => total + request.days, 0);

  const sickLeave = leaveRequests
    .filter((request) => request.leaveType === "Sick Leave")
    .reduce((total, request) => total + request.days, 0);

  const earnedLeave = leaveRequests
    .filter((request) => request.leaveType === "Earned Leave")
    .reduce((total, request) => total + request.days, 0);

  const totalLeaveDays =
    casualLeave + sickLeave + earnedLeave;

  // ==========================
  // LEAVE STATUS
  // ==========================

  const pending = leaveRequests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approved = leaveRequests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejected = leaveRequests.filter(
    (request) => request.status === "Rejected"
  ).length;

  const cancelled = leaveRequests.filter(
    (request) => request.status === "Cancelled"
  ).length;

  // ==========================
  // USAGE PERCENTAGES
  // ==========================

  const casualPercentage = totalLeaveDays
    ? ((casualLeave / totalLeaveDays) * 100).toFixed(2)
    : 0;

  const sickPercentage = totalLeaveDays
    ? ((sickLeave / totalLeaveDays) * 100).toFixed(2)
    : 0;

  const earnedPercentage = totalLeaveDays
    ? ((earnedLeave / totalLeaveDays) * 100).toFixed(2)
    : 0;

  return (
    <div className={styles["leave-management-graphs"]}>

      {/* ==========================
          LEAVE USAGE OVERVIEW
      ========================== */}

      <div
        className={[
          styles["leave-chart-card"],
          styles["usage-card"],
        ].join(" ")}
      >
        <h3>Leave Usage Overview</h3>

        <div className={styles["usage-content"]}>

          <div className={styles["usage-donut"]}>
            <div className={styles["usage-donut-center"]}>
              <strong>{totalLeaveDays}</strong>
              <span>Requested Days</span>
              <small>Current Data</small>
            </div>
          </div>

          <div className={styles["usage-legend"]}>

            <div>
              <span
                className={[
                  styles["legend-dot"],
                  styles["green"],
                ].join(" ")}
              />

              <p>Casual Leave</p>

              <b>
                {casualLeave} ({casualPercentage}%)
              </b>
            </div>

            <div>
              <span
                className={[
                  styles["legend-dot"],
                  styles["blue"],
                ].join(" ")}
              />

              <p>Sick Leave</p>

              <b>
                {sickLeave} ({sickPercentage}%)
              </b>
            </div>

            <div>
              <span
                className={[
                  styles["legend-dot"],
                  styles["purple"],
                ].join(" ")}
              />

              <p>Earned Leave</p>

              <b>
                {earnedLeave} ({earnedPercentage}%)
              </b>
            </div>

          </div>

        </div>
      </div>


      {/* ==========================
          LEAVE TREND
      ========================== */}

      <div
        className={[
          styles["leave-chart-card"],
          styles["trend-card"],
        ].join(" ")}
      >
        <div className={styles["chart-title-row"]}>

          <h3>
            Leave Trend <span>(This Year)</span>
          </h3>

          <div className={styles["trend-legend"]}>

            <span>
              <i className={styles["green"]} />
              Casual Leave
            </span>

            <span>
              <i className={styles["blue"]} />
              Sick Leave
            </span>

            <span>
              <i className={styles["purple"]} />
              Earned Leave
            </span>

          </div>
        </div>

        <div className={styles["trend-chart"]}>

          <div className={styles["y-axis"]}>
            <span>8</span>
            <span>6</span>
            <span>4</span>
            <span>2</span>
            <span>0</span>
          </div>

          <div className={styles["chart-area"]}>

            <div className={styles["grid-line"]} />
            <div className={styles["grid-line"]} />
            <div className={styles["grid-line"]} />
            <div className={styles["grid-line"]} />
            <div className={styles["grid-line"]} />

            <svg
              className={styles["trend-svg"]}
              viewBox="0 0 700 190"
              preserveAspectRatio="none"
            >

              {/* Casual Leave */}
              <polyline
                points="
                  0,145
                  55,150
                  110,105
                  165,35
                  220,90
                  275,110
                  330,155
                  385,140
                  440,160
                  495,175
                  550,178
                  605,160
                  660,145
                "
                fill="none"
                stroke="#e33116"
                strokeWidth="3"
              />

              {/* Sick Leave */}
              <polyline
                points="
                  0,175
                  55,175
                  110,125
                  165,85
                  220,120
                  275,135
                  330,150
                  385,140
                  440,170
                  495,170
                  550,170
                  605,170
                  660,175
                "
                fill="none"
                stroke="#2eea2e"
                strokeWidth="3"
              />

              {/* Earned Leave */}
              <polyline
                points="
                  0,180
                  55,180
                  110,160
                  165,135
                  220,165
                  275,155
                  330,175
                  385,178
                  440,178
                  495,180
                  550,180
                  605,180
                  660,180
                "
                fill="none"
                stroke="#ee9510"
                strokeWidth="3"
              />

            </svg>

            <div className={styles["x-axis"]}>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>

          </div>
        </div>
      </div>


      {/* ==========================
          LEAVE STATUS
      ========================== */}

      <div
        className={[
          styles["leave-chart-card"],
          styles["status-card"],
        ].join(" ")}
      >
        <h3>Leave Status</h3>

        <div className={styles["status-content"]}>

          <div className={styles["status-donut"]}>
            <div className={styles["status-donut-center"]}>
              <strong>{pending}</strong>
              <span>Pending</span>
              <small>Requests</small>
            </div>
          </div>

          <div className={styles["status-legend"]}>

            <div>
              <i className={styles["orange"]} />
              <span>Pending</span>
              <b>{pending}</b>
            </div>

            <div>
              <i className={styles["green"]} />
              <span>Approved</span>
              <b>{approved}</b>
            </div>

            <div>
              <i className={styles["red"]} />
              <span>Rejected</span>
              <b>{rejected}</b>
            </div>

            <div>
              <i className={styles["blue"]} />
              <span>Cancelled</span>
              <b>{cancelled}</b>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default LeaveManagementGraph;