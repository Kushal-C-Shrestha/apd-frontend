import { NavLink } from 'react-router-dom'
import { LogOut, Car } from 'lucide-react'
import { NAV_GROUPS } from '@/data/navItems'
import useAuth from '@/hooks/useAuth'

const Navbar = ({ role = 'Admin', collapsed = false }) => {
    const groups = NAV_GROUPS[role] ?? []
    const { logout } = useAuth()

    return (
        <aside className="flex h-full w-full flex-col bg-[#0d1117] text-white border-r border-white/5 shrink-0">

            {/* Brand */}
            <div className="flex items-center px-2 py-3 border-b border-white/5 shrink-0">
                {/* Fixed-size logo container always centered */}
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600 shrink-0">
                    <Car size={18} className="text-white" />
                </div>
                {/* Brand name and role details slide out with max-width and opacity */}
                <div className={`flex flex-col leading-tight whitespace-nowrap overflow-hidden transition-[max-width,margin-left,opacity] duration-200 ease-out ${
                    collapsed ? 'ml-0 max-w-0 opacity-0' : 'ml-3 max-w-40 opacity-100'
                }`}>
                    <span className="text-sm font-semibold text-white">VehicleMgmt</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{role}</span>
                </div>
            </div>

            {/* Nav Groups */}
            <nav className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {groups.map(({ group, items }) => (
                    <div key={group} className="flex flex-col">
                        {/* Group label and divider container keeps spacing consistent */}
                        <div className="h-5 flex items-center mb-2 shrink-0 relative">
                            {/* Group name label */}
                            <span className={`text-[10px] text-slate-600 uppercase tracking-widest font-medium whitespace-nowrap transition-opacity duration-200 absolute left-0 ${
                                collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                            }`}>
                                {group}
                            </span>
                            {/* Group divider line */}
                            <div className={`w-full border-t border-white/5 transition-opacity duration-200 ${
                                collapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`} />
                        </div>

                        <div className="flex flex-col gap-1">
                            {items.map(({ label, path, icon: Icon }) => (
                                <NavLink
                                    key={path}
                                    to={path}
                                    title={collapsed ? label : undefined}
                                    className={({ isActive }) =>
                                        `group relative flex min-h-10 w-full items-center overflow-hidden rounded-lg whitespace-nowrap border px-0 text-[13px] transition-colors duration-200 ${
                                            isActive
                                                ? 'bg-indigo-600/20 text-indigo-400 font-medium border-indigo-500/20'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'
                                        }`
                                    }
                                >
                                    {/* Fixed-size icon container keeps icon alignment stable */}
                                    <div className="flex items-center justify-center w-10 h-10 shrink-0">
                                        <Icon size={18} />
                                    </div>
                                    <span className={`overflow-hidden leading-none transition-[max-width,margin-left,opacity] duration-200 ease-out ${
                                        collapsed ? 'ml-0 max-w-0 opacity-0' : 'ml-3 max-w-40 opacity-100'
                                    }`}>{label}</span>

                                    {/* Tooltip in collapsed mode */}
                                    {collapsed && (
                                        <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-slate-800 text-white text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl border border-white/10">
                                            {label}
                                        </span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-2 py-3 border-t border-white/5 shrink-0">
                <button
                    className="group relative flex min-h-10 w-full items-center overflow-hidden rounded-lg whitespace-nowrap border border-transparent px-0 text-[13px] text-slate-500 transition-colors duration-200 hover:bg-white/5 hover:text-slate-300"
                    onClick={logout}
                    title={collapsed ? 'Logout' : undefined}
                >
                    {/* Fixed-size container for logout icon */}
                    <div className="flex items-center justify-center w-10 h-10 shrink-0">
                        <LogOut size={16} />
                    </div>
                    <span className={`overflow-hidden leading-none transition-[max-width,margin-left,opacity] duration-200 ease-out ${
                        collapsed ? 'ml-0 max-w-0 opacity-0' : 'ml-3 max-w-40 opacity-100'
                    }`}>Logout</span>

                    {collapsed && (
                        <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-slate-800 text-white text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl border border-white/10">
                            Logout
                        </span>
                    )}
                </button>
            </div>
        </aside>
    )
}

export default Navbar