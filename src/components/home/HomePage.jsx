import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/AuthSlice";
import { fetchInbox, fetchSent } from "../redux/slices/mailSlice";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // auth + mail state
  const userEmail = useSelector((s) => s.auth.email);
  const { inbox, sent, loadingInbox } = useSelector((s) => s.mail);

  // load inbox & sent once email is available
  useEffect(() => {
    if (!userEmail) return;
    dispatch(fetchInbox({ userEmail }));
    dispatch(fetchSent({ userEmail }));
  }, [dispatch, userEmail]);

  const recentInbox = inbox.slice(0, 3);
  const recentSent = sent.slice(0, 3);

  const unreadCount = inbox.filter((m) => !m.read).length;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="container-fluid p-0">
      {/* ================= NAVBAR ================= */}
      <nav className="navbar navbar-dark bg-dark px-3">
        <Link className="navbar-brand fw-semibold" to="/">
          MailBox
        </Link>

        {/* Sandwich dropdown */}
        <div className="ms-auto dropdown">
          <button
            className="btn btn-outline-light btn-sm"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            ☰
          </button>

          <ul className="dropdown-menu dropdown-menu-end shadow">
            <li className="px-3 py-2">
              <div className="small text-muted">Logged in as</div>
              <div
                className="fw-semibold text-truncate"
                style={{ maxWidth: "220px" }}
              >
                {userEmail || "—"}
              </div>
            </li>

            <li>
              <hr className="dropdown-divider" />
            </li>

            <li>
              <button
                className="dropdown-item text-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="row g-0">
        {/* ================= SIDEBAR ================= */}
        <aside className="d-none d-md-block col-md-3 col-lg-2 border-end bg-light min-vh-100 p-3">

          <Link to="/compose" className="btn btn-primary w-100 mb-3">
            + Compose
          </Link>

          <div className="list-group">
            <Link
              to="/inbox"
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            >
              Inbox
              <span className="badge bg-primary rounded-pill">
                {inbox.length}
              </span>
            </Link>

            <Link
              to="/sent"
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            >
              Sent
              <span className="badge bg-secondary rounded-pill">
                {sent.length}
              </span>
            </Link>
          </div>

          <hr />

          <div className="small text-muted">
            Tip: Inbox & Sent are stored separately for each user.
          </div>
        </aside>

        {/* ================= MAIN ================= */}
        <main className="col-12 col-md-9 col-lg-10 p-3 p-md-4">
          {/* Hero */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h3 className="mb-2">Welcome to MailBox</h3>
              <p className="text-muted mb-3">
                Send rich-text emails and manage your Inbox & Sentbox.
              </p>

              <div className="d-flex flex-wrap gap-2">
                <Link to="/compose" className="btn btn-primary">
                  Compose Mail
                </Link>
                <Link to="/inbox" className="btn btn-outline-primary">
                  View Inbox
                </Link>
                <Link to="/sent" className="btn btn-outline-secondary">
                  View Sent
                </Link>
              </div>
            </div>
          </div>

          {/* ================= QUICK STATS ================= */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">Unread</div>
                  <div className="display-6 fw-semibold">{unreadCount}</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">Inbox</div>
                  <div className="display-6 fw-semibold">{inbox.length}</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small">Sent</div>
                  <div className="display-6 fw-semibold">{sent.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RECENT MAILS ================= */}
          <div className="row g-3">
            {/* Recent Inbox */}
            <div className="col-12 col-lg-6">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Recent Inbox</span>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => dispatch(fetchInbox({ userEmail }))}
                    disabled={!userEmail || loadingInbox}
                  >
                    {loadingInbox ? "…" : "Refresh"}
                  </button>
                </div>

                <div className="list-group list-group-flush">
                  {recentInbox.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="text-muted fw-semibold">
                        No mails yet
                      </div>
                      <div className="small text-muted mt-1">
                        New mails will show here
                      </div>
                    </div>
                  ) : (
                    recentInbox.map((m) => (
                      <div key={m.id} className="list-group-item">
                        <div className="d-flex justify-content-between mb-1">
                          <div
                            className={`text-truncate ${
                              m.read ? "" : "fw-semibold"
                            }`}
                            style={{ maxWidth: "75%" }}
                          >
                            {m.subject || "(no subject)"}
                          </div>
                          <small className="text-muted">
                            {m.createdAt
                              ? new Date(m.createdAt).toLocaleDateString(
                                  "en-IN",
                                  { day: "2-digit", month: "short" }
                                )
                              : ""}
                          </small>
                        </div>
                        <div className="small text-muted text-truncate">
                          From <span className="fw-medium">{m.from}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Sent */}
            <div className="col-12 col-lg-6">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Recent Sent</span>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => dispatch(fetchSent({ userEmail }))}
                    disabled={!userEmail}
                  >
                    Refresh
                  </button>
                </div>

                <div className="list-group list-group-flush">
                  {recentSent.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="text-muted fw-semibold">
                        No mails yet
                      </div>
                      <div className="small text-muted mt-1">
                        Sent mails will show here
                      </div>
                    </div>
                  ) : (
                    recentSent.map((m) => (
                      <div key={m.id} className="list-group-item">
                        <div className="d-flex justify-content-between mb-1">
                          <div className="text-truncate fw-semibold" style={{ maxWidth: "75%" }}>
                            {m.subject || "(no subject)"}
                          </div>
                          <small className="text-muted">
                            {m.createdAt
                              ? new Date(m.createdAt).toLocaleDateString(
                                  "en-IN",
                                  { day: "2-digit", month: "short" }
                                )
                              : ""}
                          </small>
                        </div>
                        <div className="small text-muted text-truncate">
                          To <span className="fw-medium">{m.to}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
