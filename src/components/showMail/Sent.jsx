import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSent, selectMail, clearSelected } from "../redux/slices/mailSlice";

export default function Sent() {
  const dispatch = useDispatch();

  const userEmail = useSelector((s) => s.auth.email);
  const { sent, selected, error } = useSelector((s) => s.mail);

  useEffect(() => {
    // if user not logged in, nothing to load
    if (!userEmail) return;

    // load sent mails when page opens
    dispatch(fetchSent({ userEmail }));

    // optional: clear selected when leaving this page
    return () => dispatch(clearSelected());
  }, [dispatch, userEmail]);

  const openMail = (mail) => {
    // just open mail on right panel
    dispatch(selectMail(mail));
  };

  return (
    <div className="container my-4">
      <div className="row g-3">
        {/* Left: Sent list */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex align-items-center justify-content-between">
              <span className="fw-semibold">Sent</span>

              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => userEmail && dispatch(fetchSent({ userEmail }))}
                disabled={!userEmail}
              >
                Refresh
              </button>
            </div>

            <div className="list-group list-group-flush">
              {!userEmail && (
                <div className="p-3 text-muted">Login required.</div>
              )}

              {userEmail && sent.length === 0 && (
                <div className="p-3 text-muted">No sent mails yet.</div>
              )}

              {userEmail &&
                sent.map((m) => (
                  <button
                    key={m.id}
                    className={`list-group-item list-group-item-action ${
                      selected?.id === m.id ? "active" : ""
                    }`}
                    onClick={() => openMail(m)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="me-2">
                        <div className="fw-semibold">
                          {m.subject || "(no subject)"}
                        </div>
                        <div
                          className={`small ${
                            selected?.id === m.id ? "text-white-50" : "text-muted"
                          }`}
                        >
                          To: {m.to}
                        </div>
                      </div>

                      <small
                        className={
                          selected?.id === m.id ? "text-white-50" : "text-muted"
                        }
                      >
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                      </small>
                    </div>
                  </button>
                ))}
            </div>

            {error && <div className="alert alert-danger m-3 mb-0">{error}</div>}
          </div>
        </div>

        {/* Right: Mail viewer */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <span className="fw-semibold">Mail</span>
            </div>

            <div className="card-body">
              {!selected ? (
                <div className="text-muted">Select a sent mail to view.</div>
              ) : (
                <>
                  <h5 className="mb-1">{selected.subject || "(no subject)"}</h5>

                  <div className="text-muted small mb-3">
                    <div>
                      <b>From:</b> {selected.from || "(unknown sender)"}
                    </div>
                    <div>
                      <b>To:</b> {selected.to}
                    </div>
                    <div>
                      <b>Date:</b>{" "}
                      {selected.createdAt
                        ? new Date(selected.createdAt).toLocaleString()
                        : "-"}
                    </div>
                  </div>

                  <hr />

                  {/* render stored HTML body */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selected.html || selected.bodyHtml || "",
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
