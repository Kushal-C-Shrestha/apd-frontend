import { Search } from 'lucide-react'
import { useState } from 'react'

const PARTS = [
    { id: 1, name: 'Brake Pad Set', description: 'Front & rear brake pads', price: 1200, stock: 4 },
    { id: 2, name: 'Oil Filter', description: 'Standard oil filter', price: 350, stock: 7 },
    { id: 3, name: 'Spark Plug', description: 'NGK iridium plug', price: 480, stock: 3 },
    { id: 4, name: 'Air Filter', description: 'Engine air filter', price: 620, stock: 18 },
    { id: 5, name: 'Timing Belt', description: 'OEM timing belt', price: 2100, stock: 11 },
    { id: 6, name: 'Clutch Plate', description: 'Heavy duty clutch plate', price: 3400, stock: 6 },
]

const Parts = () => {
    const [query, setQuery] = useState('')
    const filtered = PARTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))

    return (
        <div className="space-y-5">
            <h1 className="text-xl font-semibold text-gray-900">Parts Inventory</h1>

            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search parts…"
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-gray-400 bg-gray-50 border-b border-gray-100">
                            {['Name', 'Description', 'Unit Price', 'Stock'].map(h => (
                                <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3 font-medium text-gray-800">{p.name}</td>
                                <td className="px-5 py-3 text-gray-500">{p.description}</td>
                                <td className="px-5 py-3 text-gray-800">Rs. {p.price.toLocaleString()}</td>
                                <td className="px-5 py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.stock < 10 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'}`}>
                                        {p.stock} in stock
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Parts
