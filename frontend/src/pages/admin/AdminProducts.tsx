import { useEffect, useState, useRef } from 'react'
import {
  Plus,
  PencilSimple,
  Trash,
  X,
  MagnifyingGlass,
  UploadSimple,
  FileCsv,
  FileArrowDown,
  CheckCircle,
  WarningCircle,
  ArrowClockwise
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { productService, categoryService } from '../../services/api'
import api from '../../services/api'
import type { Product, Category } from '../../types'
import toast from 'react-hot-toast'

const MOCK_P: Product[] = [
  { id: 1, name: 'Strawberry Mochi Squishy', price: 189000, stock: 24, imageUrls: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100'], variants: ['Pink', 'Yellow', 'Mint'], categoryId: 1, categoryName: 'Squishy', active: true, newArrival: true, featured: true, soldCount: 128, description: '', createdAt: '' },
  { id: 2, name: 'Bunny Plushie Pillow', price: 349000, stock: 12, imageUrls: ['https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=100'], variants: [], categoryId: 2, categoryName: 'Plushie', active: true, newArrival: false, featured: true, soldCount: 94, description: '', createdAt: '' },
]

interface FormState {
  name: string
  description: string
  price: string
  stock: string
  categoryId: string
  variants: string
  active: boolean
  newArrival: boolean
  featured: boolean
  imageUrls: string[]
}

const EMPTY: FormState = {
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  variants: '',
  active: true,
  newArrival: false,
  featured: false,
  imageUrls: []
}

interface ParsedProduct {
  name: string
  description: string
  price: number
  stock: number
  categoryId: number | null
  categoryName: string
  variants: string[]
  imageUrls: string[]
  active: boolean
  newArrival: boolean
  featured: boolean
  isValid: boolean
  errors: string[]
}

// Robust CSV parser supporting quotes, delimiters (; or ,), and multiline text
function parseCSV(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '').trim()
  if (!clean) return []

  const firstLine = clean.split(/\r\n|\n|\r/)[0] || ''
  const delimiter = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ','

  const rows: string[][] = []
  let currentRow: string[] = []
  let currentVal = ''
  let inQuotes = false

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i]
    const nextChar = clean[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentVal += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        currentVal += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === delimiter) {
        currentRow.push(currentVal.trim())
        currentVal = ''
      } else if (char === '\r') {
        if (nextChar === '\n') i++
        currentRow.push(currentVal.trim())
        rows.push(currentRow)
        currentRow = []
        currentVal = ''
      } else if (char === '\n') {
        currentRow.push(currentVal.trim())
        rows.push(currentRow)
        currentRow = []
        currentVal = ''
      } else {
        currentVal += char
      }
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim())
    rows.push(currentRow)
  }

  return rows.filter(r => r.some(cell => cell.length > 0))
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [keyword, setKeyword] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // CSV Import States
  const [importModal, setImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [parsedItems, setParsedItems] = useState<ParsedProduct[]>([])
  const [importing, setImporting] = useState(false)
  const csvInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    productService.getAll()
      .then(r => setProducts(r.data.data?.content ?? MOCK_P))
      .catch(() => setProducts(MOCK_P))

    categoryService.getAll()
      .then(r => setCategories(r.data.data ?? []))
      .catch(() => {})
  }, [])

  const filtered = products.filter(p => !keyword || p.name.toLowerCase().includes(keyword.toLowerCase()))

  const openAdd = () => {
    setForm(EMPTY)
    setEditing(null)
    setModal('add')
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
      categoryId: String(p.categoryId ?? ''),
      variants: p.variants.join(', '),
      active: p.active,
      newArrival: p.newArrival,
      featured: p.featured,
      imageUrls: p.imageUrls
    })
    setModal('edit')
  }

  // Upload image to Cloudinary
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await api.post('/admin/images/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        uploaded.push(res.data.data.url)
      }
      setForm(f => ({ ...f, imageUrls: [...f.imageUrls, ...uploaded] }))
      toast.success(`Đã upload ${uploaded.length} ảnh! ✨`)
    } catch {
      toast.error('Upload ảnh thất bại')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeImage = async (url: string) => {
    if (url.includes('cloudinary.com')) {
      try { await api.delete('/admin/images/delete', { data: { url } }) } catch {}
    }
    setForm(f => ({ ...f, imageUrls: f.imageUrls.filter(u => u !== url) }))
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) {
      toast.error('Vui lòng điền đầy đủ tên, giá và tồn kho')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      imageUrls: form.imageUrls,
      variants: form.variants.split(',').map(s => s.trim()).filter(Boolean),
      active: form.active,
      newArrival: form.newArrival,
      featured: form.featured,
    }
    try {
      if (editing) {
        await productService.update(editing.id, payload)
        setProducts(ps => ps.map(p => p.id === editing.id ? { ...p, ...payload, categoryName: p.categoryName } as Product : p))
        toast.success('Đã cập nhật sản phẩm!')
      } else {
        const r = await productService.create(payload)
        setProducts(ps => [r.data.data, ...ps])
        toast.success('Đã thêm sản phẩm!')
      }
      setModal(null)
    } catch {
      toast.error('Lưu thất bại, vui lòng thử lại!')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p: Product) => {
    if (!confirm(`Xoá "${p.name}"? Ảnh sẽ bị xoá vĩnh viễn.`)) return
    try { await productService.delete(p.id) } catch {}
    setProducts(ps => ps.filter(x => x.id !== p.id))
    toast.success('Đã xoá sản phẩm!')
  }

  const handleToggle = async (p: Product) => {
    try { await productService.toggleActive(p.id) } catch {}
    setProducts(ps => ps.map(x => x.id === p.id ? { ...x, active: !x.active } : x))
  }

  // ── CSV Import Logic ────────────────────────────────────────────────────────
  const downloadTemplate = () => {
    const headers = [
      'Tên sản phẩm',
      'Giá bán',
      'Tồn kho',
      'Danh mục',
      'Biến thể (cách nhau dấu |)',
      'Link ảnh (cách nhau dấu | hoặc khoảng trắng)',
      'Hàng mới (true/false)',
      'Nổi bật (true/false)',
      'Mô tả chi tiết'
    ]
    const sampleRows = [
      [
        'Strawberry Mochi Squishy Dâu Tây',
        '189000',
        '50',
        'Squishy',
        'Hồng | Vàng | Bạc hà',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'true',
        'true',
        'Squishy mochi dâu tây mềm dẻo chậm tăng, thơm nhẹ hương hoa quả cực thư giãn.'
      ],
      [
        'Bunny Plushie Pillow Thỏ Múp',
        '349000',
        '30',
        'Gấu bông',
        'Trắng | Xám | Hồng phấn',
        'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=800',
        'false',
        'true',
        'Gấu bông thỏ ôm siêu mềm mại, chất liệu lông cừu tổng hợp an toàn cho da nhạy cảm.'
      ],
      [
        'Sổ tay Vintage Peatea Journal',
        '85000',
        '100',
        'Văn phòng phẩm',
        'Kẻ ngang | Chấm bi | Trơn',
        'https://images.unsplash.com/photo-1523634540939-0be5fba32c8f?w=800',
        'true',
        'false',
        'Sổ tay bìa cứng tối giản, 160 trang giấy dán gáy chắc chắn, định lượng 100gsm.'
      ]
    ]

    const csvBody = '\uFEFF' + [
      headers.map(h => `"${h}"`).join(','),
      ...sampleRows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))
    ].join('\r\n')

    const blob = new Blob([csvBody], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mau_nhap_san_pham_peatea.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Đã tải file CSV mẫu về máy! 📄')
  }

  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Vui lòng chọn file định dạng .csv')
      return
    }

    setImportFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = String(event.target?.result || '')
        const rows = parseCSV(text)
        if (rows.length < 2) {
          toast.error('File không chứa dữ liệu sản phẩm hợp lệ')
          return
        }

        const headers = rows[0].map(h => h.toLowerCase())

        // Index detectors
        const nameIdx = headers.findIndex(h => h.includes('tên') || h.includes('name'))
        const priceIdx = headers.findIndex(h => h.includes('giá') || h.includes('price'))
        const stockIdx = headers.findIndex(h => h.includes('tồn') || h.includes('stock') || h.includes('số lượng') || h.includes('quantity'))
        const catIdx = headers.findIndex(h => h.includes('danh mục') || h.includes('category') || h.includes('loại'))
        const varIdx = headers.findIndex(h => h.includes('biến thể') || h.includes('variant') || h.includes('phân loại'))
        const imgIdx = headers.findIndex(h => h.includes('ảnh') || h.includes('image') || h.includes('hình') || h.includes('photo'))
        const newIdx = headers.findIndex(h => h.includes('mới') || h.includes('new'))
        const featIdx = headers.findIndex(h => h.includes('nổi bật') || h.includes('featured') || h.includes('hot'))
        const descIdx = headers.findIndex(h => h.includes('mô tả') || h.includes('desc'))

        const parsed: ParsedProduct[] = rows.slice(1).map((row) => {
          const name = (nameIdx >= 0 ? row[nameIdx] : row[0])?.trim() || ''
          const rawPrice = (priceIdx >= 0 ? row[priceIdx] : row[1])?.replace(/[^0-9.]/g, '') || '0'
          const price = parseFloat(rawPrice) || 0
          const rawStock = (stockIdx >= 0 ? row[stockIdx] : row[2])?.replace(/[^0-9]/g, '') || '0'
          const stock = parseInt(rawStock, 10) || 0

          const rawCat = (catIdx >= 0 ? row[catIdx] : '')?.trim() || ''
          const catMatch = categories.find(c =>
            String(c.id) === rawCat ||
            c.name.toLowerCase() === rawCat.toLowerCase() ||
            c.name.toLowerCase().includes(rawCat.toLowerCase())
          )
          const categoryId = catMatch ? catMatch.id : null
          const categoryName = catMatch ? catMatch.name : (rawCat || 'Chưa phân loại')

          const rawVariants = (varIdx >= 0 ? row[varIdx] : '') || ''
          const variants = rawVariants
            .split(/[|,;]/)
            .map(v => v.trim())
            .filter(Boolean)

          const rawImages = (imgIdx >= 0 ? row[imgIdx] : '') || ''
          const imageUrls = rawImages
            .split(/[|,\s]+/)
            .map(u => u.trim())
            .filter(u => u.startsWith('http://') || u.startsWith('https://'))

          const description = (descIdx >= 0 ? row[descIdx] : '')?.trim() || ''

          const isTruth = (val?: string) => ['true', '1', 'yes', 'có', 'x'].includes(val?.toLowerCase()?.trim() || '')
          const newArrival = newIdx >= 0 ? isTruth(row[newIdx]) : false
          const featured = featIdx >= 0 ? isTruth(row[featIdx]) : false

          const errors: string[] = []
          if (!name) errors.push('Thiếu tên sản phẩm')
          if (price <= 0) errors.push('Giá bán phải lớn hơn 0')
          if (stock < 0) errors.push('Tồn kho không được âm')

          return {
            name,
            description,
            price,
            stock,
            categoryId,
            categoryName,
            variants,
            imageUrls,
            active: true,
            newArrival,
            featured,
            isValid: errors.length === 0,
            errors
          }
        })

        setParsedItems(parsed)
      } catch (err) {
        console.error(err)
        toast.error('Lỗi khi đọc file CSV. Vui lòng kiểm tra lại định dạng file.')
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleConfirmImport = async () => {
    const valid = parsedItems.filter(p => p.isValid)
    if (valid.length === 0) {
      toast.error('Không có sản phẩm hợp lệ nào để nhập!')
      return
    }

    setImporting(true)
    const payload = valid.map(p => ({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      categoryId: p.categoryId,
      imageUrls: p.imageUrls,
      variants: p.variants,
      active: true,
      newArrival: p.newArrival,
      featured: p.featured,
    }))

    try {
      const res = await productService.createBulk(payload)
      const createdList: Product[] = res.data?.data ?? []
      if (createdList.length > 0) {
        setProducts(ps => [...createdList, ...ps])
      } else {
        // Refresh products
        const r = await productService.getAll()
        if (r.data?.data?.content) {
          setProducts(r.data.data.content)
        } else {
          setProducts(ps => [
            ...valid.map((v, i) => ({
              id: Date.now() + i,
              name: v.name,
              description: v.description,
              price: v.price,
              stock: v.stock,
              imageUrls: v.imageUrls,
              variants: v.variants,
              categoryId: v.categoryId ?? (categories[0]?.id || 1),
              categoryName: v.categoryName || (categories.find(c => c.id === v.categoryId)?.name || 'Khác'),
              active: v.active,
              newArrival: v.newArrival,
              featured: v.featured,
              soldCount: 0,
              createdAt: new Date().toISOString(),
            })),
            ...ps,
          ])
        }
      }
      toast.success(`Đã nhập thành công ${valid.length} sản phẩm! 🎉`)
      setImportModal(false)
      setImportFile(null)
      setParsedItems([])
    } catch {
      toast.error('Nhập hàng loạt thất bại, vui lòng kiểm tra lại kết nối')
    } finally {
      setImporting(false)
    }
  }

  const validCount = parsedItems.filter(p => p.isValid).length
  const invalidCount = parsedItems.length - validCount

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
          <p className="text-xs text-gray-500 mt-0.5">Tổng số {products.length} sản phẩm trong kho Peatea</p>
        </div>
        <div className="flex items-center gap-2.5">
          <motion.button
            type="button"
            onClick={() => { setImportModal(true); setParsedItems([]); setImportFile(null) }}
            className="btn-outline py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
          >
            <FileCsv size={16} weight="bold" /> Nhập từ Excel/CSV
          </motion.button>
          <motion.button
            type="button"
            onClick={openAdd}
            className="btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-1.5"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
          >
            <Plus size={15} weight="bold" /> Thêm sản phẩm
          </motion.button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm">
        <div className="relative max-w-sm">
          <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-olive transition-colors"
            placeholder="Tìm theo tên sản phẩm..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 text-xs text-gray-400 font-semibold uppercase tracking-wide text-left border-b border-gray-100">
                {['Sản phẩm', 'Danh mục', 'Giá bán', 'Tồn kho', 'Trạng thái', 'Đã bán', 'Hành động'].map((h, i) => (
                  <th key={i} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrls[0] ? (
                        <img src={p.imageUrls[0]} alt={p.name} className="w-11 h-11 object-cover rounded-xl flex-shrink-0 border border-gray-100" />
                      ) : (
                        <div className="w-11 h-11 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                          Ảnh
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-gray-800 block line-clamp-1">{p.name}</span>
                        <div className="flex gap-1.5 mt-0.5">
                          {p.newArrival && <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium">Mới về</span>}
                          {p.featured && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">Nổi bật</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                      {p.categoryName || 'Chưa phân loại'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-olive">
                    {Number(p.price).toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-50 text-red-600' : p.stock < 5 ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-700'}`}>
                      {p.stock} cái
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(p)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${p.active ? 'bg-olive' : 'bg-gray-200'}`}
                      aria-label="Đổi trạng thái hiển thị"
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${p.active ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-medium">{p.soldCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <motion.button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                        whileHover={{ y: -1 }}
                      >
                        <PencilSimple size={16} weight="bold" />
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xoá"
                        whileHover={{ y: -1 }}
                      >
                        <Trash size={16} weight="bold" />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Chưa có sản phẩm nào phù hợp từ khóa
          </div>
        )}
      </div>

      {/* ── Modal Thêm / Sửa Thủ Công ─────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModal(null)}
            />
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-800 text-base">
                    {modal === 'add' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
                  </h2>
                  <button type="button" onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} weight="bold" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  {/* Image upload */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block">Hình ảnh sản phẩm</label>
                    {form.imageUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {form.imageUrls.map((url, i) => (
                          <div key={i} className="relative group">
                            <img src={url} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
                            <button
                              type="button"
                              onClick={() => removeImage(url)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 text-xs text-olive font-semibold w-full justify-center hover:border-olive hover:bg-olive/5 transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <ArrowClockwise size={14} className="animate-spin" /> Đang tải ảnh lên...
                        </>
                      ) : (
                        <>
                          <UploadSimple size={15} weight="bold" /> Tải ảnh từ thiết bị
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Tên sản phẩm *</label>
                    <input
                      className="input-field"
                      placeholder="Ví dụ: Strawberry Mochi Squishy"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Mô tả chi tiết</label>
                    <textarea
                      className="input-field resize-none h-20 rounded-2xl"
                      placeholder="Mô tả cảm giác chạm, độ mềm dẻo, công dụng..."
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Giá bán (VNĐ) *</label>
                      <input
                        type="number"
                        className="input-field"
                        placeholder="189000"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Tồn kho *</label>
                      <input
                        type="number"
                        className="input-field"
                        placeholder="20"
                        value={form.stock}
                        onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Danh mục</label>
                      <select
                        className="input-field"
                        value={form.categoryId}
                        onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                      >
                        <option value="">Chưa chọn</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Biến thể (phân cách bằng dấu phẩy)</label>
                    <input
                      className="input-field"
                      placeholder="Hồng, Vàng, Xanh lá..."
                      value={form.variants}
                      onChange={e => setForm(f => ({ ...f, variants: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-4 pt-1">
                    {([['active', 'Hiển thị bán'], ['newArrival', 'Hàng mới về'], ['featured', 'Nổi bật trang chủ']] as const).map(([k, label]) => (
                      <label key={k} className="flex items-center gap-2 text-xs font-medium cursor-pointer text-gray-700">
                        <input
                          type="checkbox"
                          className="accent-olive w-4 h-4 rounded"
                          checked={form[k] as boolean}
                          onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setModal(null)} className="btn-outline flex-1 py-2 text-xs">
                    Huỷ
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || uploading}
                    className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : modal === 'add' ? 'Thêm vào kho' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal Nhập Hàng Loạt Qua File CSV / Excel ─────────────────── */}
      <AnimatePresence>
        {importModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!importing) setImportModal(false) }}
            />
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FileCsv size={22} weight="bold" className="text-olive" />
                    <h2 className="font-bold text-gray-800 text-base">Nhập sản phẩm hàng loạt từ file CSV / Excel</h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tải file mẫu về điền thông tin, sau đó tải lên để nhập hàng chục sản phẩm chỉ trong 1 click.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={downloadTemplate}
                    className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5 text-olive border-olive/30"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <FileArrowDown size={16} weight="bold" /> Tải file mẫu (.csv)
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setImportModal(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X size={18} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                {/* File Dropzone */}
                {!importFile ? (
                  <div
                    onClick={() => csvInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault()
                      const file = e.dataTransfer.files[0]
                      if (file) processFile(file)
                    }}
                    className="border-2 border-dashed border-gray-200 hover:border-olive/60 hover:bg-olive/5 rounded-2xl p-8 text-center cursor-pointer transition-all"
                  >
                    <input
                      ref={csvInputRef}
                      type="file"
                      accept=".csv, text/csv, text/plain"
                      className="hidden"
                      onChange={handleCSVFileChange}
                    />
                    <FileCsv size={48} weight="duotone" className="mx-auto text-olive mb-3" />
                    <p className="text-sm font-bold text-gray-800">Kéo thả file CSV vào đây hoặc bấm để chọn file</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                      Hỗ trợ file định dạng .csv (mở và lưu dễ dàng bằng Excel / Google Sheets). Đã bao gồm tiêu đề tiếng Việt chuẩn UTF-8.
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* File summary bar */}
                    <div className="flex flex-wrap items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-200/70 gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <FileCsv size={24} weight="fill" className="text-olive" />
                        <div>
                          <p className="text-xs font-bold text-gray-800">{importFile.name}</p>
                          <p className="text-[11px] text-gray-400">
                            Tìm thấy {parsedItems.length} dòng • {validCount} hợp lệ {invalidCount > 0 && `• ${invalidCount} dòng có lỗi`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setImportFile(null); setParsedItems([]) }}
                        className="text-xs text-gray-500 hover:text-gray-800 underline font-medium"
                      >
                        Chọn file khác
                      </button>
                    </div>

                    {/* Preview Table */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-100 text-gray-600 font-semibold sticky top-0 z-10">
                          <tr>
                            <th className="px-3 py-2 text-center w-10">#</th>
                            <th className="px-3 py-2 text-center w-14">Trạng thái</th>
                            <th className="px-3 py-2 text-left">Tên sản phẩm</th>
                            <th className="px-3 py-2 text-right">Giá</th>
                            <th className="px-3 py-2 text-center">Tồn kho</th>
                            <th className="px-3 py-2 text-left">Danh mục</th>
                            <th className="px-3 py-2 text-left">Biến thể</th>
                            <th className="px-3 py-2 text-center">Ảnh</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {parsedItems.map((item, idx) => (
                            <tr key={idx} className={item.isValid ? 'hover:bg-gray-50/70' : 'bg-red-50/40'}>
                              <td className="px-3 py-2 text-center text-gray-400">{idx + 1}</td>
                              <td className="px-3 py-2 text-center">
                                {item.isValid ? (
                                  <span className="inline-flex items-center gap-1 text-green-600 font-medium" title="Hợp lệ">
                                    <CheckCircle size={15} weight="fill" />
                                  </span>
                                ) : (
                                  <span
                                    className="inline-flex items-center gap-1 text-red-600 font-medium cursor-help"
                                    title={item.errors.join(', ')}
                                  >
                                    <WarningCircle size={15} weight="fill" />
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                <span className="font-semibold text-gray-800 block">{item.name || '(Trống tên)'}</span>
                                {item.errors.length > 0 && (
                                  <span className="text-[10px] text-red-500 block">{item.errors.join(', ')}</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right font-bold text-olive">
                                {item.price.toLocaleString('vi-VN')} ₫
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                                  {item.stock}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${item.categoryId ? 'bg-olive/10 text-olive' : 'bg-gray-100 text-gray-500'}`}>
                                  {item.categoryName}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-gray-500">
                                {item.variants.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {item.variants.map((v, i) => (
                                      <span key={i} className="px-1.5 py-0.2 bg-gray-100 rounded text-[10px] text-gray-600">
                                        {v}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {item.imageUrls.length > 0 ? (
                                  <span className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                    {item.imageUrls.length} ảnh
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-[10px]">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {importFile && (
                    <span>
                      Sẵn sàng nhập <strong className="text-olive">{validCount}</strong> sản phẩm hợp lệ
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setImportModal(false)}
                    disabled={importing}
                    className="btn-outline py-2 px-4 text-xs font-semibold"
                  >
                    Hủy bỏ
                  </button>
                  <motion.button
                    type="button"
                    disabled={importing || validCount === 0}
                    onClick={handleConfirmImport}
                    className="btn-primary py-2 px-5 text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {importing ? (
                      <>
                        <ArrowClockwise size={14} className="animate-spin" /> Đang lưu {validCount} sản phẩm...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={15} weight="bold" /> Xác nhận nhập {validCount > 0 ? `(${validCount} sản phẩm)` : ''}
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
