import * as React from 'react';

import { cn } from '@/lib/utils';

export function TypographyCode({
    className,
    children,
    ...props
}: React.ComponentProps<'code'>) {
    const defaultclsx =
        'bg-secondary text-secondary-foreground relative rounded px-[0.3rem] py-[0.2rem] font-mono';
    return (
        <code className={cn(defaultclsx, className)} {...props}>
            {children}
        </code>
    );
}

export function TypographyH1({
    className,
    children,
    ...props
}: React.ComponentProps<'h1'>) {
    const defaultclsx =
        'scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance';
    return (
        <h1 className={cn(defaultclsx, className)} {...props}>
            {children}
        </h1>
    );
}

export function TypographyH2({
    className,
    children,
    ...props
}: React.ComponentProps<'h2'>) {
    const defaultclsx =
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0';
    return (
        <h2 className={cn(defaultclsx, className)} {...props}>
            {children}
        </h2>
    );
}

export function TypographyH3({
    className,
    children,
    ...props
}: React.ComponentProps<'h3'>) {
    const defaultclsx = 'scroll-m-20 text-2xl font-semibold tracking-tight';
    return (
        <h3 className={cn(defaultclsx, className)} {...props}>
            {children}
        </h3>
    );
}

export function TypographyH4({
    className,
    children,
    ...props
}: React.ComponentProps<'h4'>) {
    const defaultclsx = 'scroll-m-20 text-xl font-semibold tracking-tight';
    return (
        <h4 className={cn(defaultclsx, className)} {...props}>
            {children}
        </h4>
    );
}

export function TypographyP({
    className,
    children,
    ...props
}: React.ComponentProps<'p'>) {
    const defaultclsx = 'leading-7 [&:not(:first-child)]:mt-6';
    return (
        <p className={cn(defaultclsx, className)} {...props}>
            {children}
        </p>
    );
}
export function TypographyLarge({
    className,
    children,
    ...props
}: React.ComponentProps<'div'>) {
    const defaultclsx = 'text-lg font-semibold';
    return (
        <div className={cn(defaultclsx, className)} {...props}>
            {children}
        </div>
    );
}
export function TypographySmall({
    className,
    children,
    ...props
}: React.ComponentProps<'div'>) {
    const defaultclsx = 'text-sm leading-none font-medium';
    return (
        <div className={cn(defaultclsx, className)} {...props}>
            {children}
        </div>
    );
}
export function TypographyMuted({
    className,
    children,
    ...props
}: React.ComponentProps<'p'>) {
    const defaultclsx = 'text-muted-foreground text-sm';
    return (
        <p className={cn(defaultclsx, className)} {...props}>
            {children}
        </p>
    );
}
