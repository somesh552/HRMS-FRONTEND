import React, { useState } from "react";
import { X } from "lucide-react";
import { leaveRequests as initialLeaveRequests } from "./leaveMockData";
import styles from "./LeaveManagementTable.module.css";


const LeaveManagementTable = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const tabs = ["All", "Pending", "Approved", "Rejected", "Cancelled"];

  const filteredRequests =
    activeTab === "All"
      ? leaveRequests
      : leaveRequests.filter((item) => item.status === activeTab);

  const displayedRequests = showAll
    ? filteredRequests
    : filteredRequests.slice(0, 5);

  const handleAction = (request) => {
    setSelectedRequest(request);
  };

  const updateRequestStatus = (status) => {
    if (!selectedRequest) return;

    setLeaveRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === selectedRequest.id ? { ...request, status } : request,
      ),
    );

    setSelectedRequest((current) => ({
      ...current,
      status,
    }));
  };

  const closeDetails = () => {
    setSelectedRequest(null);
  };

  return (
    <>
      <div className={styles["leave-requests-container"]}>
        {/* Header */}
        <div className={styles["leave-requests-header"]}>
          <h3>Leave Requests</h3>

          <button
            type="button"
            className={styles["view-all-btn"]}
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll ? "Show Less" : "View All"}
          </button>
        </div>

        {/* Tabs */}
        <div className={styles["leave-request-tabs"]}>
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab}
              className={activeTab === tab ? styles["active"] : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className={styles["leave-table-wrapper"]}>
          <table className={styles["leave-requests-table"]}>
            <thead>
              <tr>
                <th>REQUEST ID</th>
                <th>EMPLOYEE</th>
                <th>LEAVE TYPE</th>
                <th>FROM DATE</th>
                <th>TO DATE</th>
                <th>DAYS</th>
                <th>REASON</th>
                <th>STATUS</th>
                <th>APPLIED ON</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {displayedRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td>

                  <td>
                    <div className={styles["employee-cell"]}>
                      <div className={styles["employee-avatar"]}>
                        {request.employee.charAt(0)}
                      </div>

                      <div>
                        <strong>{request.employee}</strong>
                        <small>{request.empId}</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={[
                        styles["leave-type"],
                        styles[
                          request.leaveType.toLowerCase().replace(" ", "-")
                        ],
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {request.leaveType}
                    </span>
                  </td>

                  <td>{request.from}</td>
                  <td>{request.to}</td>
                  <td>{request.days}</td>
                  <td>{request.reason}</td>

                  <td>
                    <span
                      className={[
                        styles["request-status"],
                        styles[request.status.toLowerCase()],
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {request.status}
                    </span>
                  </td>

                  <td>{request.appliedOn}</td>

                  <td>
                    <button
                      type="button"
                      className={styles["request-view-btn"]}
                      onClick={() => handleAction(request)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details */}
      {selectedRequest && (
        <div
          className={styles["request-modal-overlay"]}
          onMouseDown={closeDetails}
        >
          <div
            className={styles["request-modal"]}
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-details-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles["request-modal-header"]}>
              <div>
                <h2 id="request-details-title">Leave Request</h2>
                <p>{selectedRequest.id}</p>
              </div>

              <button
                type="button"
                className={styles["request-modal-close"]}
                onClick={closeDetails}
                aria-label="Close request details"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles["request-details"]}>
              <div className={styles["request-employee"]}>
                <div className={styles["request-large-avatar"]}>
                  {selectedRequest.employee.charAt(0)}
                </div>

                <div>
                  <strong>{selectedRequest.employee}</strong>
                  <span>{selectedRequest.empId}</span>
                </div>
              </div>

              <div className={styles["request-detail-grid"]}>
                <div>
                  <span>Leave Type</span>
                  <strong>{selectedRequest.leaveType}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong
                    className={
                      styles[
                        `request-detail-${selectedRequest.status.toLowerCase()}`
                      ]
                    }
                  >
                    {selectedRequest.status}
                  </strong>
                </div>

                <div>
                  <span>From Date</span>
                  <strong>{selectedRequest.from}</strong>
                </div>

                <div>
                  <span>To Date</span>
                  <strong>{selectedRequest.to}</strong>
                </div>

                <div>
                  <span>Number of Days</span>
                  <strong>{selectedRequest.days}</strong>
                </div>

                <div>
                  <span>Applied On</span>
                  <strong>{selectedRequest.appliedOn}</strong>
                </div>
              </div>

              <div className={styles["request-reason"]}>
                <span>Reason</span>
                <p>{selectedRequest.reason}</p>
              </div>
            </div>

            {selectedRequest.status === "Pending" && (
              <div className={styles["request-modal-actions"]}>
                <button
                  type="button"
                  className={styles["reject-request-btn"]}
                  onClick={() => updateRequestStatus("Rejected")}
                >
                  Reject
                </button>

                <button
                  type="button"
                  className={styles["approve-request-btn"]}
                  onClick={() => updateRequestStatus("Approved")}
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveManagementTable;
