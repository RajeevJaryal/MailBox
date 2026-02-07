export const emailToKey = (email = "") =>
  String(email).trim().toLowerCase().replaceAll(".", ",");
