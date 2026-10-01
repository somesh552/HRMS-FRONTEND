import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { employeeApi } from "../../services/api/employee.api";

// GET /employees
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeApi.getAll();

      const employees = Array.isArray(response.data)
        ? response.data
        : response.data?.value;

      if (!Array.isArray(employees)) {
        return rejectWithValue("Invalid employee API response");
      }

      return employees;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load employees"
      );
    }
  }
);

// GET /employees/:id
export const fetchEmployeeById = createAsyncThunk(
  "employees/fetchEmployeeById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeApi.getById(id);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load employee"
      );
    }
  }
);

const employeeSlice = createSlice({
  name: "employees",

  initialState: {
    data: [],

    selectedEmployee: null,

    isLoading: false,
    isLoadingById: false,

    error: null,
    errorById: null,
  },

  reducers: {
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
      state.errorById = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // --------------------------------
      // GET ALL EMPLOYEES
      // --------------------------------
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })

      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Failed to load employees";
      })

      // --------------------------------
      // GET EMPLOYEE BY ID
      // --------------------------------
      .addCase(fetchEmployeeById.pending, (state) => {
        state.isLoadingById = true;
        state.errorById = null;
      })

      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.isLoadingById = false;
        state.selectedEmployee = action.payload;
      })

      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.isLoadingById = false;
        state.errorById =
          action.payload || "Failed to load employee";
      });
  },
});

export const { clearSelectedEmployee } = employeeSlice.actions;

export default employeeSlice.reducer;