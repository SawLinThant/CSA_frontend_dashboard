import { useCallback } from "react"
import { PaginatedTable, type ColumnDef } from "@/components/common/PaginatedTable"
import { listProducts, type PublicProductListItem } from "@/features/products/api/listProducts"

export default function ProductsListPage() {
  const fetchPage = useCallback(({ page, limit }: { page: number; limit: number }) => {
    return listProducts({ page, limit })
  }, [])

  const columns: ColumnDef<PublicProductListItem>[] = [
    { key: "id", header: "ID", cell: (r) => r.id, className: "w-[140px] text-xs text-muted-foreground" },
    { key: "name", header: "Name", cell: (r) => r.name , className: "w-[140px] text-xs text-muted-foreground" },
    { key: "unit", header: "Unit", cell: (r) => r.unit , className: "w-[140px] text-xs text-muted-foreground" },
    { key: "basePrice", header: "Base Price", cell: (r) => r.basePrice , className: "w-[140px] text-xs text-muted-foreground" },
    { key: "active", header: "Active", cell: (r) => (r.isActive ? "Yes" : "No") , className: "w-[140px] text-xs text-muted-foreground" },
  ]

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-muted-foreground">Products</h1>
      </div>

      <PaginatedTable columns={columns} fetchPage={fetchPage} rowKey={(r) => r.id} />
    </div>
  )
}

