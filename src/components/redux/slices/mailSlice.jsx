import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { firebaseDb } from "../../../firebase";
import { emailToKey } from "../../utilities/emailToKey";

const makeId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

/* ========================= SEND MAIL ========================= */
export const sendMail = createAsyncThunk(
  "mail/sendMail",
  async ({ fromEmail, toEmail, subject, html }, { rejectWithValue }) => {
    try {
      const fromKey = emailToKey(fromEmail);
      const toKey = emailToKey(toEmail);
      const messageId = makeId();

      const mail = {
        id: messageId,
        from: fromEmail,
        to: toEmail,
        subject: subject || "(no subject)",
        html,
        createdAt: Date.now(),
        read: false,
      };

      await Promise.all([
        firebaseDb.put(`/mailboxes/${toKey}/inbox/${messageId}.json`, mail),
        firebaseDb.put(`/mailboxes/${fromKey}/sent/${messageId}.json`, mail),
      ]);

      return mail;
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to send mail");
    }
  }
);

/* ========================= FETCH INBOX ========================= */
export const fetchInbox = createAsyncThunk(
  "mail/fetchInbox",
  async ({ userEmail }, { rejectWithValue }) => {
    try {
      const key = emailToKey(userEmail);
      const res = await firebaseDb.get(`/mailboxes/${key}/inbox.json`);
      const data = res.data || {};
      return Object.values(data).sort((a, b) => b.createdAt - a.createdAt);
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to load inbox");
    }
  }
);

/* ========================= FETCH SENT ========================= */
export const fetchSent = createAsyncThunk(
  "mail/fetchSent",
  async ({ userEmail }, { rejectWithValue }) => {
    try {
      const key = emailToKey(userEmail);
      const res = await firebaseDb.get(`/mailboxes/${key}/sent.json`);
      const data = res.data || {};
      return Object.values(data).sort((a, b) => b.createdAt - a.createdAt);
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to load sent");
    }
  }
);

/* ========================= MARK READ ========================= */
export const markRead = createAsyncThunk(
  "mail/markRead",
  async ({ userEmail, mailId }, { rejectWithValue }) => {
    try {
      const key = emailToKey(userEmail);
      await firebaseDb.patch(`/mailboxes/${key}/inbox/${mailId}.json`, {
        read: true,
      });
      return mailId;
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to mark as read");
    }
  }
);

/* ========================= DELETE INBOX ========================= */
export const deleteInboxMail = createAsyncThunk(
  "mail/deleteInboxMail",
  async ({ userEmail, mailId }, { rejectWithValue }) => {
    try {
      const key = emailToKey(userEmail);
      await firebaseDb.delete(`/mailboxes/${key}/inbox/${mailId}.json`);
      return mailId;
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to delete inbox mail");
    }
  }
);

/* ========================= DELETE SENT ========================= */
export const deleteSentMail = createAsyncThunk(
  "mail/deleteSentMail",
  async ({ userEmail, mailId }, { rejectWithValue }) => {
    try {
      const key = emailToKey(userEmail);
      await firebaseDb.delete(`/mailboxes/${key}/sent/${mailId}.json`);
      return mailId;
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to delete sent mail");
    }
  }
);

/* ========================= SLICE ========================= */
const mailSlice = createSlice({
  name: "mail",
  initialState: {
    sending: false,
    loadingInbox: false,
    loadingSent: false,       // ✅ added: track sent fetch state
    inbox: [],
    sent: [],
    selected: null,
    error: null,
    sentError: null,          // ✅ added: separate error for sent
    lastInboxHash: null,
  },

  reducers: {
    selectMail: (state, action) => {
      state.selected = action.payload;
    },
    clearSelected: (state) => {
      state.selected = null;
    },
    // ✅ added: lets components clear errors after showing them
    clearError: (state) => {
      state.error = null;
      state.sentError = null;
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

        const nextHash = action.payload
          .map((m) => `${m.id}:${m.read ? 1 : 0}:${m.createdAt}`)
          .join("|");

        if (state.lastInboxHash === nextHash) return;

        state.lastInboxHash = nextHash;
        state.inbox = action.payload;

        // keep selected mail in sync if inbox refreshes
        if (state.selected?.id) {
          const updated = action.payload.find((m) => m.id === state.selected.id);
          //  if selected mail no longer exists in inbox (e.g. deleted elsewhere), clear it
          state.selected = updated ?? null;
        }
      })
      .addCase(fetchInbox.rejected, (state, action) => {
        state.loadingInbox = false;
        state.error = action.payload;
      })

      /* ---- fetch sent ---- */
      .addCase(fetchSent.pending, (state) => {         //  added
        if (state.sent.length === 0) state.loadingSent = true;
        state.sentError = null;
      })
      .addCase(fetchSent.fulfilled, (state, action) => {
        state.loadingSent = false;                     //  added
        state.sent = action.payload;
      })
      .addCase(fetchSent.rejected, (state, action) => { //  added
        state.loadingSent = false;
        state.sentError = action.payload;
      })

      /* ---- mark read ---- */
      .addCase(markRead.fulfilled, (state, action) => {
        const id = action.payload;
        const mail = state.inbox.find((m) => m.id === id);
        if (mail) mail.read = true;
        if (state.selected?.id === id) state.selected.read = true;
      })

      /* ---- delete inbox ---- */
      .addCase(deleteInboxMail.fulfilled, (state, action) => {
        const id = action.payload;
        state.inbox = state.inbox.filter((m) => m.id !== id);
        if (state.selected?.id === id) state.selected = null;
      })

      /* ---- delete sent ---- */
      .addCase(deleteSentMail.fulfilled, (state, action) => {
        const id = action.payload;
        state.sent = state.sent.filter((m) => m.id !== id);
        if (state.selected?.id === id) state.selected = null;
      });
  },
});

export const { selectMail, clearSelected, clearError } = mailSlice.actions;
export default mailSlice.reducer;