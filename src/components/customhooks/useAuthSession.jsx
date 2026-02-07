import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { restoreSession, logout } from "../redux/slices/AuthSlice";

export function useAuthSession() {
  const dispatch = useDispatch();

  useEffect(() => {
    const saved = localStorage.getItem("auth");
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      if (!data?.token || !data?.expiresAt || Date.now() >= data.expiresAt) {
        dispatch(logout());
        return;
      }
      dispatch(restoreSession(data));
    } catch {
      dispatch(logout());
    }
  }, [dispatch]);
}
