
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAdmin } from '@/hooks/useAdmin'
import { useDebounce } from '@/hooks/useDebounce'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Search, Users, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UserData {
  id: string
  email: string
  nome: string
  phone: string
  created_at: string
  is_admin: boolean
  ativo: boolean
  subscribed?: boolean
  subscription_tier?: string
}

const USERS_PER_PAGE = 10

export default function AdminUsers() {
  const { logAdminAction } = useAdmin()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  // Debounce para a busca
  const debouncedSearch = useDebounce((term: string) => {
    setDebouncedSearchTerm(term)
    setCurrentPage(1) // Reset para primeira página ao buscar
  }, 500)

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  useEffect(() => {
    loadUsers()
    logAdminAction('admin_users_view')
  }, [debouncedSearchTerm, currentPage, logAdminAction])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Loading users with search term:', debouncedSearchTerm)

      // Calcular offset para paginação
      const offset = (currentPage - 1) * USERS_PER_PAGE

      // Query base para contar total de usuários
      let countQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Query principal para buscar usuários com dados de assinatura
      let usersQuery = supabase
        .from('profiles')
        .select(`
          id,
          email,
          nome,
          phone,
          created_at,
          is_admin,
          ativo,
          subscribers (
            subscribed,
            subscription_tier
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + USERS_PER_PAGE - 1)

      // Aplicar filtros de busca se houver termo
      if (debouncedSearchTerm.trim()) {
        const searchFilter = `email.ilike.%${debouncedSearchTerm}%,nome.ilike.%${debouncedSearchTerm}%`
        countQuery = countQuery.or(searchFilter)
        usersQuery = usersQuery.or(searchFilter)
      }

      const [
        { count, error: countError },
        { data: usersData, error: usersError }
      ] = await Promise.all([
        countQuery,
        usersQuery
      ])

      if (countError) throw countError
      if (usersError) throw usersError

      console.log('Users data received:', usersData)

      // Processar dados dos usuários
      const processedUsers: UserData[] = (usersData || []).map(user => ({
        ...user,
        subscribed: Array.isArray(user.subscribers) 
          ? user.subscribers.some((sub: any) => sub.subscribed) 
          : false,
        subscription_tier: Array.isArray(user.subscribers) 
          ? user.subscribers.find((sub: any) => sub.subscribed)?.subscription_tier 
          : undefined
      }))

      setUsers(processedUsers)
      setTotalUsers(count || 0)

    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error)
      setError(error.message || 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getPlanBadge = (user: UserData) => {
    if (user.subscribed) {
      return (
        <Badge className="bg-green-600 text-white">
          Pago {user.subscription_tier ? `(${user.subscription_tier})` : ''}
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-600 text-white">
        Gratuito
      </Badge>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Gestão de Usuários
          </h1>
          <p className="text-gray-400">
            Erro ao carregar dados dos usuários
          </p>
        </div>
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Gestão de Usuários
        </h1>
        <p className="text-gray-400">
          Visualização e controle de todos os usuários do sistema
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar usuários por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Users className="h-4 w-4" />
          <span>{totalUsers} usuários encontrados</span>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">
            Usuários Cadastrados ({totalUsers})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-full bg-gray-700" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-gray-400">
                {debouncedSearchTerm.trim() 
                  ? `Nenhum usuário encontrado para "${debouncedSearchTerm}"`
                  : 'Não há usuários cadastrados no sistema'
                }
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Nome</TableHead>
                    <TableHead className="text-gray-300">E-mail</TableHead>
                    <TableHead className="text-gray-300">Tipo de Plano</TableHead>
                    <TableHead className="text-gray-300">Data de Cadastro</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-gray-700">
                      <TableCell className="text-white">
                        <div className="flex items-center space-x-2">
                          <span>{user.nome || '-'}</span>
                          {user.is_admin && (
                            <Badge className="bg-red-600 text-white text-xs">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {getPlanBadge(user)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {formatDistanceToNow(new Date(user.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge className={user.ativo ? 'bg-green-600' : 'bg-gray-600'}>
                          {user.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1
                        if (
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        }
                        return null
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
