import { useCallback, useState } from "react"
import { PaginatedTable, type ColumnDef } from "@/components/common/PaginatedTable"
import { UserStatusToggleCell } from "@/components/common/UserStatusToggleCell"
import { listCustomers, type CustomerListItem } from "@/features/customers/api/listCustomers"

export default function CustomersListPage() {
  const [refreshToken, setRefreshToken] = useState(0)

  const fetchPage = useCallback(({ page, limit }: { page: number; limit: number }) => {
    return listCustomers({ page, limit })
  }, [])

  const columns: ColumnDef<CustomerListItem>[] = [
    { key: "id", header: "ID", cell: (r) => r.id, className: "w-[140px] text-xs text-muted-foreground" },
    { key: "name", header: "Name", cell: (r) => r.user.name , className: "w-[140px] text-xs text-muted-foreground" },
    { key: "phone", header: "Phone", cell: (r) => r.user.phone , className: "w-[140px] text-xs text-muted-foreground" },
    { key: "email", header: "Email", cell: (r) => r.user.email ?? "-" , className: "w-[140px] text-xs text-muted-foreground" },
    { key: "createdAt", header: "Created", cell: (r) => new Date(r.createdAt).toLocaleString() , className: "w-[140px] text-xs text-muted-foreground" },
    {
      key: "status",
      header: "Status",
      className: "text-right",
      cell: (r) => (
        <UserStatusToggleCell
          userId={r.userId}
          status={r.user.status}
          onToggled={() => setRefreshToken((v) => v + 1)}
        />
      ),
    },
  ]

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-muted-foreground">Customers</h1>
      </div>

      <PaginatedTable
        columns={columns}
        fetchPage={fetchPage}
        rowKey={(r) => r.id}
        refreshToken={refreshToken}
      />
    </div>
  )
}

