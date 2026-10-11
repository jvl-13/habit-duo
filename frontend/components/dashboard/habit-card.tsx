'use client';

import {
    Check,
    Circle,
    Flame,
    Loader2,
    Clock,
    ImagePlus,
} from 'lucide-react';

import { useCreateCheckIn, useHabitCheckIns, useUploadCheckInPhoto } from '@/lib/queries/check-in-queries';
import { useAuth } from '@/lib/auth/auth-context';
import { ChangeEvent, useState } from 'react';

interface HabitCardProps {
    id: string;
    name: string;
    description: string;
    deadline: string | null;
    streak: number;
}

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp'
]

export function HabitCard({
    id,
    name,
    description,
    deadline,
    streak,
}: HabitCardProps) {
    const { user } = useAuth();

    const [photoError, setPhotoError] = useState('');

    const {
        data: checkIns,
        isLoading,
        isError,
    } = useHabitCheckIns(id);

    const {
        mutate: createCheckIn,
        isPending: isCheckIn,
        error: checkInError,
    } = useCreateCheckIn();

    const {
        mutate: uploadPhoto,
        isPending: isUploading,
        error: uploadError,
    } = useUploadCheckInPhoto();


    const todayKey = new Date()
        .toISOString()
        .slice(0, 10);

    const ownCheckInToday = checkIns?.find(
        (checkIn) => 
            checkIn.userId === user?.id &&
            checkIn.dayKey === todayKey,
    );


    const completedToday = Boolean(ownCheckInToday);

    const handleCheckIn = () => {
        createCheckIn({ habitId: id});
    };

    const handlePhotoChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file || !ownCheckInToday) {
            return;
        }

        setPhotoError('');

        if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
            setPhotoError('Choose a JPEG, PNG, or WebP image.');

            event.target.value = '';
            return;
        }

        if (file.size > MAX_PHOTO_SIZE) {
            setPhotoError('Image must be 5MB or smaller');

            event.target.value = '';
            return;
        }

        uploadPhoto({
            checkInId: ownCheckInToday.id,
            photo: file,
        });

        event.target.value = '';
    }

    const now = new Date();
    const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

    const deadlineMinutes = deadline
        ? (() => {
            const [hours, minutes] = deadline
                .split(':')
                .map(Number);

            if (
                !Number.isInteger(hours) ||
                !Number.isInteger(minutes) ||
                hours < 0 ||
                hours > 23 ||
                minutes < 0 ||
                minutes > 59
            ) {
                return null;
            }

            return hours * 60 + minutes;
        })()
        : null;

    const isMissed =
        !completedToday &&
        deadlineMinutes !== null &&
        currentMinutes > deadlineMinutes;

    const status = completedToday
        ? 'Completed'
        : isMissed
            ? 'Missed'
            : 'Due today';

    const statusClass = completedToday
        ? 'bg-green-100 text-green-700'
        : isMissed
            ? 'bg-red-100 text-red-700'
            : 'bg-blue-100 text-blue-700';
    
    const photoUrl = ownCheckInToday?.photoUrl;

    const photoSrc = photoUrl 
        ? photoUrl.startsWith('http') 
        ? photoUrl 
        : `${process.env.NEXT_PUBLIC_API_URL}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`
        :null;
    
    console.log('photoUrl:', photoUrl);
    console.log('photoSrc:', photoSrc);

    return (
        <div className="rounded-2xl border bg-background p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h3 className="font-semibold">{name}</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        completedToday
                            ? 'bg-green-100 text-green-600'
                            : 'bg-muted text-muted-foreground'
                    }`}
                >
                    {completedToday ? (
                        <Check className="h-5 w-5" />
                    ) : (
                        <Circle className="h-5 w-5" />
                    )}
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}
                >
                    {status}
                </span>

                {deadline && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Deadline: {deadline}
                    </span>
                )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>{streak} day streak</span>
                </div>

                {!isLoading && !isError && !completedToday && (
                    <button
                        type="button"
                        onClick={handleCheckIn}
                        disabled={isMissed || isCheckIn}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isCheckIn
                            ? 'Checking in...'
                            : isMissed
                                ? 'Deadline passed'
                                : 'Check in'}
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading check-ins...
                </div>
            )}

            {isError && (
                <p className="mt-4 text-sm text-destructive">
                    Failed to load check-ins.
                </p>
            )}

            {checkInError && (
                <p className="mt-3 text-sm text-destructive">
                    {checkInError instanceof Error
                        ? checkInError.message
                        : 'Failed to check in.'}
                </p>
            )}

            {!isLoading && !isError && ownCheckInToday && (
                <div className="mt-5 border-t pt-4">
                    <p className="text-sm font-medium">
                        Photo proof
                    </p>

                    {photoSrc ? (
                        <div className="mt-3">
                            <img
                                src={photoSrc}
                                alt={`Photo proof for ${name}`}
                                className="max-h-64 w-full rounded-xl border object-cover"
                            />

                            <p className="mt-2 text-xs text-green-600">
                                Photo uploaded successfully.
                            </p>
                        </div>
                    ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                            Add a photo to show your progress today.
                        </p>
                    )}

                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
                        {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ImagePlus className="h-4 w-4" />
                        )}

                        {isUploading
                            ? 'Uploading photo...'
                            : photoSrc
                                ? 'Replace photo'
                                : 'Upload photo'}

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="sr-only"
                            disabled={isUploading}
                            onChange={handlePhotoChange}
                        />
                    </label>

                    <p className="mt-2 text-xs text-muted-foreground">
                        JPEG, PNG, or WebP · Maximum 5 MB
                    </p>

                    {photoError && (
                        <p className="mt-2 text-sm text-destructive">
                            {photoError}
                        </p>
                    )}

                    {uploadError && (
                        <p className="mt-2 text-sm text-destructive">
                            {uploadError instanceof Error
                                ? uploadError.message
                                : 'Failed to upload photo.'}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

