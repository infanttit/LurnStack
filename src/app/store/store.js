import { configureStore } from "@reduxjs/toolkit";
import liveClassesReducer from "../../live-classes/model/liveClassesSlice";

export const store = configureStore({
  reducer: {
    liveClasses: liveClassesReducer,
  },
});

