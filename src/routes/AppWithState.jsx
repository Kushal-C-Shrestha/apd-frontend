import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import api from '../services/api'
import Layout from '../components/Layout/Layout'
import Dashboard from '../pages/Dashboard/Dashboard'
import PartsPage from '../pages/Parts/Parts'
import VendorsPage from '../pages/Vendors/Vendors'
import { Toasts } from '../components/UI'
import { useToast } from '../hooks/useToast'

function toArray(data) {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (Array.isArray(data.$values)) return data.$values
    if (Array.isArray(data.value)) return data.value
    if (Array.isArray(data.data)) return data.data
    // Single object returned instead of array
    if (typeof data === 'object') return [data]
    return []
}

export default function AppWithState() {
    const [parts, setParts]         = useState([])
    const [vendors, setVendors]     = useState([])
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading]     = useState(true)
    const { toasts, toast }         = useToast()

    useEffect(() => {
        async function loadAll() {
            setLoading(true)
            try {
                const [partsRes, vendorsRes, purchasesRes] = await Promise.all([
                    api.get('/parts'),
                    api.get('/vendors'),
                    api.get('/parts/purchases'),
                ])
                setParts(toArray(partsRes.data))
                setVendors(toArray(vendorsRes.data))
                setPurchases(toArray(purchasesRes.data))
            } catch (err) {
                console.warn('API unavailable, using demo data:', err.message)
                setParts([
                    { partId: 1, name: "Brake Pad",         description: "Front disc brake pad",           unitPrice: 1200, stockQuantity: 45,  createdAt: new Date().toISOString() },
                    { partId: 2, name: "Engine Oil Filter",  description: "Compatible with Honda & Toyota", unitPrice: 350,  stockQuantity: 8,   createdAt: new Date().toISOString() },
                    { partId: 3, name: "Spark Plug",         description: "NGK standard",                  unitPrice: 180,  stockQuantity: 120, createdAt: new Date().toISOString() },
                    { partId: 4, name: "Air Filter",         description: "Universal fit",                 unitPrice: 450,  stockQuantity: 5,   createdAt: new Date().toISOString() },
                    { partId: 5, name: "Clutch Plate",       description: "Heavy duty",                    unitPrice: 3200, stockQuantity: 22,  createdAt: new Date().toISOString() },
                ])
                setVendors([
                    { vendorId: 1, name: "Nepal Auto Supplies", phone: "9841123456", email: "sales@nepalauto.com",    address: "Kalanki, Kathmandu",   createdAt: new Date().toISOString(), totalPurchases: 12 },
                    { vendorId: 2, name: "Himalaya Parts Co.",  phone: "9851234567", email: "info@himalayaparts.com", address: "Baneshwor, Kathmandu", createdAt: new Date().toISOString(), totalPurchases: 7  },
                    { vendorId: 3, name: "Pokhara Motors Ltd.", phone: "9806543210", email: "",                       address: "Lakeside, Pokhara",    createdAt: new Date().toISOString(), totalPurchases: 3  },
                ])
                setPurchases([
                    {
                        purchaseId: 1, vendorId: 1, vendorName: "Nepal Auto Supplies", totalAmount: 54000, createdAt: new Date().toISOString(),
                        items: [
                            { purchaseItemId: 1, partId: 1, partName: "Brake Pad",         quantity: 30,  unitCost: 1200, subtotal: 36000 },
                            { purchaseItemId: 2, partId: 3, partName: "Spark Plug",         quantity: 100, unitCost: 180,  subtotal: 18000 },
                        ]
                    },
                    {
                        purchaseId: 2, vendorId: 2, vendorName: "Himalaya Parts Co.", totalAmount: 16000, createdAt: new Date().toISOString(),
                        items: [
                            { purchaseItemId: 3, partId: 2, partName: "Engine Oil Filter", quantity: 20, unitCost: 350, subtotal: 7000 },
                            { purchaseItemId: 4, partId: 4, partName: "Air Filter",         quantity: 20, unitCost: 450, subtotal: 9000 },
                        ]
                    },
                ])
            }
            setLoading(false)
        }
        loadAll()
    }, [])

    const safeSetParts     = (val) => setParts(prev     => Array.isArray(val) ? val : typeof val === 'function' ? val(prev) : toArray(val))
    const safeSetVendors   = (val) => setVendors(prev   => Array.isArray(val) ? val : typeof val === 'function' ? val(prev) : toArray(val))
    const safeSetPurchases = (val) => setPurchases(prev => Array.isArray(val) ? val : typeof val === 'function' ? val(prev) : toArray(val))

    const sharedProps = {
        parts,     setParts:     safeSetParts,
        vendors,   setVendors:   safeSetVendors,
        purchases, setPurchases: safeSetPurchases,
        toast,
    }

    return (
        <>
            <Layout>
                {loading ? (
                    <div style={{ textAlign: "center", padding: 80, color: "#7A93B0", fontSize: 15 }}>
                        Loading…
                    </div>
                ) : (
                    <Routes>
                        <Route path="/"        element={<Dashboard parts={parts} vendors={vendors} purchases={purchases} />} />
                        <Route path="/parts"   element={<PartsPage   {...sharedProps} />} />
                        <Route path="/vendors" element={<VendorsPage {...sharedProps} />} />
                    </Routes>
                )}
            </Layout>
            <Toasts toasts={toasts} />
        </>
    )
}