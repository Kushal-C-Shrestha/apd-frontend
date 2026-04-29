import React, { useState } from "react";
import api from "../../services/api";
import { fmt } from "../../utils/format";
import { Icon, Modal, ConfirmDelete } from "../../components/UI";

function normalizePart(p) {
    return {
        partId:        p.partId        ?? p.PartId,
        name:          p.name          ?? p.Name          ?? "",
        description:   p.description   ?? p.Description   ?? "",
        unitPrice:     p.unitPrice     ?? p.UnitPrice      ?? 0,
        stockQuantity: p.stockQuantity ?? p.StockQuantity  ?? 0,
        createdAt:     p.createdAt     ?? p.CreatedAt,
    };
}

function normalizePurchase(p) {
    return {
        purchaseId:  p.purchaseId  ?? p.PurchaseId,
        vendorId:    p.vendorId    ?? p.VendorId,
        vendorName:  p.vendorName  ?? p.VendorName  ?? "",
        totalAmount: p.totalAmount ?? p.TotalAmount  ?? 0,
        createdAt:   p.createdAt   ?? p.CreatedAt,
        items:       (p.items      ?? p.Items        ?? []).map(i => ({
            purchaseItemId: i.purchaseItemId ?? i.PurchaseItemId,
            partId:         i.partId         ?? i.PartId,
            quantity:       i.quantity       ?? i.Quantity       ?? 0,
            unitCost:       i.unitCost       ?? i.UnitCost       ?? 0,
        })),
    };
}

function normalizeVendor(v) {
    return {
        vendorId: v.vendorId ?? v.VendorId,
        name:     v.name     ?? v.Name     ?? "",
    };
}

export default function PartsPage({ parts, setParts, vendors, purchases, setPurchases, toast }) {
    const [tab, setTab]       = useState("inventory");
    const [search, setSearch] = useState("");
    const [modal, setModal]   = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [form, setForm]     = useState({});
    const [purchaseForm, setPurchaseForm] = useState({
        vendorId: "",
        items: [{ partId: "", quantity: 1, unitCost: "" }],
    });
    const [busy, setBusy] = useState(false);

    const normalizedParts     = parts.map(normalizePart);
    const normalizedPurchases = purchases.map(normalizePurchase);
    const normalizedVendors   = vendors.map(normalizeVendor);

    const filtered = normalizedParts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    function openCreate() {
        setForm({ name: "", description: "", unitPrice: "", stockQuantity: "" });
        setModal("create");
    }

    function openEdit(p) {
        setForm({
            name:          p.name,
            description:   p.description,
            unitPrice:     p.unitPrice,
            stockQuantity: p.stockQuantity,
        });
        setModal({ type: "edit", id: p.partId });
    }

    async function saveCreate() {
        setBusy(true);
        try {
            const { data } = await api.post("/parts", {
                name:          form.name,
                description:   form.description,
                unitPrice:     parseFloat(form.unitPrice),
                stockQuantity: parseInt(form.stockQuantity),
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
                name:          form.name,
                description:   form.description,
                unitPrice:     parseFloat(form.unitPrice),
                stockQuantity: parseInt(form.stockQuantity),
            });
            setParts(prev => prev.map(x =>
                (x.partId ?? x.PartId) === modal.id ? data : x
            ));
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
            setParts(prev => prev.filter(x => (x.partId ?? x.PartId) !== id));
            setConfirm(null);
            toast("Part deleted");
        } catch (e) {
            toast(e.response?.data?.message || e.message, "error");
            setConfirm(null);
        }
    }

    function addItem() {
        setPurchaseForm(f => ({ ...f, items: [...f.items, { partId: "", quantity: 1, unitCost: "" }] }));
    }
    function removeItem(i) {
        setPurchaseForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
    }
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
                vendorId: parseInt(purchaseForm.vendorId),
                items: purchaseForm.items.map(it => ({
                    partId:   parseInt(it.partId),
                    quantity: parseInt(it.quantity),
                    unitCost: parseFloat(it.unitCost),
                })),
            };
            const { data } = await api.post("/parts/purchases", body);
            const normalized = normalizePurchase(data);
            setPurchases(prev => [data, ...prev]);
            normalized.items.forEach(item => {
                setParts(prev => prev.map(pt => {
                    const ptId = pt.partId ?? pt.PartId;
                    if (ptId !== item.partId) return pt;
                    return pt.partId !== undefined
                        ? { ...pt, stockQuantity: (pt.stockQuantity ?? 0) + item.quantity }
                        : { ...pt, StockQuantity: (pt.StockQuantity ?? 0) + item.quantity };
                }));
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
            {/* Tabs */}
            <div className="tabs">
                {["inventory", "purchases"].map(t => (
                    <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                        {t === "inventory" ? "Inventory" : "Purchase History"}
                    </button>
                ))}
            </div>

            {/* ── Inventory tab ── */}
            {tab === "inventory" && (
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Parts Inventory</span>
                        <div className="flex gap-2">
                            <div className="search-wrap">
                                <span className="search-icon"><Icon name="search" size={14} /></span>
                                <input
                                    id="parts-search"
                                    name="partsSearch"
                                    autoComplete="off"
                                    placeholder="Search parts…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
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
                            <tr>
                                <th>Part Name</th><th>Description</th><th>Unit Price</th>
                                <th>Stock</th><th>Added</th><th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.partId}>
                                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                                    <td className="text-muted" style={{ fontSize: 13 }}>{p.description || "—"}</td>
                                    <td className="mono">Rs. {fmt(p.unitPrice)}</td>
                                    <td>
                                        <span className={p.stockQuantity < 10 ? "badge badge-red" : "badge badge-green"}>
                                            {p.stockQuantity}{p.stockQuantity < 10 ? " LOW" : ""}
                                        </span>
                                    </td>
                                    <td className="text-muted" style={{ fontSize: 12 }}>
                                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn btn-icon btn-outline" onClick={() => openEdit(p)}>
                                                <Icon name="edit" size={14} />
                                            </button>
                                            <button className="btn btn-icon btn-danger"
                                                onClick={() => setConfirm({ id: p.partId, name: p.name })}>
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

            {/* ── Purchases tab ── */}
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
                            {normalizedPurchases.map(p => (
                                <tr key={p.purchaseId}>
                                    <td className="mono text-muted">#{p.purchaseId}</td>
                                    <td style={{ fontWeight: 500 }}>{p.vendorName}</td>
                                    <td><span className="badge badge-blue">{p.items.length} items</span></td>
                                    <td className="mono">Rs. {fmt(p.totalAmount)}</td>
                                    <td className="text-muted" style={{ fontSize: 12 }}>
                                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                                    </td>
                                </tr>
                            ))}
                            {!normalizedPurchases.length && (
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

            {/* ── Create / Edit Part Modal ── */}
            {(modal === "create" || modal?.type === "edit") && (
                <Modal
                    title={modal === "create" ? "Add New Part" : "Edit Part"}
                    onClose={() => setModal(null)}
                    onSubmit={modal === "create" ? saveCreate : saveEdit}
                    submitting={busy}
                >
                    <div className="field">
                        <label htmlFor="part-name">Part Name *</label>
                        <input
                            id="part-name"
                            name="partName"
                            autoComplete="off"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. Brake Pad"
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="part-description">Description</label>
                        <input
                            id="part-description"
                            name="partDescription"
                            autoComplete="off"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Optional description"
                        />
                    </div>
                    <div className="field-row">
                        <div className="field">
                            <label htmlFor="part-price">Unit Price (Rs.) *</label>
                            <input
                                id="part-price"
                                name="partPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                autoComplete="off"
                                value={form.unitPrice}
                                onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="part-stock">Stock Quantity *</label>
                            <input
                                id="part-stock"
                                name="partStock"
                                type="number"
                                min="0"
                                autoComplete="off"
                                value={form.stockQuantity}
                                onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))}
                                placeholder="0"
                            />
                        </div>
                    </div>
                </Modal>
            )}

            {/* ── Purchase Modal ── */}
            {modal === "purchase" && (
                <Modal
                    title="Record Purchase"
                    onClose={() => setModal(null)}
                    onSubmit={savePurchase}
                    submitting={busy}
                    submitLabel="Record Purchase"
                >
                    <div className="field">
                        <label htmlFor="purchase-vendor">Vendor *</label>
                        <select
                            id="purchase-vendor"
                            name="purchaseVendor"
                            value={purchaseForm.vendorId}
                            onChange={e => setPurchaseForm(f => ({ ...f, vendorId: e.target.value }))}
                        >
                            <option value="">Select vendor…</option>
                            {normalizedVendors.map(v => (
                                <option key={v.vendorId} value={v.vendorId}>{v.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#7A93B0", marginBottom: 8 }}>
                            Items
                        </p>
                        {purchaseForm.items.map((item, i) => (
                            <div key={i} className="item-row" style={{ marginBottom: 8 }}>
                                <div className="field">
                                    {i === 0 && <label htmlFor={`item-part-${i}`}>Part</label>}
                                    <select
                                        id={`item-part-${i}`}
                                        name={`itemPart${i}`}
                                        value={item.partId}
                                        onChange={e => updateItem(i, "partId", e.target.value)}
                                    >
                                        <option value="">Select part…</option>
                                        {normalizedParts.map(p => (
                                            <option key={p.partId} value={p.partId}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="field">
                                    {i === 0 && <label htmlFor={`item-qty-${i}`}>Qty</label>}
                                    <input
                                        id={`item-qty-${i}`}
                                        name={`itemQty${i}`}
                                        type="number"
                                        min="1"
                                        autoComplete="off"
                                        value={item.quantity}
                                        onChange={e => updateItem(i, "quantity", e.target.value)}
                                    />
                                </div>
                                <div className="field">
                                    {i === 0 && <label htmlFor={`item-cost-${i}`}>Unit Cost</label>}
                                    <input
                                        id={`item-cost-${i}`}
                                        name={`itemCost${i}`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        autoComplete="off"
                                        placeholder="0.00"
                                        value={item.unitCost}
                                        onChange={e => updateItem(i, "unitCost", e.target.value)}
                                    />
                                </div>
                                <button
                                    className="btn btn-icon btn-danger"
                                    style={{ marginTop: i === 0 ? 20 : 0 }}
                                    onClick={() => removeItem(i)}
                                    disabled={purchaseForm.items.length === 1}
                                >
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

            {/* ── Confirm Delete ── */}
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
