import { Spinner } from './ui/spinner';

export function LoadScreen() {
    return (
        <div className="w-screen h-screen flex justify-center align-middle">
            <Spinner className="m-auto" />
        </div>
    );
}
