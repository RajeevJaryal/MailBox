import axios from "axios";

export const firebaseAuthAPI = axios.create({
  baseURL: "https://identitytoolkit.googleapis.com/v1",
  params: {
    key: import.meta.env.VITE_FIREBASE_API_KEY,
  },
});

export const firebaseDb=axios.create({
  baseURL: import.meta.env.VITE_FIREBASE_DB_URL,
});
