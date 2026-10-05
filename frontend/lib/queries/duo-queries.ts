import { useQuery } from "@tanstack/react-query";
import { getMyDuo } from "../api/duo/duo-api";

export function useMyDuo() {
    return useQuery({
        queryKey: ['duo', 'me'],
        queryFn: getMyDuo,
    });
}