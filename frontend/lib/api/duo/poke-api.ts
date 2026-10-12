import { apiFetch  } from "../client";

export function pokePartner(habitId: string) {
    return apiFetch<void>(`/poke/${habitId}/poke`, {
        method: 'POST',
    })
}