import { createHttpClient } from "../../shared/api";
import { env } from "../../shared/config/env";

export const apiClient = createHttpClient({
  baseUrl: env.apiBaseUrl,
  // Later: connect this to your auth store/token:
  // getAuthToken: () => authStore.getState().token,
});

