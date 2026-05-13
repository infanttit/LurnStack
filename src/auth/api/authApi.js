import { axiosClient } from "../../shared/api/axiosClient";
import { getAxiosErrorMessage } from "../../shared/api/axiosError";

function unwrap(res) {
  const data = res?.data;
  if (!data?.success) {
    throw new Error(data?.message || "Request failed");
  }
  return data;
}

export async function registerApi({ fullName, email, password }) {
  try {
    const res = await axiosClient.post("/api/auth/register", {
      FULL_NAME: fullName,
      EMAIL_ADDRESS: email,
      PASSWORD: password,
    });
    const data = unwrap(res);
    return {
      user: data.user,
      token: data.token || null,
      message: data.message,
    };
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to register. Please try again."));
  }
}

export async function loginApi({ email, password }) {
  try {
    const res = await axiosClient.post("/api/auth/login", {
      EMAIL_ADDRESS: email,
      PASSWORD: password,
    });
    const data = unwrap(res);
    return {
      user: data.user,
      token: data.token,
      message: data.message,
    };
  } catch (err) {
    throw new Error(getAxiosErrorMessage(err, "Unable to log in. Please try again."));
  }
}
