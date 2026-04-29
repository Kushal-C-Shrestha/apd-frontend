import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import api from '../services/api'
import Layout from '../components/Layout/Layout'
import Dashboard from '../pages/Dashboard/Dashboard'
import PartsPage from '../pages/Parts/Parts'
import VendorsPage from '../pages/Vendors/Vendors'
import { Toasts } from '../components/UI'
import { useToast } from '../hooks/useToast'

export default function AppWithState() {
    const [parts, setParts]       = useState([])
    const [vendors, setVendors]   = useState([])
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading]   = useState(true)
    const { toasts, toast }       = useToast()

    useEffect(() => {
        async function loadAll() {
            setLoading(true)
            try {
                const [partsRes, vendorsRes, purchasesRes] = await Promise.all([
                    api.get('/parts'),
                    api.get('/vendors'),
                    api.get('/parts/purchases'),
                ])
                setParts(partsRes.data ?? [])
                setVendors(vendorsRes.data ?? [])
                setPurchases(purchasesRes.data ?? [])
            } catch (err) {
                console.warn('API unavailable, using demo data:', err.message)
                // Demo data matching backend PascalCase field names
                setParts([
                    { PartId: 1, Name: "Brake Pad",        Description: "Front disc brake pad",          UnitPrice: 1200, StockQuantity: 45,  CreatedAt: new Date().toISOString() },
                    { PartId: 2, Name: "Engine Oil Filter", Description: "Compatible with Honda & Toyota", UnitPrice: 350,  StockQuantity: 8,   CreatedAt: new Date().toISOString() },
                    { PartId: 3, Name: "Spark Plug",        Description: "NGK standard",                  UnitPrice: 180,  StockQuantity: 120, CreatedAt: new Date().toISOString() },
                    { PartId: 4, Name: "Air Filter",        Description: "Universal fit",                 UnitPrice: 450,  StockQuantity: 5,   CreatedAt: new Date().toISOString() },
                    { PartId: 5, Name: "Clutch Plate",      Description: "Heavy duty",                    UnitPrice: 3200, StockQuantity: 22,  CreatedAt: new Date().toISOString() },
                ])
                setVendors([
                    { VendorId: 1, Name: "Nepal Auto Supplies",  Phone: "9841123456", Email: "sales@nepalauto.com",    Address: "Kalanki, Kathmandu",   CreatedAt: new Date().toISOString(), TotalPurchases: 12 },
                    { VendorId: 2, Name: "Himalaya Parts Co.",   Phone: "9851234567", Email: "info@himalayaparts.com", Address: "Baneshwor, Kathmandu", CreatedAt: new Date().toISOString(), TotalPurchases: 7  },
                    { VendorId: 3, Name: "Pokhara Motors Ltd.",  Phone: "9806543210", Email: "",                       Address: "Lakeside, Pokhara",    CreatedAt: new Date().toISOString(), TotalPurchases: 3  },
                ])
                setPurchases([
                    {
                        PurchaseId: 1, VendorId: 1, VendorName: "Nepal Auto Supplies", TotalAmount: 54000, CreatedAt: new Date().toISOString(),
                        Items: [
                            { PurchaseItemId: 1, PartId: 1, PartName: "Brake Pad",         Quantity: 30,  UnitCost: 1200, Subtotal: 36000 },
                            { PurchaseItemId: 2, PartId: 3, PartName: "Spark Plug",         Quantity: 100, UnitCost: 180,  Subtotal: 18000 },
                        ]
                    },
                    {
                        PurchaseId: 2, VendorId: 2, VendorName: "Himalaya Parts Co.", TotalAmount: 16000, CreatedAt: new Date().toISOString(),
                        Items: [
                            { PurchaseItemId: 3, PartId: 2, PartName: "Engine Oil Filter", Quantity: 20, UnitCost: 350, Subtotal: 7000 },
                            { PurchaseItemId: 4, PartId: 4, PartName: "Air Filter",         Quantity: 20, UnitCost: 450, Subtotal: 9000 },
                        ]
                    },
                ])
            }
            setLoading(false)
        }
        loadAll()
    }, [])

    const sharedProps = { parts, setParts, vendors, setVendors, purchases, setPurchases, toast }

    return (
        <>
            <Layout>
                {loading ? (
                    <div style={{ textAlign: "center", padding: 80, color: "#7A93B0", fontSize: 15 }}>
                        Loading…
                    </div>
                ) : (
                    <Routes>
                        <Route path="/"        element={<Dashboard  parts={parts} vendors={vendors} purchases={purchases} />} />
                        <Route path="/parts"   element={<PartsPage   {...sharedProps} />} />
                        <Route path="/vendors" element={<VendorsPage {...sharedProps} />} />
                    </Routes>
                )}
            </Layout>
            <Toasts toasts={toasts} />
        </>
    )
}
