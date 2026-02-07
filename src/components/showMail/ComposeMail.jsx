import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { sendMail } from "../redux/slices/mailSlice";

export default function ComposeMail() {
  const dispatch = useDispatch();

  // ✅ take logged-in email from auth slice
  const fromEmail = useSelector((s) => s.auth.email);

  const { sending, error } = useSelector((s) => s.mail);

  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const canSend = useMemo(() => {
    const plainText =
      editorState?.getCurrentContent?.()?.getPlainText?.() || "";

    // ✅ don't allow send if sender email missing
    return (
      !!fromEmail &&
      toEmail?.includes("@") &&
      plainText.trim().length > 0 &&
      !sending
    );
  }, [fromEmail, toEmail, editorState, sending]);

  const onSend = async () => {
    if (!fromEmail) return; // safety

    const rawContent = convertToRaw(editorState.getCurrentContent());
    const html = draftToHtml(rawContent);

    const res = await dispatch(sendMail({ fromEmail, toEmail, subject, html }));

    if (sendMail.fulfilled.match(res)) {
      setToEmail("");
      setSubject("");
      setEditorState(EditorState.createEmpty());
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-9">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0">Compose</h5>
                <button
                  className="btn btn-primary"
                  onClick={onSend}
                  disabled={!canSend}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>

              {/* small hint if email not loaded */}
              {!fromEmail && (
                <div className="small text-danger mt-2">
                  Sender email not found. Please login again.
                </div>
              )}
            </div>

            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">To</label>
                <input
                  className="form-control"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  placeholder="receiver@email.com"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Subject</label>
                <input
                  className="form-control"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                />
              </div>

              <div className="border rounded">
                <Editor
                  editorState={editorState}
                  onEditorStateChange={setEditorState}
                  placeholder="Write your mail here..."
                  toolbar={{
                    options: ["inline", "colorPicker", "list", "link", "history"],
                    inline: { options: ["bold", "italic", "underline"] },
                    colorPicker: {
                      colors: ["#000000", "#FF0000", "#00AA00", "#0066FF", "#FFFF00", "#FFA500"],
                    },
                  }}
                  toolbarClassName="border-bottom"
                  wrapperClassName="p-2"
                  editorClassName="p-3"
                />
              </div>

              {error && (
                <div className="alert alert-danger mt-3 mb-0">{error}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
