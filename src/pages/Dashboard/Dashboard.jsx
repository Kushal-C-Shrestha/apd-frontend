import React from "react";
import { fmt } from "../../utils/format";

function n(p) {
    return {
        partId:        p.partId        ?? p.PartId,
        name:          p.name          ?? p.Name          ?? "",
        unitPrice:     p.unitPrice     ?? p.UnitPrice      ?? 0,
        stockQuantity: p.stockQuantity ?? p.StockQuantity  ?? 0,
        createdAt:     p.createdAt     ?? p.CreatedAt,
    };
}
function nv(v) {
    return {
        vendorId:       v.vendorId       ?? v.VendorId,
        name:           v.name           ?? v.Name           ?? "",
        phone:          v.phone          ?? v.Phone          ?? "",
        totalPurchases: v.totalPurchases ?? v.TotalPurchases ?? 0,
    };
}
function np(p) {
    return {
        purchaseId:  p.purchaseId  ?? p.PurchaseId,
        totalAmount: p.totalAmount ?? p.TotalAmount ?? 0,
    };
}

export default function Dashboard({ parts, vendors, purchases }) {
    const ps = parts.map(n);
    const vs = vendors.map(nv);
    const pur = purchases.map(np);

    const totalStock       = ps.reduce((s, p) => s + p.stockQuantity, 0);
    const lowStock         = ps.filter(p => p.stockQuantity < 10).length;
    const totalPurchaseVal = pur.reduce((s, p) => s + p.totalAmount, 0);

    const recentParts = [...ps]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return (
        <div>
            <div className="stats-row">
                {[
                    { label: "Total Parts",     value: ps.length,                   sub: `${totalStock} units in stock`  },
                    { label: "Low Stock",        value: lowStock,                    sub: "items below 10 units"           },
                    { label: "Vendors",          value: vs.length,                   sub: "active suppliers"               },
                    { label: "Total Purchased",  value: `Rs. ${fmt(totalPurchaseVal)}`, sub: `${pur.length} orders`        },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-sub">{s.sub}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="card">
                    <div className="card-header"><span className="card-title">Recent Parts</span></div>
                    <table>
                        <thead><tr><th>Name</th><th>Price</th><th>Stock</th></tr></thead>
                        <tbody>
                            {recentParts.map(p => (
                                <tr key={p.partId}>
                                    <td>{p.name}</td>
                                    <td className="mono">Rs. {fmt(p.unitPrice)}</td>
                                    <td>
                                        <span className={p.stockQuantity < 10 ? "stock-low" : "stock-ok"}>
                                            {p.stockQuantity}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {!recentParts.length && (
                                <tr><td colSpan={3} style={{ textAlign: "center", padding: 24, color: "#7A93B0" }}>
                                    No parts yet
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <div className="card-header"><span className="card-title">Top Vendors</span></div>
                    <table>
                        <thead><tr><th>Name</th><th>Phone</th><th>Orders</th></tr></thead>
                        <tbody>
                            {vs.slice(0, 5).map(v => (
                                <tr key={v.vendorId}>
                                    <td>{v.name}</td>
                                    <td className="text-muted mono">{v.phone}</td>
                                    <td><span className="badge badge-blue">{v.totalPurchases}</span></td>
                                </tr>
                            ))}
                            {!vs.length && (
                                <tr><td colSpan={3} style={{ textAlign: "center", padding: 24, color: "#7A93B0" }}>
                                    No vendors yet
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
