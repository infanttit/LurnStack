import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getCompletedClasses,
  getEnrolledCourses,
  getUpcomingClasses,
  joinClass,
} from "../api/liveClassesApi";

export const fetchDashboardData = createAsyncThunk(
  "liveClasses/fetchDashboardData",
  async () => {
    const [enrolledCourses, upcomingClasses, completedClasses] =
      await Promise.all([
        getEnrolledCourses(),
        getUpcomingClasses(),
        getCompletedClasses(),
      ]);
    return { enrolledCourses, upcomingClasses, completedClasses };
  }
);

export const joinLiveClass = createAsyncThunk(
  "liveClasses/joinLiveClass",
  async ({ classId }, { rejectWithValue }) => {
    try {
      const result = await joinClass(classId);
      return { classId: String(classId), ...result };
    } catch (err) {
      return rejectWithValue(err?.message || "Unable to join class");
    }
  }
);

const initialState = {
  enrolledCourses: [],
  upcomingClasses: [],
  completedClasses: [],
  joinedByClassId: {},
  loading: false,
  error: "",
};

const liveClassesSlice = createSlice({
  name: "liveClasses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.enrolledCourses = action.payload.enrolledCourses || [];
        state.upcomingClasses = action.payload.upcomingClasses || [];
        state.completedClasses = action.payload.completedClasses || [];
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load dashboard";
      })
      .addCase(joinLiveClass.fulfilled, (state, action) => {
        const { classId, joinedAt, attendanceStatus } = action.payload || {};
        if (!classId) return;
        state.joinedByClassId[classId] = {
          joinedAt: joinedAt || new Date().toISOString(),
          attendanceStatus: attendanceStatus || "present",
        };
      })
      .addCase(joinLiveClass.rejected, (state, action) => {
        state.error = action.payload || action.error?.message || "Failed to join class";
      });
  },
});

export default liveClassesSlice.reducer;

