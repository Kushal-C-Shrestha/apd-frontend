import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Icon } from "../UI";

const BLUE = {
    50:  "#E6F1FB",
    100: "#B5D4F4",
    200: "#85B7EB",
    400: "#378ADD",
    600: "#185FA5",
    800: "#0C447C",
    900: "#042C53",
};

const NAV = [
    { to: "/",        label: "Dashboard", icon: "dash",    group: "Overview"   },
    { to: "/parts",   label: "Parts",     icon: "parts",   group: "Inventory"  },
    { to: "/vendors", label: "Vendors",   icon: "vendor",  group: "Inventory"  },
];

const PAGE_TITLES = {
    "/":        "Dashboard",
    "/parts":   "Parts Management",
    "/vendors": "Vendor Management",
};

export default function Layout({ children }) {
    const { pathname } = useLocation();
    const groups = [...new Set(NAV.map(n => n.group))];

    return (
        <div className="layout">
            <nav className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-mark">
                        <div className="logo-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <div>
                            <div className="logo-text">APD System</div>
                            <div className="logo-sub">Auto Parts Dealership</div>
                        </div>
                    </div>
                </div>
                <div className="sidebar-nav">
                    {groups.map(g => (
                        <div key={g}>
                            <div className="nav-label">{g}</div>
                            {NAV.filter(n => n.group === g).map(n => (
                                <NavLink
                                    key={n.to}
                                    to={n.to}
                                    end={n.to === "/"}
                                    className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                                >
                                    <span className="nav-icon"><Icon name={n.icon} size={15} /></span>
                                    {n.label}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </div>
            </nav>

            <div className="main">
                <div className="topbar">
                    <span className="page-title">{PAGE_TITLES[pathname] ?? "APD System"}</span>
                    <div className="topbar-right">
                        <span className="admin-badge">Admin</span>
                    </div>
                </div>
                <div className="content">{children}</div>
            </div>
        </div>
    );
}
