import Link from "next/link";
import Register from "@/components/register/Register";

export default () => {
    return (
        <div className="flex h-screen justify-content-center">
            <div className="my-auto w-8 md:w-6 lg:w-4">
                <h1 className="text-primary text-lg md:text-xl lg:text-2xl text-center">Create an Account</h1>
                <Register/>
                <p className="p-text-secondary text-center">
                    Already have an account? <Link href="/" className="p-link">Login</Link>
                </p>
            </div>
        </div>
    );
}