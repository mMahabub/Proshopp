import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { auth } from '@/auth'
import { getAllUsers } from '@/lib/actions/admin.actions'
import UsersTable from '@/components/admin/users-table'

export const metadata: Metadata = {
  title: 'Users - Admin',
  description: 'Manage user accounts and roles',
}

interface SearchParams {
  page?: string
  search?: string
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  // Get current user session
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in')
  }

  // Await searchParams (Next.js 15 compatibility)
  const params = await searchParams

  // Parse URL parameters
  const page = Number(params.page) || 1
  const search = params.search || ''

  // Fetch users data
  const usersResult = await getAllUsers({
    page,
    limit: 10,
    search: search || undefined,
  })

  // Handle errors
  if (!usersResult.success || !usersResult.data) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-2">Manage user accounts and roles</p>
        </div>
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md">
          <p className="font-semibold">Error loading users</p>
          <p className="text-sm mt-1">
            {usersResult.message || 'Failed to fetch users'}
          </p>
        </div>
      </div>
    )
  }

  const { users, pagination } = usersResult.data

  // Server action for filter changes (triggers navigation with new URL params)
  const handleFilterChange = async (
    roleFilter: string,
    search: string,
    page: number
  ) => {
    'use server'
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (page > 1) params.set('page', page.toString())

    redirect(`/admin/users${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-2">
          Manage user accounts and roles ({pagination.total} total)
        </p>
      </div>

      <UsersTable
        initialUsers={users}
        initialPagination={pagination}
        currentUserId={session.user.id}
        onFilterChange={handleFilterChange}
      />
    </div>
  )
}
