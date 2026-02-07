import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchInbox } from "../redux/slices/mailSlice";

export function useInboxPolling(userEmail, interval = 2000) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userEmail) return;

    dispatch(fetchInbox({ userEmail }));

    const id = setInterval(() => {
      dispatch(fetchInbox({ userEmail }));
    }, interval);

    return () => clearInterval(id);
  }, [dispatch, userEmail, interval]);
}
