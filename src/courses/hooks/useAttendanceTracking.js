import { useEffect, useRef } from "react";
import { startAttendanceHeartbeat } from "../utils/attendanceHeartbeat";

/**
 * A hook to automatically manage the lifecycle of the attendance heartbeat.
 * Automatically sends a "leave" request when the component unmounts.
 */
export function useAttendanceTracking() {
  const stopRef = useRef(null);

  useEffect(() => {
    // Cleanup function runs when the component unmounts
    return () => {
      if (stopRef.current) {
        stopRef.current();
        stopRef.current = null;
      }
    };
  }, []);

  const track = (options) => {
    if (stopRef.current) {
      // If we are already tracking, stop the previous one without sending a leave
      // so we can start the new one cleanly (e.g. if options change)
      stopRef.current({ sendLeave: false });
    }
    stopRef.current = startAttendanceHeartbeat(options);
  };

  const stopTracking = () => {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
  };

  return { track, stopTracking };
}
