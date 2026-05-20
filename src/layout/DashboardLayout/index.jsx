import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Header from '@/components/Header'
import { useAuth } from '@/hooks'

const DashboardLayout = () => {
    const [collapsed, setCollapsed] = useState(false)
    const { user } = useAuth()
    const role = user?.role ?? 'Customer'

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
            <div
                className={`shrink-0 h-full overflow-hidden transition-[width] duration-300 ease-in-out ${
                    collapsed ? 'w-14' : 'w-60'
                }`}
            >
                <Navbar role={role} collapsed={collapsed} />
            </div>

            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                <Header role={role} collapsed={collapsed} onToggle={() => setCollapsed(prev => !prev)} />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout
