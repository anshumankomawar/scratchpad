import { fetchAuth } from './auth'
import { queryOptions } from '@tanstack/react-query'

export const authQueryOptions = (username: string, password: string) =>
  queryOptions({
    queryKey: ['login'],
    queryFn: () => fetchAuth(username, password),
    enabled: false
  })