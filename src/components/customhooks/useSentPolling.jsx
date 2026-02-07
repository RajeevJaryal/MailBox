import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchSent } from "../redux/slices/mailSlice";

export function useSentPolling(userEmail, interval = 2000) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userEmail) return;

    dispatch(fetchSent({ userEmail }));

    const id = setInterval(() => {
      dispatch(fetchSent({ userEmail }));
    }, interval);

    return () => clearInterval(id);
  }, [dispatch, userEmail, interval]);
}
