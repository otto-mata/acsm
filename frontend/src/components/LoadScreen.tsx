import { Spinner } from './ui/spinner';

export function LoadScreen() {
    return (
        <div className="w-full min-h-full flex justify-center align-middle">
            <Spinner className="m-auto" />
        </div>
    );
}
