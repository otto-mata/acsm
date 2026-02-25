import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/src/components/ui/button';

export default function LoginPage() {
    return (
        <div className="h-screen w-screen flex">
            <Card className="w-xs lg:w-lg m-auto flex flex-col justify-around">
                <CardHeader className="text-center">Login</CardHeader>
                <CardContent>
                    <form className="flex flex-col gap-y-2">
                        <Input type="text" placeholder="Email" />
                        <Input type="password" placeholder="Password" />
                        <Button type="submit">Connect</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
