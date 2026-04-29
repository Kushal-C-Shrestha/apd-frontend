import React, { useState } from "react";
import api from "../../services/api";
import { fmt } from "../../utils/format";
import { Icon, Modal, ConfirmDelete } from "../../components/UI";

export default function PartsPage({ parts, setParts, vendors, purchases, setPurchases, toast }) {
    const [tab, setTab]               = useState("inventory");
    const [search, setSearch]         = useState("");
    const [modal, setModal]           = useState(null);   // null | "create" | {type:"edit",id} | "purchase"
    const [confirm, setConfirm]       = useState(null);
    const [form, setForm]             = useState({});
    const [purchaseForm, setPurchaseForm] = useState({
        vendorId: "",
        items: [{ partId: "", quantity: 1, unitCost: "" }],
    });
    const [busy, setBusy] = useState(false);

    const filtered = parts.filter(p =>
        p.Name.toLowerCase().includes(search.toLowerCase())
    );

    function openCreate() {
        setForm({ name: "", description: "", unitPrice: "", stockQuantity: "" });
        setModal("create");
    }

    function openEdit(p) {
        setForm({
            name:          p.Name,
            description:   p.Description || "",
            unitPrice:     p.UnitPrice,
            stockQuantity: p.StockQuantity,
        });
        setModal({ type: "edit", id: p.PartId });
    }

    async function saveCreate() {
        setBusy(true);
        try {
            const { data } = await api.post("/parts", {
                Name:          form.name,
                Description:   form.description,
                UnitPrice:     parseFloat(form.unitPrice),
                StockQuantity: parseInt(form.stockQuantity),
            });
            setParts(prev => [...prev, data]);
            setModal(null);
            toast("Part created successfully");
        } catch (e) {
            toast(e.response?.data?.message || e.message, "error");
        }
        setBusy(false);
    }

    async function saveEdit() {
        setBusy(true);
        try {
            const { data } = await api.put(`/parts/${modal.id}`, {
                Name:          form.name,
                Description:   form.description,
                UnitPrice:     parseFloat(form.unitPrice),
                StockQuantity: parseInt(form.stockQuantity),
            });
            setParts(prev => prev.map(x => x.PartId === modal.id ? data : x));
            setModal(null);
            toast("Part updated");
        } catch (e) {
            toast(e.response?.data?.message || e.message, "error");
        }
        setBusy(false);
    }

    async function deletePart(id) {
        try {
            await api.delete(`/parts/${id}`);
            setParts(prev => prev.filter(x => x.PartId !== id));
            setConfirm(null);
            toast("Part deleted");
        } catch (e) {
            toast(e.response?.data?.message || e.message, "error");
            setConfirm(null);
        }
    }

    function addItem()  { setPurchaseForm(f => ({ ...f, items: [...f.items, { partId: "", quantity: 1, unitCost: "" }] })); }
    function removeItem(i) { setPurchaseForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) })); }
    function updateItem(i, field, val) {
        setPurchaseForm(f => {
            const items = [...f.items];
            items[i] = { ...items[i], [field]: val };
            return { ...f, items };
        });
    }

    async function savePurchase() {
        setBusy(true);
        try {
            const body = {
                VendorId: parseInt(purchaseForm.vendorId),
                Items: purchaseForm.items.map(it => ({
                    PartId:   parseInt(it.partId),
                    Quantity: parseInt(it.quantity),
                    UnitCost: parseFloat(it.unitCost),
                })),
            };
            const { data } = await api.post("/parts/purchases", body);
            setPurchases(prev => [data, ...prev]);
            data.Items.forEach(item => {
                setParts(prev => prev.map(pt =>
                    pt.PartId === item.PartId
                        ? { ...pt, StockQuantity: pt.StockQuantity + item.Quantity }
                        : pt
                ));
            });
            setPurchaseForm({ vendorId: "", items: [{ partId: "", quantity: 1, unitCost: "" }] });
            setModal(null);
            toast("Purchase recorded & stock updated");
        } catch (e) {
            toast(e.response?.data?.message || e.message, "error");
        }
        setBusy(false);
    }

    const purchaseTotal = purchaseForm.items.reduce(
        (s, it) => s + (parseFloat(it.quantity) || 0) * (parseFloat(it.unitCost) || 0),
        0
    );

    return (
        <div>
            <div className="tabs">
                {["inventory", "purchases"].map(t => (
                    <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                        {t === "inventory" ? "Inventory" : "Purchase History"}
                    </button>
                ))}
            </div>

            {tab === "inventory" && (
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Parts Inventory</span>
                        <div className="flex gap-2">
                            <div className="search-wrap">
                                <span className="search-icon"><Icon name="search" size={14} /></span>
                                <input placeholder="Search parts…" value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <button className="btn btn-outline btn-sm" onClick={() => setModal("purchase")}>
                                <Icon name="pkg" size={14} />New Purchase
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={openCreate}>
                                <Icon name="plus" size={14} />Add Part
                            </button>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr><th>Part Name</th><th>Description</th><th>Unit Price</th><th>Stock</th><th>Added</th><th></th></tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.PartId}>
                                    <td style={{ fontWeight: 500 }}>{p.Name}</td>
                                    <td className="text-muted" style={{ fontSize: 13 }}>{p.Description || "—"}</td>
                                    <td className="mono">Rs. {fmt(p.UnitPrice)}</td>
                                    <td>
                                        <span className={p.StockQuantity < 10 ? "badge badge-red" : "badge badge-green"}>
                                            {p.StockQuantity}{p.StockQuantity < 10 ? " LOW" : ""}
                                        </span>
                                    </td>
                                    <td className="text-muted" style={{ fontSize: 12 }}>
                                        {new Date(p.CreatedAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn btn-icon btn-outline" onClick={() => openEdit(p)}>
                                                <Icon name="edit" size={14} />
                                            </button>
                                            <button className="btn btn-icon btn-danger"
                                                onClick={() => setConfirm({ id: p.PartId, name: p.Name })}>
                                                <Icon name="trash" size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!filtered.length && (
                                <tr><td colSpan={6}>
                                    <div className="empty">
                                        <div className="empty-icon">📦</div>
                                        <div className="empty-text">No parts found</div>
                                        <div className="empty-sub">Add your first part to get started</div>
                                    </div>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === "purchases" && (
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Purchase History</span>
                        <button className="btn btn-primary btn-sm" onClick={() => setModal("purchase")}>
                            <Icon name="plus" size={14} />New Purchase
                        </button>
                    </div>
                    <table>
                        <thead>
                            <tr><th>#</th><th>Vendor</th><th>Items</th><th>Total</th><th>Date</th></tr>
                        </thead>
                        <tbody>
                            {purchases.map(p => (
                                <tr key={p.PurchaseId}>
                                    <td className="mono text-muted">#{p.PurchaseId}</td>
                                    <td style={{ fontWeight: 500 }}>{p.VendorName}</td>
                                    <td><span className="badge badge-blue">{p.Items?.length ?? 0} items</span></td>
                                    <td className="mono">Rs. {fmt(p.TotalAmount)}</td>
                                    <td className="text-muted" style={{ fontSize: 12 }}>
                                        {new Date(p.CreatedAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {!purchases.length && (
                                <tr><td colSpan={5}>
                                    <div className="empty">
                                        <div className="empty-icon">🧾</div>
                                        <div className="empty-text">No purchases yet</div>
                                    </div>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {(modal === "create" || (modal && modal.type === "edit")) && (
                <Modal
                    title={modal === "create" ? "Add New Part" : "Edit Part"}
                    onClose={() => setModal(null)}
                    onSubmit={modal === "create" ? saveCreate : saveEdit}
                    submitting={busy}
                >
                    <div className="field">
                        <label>Part Name *</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Brake Pad" />
                    </div>
                    <div className="field">
                        <label>Description</label>
                        <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
                    </div>
                    <div className="field-row">
                        <div className="field">
                            <label>Unit Price (Rs.) *</label>
                            <input type="number" min="0" step="0.01" value={form.unitPrice}
                                onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))} placeholder="0.00" />
                        </div>
                        <div className="field">
                            <label>Stock Quantity *</label>
                            <input type="number" min="0" value={form.stockQuantity}
                                onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))} placeholder="0" />
                        </div>
                    </div>
                </Modal>
            )}

            {modal === "purchase" && (
                <Modal title="Record Purchase" onClose={() => setModal(null)}
                    onSubmit={savePurchase} submitting={busy} submitLabel="Record Purchase">
                    <div className="field">
                        <label>Vendor *</label>
                        <select value={purchaseForm.vendorId}
                            onChange={e => setPurchaseForm(f => ({ ...f, vendorId: e.target.value }))}>
                            <option value="">Select vendor…</option>
                            {vendors.map(v => <option key={v.VendorId} value={v.VendorId}>{v.Name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#7A93B0", display: "block", marginBottom: 8 }}>
                            Items
                        </label>
                        {purchaseForm.items.map((item, i) => (
                            <div key={i} className="item-row" style={{ marginBottom: 8 }}>
                                <div className="field">
                                    {i === 0 && <label>Part</label>}
                                    <select value={item.partId} onChange={e => updateItem(i, "partId", e.target.value)}>
                                        <option value="">Select part…</option>
                                        {parts.map(p => <option key={p.PartId} value={p.PartId}>{p.Name}</option>)}
                                    </select>
                                </div>
                                <div className="field">
                                    {i === 0 && <label>Qty</label>}
                                    <input type="number" min="1" value={item.quantity}
                                        onChange={e => updateItem(i, "quantity", e.target.value)} />
                                </div>
                                <div className="field">
                                    {i === 0 && <label>Unit Cost</label>}
                                    <input type="number" min="0" step="0.01" placeholder="0.00" value={item.unitCost}
                                        onChange={e => updateItem(i, "unitCost", e.target.value)} />
                                </div>
                                <button className="btn btn-icon btn-danger"
                                    style={{ marginTop: i === 0 ? 20 : 0 }}
                                    onClick={() => removeItem(i)}
                                    disabled={purchaseForm.items.length === 1}>
                                    <Icon name="close" size={12} />
                                </button>
                            </div>
                        ))}
                        <button className="btn btn-outline btn-sm" style={{ marginTop: 4 }} onClick={addItem}>
                            <Icon name="plus" size={12} />Add Item
                        </button>
                    </div>

                    {purchaseTotal > 0 && (
                        <div style={{ background: "#F4F8FD", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                            Total: <strong className="mono">Rs. {fmt(purchaseTotal)}</strong>
                        </div>
                    )}
                </Modal>
            )}

            {confirm && (
                <ConfirmDelete
                    label={confirm.name}
                    onClose={() => setConfirm(null)}
                    onConfirm={() => deletePart(confirm.id)}
                />
            )}
        </div>
    );
}
