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

  const [mode, setMode] = useState("signup"); // "signup" | "login"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState("");

  // clear error when mode changes
  useEffect(() => {
    if (error) dispatch(clearAuthError());
  }, [mode]); // eslint-disable-line

  const submitHandler = (e) => {
    e.preventDefault();

    if (mode === "signup") {
      if (password !== cpassword) {
        alert("Password and Confirm Password must match");
        return;
      }
      dispatch(signupUser({ email, password }));
    } else {
      dispatch(loginUser({ email, password }));
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setPassword("");
    setCpassword("");
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div className="col-12 col-sm-10 col-md-6 col-lg-4">
        <div className="card shadow-lg border-0">
          <div className="card-body p-4">
            {/* Title */}
            <h3 className="text-center mb-3">
              {mode === "signup" ? "Create Account" : "Welcome Back"}
            </h3>

            {/* Mode Toggle */}
            <div className="btn-group w-100 mb-4" role="group">
              <button
                type="button"
                className={`btn ${
                  mode === "signup" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => switchMode("signup")}
              >
                Sign Up
              </button>
              <button
                type="button"
                className={`btn ${
                  mode === "login" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => switchMode("login")}
              >
                Log In
              </button>
            </div>

            <form onSubmit={submitHandler}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) dispatch(clearAuthError());
                  }}
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) dispatch(clearAuthError());
                  }}
                  minLength={6}
                  required
                />
              </div>

              {/* Confirm Password only for signup */}
              {mode === "signup" && (
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm password"
                    value={cpassword}
                    onChange={(e) => {
                      setCpassword(e.target.value);
                      if (error) dispatch(clearAuthError());
                    }}
                    minLength={6}
                    required
                  />
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading
                  ? mode === "signup"
                    ? "Creating account..."
                    : "Logging in..."
                  : mode === "signup"
                  ? "Sign Up"
                  : "Log In"}
              </button>

              {/* Error */}
              {error && (
                <div className="alert alert-danger mt-3 text-center">
                  {error}
                </div>
              )}

              {/* Success */}
              {isLoggedIn && signedEmail && (
                <div className="alert alert-success mt-3 text-center">
                  Logged in as <strong>{signedEmail}</strong>
                </div>
              )}
            </form>

            {/* Small footer text */}
            <p className="text-center mt-3 mb-0 text-muted" style={{ fontSize: 14 }}>
              {mode === "signup"
                ? "Already have an account? Switch to Log In."
                : "New here? Switch to Sign Up."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
