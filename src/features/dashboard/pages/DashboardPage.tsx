import { useTranslation } from 'react-i18next'

export default function DashboardPage() {
  const { t } = useTranslation('dashboard')

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-50">
          {t('title')}
        </h1>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          label={t('cards.totalRevenue')}
          value="$120,430"
          trend="+14.3% vs last month"
        />
        <DashboardCard
          label={t('cards.activeFarmers')}
          value="312"
          trend="+32 new this week"
        />
        <DashboardCard
          label={t('cards.pendingOrders')}
          value="27"
          trend="Most from wholesale partners"
        />
      </section>
    </div>
  )
}

interface DashboardCardProps {
  label: string
  value: string
  trend: string
}

function DashboardCard({ label, value, trend }: DashboardCardProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-50">{value}</p>
      <p className="mt-1 text-xs text-emerald-400">{trend}</p>
    </article>
  )
}

