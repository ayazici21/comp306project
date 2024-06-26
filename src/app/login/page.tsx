import Login from "@/components/login/Login";
import Link from "next/link";

const LoginPage = () => {
    return (
        <div className="flex h-screen justify-content-center">
            <div className="my-auto w-8 md:w-6 lg:w-4">
                <Login/>
                <p className="p-text-secondary text-center">
                    Don&apos;t have an account? <Link href="/register" className="p-link">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;