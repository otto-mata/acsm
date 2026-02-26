export default function UserSpaceLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            coucou<div>{children}</div>
        </>
    );
}
