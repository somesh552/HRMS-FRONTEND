export const initialLeaveTypes = [
  {
    id: "LT-001",
    name: "Casual Leave",
    maxDaysAllowed: 3,
    isPaid: true,
    isCarryForward: false,
    maxCarryForwardDays: 0,
    isEncashable: false,
    applicableAfterDays: 0,
  },
  {
    id: "LT-002",
    name: "Sick Leave",
    maxDaysAllowed: 5,
    isPaid: true,
    isCarryForward: false,
    maxCarryForwardDays: 0,
    isEncashable: false,
    applicableAfterDays: 0,
  },
  {
    id: "LT-003",
    name: "Earned Leave",
    maxDaysAllowed: 18,
    isPaid: true,
    isCarryForward: true,
    maxCarryForwardDays: 10,
    isEncashable: true,
    applicableAfterDays: 0,
  },
];

export const initialLeavePeriods = [
  {
    id: "LP-001",
    periodName: "Leave Period 2026",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    company: "HRMS Organization",
    isActive: true,
  },
];

export const initialHolidays = [
  {
    id: "H-001",
    date: "2026-01-26",
    name: "Republic Day",
    type: "Public",
  },
  {
    id: "H-002",
    date: "2026-08-15",
    name: "Independence Day",
    type: "Public",
  },
  {
    id: "H-003",
    date: "2026-10-02",
    name: "Gandhi Jayanti",
    type: "Public",
  },
];

export const employees = [
  {
    id: "EMP-125",
    name: "Ravi Kumar",
  },
  {
    id: "EMP-124",
    name: "Priya Sharma",
  },
  {
    id: "EMP-123",
    name: "Arjun Reddy",
  },
];

export const initialAllocations = [
  {
    id: "LA-001",
    employeeId: "EMP-125",
    employee: "Ravi Kumar",
    leaveType: "Casual Leave",
    period: "Leave Period 2026",
    allocated: 12,
    carryForward: 0,
    used: 4,
  },
  {
    id: "LA-002",
    employeeId: "EMP-124",
    employee: "Priya Sharma",
    leaveType: "Sick Leave",
    period: "Leave Period 2026",
    allocated: 10,
    carryForward: 0,
    used: 2,
  },
  {
    id: "LA-003",
    employeeId: "EMP-123",
    employee: "Arjun Reddy",
    leaveType: "Earned Leave",
    period: "Leave Period 2026",
    allocated: 18,
    carryForward: 3,
    used: 5,
  },
];