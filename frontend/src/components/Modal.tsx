import { ReactNode } from 'react';

export function ModalDialog({
    setModalState,
    children,
}: {
    setModalState: (x: boolean) => void;
    children: ReactNode;
}) {
    return (
        <div>
            <div className="fixed inset-0 size-auto max-h-none max-w-none overflow-y-auto bg-transparent backdrop:bg-transparent">
                <div
                    className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                    onClick={() => {
                        setModalState(false);
                    }}
                ></div>
                <div className="flex min-h-full items-end justify-center p-4 text-center focus:outline-none sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
