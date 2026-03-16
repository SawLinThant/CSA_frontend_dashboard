import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
}

const MOCK_PRODUCTS: Product[] = Array.from({ length: 100 }).map((_, index) => ({
  id: String(index + 1),
  name: `Product ${index + 1}`,
  category: index % 2 === 0 ? 'Vegetable' : 'Fruit',
  price: 10 + index,
  stock: 50 - (index % 20),
}))

export default function ProductsListPage() {
  const { t } = useTranslation('common')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return MOCK_PRODUCTS.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term),
    )
  }, [search])

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-50">
          {t('nav.products')}
        </h1>
        <button className="inline-flex items-center rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-400">
          + New product
        </button>
      </header>
      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-64 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-50 outline-none ring-0 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="max-h-full overflow-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="sticky top-0 bg-slate-900/80 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Stock</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-slate-800 hover:bg-slate-800/60"
                >
                  <td className="px-4 py-2 text-xs text-slate-400">
                    {product.id}
                  </td>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.category}</td>
                  <td className="px-4 py-2 text-right">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right">{product.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

