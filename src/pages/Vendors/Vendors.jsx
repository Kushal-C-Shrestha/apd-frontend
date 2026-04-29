import React, { useState } from "react";
import api from "../../services/api";
import { Icon, Modal, ConfirmDelete } from "../../components/UI";

export default function VendorsPage({ vendors, setVendors, toast }) {
    const [search, setSearch]   = useState("");
    const [modal, setModal]     = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [form, setForm]       = useState({});
    const [busy, setBusy]       = useState(false);

    const filtered = vendors.filter(v =>
        v.Name.toLowerCase().includes(search.toLowerCase()) ||
        (v.Email || "").toLowerCase().includes(search.toLowerCase())
    );

    function openCreate() {
        setForm({ name: "", phone: "", email: "", address: "" });
        setModal("create");
    }

    function openEdit(v) {
        setForm({ name: v.Name, phone: v.Phone, email: v.Email || "", address: v.Address || "" });
        setModal({ type: "edit", id: v.VendorId });
    }

    async function saveCreate() {
        setBusy(true);
        try {
            const { data } = await api.post("/vendors", {
                Name:    form.name,
                Phone:   form.phone,
                Email:   form.email,
                Address: form.address,
            });
            setVendors(prev => [...prev, data]);
            setModal(null);
            toast("Vendor added");
        } catch (e) {
            toast(e.response?.data?.message || e.message, "error");
        }
        setBusy(false);
    }

    async function saveEdit() {
        setBusy(true);
        try {
            const { data } = await api.put(`/vendors/${modal.id}`, {
                Name:    form.name,
                Phone:   form.phone,
                Email:   form.email,
                Address: form.address,
            });
            setVendors(prev => prev.map(x => x.VendorId === modal.id ? data : x));
            setModal(null);
            toast("Vendor updated");
        } catch (e) {
            toast(e.response?.data?.message || e.message, "error");
        }
        setBusy(false);
    }

    async function deleteVendor(id) {
        try {
            await api.delete(`/vendors/${id}`);
            setVendors(prev => prev.filter(x => x.VendorId !== id));
            setConfirm(null);
            toast("Vendor deleted");
        } catch (e) {
            toast(e.response?.data?.message || e.message, "error");
            setConfirm(null);
        }
    }

    const VendorForm = () => (
        <>
            <div className="field">
                <label>Vendor Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Nepal Auto Supplies" />
            </div>
            <div className="field-row">
                <div className="field">
                    <label>Phone *</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="e.g. 9841000000" />
                </div>
                <div className="field">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="vendor@example.com" />
                </div>
            </div>
            <div className="field">
                <label>Address</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Kathmandu, Nepal" />
            </div>
        </>
    );

    return (
        <div>
            <div className="card">
                <div className="card-header">
                    <span className="card-title">Vendor Directory</span>
                    <div className="flex gap-2">
                        <div className="search-wrap">
                            <span className="search-icon"><Icon name="search" size={14} /></span>
                            <input placeholder="Search vendors…" value={search}
                                onChange={e => setSearch(e.target.value)} />
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={openCreate}>
                            <Icon name="plus" size={14} />Add Vendor
                        </button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Orders</th><th>Since</th><th></th></tr>
                    </thead>
                    <tbody>
                        {filtered.map(v => (
                            <tr key={v.VendorId}>
                                <td style={{ fontWeight: 500 }}>{v.Name}</td>
                                <td className="mono text-muted">{v.Phone}</td>
                                <td className="text-muted" style={{ fontSize: 13 }}>{v.Email || "—"}</td>
                                <td className="text-muted" style={{ fontSize: 13 }}>{v.Address || "—"}</td>
                                <td><span className="badge badge-blue">{v.TotalPurchases}</span></td>
                                <td className="text-muted" style={{ fontSize: 12 }}>
                                    {new Date(v.CreatedAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button className="btn btn-icon btn-outline" onClick={() => openEdit(v)}>
                                            <Icon name="edit" size={14} />
                                        </button>
                                        <button className="btn btn-icon btn-danger"
                                            onClick={() => setConfirm({ id: v.VendorId, name: v.Name })}>
                                            <Icon name="trash" size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!filtered.length && (
                            <tr><td colSpan={7}>
                                <div className="empty">
                                    <div className="empty-icon">🏪</div>
                                    <div className="empty-text">No vendors found</div>
                                    <div className="empty-sub">Add your first vendor to start recording purchases</div>
                                </div>
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modal === "create" && (
                <Modal title="Add Vendor" onClose={() => setModal(null)} onSubmit={saveCreate} submitting={busy}>
                    <VendorForm />
                </Modal>
            )}
            {modal?.type === "edit" && (
                <Modal title="Edit Vendor" onClose={() => setModal(null)} onSubmit={saveEdit} submitting={busy}>
                    <VendorForm />
                </Modal>
            )}
            {confirm && (
                <ConfirmDelete
                    label={confirm.name}
                    onClose={() => setConfirm(null)}
                    onConfirm={() => deleteVendor(confirm.id)}
                />
            )}
        </div>
    );
}
