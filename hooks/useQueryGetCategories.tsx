import { purchasesApi } from "@/api"
import { useQuery } from "@tanstack/react-query"

export const GET_CATEGORIES_QUERY_KEY = "categories"

export const useQueryGetCategories = () => {
  return useQuery({
    queryKey: [GET_CATEGORIES_QUERY_KEY],
    queryFn: purchasesApi.getCategories,
    staleTime: Infinity,
  })
}
