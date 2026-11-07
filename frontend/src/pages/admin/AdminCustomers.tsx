import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { dashboardService } from '../../services/api'
import type { User } from '../../types'

const MOCK: User[] = [
  { id:1, fullName:'Nguyễn Minh Anh', email:'ban@email.com', phone:'09171234567', role:'CUSTOMER', createdAt:'2024-01-01' },
  { id:2, fullName:'Jasmine Lim', email:'jasmine@email.com', phone:'09181234567', role:'CUSTOMER', createdAt:'2024-01-05' },
  { id:3, fullName:'Bea Dela Cruz', email:'bea@email.com', phone:'09191234567', role:'CUSTOMER', createdAt:'2024-01-10' },
]

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<User[]>([])
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    dashboardService.getCustomers()
      .then(r => setCustomers(r.data.data?.content ?? MOCK))
      .catch(() => setCustomers(MOCK))
  }, [])

  const filtered = customers.filter(c =>
    !keyword ||
    c.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
    c.email.toLowerCase().includes(keyword.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-gray-800">Khách hàng</h1>
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm
                            focus:outline-none focus:border-pink-300"
            placeholder="Tìm tên hoặc email..." value={keyword} onChange={e => setKeyword(e.target.value)} />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-400 font-semibold uppercase tracking-wide text-left">
              {['Customer','Email','Phone','Role','Joined'].map(h => (
                <th key={h} className="px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center font-bold text-pink-500 text-xs flex-shrink-0">
                      {c.fullName.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-700">{c.fullName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.email}</td>
                <td className="px-4 py-3 text-gray-500">{c.phone}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full
                    ${c.role === 'ADMIN' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400">Chưa có khách hàng phù hợp</div>}
      </div>
    </div>
  )
}
