import React from "react";
import { fmt } from "../../utils/format";

export default function Dashboard({ parts, vendors, purchases }) {
    const totalStock = parts.reduce((s, p) => s + p.StockQuantity, 0);
    const lowStock   = parts.filter(p => p.StockQuantity < 10).length;
    const totalPurchaseVal = purchases.reduce((s, p) => s + p.TotalAmount, 0);

    const recentParts = [...parts]
        .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))
        .slice(0, 5);

    return (
        <div>
            <div className="stats-row">
                {[
                    { label: "Total Parts",      value: parts.length,                  sub: `${totalStock} units in stock`   },
                    { label: "Low Stock",         value: lowStock,                      sub: "items below 10 units"            },
                    { label: "Vendors",           value: vendors.length,                sub: "active suppliers"                },
                    { label: "Total Purchased",   value: `Rs. ${fmt(totalPurchaseVal)}`,sub: `${purchases.length} orders`     },
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
                        <thead>
                            <tr><th>Name</th><th>Price</th><th>Stock</th></tr>
                        </thead>
                        <tbody>
                            {recentParts.map(p => (
                                <tr key={p.PartId}>
                                    <td>{p.Name}</td>
                                    <td className="mono">Rs. {fmt(p.UnitPrice)}</td>
                                    <td>
                                        <span className={p.StockQuantity < 10 ? "stock-low" : "stock-ok"}>
                                            {p.StockQuantity}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {!recentParts.length && (
                                <tr><td colSpan={3} style={{ textAlign: "center", padding: 24, color: "#7A93B0" }}>No parts yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <div className="card-header"><span className="card-title">Top Vendors</span></div>
                    <table>
                        <thead>
                            <tr><th>Name</th><th>Phone</th><th>Orders</th></tr>
                        </thead>
                        <tbody>
                            {vendors.slice(0, 5).map(v => (
                                <tr key={v.VendorId}>
                                    <td>{v.Name}</td>
                                    <td className="text-muted mono">{v.Phone}</td>
                                    <td><span className="badge badge-blue">{v.TotalPurchases}</span></td>
                                </tr>
                            ))}
                            {!vendors.length && (
                                <tr><td colSpan={3} style={{ textAlign: "center", padding: 24, color: "#7A93B0" }}>No vendors yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
