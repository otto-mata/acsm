import z from 'zod';

export const JobType = z.xor([
    z.string('file_processing'),
    z.string('scheduled_task'),
    z.string('triggered_task'),
]);
export type JobType = z.infer<typeof JobType>;

export const CreateJobParams = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    description: z
        .string()
        .max(512, 'Description must not exceed 512 characters'),
    type: JobType,
    script_path: z.string(),
    args: z.array(z.string()).nullable(),
    env_vars: z.object().nullable(),
    config: z.object().nullable(),
    timeout_secs: z.number(),
});

export type CreateJobParams = z.infer<typeof CreateJobParams>;
