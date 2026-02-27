import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const typographyVariants = cva('', {
    variants: {
        variant: {
            default: 'text-primary',
            title: 'text-primary font-bold',
            subtitle: 'text-primary-muted font-thin',
            label: 'text-primary-muted font-thin text-sm',
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
            data-slot="badge"
            data-variant={variant}
            className={cn(typographyVariants({ variant }), className)}
            {...props}
        />
    );
}

export { Typography, typographyVariants };
