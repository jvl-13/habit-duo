
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    acceptDuoInvitation,
    endDuo,
    getMyDuo,
    invitePartner,
    rejectDuoInvitation,
} from "../api/duo/duo-api";

export function useMyDuo() {
    return useQuery({
        queryKey: ["duo", "me"],
        queryFn: getMyDuo,
    });
}

export function useInvitePartner() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: invitePartner,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["duo", "me"],
            });
        },
    });
}

export function useAcceptDuoInvitation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: acceptDuoInvitation,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["duo", "me"],
            });
        },
    });
}

export function useRejectDuoInvitation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: rejectDuoInvitation,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["duo", "me"],
            });
        },
    });
}

export function useEndDuo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: endDuo,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["duo", "me"],
            });
        },
    });
}
