import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import DashboardPage from '../pages/Dashboard/Dashboard'
import PartsPage from '../pages/Parts/Parts'
import VendorsPage from '../pages/Vendors/Vendors'

// AppRoutes wraps everything in the shared layout and passes shared state via context/props
// The state is lifted to App.jsx which is the single source of truth
import AppWithState from './AppWithState'

const AppRoutes = () => {
    return (
        <Router>
            <AppWithState />
        </Router>
    )
}

export default AppRoutes
