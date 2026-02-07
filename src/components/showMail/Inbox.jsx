import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInbox,
  markRead,
  selectMail,
  deleteInboxMail,
} from "../redux/slices/mailSlice";
import { useNavigate } from "react-router-dom";
import { useInboxPolling } from "../customhooks/useInboxPolling";



export default function Inbox() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userEmail = useSelector((s) => s.auth.email);
  const { inbox, loadingInbox, selected, error } = useSelector((s) => s.mail);

  useInboxPolling(userEmail);

const openMail = (mail) => {
  dispatch(selectMail(mail));

  // mark as read only if it was unread
  if (!mail.read) {
    dispatch(markRead({ userEmail, mailId: mail.id }));
  }
};


  const handleDelete = () => {
    if (!selected || !userEmail) return;

    const ok = window.confirm("Delete this mail?");
    if (!ok) return;

    dispatch(deleteInboxMail({ userEmail, mailId: selected.id }));
  };

  return (
    <div className="container my-4">
      <div className="row g-3">
        {/* Left: Inbox list */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex align-items-center justify-content-between">
              
              <button
      className="btn btn-sm btn-outline-secondary"
      onClick={() => navigate("/home")}
    >
      ← Back
    </button><span className="fw-semibold">Inbox</span>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => userEmail && dispatch(fetchInbox({ userEmail }))}
                disabled={!userEmail || loadingInbox}
              >
                {loadingInbox ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="list-group list-group-flush">
              {!userEmail && (
                <div className="p-3 text-muted">Login required.</div>
              )}

              {userEmail && loadingInbox && (
                <div className="p-3">Loading mails...</div>
              )}

              {userEmail && !loadingInbox && inbox.length === 0 && (
                <div className="p-3 text-muted">No mails in inbox.</div>
              )}

              {userEmail &&
                !loadingInbox &&
                inbox.map((m) => (
                  <button
                    key={m.id}
                    className={`list-group-item list-group-item-action ${
                      selected?.id === m.id ? "active" : ""
                    }`}
                    onClick={() => openMail(m)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="me-2">
                        <div className={m.read ? "" : "fw-bold"}>
                          {m.subject || "(no subject)"}
                        </div>
                        <div className={`small ${m.read ? "text-muted" : ""}`}>
                          From: {m.from || "(unknown)"}
                        </div>
                      </div>

                      <small
                        className={
                          selected?.id === m.id ? "text-white-50" : "text-muted"
                        }
                      >
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleString()
                          : ""}
                      </small>
                    </div>
                  </button>
                ))}
            </div>

            {error && (
              <div className="alert alert-danger m-3 mb-0">{error}</div>
            )}
          </div>
        </div>

        {/* Right: Mail viewer */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Mail</span>

              {/* Delete only when a mail is selected */}
              {selected && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              )}
            </div>

            <div className="card-body">
              {!selected ? (
                <div className="text-muted">Select a mail to read.</div>
              ) : (
                <>
                  <h5 className="mb-1">{selected.subject || "(no subject)"}</h5>

                  <div className="text-muted small mb-3">
                    <div>
                      <b>From:</b> {selected.from || "(unknown)"}
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
