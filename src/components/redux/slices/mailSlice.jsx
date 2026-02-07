import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { firebaseDb } from "../../../firebase";
import { emailToKey } from "../../utilities/emailToKey";

// small helper to generate unique mail ids
const makeId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

/* =========================
   SEND MAIL
   ========================= */
export const sendMail = createAsyncThunk(
  "mail/sendMail",
  async ({ fromEmail, toEmail, subject, html }, { rejectWithValue }) => {
    try {
      const fromKey = emailToKey(fromEmail);
      const toKey = emailToKey(toEmail);
      const messageId = makeId();

      // actual mail object we store in DB
      const mail = {
        id: messageId,
        from: fromEmail,
        to: toEmail,
        subject: subject || "(no subject)",
        html,
        createdAt: Date.now(),
        read: false, // inbox mails start as unread
      };

      // save mail for receiver (inbox) and sender (sent)
      await Promise.all([
        firebaseDb.put(`/mailboxes/${toKey}/inbox/${messageId}.json`, mail),
        firebaseDb.put(`/mailboxes/${fromKey}/sent/${messageId}.json`, mail),
      ]);

      return mail;
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to send mail");
    }
  },
);

/* =========================
   FETCH INBOX MAILS
   ========================= */
export const fetchInbox = createAsyncThunk(
  "mail/fetchInbox",
  async ({ userEmail }, { rejectWithValue }) => {
    try {
      const key = emailToKey(userEmail);

      // get all inbox mails for this user
      const res = await firebaseDb.get(`/mailboxes/${key}/inbox.json`);
      const data = res.data || {};

      // convert object -> array and sort latest first
      return Object.values(data).sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return rejectWithValue("Failed to load inbox");
    }
  },
);

/* =========================
   FETCH SENT MAILS
   ========================= */
export const fetchSent = createAsyncThunk(
  "mail/fetchSent",
  async ({ userEmail }, { rejectWithValue }) => {
    try {
      const key = emailToKey(userEmail);
      const res = await firebaseDb.get(`/mailboxes/${key}/sent.json`);
      const data = res.data || {};

      return Object.values(data).sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return rejectWithValue("Failed to load sent data");
    }
  },
);

/* =========================
   MARK MAIL AS READ
   ========================= */
export const markRead = createAsyncThunk(
  "mail/markRead",
  async ({ userEmail, mailId }, { rejectWithValue }) => {
    try {
      const key = emailToKey(userEmail);

      // only update the read flag in DB
      await firebaseDb.patch(`/mailboxes/${key}/inbox/${mailId}.json`, {
        read: true,
      });

      // return id so reducer knows which mail to update
      return mailId;
    } catch {
      return rejectWithValue("Failed to mark mail as read");
    }
  },
);
export const deleteInboxMail = createAsyncThunk(
  "mail/deleteInboxMail",
  async ({ userEmail, mailId }, { rejectWithValue }) => {
    try {
      const key = emailToKey(userEmail);
      await firebaseDb.delete(`/mailboxes/${key}/inbox/${mailId}.json`);
      return mailId;
    } catch (err) {
      return rejectWithValue("Failed to delete inbox mail");
    }
  },
);

export const deleteSentMail = createAsyncThunk(
  "mail/deleteSentMail",
  async ({ userEmail, mailId }, { rejectWithValue }) => {
    try {
      const key = emailToKey(userEmail);
      await firebaseDb.delete(`/mailboxes/${key}/sent/${mailId}.json`);
      return mailId;
    } catch (err) {
      return rejectWithValue("Failed to delete sent mail");
    }
  },
);

/* =========================
   MAIL SLICE
   ========================= */
const mailSlice = createSlice({
  name: "mail",
  initialState: {
    sending: false, // used while sending a mail
    loadingInbox: false, // used while fetching inbox
    inbox: [], // inbox mails
    sent: [], // sent mails
    selected: null, // currently opened mail
    error: null,
    lastInboxHash: null,

  },

  reducers: {
    // when user clicks a mail in inbox
    selectMail: (state, action) => {
      state.selected = action.payload;
    },

    // clear selected mail (useful when navigating away)
    clearSelected: (state) => {
      state.selected = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ---- send mail ---- */
      .addCase(sendMail.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendMail.fulfilled, (state, action) => {
        state.sending = false;

        // instantly add mail to sent list
        state.sent.unshift(action.payload);
      })
      .addCase(sendMail.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })

      /* ---- fetch inbox ---- */
      .addCase(fetchInbox.pending, (state) => {
  if (state.inbox.length === 0) state.loadingInbox = true;
  state.error = null;
})

      .addCase(fetchInbox.fulfilled, (state, action) => {
  state.loadingInbox = false;

  // make a lightweight signature so we don't update state if nothing changed
  const nextHash = action.payload
    .map((m) => `${m.id}:${m.read ? 1 : 0}:${m.createdAt}`)
    .join("|");

  // if same as last time → skip updating inbox (prevents useless rerenders)
  if (state.lastInboxHash === nextHash) return;

  state.lastInboxHash = nextHash;
  state.inbox = action.payload;

  // keep opened mail updated if inbox refreshes
  if (state.selected?.id) {
    const updated = action.payload.find((m) => m.id === state.selected.id);
    if (updated) state.selected = updated;
  }
})

      .addCase(fetchInbox.rejected, (state, action) => {
        state.loadingInbox = false;
        state.error = action.payload;
      })

      /* ---- fetch sent ---- */
      .addCase(fetchSent.fulfilled, (state, action) => {
        state.sent = action.payload;
      })

      /* ---- mark read ---- */
      .addCase(markRead.fulfilled, (state, action) => {
        const id = action.payload;

        // update read flag in inbox list
        const mail = state.inbox.find((m) => m.id === id);
        if (mail) mail.read = true;

        // also update opened mail if same one
        if (state.selected?.id === id) {
          state.selected.read = true;
        }
      });
    // ---- delete inbox ----
    builder.addCase(deleteInboxMail.fulfilled, (state, action) => {
      const id = action.payload;

      // remove from list
      state.inbox = state.inbox.filter((m) => m.id !== id);

      // if currently opened mail is deleted, close it
      if (state.selected?.id === id) {
        state.selected = null;
      }
    });

    // ---- delete sent ----
    builder.addCase(deleteSentMail.fulfilled, (state, action) => {
      const id = action.payload;

      state.sent = state.sent.filter((m) => m.id !== id);

      if (state.selected?.id === id) {
        state.selected = null;
      }
    });
  },
});

export const { selectMail, clearSelected } = mailSlice.actions;
export default mailSlice.reducer;
