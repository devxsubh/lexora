'use client'

import React, { useMemo, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AlertTriangle,
  Bell,
  Brain,
  ChevronDown,
  ChevronRight,
  Clock,
  FileSignature,
  FileText,
  LayoutDashboard,
  Menu,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Settings,
  BookOpenCheck,
  ArrowRight,
  X,
  Calendar,
  User,
  Upload,
  FileUp,
  LayoutTemplate,
  Wand2,
  CheckCircle2,
  Edit3,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/Card'
import { LexoraLogo } from '@/components/ui/LexoraLogo'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuthStore } from '@/store/authStore'
import { UserProfileDropdown } from '@/components/user/UserProfileDropdown'
import { cn } from '@/utils/helpers'

type MetricId = 'total-contracts' | 'pending-signatures' | 'expiring-soon' | 'ai-risk-flags'

const METRIC_CARDS: { id: MetricId; label: string; value: string; delta: string; deltaLabel: string }[] = [
  { id: 'total-contracts', label: 'Total Contracts', value: '128', delta: '+12%', deltaLabel: 'this month' },
  { id: 'pending-signatures', label: 'Pending Signatures', value: '7', delta: '+3', deltaLabel: 'awaiting action' },
  { id: 'expiring-soon', label: 'Expiring Soon', value: '5', delta: '7 days', deltaLabel: 'avg. time left' },
  { id: 'ai-risk-flags', label: 'AI Risk Flags', value: '3', delta: '2 high', deltaLabel: 'priority issues' },
]

const METRIC_DROPDOWN_SAMPLES = {
  'total-contracts': [
    { id: '1', name: 'Vendor Agreement - Acme Pvt Ltd', party: 'Acme Pvt Ltd' },
    { id: '2', name: 'NDA - Investor Round', party: 'Blue Ocean Ventures' },
    { id: '3', name: 'Employment Offer - Product Lead', party: 'Priya Sharma' },
    { id: '4', name: 'MSA - Logistics Partner', party: 'SwiftShip Logistics' },
    { id: '5', name: 'Supplier MSA - TechVendor Inc', party: 'TechVendor Inc' },
  ],
  'pending-signatures': [
    { id: '1', name: 'Vendor Agreement - Acme Pvt Ltd', awaiting: 'Acme Pvt Ltd' },
    { id: '3', name: 'Employment Offer - Product Lead', awaiting: 'Priya Sharma' },
    { id: '6', name: 'Consulting Agreement', awaiting: 'ABC Consulting' },
    { id: '7', name: 'License Agreement', awaiting: 'Design Co' },
  ],
  'expiring-soon': [
    { id: '5', name: 'Supplier MSA - TechVendor Inc', expires: 'Mar 2, 2026' },
    { id: '8', name: 'Marketing NDA', expires: 'Mar 6, 2026' },
    { id: '1', name: 'Vendor Agreement - Acme Pvt Ltd', expires: 'Mar 10, 2026' },
    { id: '9', name: 'Service Agreement', expires: 'Mar 12, 2026' },
  ],
  'ai-risk-flags': [
    { id: '1', name: 'Vendor Agreement - Acme Pvt Ltd', severity: 'high', issue: 'Indemnity cap inconsistency' },
    { id: '4', name: 'MSA - Logistics Partner', severity: 'high', issue: 'Missing termination clause' },
    { id: '2', name: 'NDA - Investor Round', severity: 'medium', issue: 'Jurisdiction clause missing' },
  ],
}

const QUICK_ACTIONS_EXPANDED = [
  { id: 'new', label: 'New Contract', href: '/contracts', icon: Sparkles },
  { id: 'upload', label: 'Upload for AI Review', href: '/contracts/workspace?q=upload+for+review', icon: Upload },
  { id: 'nda', label: 'Generate NDA', href: '/contracts/workspace?q=Generate+NDA', icon: FileText },
  { id: 'import', label: 'Import from Google Drive', href: '/contracts', icon: FileUp },
  { id: 'template', label: 'Create from Template', href: '/contracts', icon: LayoutTemplate },
] as const

const CONTRACT_TYPES = { NDA: 'purple', Vendor: 'blue', Employment: 'green', MSA: 'slate' } as const
type ContractTypeKey = keyof typeof CONTRACT_TYPES

const CONTRACT_ROWS = [
  { id: '1', name: 'Vendor Agreement - Acme Pvt Ltd', party: 'Acme Pvt Ltd', contractType: 'Vendor' as ContractTypeKey, aiRiskScore: 42, status: 'Sent', lastUpdated: 'Feb 26, 2026', lastActivity: 'Edited by you', riskLevel: 'Medium', hasRiskFlag: true, lifecycleStage: 2 as 0|1|2|3|4|5, effectiveDate: 'Mar 1, 2026', summary: 'Master vendor agreement for supply of components.' },
  { id: '2', name: 'NDA - Investor Round', party: 'Blue Ocean Ventures', contractType: 'NDA' as ContractTypeKey, aiRiskScore: 18, status: 'Signed', lastUpdated: 'Feb 24, 2026', lastActivity: 'Signed by all parties', riskLevel: 'Low', hasRiskFlag: false, lifecycleStage: 4 as 0|1|2|3|4|5, effectiveDate: 'Feb 24, 2026', summary: 'Mutual NDA for investor discussions.' },
  { id: '3', name: 'Employment Offer - Product Lead', party: 'Priya Sharma', contractType: 'Employment' as ContractTypeKey, aiRiskScore: 25, status: 'Pending Signature', lastUpdated: 'Feb 25, 2026', lastActivity: 'Sent for signature', riskLevel: 'Low', hasRiskFlag: false, lifecycleStage: 3 as 0|1|2|3|4|5, effectiveDate: 'TBD', summary: 'Offer letter for Product Lead role.' },
  { id: '4', name: 'MSA - Logistics Partner', party: 'SwiftShip Logistics', contractType: 'MSA' as ContractTypeKey, aiRiskScore: 68, status: 'Draft', lastUpdated: 'Feb 22, 2026', lastActivity: 'AI flagged 2 clauses', riskLevel: 'High', hasRiskFlag: true, lifecycleStage: 1 as 0|1|2|3|4|5, effectiveDate: 'Draft', summary: 'Master service agreement for logistics.' },
] as const

const LIFECYCLE_STAGES = ['Draft', 'Review', 'Negotiation', 'Signature', 'Active', 'Expiry'] as const

const AI_INSIGHTS_ACTIONABLE = [
  { id: 1, title: 'NDA missing jurisdiction clause', fix: 'Add: "This agreement shall be governed by laws of India."', action: 'Apply Fix', href: '/contracts/2', actionLabel: 'Apply Fix' },
  { id: 2, title: 'Indemnity clause deviates 20% from template', action: 'Compare Clause', href: '/contracts/1', actionLabel: 'Compare Clause' },
  { id: 3, title: 'Contract expires in 7 days', action: 'Send renewal draft', href: '/contracts/1', actionLabel: 'Send renewal draft' },
] as const

const RECENT_ACTIVITY = [
  { id: '1', text: 'Priya Sharma signed Employment Offer', time: '2 hours ago', icon: CheckCircle2 },
  { id: '2', text: 'AI flagged indemnity clause in Vendor Agreement', time: '5 hours ago', icon: AlertTriangle },
  { id: '3', text: 'Contract renewed with SwiftShip Logistics', time: 'Yesterday', icon: RefreshCw },
  { id: '4', text: 'You edited NDA - Investor Round', time: 'Yesterday', icon: Edit3 },
] as const

const AI_RISK_DISTRIBUTION = { low: 82, medium: 31, high: 15 }

const AI_SEARCH_SUGGESTIONS = [
  'contracts with indemnity clause',
  'agreements expiring this month',
  'nda with acme',
  'high risk contracts',
] as const

const SIDEBAR_GROUPS = [
  { label: 'Workspace', items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }, { href: '/contracts', label: 'Contracts', icon: FileText }, { href: '/contracts?templates=1', label: 'Templates', icon: LayoutTemplate }] },
  { label: 'AI Tools', items: [{ href: '/contracts?view=ai-review', label: 'AI Review', icon: ShieldAlert }, { href: '/clause-library', label: 'Clause Library', icon: BookOpenCheck }, { href: '/dashboard', label: 'Insights', icon: Brain }] },
  { label: 'Signing', items: [{ href: '/contracts?view=signatures', label: 'Signatures', icon: FileSignature }] },
  { label: 'Governance', items: [{ href: '/contracts?view=compliance', label: 'Compliance', icon: ShieldCheck }, { href: '/profile', label: 'Settings', icon: Settings }] },
] as const

const TEMPLATES = [
  { id: 'nda', label: 'NDA', href: '/contracts/workspace?template=nda' },
  { id: 'vendor', label: 'Vendor Agreement', href: '/contracts/workspace?template=vendor' },
  { id: 'consulting', label: 'Consulting Agreement', href: '/contracts/workspace?template=consulting' },
  { id: 'employment', label: 'Employment Offer', href: '/contracts/workspace?template=employment' },
] as const

const SAMPLE_NOTIFICATIONS = [
  { id: '1', title: 'Vendor Agreement ready for review', time: '10 min ago', unread: true },
  { id: '2', title: 'NDA signed by Blue Ocean Ventures', time: '1 hour ago', unread: true },
  { id: '3', title: '2 contracts expiring in 7 days', time: '2 hours ago', unread: false },
]


export default function DashboardPage() {
  const { user } = useAuthStore()
  const greetingName = user?.name?.split(/\s+/)[0] || 'there'
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return [...CONTRACT_ROWS]
    const q = searchQuery.toLowerCase()
    return CONTRACT_ROWS.filter(
      (r) => r.name.toLowerCase().includes(q) || r.party.toLowerCase().includes(q)
    )
  }, [searchQuery])

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopNavbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8">
              <GreetingSection name={greetingName} />
              <QuickActionsBar />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                <div className="lg:col-span-3">
                  <MetricsGrid />
                </div>
                <AIRiskDistributionCard />
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:gap-8">
                <div className="min-w-0 space-y-6 lg:col-span-2">
                  <ContractsOverviewTable rows={filteredRows} />
                </div>
                <div className="min-w-0 space-y-6">
                  <RecentActivityFeed />
                  <AIInsightsPanel />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}

function DashboardSidebar({ mobileOpen, onCloseMobile }: { mobileOpen?: boolean; onCloseMobile?: () => void }) {
  const pathname = usePathname()

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
        <LexoraLogo size="md" />
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-700">
            Premium
          </span>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive =
                  pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href.split('?')[0]))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive ? 'bg-orange-50 text-orange-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600')} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
        <div>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Templates</p>
          <div className="space-y-0.5">
            {TEMPLATES.map((t) => (
              <Link
                key={t.id}
                href={t.href}
                onClick={onCloseMobile}
                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-700"
              >
                <FileText className="h-3.5 w-3.5 text-gray-400 group-hover:text-orange-500" />
                <span className="truncate">{t.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <div className="border-t border-gray-200 px-4 py-3">
        <div className="rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-xs font-medium text-gray-800">Risk-free AI — on your terms</p>
          <p className="mt-1 text-[11px] text-gray-500">AI only flags what matters. You stay in control.</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden h-full w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
        {sidebarContent}
      </aside>
      {/* Mobile: overlay drawer */}
      {onCloseMobile && (
        <>
          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              aria-hidden
              onClick={onCloseMobile}
            />
          )}
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-gray-200 bg-white shadow-xl transition-transform duration-200 ease-out lg:hidden',
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}

function TopNavbar({
  searchQuery,
  onSearchChange,
  onOpenMobileMenu,
}: {
  searchQuery: string
  onSearchChange: (v: string) => void
  onOpenMobileMenu?: () => void
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  return (
    <header className="relative flex h-14 min-h-[3.5rem] flex-shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="relative hidden min-w-0 flex-1 items-center gap-3 md:flex md:max-w-sm lg:max-w-xs">
          <div className="relative hidden md:block">
            <Brain className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />
            <input
              type="text"
              placeholder="AI search: contracts, expiring..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              className="w-full rounded-full border border-gray-200 bg-gray-50 pl-9 pr-3 py-1.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
            {searchFocused && (
              <div className="absolute left-0 top-full z-20 mt-1 w-full min-w-[280px] max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Try AI search</p>
                {AI_SEARCH_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); onSearchChange(s); setSearchFocused(false); }}
                    className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
            <Brain className="h-3.5 w-3.5" />
            AI Insights
          </span>
          <span className="text-xs text-gray-500">3 alerts today</span>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((o) => !o)}
            className="relative rounded-full p-2 hover:bg-gray-100"
          >
            <Bell className="h-4 w-4 text-gray-600" />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-orange-500" />
          </button>
          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                aria-hidden
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white py-2 shadow-lg sm:w-80">
                <div className="flex items-center justify-between px-3 pb-2">
                  <span className="text-sm font-semibold text-gray-900">Notifications</span>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="rounded p-1 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                {SAMPLE_NOTIFICATIONS.map((n) => (
                  <Link
                    key={n.id}
                    href={`/contracts/${n.id}`}
                    onClick={() => setNotificationsOpen(false)}
                    className={cn(
                      'block border-l-2 px-3 py-2 text-left text-sm transition-colors',
                      n.unread ? 'border-orange-500 bg-orange-50/50' : 'border-transparent hover:bg-gray-50'
                    )}
                  >
                    <p className="font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.time}</p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
        <UserProfileDropdown />
      </div>
    </header>
  )
}

function GreetingSection({ name }: { name: string }) {
  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm text-gray-500">Good Afternoon,</p>
        <h1 className="mt-0.5 text-xl font-semibold text-gray-900 sm:text-2xl md:text-3xl">
          {name} <span className="align-middle">👋</span>
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          You have{' '}
          <span className="font-semibold text-orange-700">3 contracts</span> requiring attention.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          Overall risk posture: Stable
        </div>
        <div className="hidden items-center gap-1 text-xs text-gray-500 sm:flex">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Last synced 3 mins ago</span>
        </div>
      </div>
    </section>
  )
}

function QuickActionsBar() {
  return (
    <section className="flex flex-wrap items-center gap-2">
      {QUICK_ACTIONS_EXPANDED.map((action, index) => {
        const Icon = action.icon
        return (
          <Link key={action.id} href={action.href}>
            <Button
              variant={index === 0 ? 'primary' : 'outline'}
              size="sm"
              className={cn(
                'flex items-center gap-1.5 rounded-lg text-xs sm:gap-2',
                index !== 0 && 'border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-700'
              )}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{action.label}</span>
            </Button>
          </Link>
        )
      })}
    </section>
  )
}

function AIRiskDistributionCard() {
  const total = AI_RISK_DISTRIBUTION.low + AI_RISK_DISTRIBUTION.medium + AI_RISK_DISTRIBUTION.high
  return (
    <Card className="border-gray-100 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">AI Risk Distribution</p>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Low risk
          </span>
          <span className="font-semibold text-gray-900">{AI_RISK_DISTRIBUTION.low}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(AI_RISK_DISTRIBUTION.low / total) * 100}%` }} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Medium risk
          </span>
          <span className="font-semibold text-gray-900">{AI_RISK_DISTRIBUTION.medium}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-amber-500" style={{ width: `${(AI_RISK_DISTRIBUTION.medium / total) * 100}%` }} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            High risk
          </span>
          <span className="font-semibold text-gray-900">{AI_RISK_DISTRIBUTION.high}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-red-500" style={{ width: `${(AI_RISK_DISTRIBUTION.high / total) * 100}%` }} />
        </div>
      </div>
    </Card>
  )
}

function RecentActivityFeed() {
  return (
    <Card className="border-gray-100 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">Activity</h2>
      <div className="space-y-2">
        {RECENT_ACTIVITY.map((a) => {
          const Icon = a.icon
          return (
            <div
              key={a.id}
              className="flex items-start gap-3 rounded-lg border border-gray-50 px-3 py-2.5 transition-colors hover:bg-gray-50/80"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900">{a.text}</p>
                <p className="text-xs text-gray-500">{a.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function MetricsGrid() {
  const [openMetricId, setOpenMetricId] = useState<MetricId | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(e.target as Node)) {
        setOpenMetricId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <section ref={sectionRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {METRIC_CARDS.map((card, index) => (
        <MetricCard
          key={card.id}
          card={card}
          index={index}
          isOpen={openMetricId === card.id}
          onToggle={() => setOpenMetricId((id) => (id === card.id ? null : card.id))}
        />
      ))}
    </section>
  )
}

function MetricCard({
  card,
  index,
  isOpen,
  onToggle,
}: {
  card: (typeof METRIC_CARDS)[number]
  index: number
  isOpen: boolean
  onToggle: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const items = METRIC_DROPDOWN_SAMPLES[card.id]

  return (
    <div className="relative" ref={cardRef}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 rounded-xl"
      >
        <Card
          hover
          className={cn(
            'transform border-gray-100 bg-white/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
            isOpen && 'ring-2 ring-orange-200 border-orange-100 shadow-md -translate-y-0.5'
          )}
        >
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {card.label}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                {index === 0 && <FileText className="h-4 w-4" />}
                {index === 1 && <FileSignature className="h-4 w-4" />}
                {index === 2 && <Clock className="h-4 w-4" />}
                {index === 3 && <AlertTriangle className="h-4 w-4" />}
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-400 transition-transform duration-200',
                  isOpen && 'rotate-180 text-orange-500'
                )}
              />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
            <div className="text-right">
              <p className="text-xs font-semibold text-emerald-600">{card.delta}</p>
              <p className="text-[11px] text-gray-500">{card.deltaLabel}</p>
            </div>
          </div>
        </Card>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full z-20 mt-2 max-h-[min(64vh,400px)] min-w-[260px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 sm:min-w-[280px]"
        >
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {card.label}
            </p>
            <p className="mt-0.5 text-sm text-gray-600">
              {card.id === 'total-contracts' && 'Recent contracts'}
              {card.id === 'pending-signatures' && 'Awaiting your or counterparty signature'}
              {card.id === 'expiring-soon' && 'Renew or review before expiry'}
              {card.id === 'ai-risk-flags' && 'AI-detected issues to review'}
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {card.id === 'total-contracts' &&
              (items as { id: string; name: string; party: string }[]).map((item) => (
                <Link
                  key={item.id}
                  href={`/contracts/${item.id}`}
                  onClick={() => onToggle()}
                  className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 transition-colors hover:bg-orange-50/50 last:border-0"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      {item.party}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                </Link>
              ))}
            {card.id === 'pending-signatures' &&
              (items as { id: string; name: string; awaiting: string }[]).map((item) => (
                <Link
                  key={item.id}
                  href={`/contracts/${item.id}`}
                  onClick={() => onToggle()}
                  className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 transition-colors hover:bg-amber-50/50 last:border-0"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <FileSignature className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-amber-700">Awaiting: {item.awaiting}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                </Link>
              ))}
            {card.id === 'expiring-soon' &&
              (items as { id: string; name: string; expires: string }[]).map((item) => (
                <Link
                  key={item.id}
                  href={`/contracts/${item.id}`}
                  onClick={() => onToggle()}
                  className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 transition-colors hover:bg-sky-50/50 last:border-0"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="flex items-center gap-1 text-xs text-sky-600">
                      <Clock className="h-3 w-3" />
                      Expires {item.expires}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                </Link>
              ))}
            {card.id === 'ai-risk-flags' &&
              (items as { id: string; name: string; severity: string; issue: string }[]).map((item) => (
                  <Link
                    key={item.id}
                    href={`/contracts/${item.id}`}
                    onClick={() => onToggle()}
                    className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 transition-colors hover:bg-red-50/50 last:border-0"
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                        item.severity === 'high'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      )}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.issue}</p>
                      <span
                        className={cn(
                          'mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                          item.severity === 'high'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        )}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                  </Link>
                ))}
          </div>
          <div className="border-t border-gray-100 bg-gray-50/80 px-4 py-2.5">
            <Link
              href="/contracts"
              onClick={() => onToggle()}
              className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50 hover:text-orange-700"
            >
              View all in Contracts
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function ContractTypeBadge({ type }: { type: ContractTypeKey }) {
  const color = CONTRACT_TYPES[type]
  const classes: Record<string, string> = {
    purple: 'bg-violet-100 text-violet-700 border-violet-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  }
  return (
    <span className={cn('inline-flex rounded border px-2 py-0.5 text-[11px] font-medium', classes[color])}>
      {type}
    </span>
  )
}

function LifecycleBar({ stage }: { stage: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {LIFECYCLE_STAGES.map((_, i) => (
        <span
          key={i}
          className={cn(
            'rounded-full transition-colors',
            i <= stage ? 'bg-orange-500' : 'bg-gray-200',
            'h-1.5 w-1.5 flex-shrink-0'
          )}
          title={LIFECYCLE_STAGES[i]}
        />
      ))}
      <span className="ml-1.5 truncate text-[10px] text-gray-500">{LIFECYCLE_STAGES[stage]}</span>
    </div>
  )
}

function CounterpartyAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
        {initial}
      </div>
      <span className="truncate text-sm text-gray-700">{name}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()

  if (normalized.includes('signed')) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        Signed
      </span>
    )
  }

  if (normalized.includes('pending')) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        Pending
      </span>
    )
  }

  if (normalized.includes('sent')) {
    return (
      <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
        Sent
      </span>
    )
  }

  if (normalized.includes('draft')) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
        Draft
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
      {status}
    </span>
  )
}

function RiskBadge({ level }: { level: string }) {
  const normalized = level.toLowerCase()

  if (normalized === 'high') {
    return (
      <span className="inline-flex items-center rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
        <AlertTriangle className="mr-1 h-3 w-3" />
        High
      </span>
    )
  }

  if (normalized === 'medium') {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Medium
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
      Low
    </span>
  )
}

type ContractRow = (typeof CONTRACT_ROWS)[number]

function ContractRowHoverPreview({ row, onClose, isExpanded }: { row: ContractRow; onClose?: () => void; isExpanded?: boolean }) {
  const [showExplain, setShowExplain] = useState(false)
  return (
    <div className="relative w-full rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
      {isExpanded && onClose && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose() }}
          className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <p className="text-xs font-semibold text-gray-500">Summary</p>
      <p className="mt-0.5 text-sm text-gray-800">{row.summary}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-500">Parties</p>
          <p className="font-medium text-gray-800">You ↔ {row.party}</p>
        </div>
        <div>
          <p className="text-gray-500">Effective</p>
          <p className="font-medium text-gray-800">{row.effectiveDate}</p>
        </div>
        <div>
          <p className="text-gray-500">AI Risk Score</p>
          <p className="font-medium text-gray-800">{row.aiRiskScore}/100</p>
        </div>
        <div>
          <p className="text-gray-500">Key clauses</p>
          <p className="font-medium text-gray-800">Termination, Indemnity, Liability</p>
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/50 p-2 text-xs">
        <p className="font-medium text-amber-800">Lexora negotiation tip</p>
        <p className="mt-0.5 text-amber-900">Counterparty: Payment in 90 days. Suggest: &quot;Payment due within 30 days of invoice.&quot;</p>
        <Link href={`/contracts/${row.id}`} className="mt-2 inline-block text-orange-600 hover:underline">Apply suggestion →</Link>
      </div>
      <div className="mt-3 flex gap-2">
        <Link href={`/contracts/${row.id}`}>
          <Button size="sm" variant="outline" className="text-xs">Review</Button>
        </Link>
        <Button size="sm" variant="primary" className="text-xs" onClick={() => setShowExplain(true)}>
          <Wand2 className="mr-1 h-3 w-3" />
          Explain this Contract
        </Button>
      </div>
      {showExplain && (
        <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50/50 p-3 text-xs">
          <p className="font-semibold text-orange-900">AI Summary</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-orange-800">
            <li>Key obligations: Supply terms, SLA</li>
            <li>Financial: Net 30 payment</li>
            <li>Termination: 30 days notice</li>
            <li>Risks: Indemnity cap deviation</li>
          </ul>
        </div>
      )}
    </div>
  )
}

function ContractsOverviewTable({ rows }: { rows: readonly ContractRow[] }) {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const showPreview = (rowId: string) => hoveredRowId === rowId || expandedRowId === rowId
  return (
    <Card className="border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Contracts overview</h2>
          <p className="mt-1 text-xs text-gray-500">Track type, risk, lifecycle, and AI insights in one view.</p>
        </div>
        <Link href="/contracts">
          <Button variant="outline" size="sm" className="hidden border-gray-200 text-xs text-gray-700 hover:border-orange-300 hover:text-orange-700 sm:inline-flex">
            View all
          </Button>
        </Link>
      </div>
      <div className="-mx-2 overflow-x-auto sm:-mx-3 sm:mx-0">
        <table className="min-w-[640px] border-separate border-spacing-y-2 text-left text-sm sm:min-w-full">
          <thead>
            <tr className="text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-2 py-1.5 sm:px-3">Contract</th>
              <th className="hidden px-3 py-1.5 md:table-cell">Type</th>
              <th className="hidden px-3 py-1.5 lg:table-cell">Counterparty</th>
              <th className="px-2 py-1.5 sm:px-3">AI Risk</th>
              <th className="hidden px-3 py-1.5 xl:table-cell">Lifecycle</th>
              <th className="px-2 py-1.5 sm:px-3">Status</th>
              <th className="hidden px-3 py-1.5 lg:table-cell">Last Activity</th>
              <th className="px-2 py-1.5 text-right sm:px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-2 py-8 text-center text-sm text-gray-500 sm:px-3">No contracts match your search.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr
                    className={cn(
                      'cursor-pointer rounded-lg bg-white shadow-sm transition-colors',
                      showPreview(row.id) && 'ring-1 ring-orange-200'
                    )}
                    onMouseEnter={() => setHoveredRowId(row.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('button')) return
                      setExpandedRowId((id) => (id === row.id ? null : row.id))
                    }}
                  >
                    <td className="max-w-[140px] truncate px-2 py-2 align-middle text-sm font-medium text-gray-900 sm:max-w-[180px] sm:px-3">
                      <Link href={`/contracts/${row.id}`} className="text-gray-900 hover:text-orange-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                        {row.name}
                      </Link>
                    </td>
                    <td className="hidden px-3 py-2 align-middle md:table-cell">
                      <ContractTypeBadge type={row.contractType} />
                    </td>
                    <td className="hidden px-3 py-2 align-middle lg:table-cell">
                      <CounterpartyAvatar name={row.party} />
                    </td>
                    <td className="px-2 py-2 align-middle sm:px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          'font-medium',
                          row.aiRiskScore >= 60 ? 'text-red-600' : row.aiRiskScore >= 35 ? 'text-amber-600' : 'text-emerald-600'
                        )}>
                          {row.aiRiskScore}
                        </span>
                        {row.hasRiskFlag && (
                          <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700">Flagged</span>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-3 py-2 align-middle xl:table-cell">
                      <LifecycleBar stage={row.lifecycleStage} />
                    </td>
                    <td className="px-2 py-2 align-middle sm:px-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="hidden max-w-[120px] truncate px-3 py-2 align-middle text-xs text-gray-600 lg:table-cell">{row.lastActivity}</td>
                    <td className="px-2 py-2 align-middle text-right sm:px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-0.5 sm:gap-1">
                        <Link href={`/contracts/${row.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs text-gray-600 hover:bg-gray-50 hover:text-orange-700">
                            Review
                          </Button>
                        </Link>
                        <Link href={`/contracts/${row.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs text-orange-600 hover:bg-orange-50" title="Explain">
                            <Wand2 className="h-3.5 w-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">Explain</span>
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                  {showPreview(row.id) && (
                    <tr>
                      <td colSpan={8} className="border-t-0 bg-gray-50/80 px-2 py-2 sm:px-3">
                        <ContractRowHoverPreview row={row} onClose={() => setExpandedRowId(null)} isExpanded={expandedRowId === row.id} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function AIInsightsPanel() {
  return (
    <div className="xl:sticky xl:top-20">
      <Card className="border-gray-800 bg-gradient-to-b from-gray-900 via-gray-900 to-black p-5 text-white shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-orange-200">
              <Brain className="h-3.5 w-3.5 text-orange-300" />
              AI Insights
            </div>
            <h2 className="mt-3 text-base font-semibold text-white">Actionable AI — fix, compare, renew</h2>
            <p className="mt-1 text-xs text-gray-300">
              Lexora suggests fixes. You choose to apply, compare, or ignore.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          {AI_INSIGHTS_ACTIONABLE.map((insight) => (
            <div
              key={insight.id}
              className="rounded-xl border border-red-400/40 bg-red-500/5 px-3 py-3 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-white">⚠ {insight.title}</p>
              </div>
              {'fix' in insight && insight.fix && (
                <p className="mt-1.5 text-[11px] text-gray-300">
                  Fix suggestion: <span className="text-orange-200">&quot;{insight.fix}&quot;</span>
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <Link href={insight.href}>
                  <Button
                    size="sm"
                    className="bg-orange-500 text-[11px] text-white hover:bg-orange-600"
                  >
                    {insight.actionLabel}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Link href="/contracts/1" className="flex-1">
            <Button variant="primary" size="sm" className="w-full bg-orange-500 text-xs text-white hover:bg-orange-600">
              Review all
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <p className="mt-3 text-[11px] text-gray-400">
          AI suggestions are never auto-applied. Every change is reviewed and approved by you.
        </p>
      </Card>
    </div>
  )
}

