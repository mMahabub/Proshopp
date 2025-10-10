'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { updateUserRole } from '@/lib/actions/admin.actions'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
}

interface UsersTableProps {
  initialUsers: User[]
  initialPagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  currentUserId: string
  onFilterChange: (roleFilter: string, search: string, page: number) => void
}

const roleColors: Record<string, string> = {
  admin: 'bg-blue-500',
  user: 'bg-gray-500',
}

export default function UsersTable({
  initialUsers,
  initialPagination,
  currentUserId,
  onFilterChange,
}: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Pagination is managed via URL params, not local state
  const pagination = initialPagination

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearch = () => {
    startTransition(() => {
      onFilterChange('', searchQuery, 1)
    })
  }

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      onFilterChange('', searchQuery, newPage)
    })
  }

  const handleRoleUpdate = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const result = await updateUserRole({ userId, role: newRole })

      if (result.success) {
        toast.success('User role updated successfully')

        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        )
      } else {
        toast.error(result.message || 'Failed to update user role')
      }
    } catch {
      toast.error('Failed to update user role')
    }
  }

  const handleViewOrders = (userId: string, userName: string) => {
    // Navigate to orders page filtered by this user
    router.push(`/admin/orders?userId=${userId}&userName=${encodeURIComponent(userName)}`)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isPending}>
            Search
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isCurrentUser = user.id === currentUserId

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${roleColors[user.role] || 'bg-gray-500'} text-white`}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isCurrentUser ? (
                          <span className="text-sm text-gray-500 italic">
                            Current User
                          </span>
                        ) : (
                          <Select
                            value={user.role}
                            onValueChange={(value) =>
                              handleRoleUpdate(user.id, value as 'user' | 'admin')
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrders(user.id, user.name)}
                        >
                          View Orders
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || isPending}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || isPending}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
