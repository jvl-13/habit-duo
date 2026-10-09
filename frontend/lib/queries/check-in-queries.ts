import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCheckIn, getHabitCheckIns } from "../api/check-ins/check-in-api";

export function useHabitCheckIns(habitId: string) {
    return useQuery({
        queryKey: [
            'check-ins',
            habitId,
        ],
        queryFn: () => getHabitCheckIns(habitId),
        enabled: Boolean(habitId),
    });
}

export function useCreateCheckIn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            habitId,
            note,
        } : {
            habitId: string;
            note? : string;
        }) => 
            createCheckIn(
                habitId,
                note ? { note } : {},
            ),
        onSuccess: async (_, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['check-ins', variables.habitId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['habits'],
                }),
            ]);
        },
    });
}