'use client'

import {useState, useRef, FormEvent} from "react";
import { useRouter } from "next/navigation";

import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";

export default () => {
    const [loading, setLoading] = useState<boolean>(false);

    const router = useRouter();

    const toast = useRef<Toast>(null);

    const loginHandler = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        let usernameOrEmail = formData.get("usernameOrEmail")
        let password = formData.get("password")

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({usernameOrEmail, password})
        })

        if (res.status == 401) {
            toast.current!.show({
                severity: "error",
                summary: "Error",
                detail: "Incorrect email or password",
                life: 3000,
            });

        } else if (res.status == 200) {
            console.log("aaa")
            router.push("/home/dashboard");
        } else {
            if (res.status !== 500) {
                console.log(res.body);
            }
            toast.current!.show({
                severity: "error",
                summary: "Error",
                detail: "An unknown error has occurred",
                life: 3000,
            })
            console.log(res)
        }
        setLoading(false);
    }

    return (
        <form onSubmit={loginHandler}>
            <Toast ref={toast} />

            <div className="h-100 middle-box text-center loginscreen animated fadeInDown">
                <div className="m-5">
                    <div className="mb-5">
                        <span className="p-float-label">
                            <InputText className="w-full" id="usernameOrEmail" name="usernameOrEmail"/>
                            <label htmlFor="usernameOrEmail">Username or Email</label>
                        </span>
                    </div>
                    <div className="mb-5">
						<span className="p-float-label">
							<Password
                                className="w-full"
                                inputClassName="w-full"
                                feedback={false}
                                inputId="password"
                                name="password"
                            />
							<label htmlFor="password">Password</label>
						</span>
                    </div>

                    <div>
                        <Button label="Login" severity="success" loading={loading}/>
                    </div>
                </div>
            </div>
        </form>
    );
}
