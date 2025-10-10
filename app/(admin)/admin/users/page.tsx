import { getAllUsers } from '@/lib/actions/admin.actions'
import UsersTable from '@/components/admin/users-table'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export const metadata = {
  title: 'Users Management - Admin',
  description: 'Manage all users',
}

interface SearchParams {
  page?: string
  search?: string
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  // Get current user for preventing self-role-change
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/sign-in')
  }

  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || ''

  const usersResult = await getAllUsers({
    page,
    limit: 10,
    search: search || undefined,
  })

  if (!usersResult.success) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-2">Manage all users</p>
        </div>
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md">
          <p className="font-semibold">Error loading users</p>
          <p className="text-sm mt-1">{usersResult.message}</p>
        </div>
      </div>
    )
  }

  const { users, pagination } = usersResult.data!

  const handleFilterChange = async (roleFilter: string, search: string, page: number) => {
    'use server'
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (page > 1) params.set('page', page.toString())

    redirect(`/admin/users${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
          Users
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage all users ({pagination.total} total)
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
