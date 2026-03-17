import { useCallback, useState } from "react"
import { PaginatedTable, type ColumnDef } from "@/components/common/PaginatedTable"
import { UserStatusToggleCell } from "@/components/common/UserStatusToggleCell"
import { listFarmers, type FarmerListItem } from "@/features/farmers/api/listFarmers"

export default function FarmersListPage() {
  const [refreshToken, setRefreshToken] = useState(0)

  const fetchPage = useCallback(({ page, limit }: { page: number; limit: number }) => {
    return listFarmers({ page, limit })
  }, [])

  const columns: ColumnDef<FarmerListItem>[] = [
    { key: "id", header: "ID", cell: (r) => r.id, className: "w-[140px] text-xs text-muted-foreground" },
    { key: "name", header: "Name", cell: (r) => r.user.name , className: "w-[140px] text-xs text-muted-foreground" },
    { key: "phone", header: "Phone", cell: (r) => r.user.phone , className: "w-[140px] text-xs text-muted-foreground" },
    { key: "farmName", header: "Farm", cell: (r) => r.farmName , className: "w-[140px] text-xs text-muted-foreground" },
    { key: "location", header: "Location", cell: (r) => r.farmLocation , className: "w-[140px] text-xs text-muted-foreground" },
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
        <h1 className="text-2xl font-semibold text-muted-foreground">Farmers</h1>
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

