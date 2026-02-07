import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  signupUser,
  loginUser,
  clearAuthError,
} from "../redux/slices/AuthSlice";

const AuthForm = () => {
  const dispatch = useDispatch();
  const { loading, error, isLoggedIn, email: signedEmail } = useSelector(
    (state) => state.auth
  );

  const [mode, setMode] = useState("login"); // default login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState("");

  useEffect(() => {
    if (error) dispatch(clearAuthError());
  }, [mode]); // eslint-disable-line

  const submitHandler = (e) => {
    e.preventDefault();

    if (mode === "signup") {
      if (password !== cpassword) {
        alert("Passwords do not match");
        return;
      }
      dispatch(signupUser({ email, password }));
    } else {
      dispatch(loginUser({ email, password }));
    }
  };

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #667eea, #764ba2)",
      }}
    >
      <div className="col-12 col-sm-10 col-md-6 col-lg-4">
        <div className="card border-0 shadow-lg rounded-4">
          <div className="card-body p-4 p-md-5">
            {/* Text Tabs */}
            <div className="d-flex justify-content-center gap-4 mb-4">
              <span
                role="button"
                onClick={() => setMode("login")}
                className={`fw-semibold ${
                  mode === "login"
                    ? "text-primary border-bottom border-2 pb-1"
                    : "text-muted"
                }`}
              >
                Login
              </span>
              <span
                role="button"
                onClick={() => setMode("signup")}
                className={`fw-semibold ${
                  mode === "signup"
                    ? "text-primary border-bottom border-2 pb-1"
                    : "text-muted"
                }`}
              >
                Sign Up
              </span>
            </div>

            <h4 className="text-center mb-4">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h4>

            <form onSubmit={submitHandler}>
              {/* Email */}
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control rounded-pill"
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) dispatch(clearAuthError());
                  }}
                  required
                />
                <label htmlFor="email">Email address</label>
              </div>

              {/* Password */}
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control rounded-pill"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) dispatch(clearAuthError());
                  }}
                  minLength={6}
                  required
                />
                <label htmlFor="password">Password</label>
              </div>

              {/* Confirm Password (signup only) */}
              {mode === "signup" && (
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control rounded-pill"
                    id="cpassword"
                    placeholder="Confirm Password"
                    value={cpassword}
                    onChange={(e) => {
                      setCpassword(e.target.value);
                      if (error) dispatch(clearAuthError());
                    }}
                    minLength={6}
                    required
                  />
                  <label htmlFor="cpassword">Confirm Password</label>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100 rounded-pill py-2 fw-semibold"
                disabled={loading}
              >
                {loading
                  ? mode === "login"
                    ? "Logging in..."
                    : "Creating account..."
                  : mode === "login"
                  ? "Login"
                  : "Sign Up"}
              </button>

              {error && (
                <div className="alert alert-danger mt-3 text-center rounded-pill">
                  {error}
                </div>
              )}

              {isLoggedIn && signedEmail && (
                <div className="alert alert-success mt-3 text-center rounded-pill">
                  Logged in as <strong>{signedEmail}</strong>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
