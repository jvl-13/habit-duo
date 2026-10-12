import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pokePartner } from "../api/duo/poke-api";

export function usePokePartner() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: pokePartner,

        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['notifications'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['duo', 'me'],
                }),
            ]);
        },
    });
}