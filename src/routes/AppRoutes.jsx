import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "../shared/components/Sidebar/Sidebar";
import Navbar from "../shared/components/Navbar/Navbar";
import EmployeeOnboarding from "../modules/employees/pages/EmployeeOnboarding";
import Login from "../pages/Login/Login";
import AdminDashboard from "../pages/Admin/Dashboard";
import EmployeeDashboard from "../pages/Employee/Dashboard";
import Dashboard from "../pages/HR/Dashboard/Dashboard";
import Departments from "../modules/departments/Departments";
import Add_Department from "../modules/departments/Add_Department";
import View_Department from "../modules/departments/View_Department";
import Designations from "../modules/designations/Designations";
import Add_Designation from "../modules/designations/Add_Designation";
import View_Designation from "../modules/designations/View_Designation";

import Edit_Designation from "../modules/designations/Edit_Designation";

import Attendance from "../pages/HR/Attendance/Attendance";
import HREmployeeManagement from "../modules/employees/pages/EmployeeManagement";
import EmployeeDetails from "../modules/employees/pages/EmployeeDetails";
import Email from "../pages/HR/Email";
import Notifications from "../pages/HR/Notifications";
import PerformanceReviews from "../pages/HR/PerformanceReviews/PerformanceReviews";
import Reports from "../pages/HR/Reports/Reports";
import styles from "../layouts/Layout.module.css";

// import JobOpenings from "../modules/recruitment/pages/JobOpenings";
// import JobOpeningForm from "../modules/recruitment/pages/JobOpeningForm";
// import Applications from "../modules/recruitment/pages/Applications";
// import ApplicationDetails from "../modules/recruitment/pages/ApplicationDetails";
// import Interviews from "../modules/recruitment/pages/Interviews";
// import InterviewForm from "../modules/recruitment/pages/InterviewForm";
// import InterviewDetails from "../modules/recruitment/pages/InterviewDetails";

// import Offers from "../modules/recruitment/pages/Offers";
// import OfferForm from "../modules/recruitment/pages/OfferForm";
// import Onboarding from "../modules/recruitment/pages/Onboarding";
// import RecruitmentManagement from "../modules/recruitment/pages/RecruitmentManagement";
// import RecruitmentDashboard from "../modules/recruitment/pages/RecruitmentDashboard";

import LeaveManagement from "../pages/HR/LeaveManagement/LeaveManagement";
import LeaveSettings from "../pages/HR/LeaveManagement/settings/LeaveSettings";
import LeaveTypes from "../pages/HR/LeaveManagement/settings/LeaveTypes";
import LeavePeriod from "../pages/HR/LeaveManagement/settings/LeavePeriod";
import HolidayList from "../pages/HR/LeaveManagement/settings/HolidayList";
import LeaveAllocations from "../pages/HR/LeaveManagement/settings/LeaveAllocations";
function HRPage({ Component, title }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`${styles.appLayout} ${collapsed ? styles.sidebarCollapsed : ""}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <button
        type="button"
        className={styles.mobileMenuButton}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((value) => !value)}
      >
        ☰
      </button>

      <div className={styles.mainArea}>
        <Navbar title={title} />
        <main className={styles.pageContent}>
          <Component />
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />

        <Route path="/hr/dashboard" element={<HRPage Component={Dashboard} title="Dashboard" />} />

        <Route path="/hr/employee-registration" element={<HRPage Component={EmployeeOnboarding} title="Employee Registration" />} />
        <Route path="/hr/employee-registration/:id" element={<HRPage Component={EmployeeOnboarding} title="Edit Employee" />} />

        <Route path="/hr/departments" element={<HRPage Component={Departments} title="Departments" />} />
        <Route path="/hr/departments/add" element={<HRPage Component={Add_Department} title="Department Management" />} />
        <Route path="/hr/view-department/:id" element={<HRPage Component={View_Department} title="Department Details" />} />
        <Route path="/hr/edit-department/:id" element={<HRPage Component={Add_Department} title="Edit Department" />} />

        <Route path="/hr/designations" element={<HRPage Component={Designations} title="Designations" />} />
        <Route path="/hr/designations/add" element={<HRPage Component={Add_Designation} title="Add Designation" />} />
        <Route path="/hr/designations/view/:id" element={<HRPage Component={View_Designation} title="Designation Details" />} />
        <Route path="/hr/designations/edit/:id" element={<HRPage Component={Edit_Designation} title="Edit Designation" />} />


        <Route path="/hr/attendance" element={<HRPage Component={Attendance} title="Attendance" />} />
        <Route path="/hr/employeemanagement" element={<HRPage Component={HREmployeeManagement} title="Employee Management" />} />
        <Route path="/hr/employees/:id" element={<HRPage Component={EmployeeDetails} title="Employee Details" />} />
        <Route path="/hr/notifications" element={<HRPage Component={Notifications} title="Notifications" />} />
        <Route path="/hr/email" element={<HRPage Component={Email} title="Email" />} />
        <Route path="/hr/leave-management" element={<HRPage Component={LeaveManagement} title="Leave Management" />} />
        <Route path="/hr/performance-reviews" element={<HRPage Component={PerformanceReviews} title="Performance Reviews" />} />
        <Route path="/hr/reports" element={<HRPage Component={Reports} title="Reports" />} />
{/* 
        <Route
                  path="/hr/recruitment/job-openings"
                  element={<HRPage Component={JobOpenings} title="Job Openings" />}
                />
                <Route
                  path="/hr/recruitment/job-openings/add"
                  element={
                    <HRPage Component={JobOpeningForm} title="Create Job Opening" />
                  }
                />
                <Route
                  path="/hr/recruitment/job-openings/:id/edit"
                  element={
                    <HRPage Component={JobOpeningForm} title="Edit Job Opening" />
                  }
                />
                <Route
                  path="/hr/recruitment/applications"
                  element={<HRPage Component={Applications} title="Applications" />}
                />
                <Route
                  path="/hr/recruitment/applications/:id"
                  element={
                    <HRPage
                      Component={ApplicationDetails}
                      title="Application Details"
                    />
                  }
                />
                <Route
                  path="/hr/recruitment/interviews"
                  element={<HRPage Component={Interviews} title="Interviews" />}
                />
                <Route
                  path="/hr/recruitment/interviews/add"
                  element={
                    <HRPage Component={InterviewForm} title="Schedule Interview" />
                  }
                />
        
                <Route
                  path="/hr/recruitment/interviews/:id/edit"
                  element={<HRPage Component={InterviewForm} title="Edit Interview" />}
                />
                <Route
                  path="/hr/recruitment/interviews/:id"
                  element={
                    <HRPage Component={InterviewDetails} title="Interview Details" />
                  }
                />
                <Route
                  path="/hr/recruitment/offers"
                  element={<HRPage Component={Offers} title="Offers" />}
                />
        
                <Route
                  path="/hr/recruitment/offers/add"
                  element={<HRPage Component={OfferForm} title="Create Offer" />}
                />
                <Route
                  path="/hr/recruitment/onboarding"
                  element={<HRPage Component={Onboarding} title="Onboarding" />}
                />
                <Route
                  path="/hr/recruitment/dashboard"
                  element={
                    <HRPage
                      Component={RecruitmentDashboard}
                      title="Recruitment Dashboard"
                    />
                  }
                />
                <Route
                  path="/hr/recruitment/management"
                  element={
                    <HRPage
                      Component={RecruitmentManagement}
                      title="Recruitment Management"
                    />
                  }
                /> */}
                <Route
          path="/hr/leave-management/settings"
          element={
            <HRPage
              Component={LeaveSettings}
              title="Leave Settings"
            />
          }
        />
        
        <Route
          path="/hr/leave-management/settings/leave-types"
          element={
            <HRPage
              Component={LeaveTypes}
              title="Leave Types"
            />
          }
        />
        
        <Route
          path="/hr/leave-management/settings/leave-period"
          element={
            <HRPage
              Component={LeavePeriod}
              title="Leave Period"
            />
          }
        />
        
        <Route
          path="/hr/leave-management/settings/holidays"
          element={
            <HRPage
              Component={HolidayList}
              title="Holiday List"
            />
          }
        />
        
        <Route
          path="/hr/leave-management/settings/allocations"
          element={
            <HRPage
              Component={LeaveAllocations}
              title="Leave Allocations"
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
