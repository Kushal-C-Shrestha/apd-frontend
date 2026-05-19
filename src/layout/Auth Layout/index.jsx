import { Outlet } from 'react-router-dom'

const AuthLayout = () => (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
        {/* Left Pane - Empty for now */}
        <div className="hidden md:block md:w-1/2 bg-slate-100/50 border-r border-slate-200/60">
        </div>

        {/* Right Pane - Form container */}
        <div className="flex w-full md:w-1/2 flex-col justify-center overflow-y-auto px-6 py-12 sm:px-12 lg:px-20 bg-white">
            <div className="mx-auto w-full max-w-md md:max-w-lg">
                <Outlet />
            </div>
        </div>
    </div>
)

export default AuthLayout