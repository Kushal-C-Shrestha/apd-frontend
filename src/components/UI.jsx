import React, { useState } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────
export const Icon = ({ name, size = 16 }) => {
    const paths = {
        parts:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
        vendor:   "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
        purchase: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
        dash:     "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
        plus:     "M12 4v16m8-8H4",
        edit:     "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
        trash:    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
        close:    "M6 18L18 6M6 6l12 12",
        search:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
        pkg:      "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10",
    };
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={paths[name]} />
        </svg>
    );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toasts({ toasts }) {
    return (
        <div className="toast-wrap">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    <span>{t.type === "success" ? "✓" : "✕"}</span>
                    {t.msg}
                </div>
            ))}
        </div>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, onSubmit, submitting, children, submitLabel = "Save" }) {
    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">{title}</span>
                    <button className="btn btn-icon btn-outline" onClick={onClose}>
                        <Icon name="close" />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={onSubmit} disabled={submitting}>
                        {submitting ? "Saving…" : submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Confirm Delete ───────────────────────────────────────────────────────────
export function ConfirmDelete({ label, onConfirm, onClose }) {
    const [busy, setBusy] = useState(false);
    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">Confirm Delete</span>
                    <button className="btn btn-icon btn-outline" onClick={onClose}>
                        <Icon name="close" />
                    </button>
                </div>
                <div className="modal-body">
                    <p style={{ fontSize: 14, color: "#1A2D45" }}>
                        Are you sure you want to delete <strong>{label}</strong>? This cannot be undone.
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn-danger" disabled={busy} onClick={async () => {
                        setBusy(true);
                        await onConfirm();
                        setBusy(false);
                    }}>
                        {busy ? "Deleting…" : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
