import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { Home } from '../pages'
import CustomerRegister from '../pages/Staff/CustomerRegister'

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register-customer" element={<CustomerRegister />} />
            </Routes>
        </Router>
    )
}

export default AppRoutes