import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
//import { createHabit, CreateHabitInput, deleteHabit, getHabits, Habit, updateHabit, UpdateHabitInput } from '../api/habits/habits-api';
import {
  createHabit,
  deleteHabit,
  getHabits,
  updateHabit,
  type Habit,
  type CreateHabitInput,
  type UpdateHabitInput,
} from "@/lib/api/habits/habits-api";

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
        // onSuccess: async () => {
        //     await queryClient.invalidateQueries({
        //         queryKey: ['habits'],
        //     });
        // },
        onSuccess: async (newHabit) => {
            queryClient.setQueryData<Habit[]>(
                ['habits'],
                (currentHabits) => {
                    if(!currentHabits) {
                        return [newHabit];
                    }

                    const alreadyExists = currentHabits.some(
                        (habit) => habit.id === newHabit.id,
                    );

                    if (alreadyExists) {
                        return currentHabits;
                    }

                    return [...currentHabits, newHabit];
                },
            );

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