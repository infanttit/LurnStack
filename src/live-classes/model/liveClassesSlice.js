import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  joinClass,
  getLiveClassById,
  getLiveClasses,
} from "../api/liveClassesApi";

export const fetchDashboardData = createAsyncThunk(
  "liveClasses/fetchDashboardData",
  async () => {
    const classes = await getLiveClasses();

    const now = Date.now();
    const upcomingClasses = [];
    const completedClasses = [];

    for (const lc of classes) {
      const start = new Date(lc?.scheduledAt || "").getTime();
      if (!Number.isFinite(start) || start <= 0) continue;
      const durationMinutes = Number(lc?.durationMinutes) || 0;
      const end = start + Math.max(0, durationMinutes) * 60 * 1000;
      if (end >= now) upcomingClasses.push(lc);
      else completedClasses.push(lc);
    }

    upcomingClasses.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    completedClasses.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

    return {
      enrolledCourses: [],
      upcomingClasses,
      completedClasses,
      allClasses: classes,
    };
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

export const fetchLiveClassDetails = createAsyncThunk(
  "liveClasses/fetchLiveClassDetails",
  async ({ classId }, { rejectWithValue }) => {
    try {
      const liveClass = await getLiveClassById(classId);
      return { classId: String(classId), liveClass };
    } catch (err) {
      return rejectWithValue(err?.message || "Unable to load class details");
    }
  }
);

const initialState = {
  allClasses: [],
  enrolledCourses: [],
  upcomingClasses: [],
  completedClasses: [],
  detailsById: {},
  joinedByClassId: {},
  loading: false,
  detailsLoading: false,
  error: "",
  detailsError: "",
  lastUpdatedAt: "",
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
        state.allClasses = action.payload.allClasses || [];
        state.enrolledCourses = action.payload.enrolledCourses || [];
        state.upcomingClasses = action.payload.upcomingClasses || [];
        state.completedClasses = action.payload.completedClasses || [];
        state.lastUpdatedAt = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to load dashboard";
      })
      .addCase(joinLiveClass.pending, (state) => {
        state.error = "";
      })
      .addCase(joinLiveClass.fulfilled, (state, action) => {
        const { classId, joinedAt, attendanceStatus, meetUrl } = action.payload || {};
        if (!classId) return;
        state.joinedByClassId[classId] = {
          joinedAt: joinedAt || new Date().toISOString(),
          attendanceStatus: attendanceStatus || "present",
          meetUrl: meetUrl || "",
        };
      })
      .addCase(joinLiveClass.rejected, (state, action) => {
        state.error = action.payload || action.error?.message || "Failed to join class";
      })
      .addCase(fetchLiveClassDetails.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = "";
      })
      .addCase(fetchLiveClassDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        const { classId, liveClass } = action.payload || {};
        if (!classId) return;
        state.detailsById[classId] = liveClass || null;
      })
      .addCase(fetchLiveClassDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.payload || action.error?.message || "Failed to load class details";
      });
  },
});

export default liveClassesSlice.reducer;

