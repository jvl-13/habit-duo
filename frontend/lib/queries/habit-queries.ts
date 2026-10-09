import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createHabit, CreateHabitInput, deleteHabit, getHabits, updateHabit, UpdateHabitInput } from '../api/habits/habits-api';

export function useHabits() {
    return useQuery({
        queryKey: ['habits'],
        queryFn: getHabits
    })
}

export function useCreateHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateHabitInput) => 
            createHabit(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['habits'],
            });
        },
    });
}

export function useUpdateHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id, 
            data,
        } : {
            id: string;
            data: UpdateHabitInput;
        }) => updateHabit(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['habits'],
            });
        },
    });
}

export function useDeleteHabit() {
    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: (id: string) => deleteHabit(id),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['habits'],
            });
        },
    });
}