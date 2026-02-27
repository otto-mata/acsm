import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const typographyVariants = cva('', {
    variants: {
        variant: {
            default: 'leading-7 [&:not(:first-child)]:mt-6',
            code: 'bg-primary text-primary-foreground relative rounded px-[0.3rem] py-[0.2rem] font-mono',
            title: 'text-primary font-bold',
            subtitle: 'text-primary-muted font-thin',
            label: 'text-primary-muted',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

function Typography({
    className,
    variant = 'default',
    asChild = false,
    ...props
}: React.ComponentProps<'span'> &
    VariantProps<typeof typographyVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot.Root : 'span';

    return (
        <Comp
            data-slot="text"
            data-variant={variant}
            className={cn(typographyVariants({ variant }), className)}
            {...props}
        />
    );
}

export { Typography, typographyVariants };
