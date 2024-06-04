'use client'

import {Toast} from "primereact/toast";
import {InputText} from "primereact/inputtext";
import {Password} from "primereact/password";
import {Button} from "primereact/button";
import {FormEvent, useRef, useState} from "react";
import {z, ZodError} from "zod"

const schema = z.object({
    username: z.string({required_error: "Username is required"})
        .min(3, "Username must have at least 3 characters")
        .max(32, "Username can have at most 32 characters")
        .regex(/^[A-Za-z0-9_.-]*$/, "Username cannot have special characters other than \"_\", \"-\", \".\""),
    email: z.string({required_error: "Email is required"})
        .email("Enter a valid email")
        .max(64, "Email cannot have more than 64 characters"),
    password: z.string()
        .min(8, "Password must have at least 8 characters")
        .max(64, "Password can have at most 64 characters")
        .regex(/[a-z]/, "Password must contain at least one lowercase character")
        .regex(/[A-Z]/, "Password must contain at least one uppercase character")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/\W/, "Password must contain at least one special character")
        .regex(/^\S*$/, "Password cannot contain any spaces"),
    confirmPassword: z.string()
}).refine(
    ({password, confirmPassword}) => password === confirmPassword,
    {message: "Enter a matching password", path: ["confirmPassword"]}
);

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<{ username?: string, email?: string, password?: string, confirmPassword?: string}>({});
    const toast = useRef<Toast>(null);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const registerHandler = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        setFormErrors({})


        try {
            schema.parse({
                username: username,
                email: email,
                password: password,
                confirmPassword: confirmPassword
            });
        } catch (e) {
            setPassword("");
            setConfirmPassword("")
            if (e instanceof ZodError) {
                const errors: {[key: string]: string} = {}
                e.errors.forEach((err) => {
                    const field = err.path[0];
                    if (!errors[field]) {
                        errors[field] = err.message
                    }
                });
                setFormErrors(errors)
            } else {
                toast.current!.show({
                    severity: "error",
                    summary: "Error",
                    detail: "An error occurred. Please try again later",
                    life: 3000,
                })
                console.log(e);
            }

            setLoading(false);
            return;
        }

        const res = await fetch("/api/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, email, password})
        });

        if (res.ok) {
            toast.current!.show({
                severity: "success",
                summary: "Success",
                detail: "Successfully created an account. Redirecting to the main page",
                life: 3000,
            });

            setUsername("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
        } else {
            setPassword("");
            setConfirmPassword("");
            toast.current!.show({
                severity: "error",
                summary: "Error",
                detail: (await res.json()).error ?? "An error occurred",
                life: 3000,
            });

        }
        setLoading(false);
    }

    return (
        <form onSubmit={registerHandler}>
            <Toast ref={toast}/>

            <div className="h-100 middle-box text-center loginscreen animated fadeInDown">
                <div className="m-5">
                    <div className="mb-5 text-left">
						<span className="p-float-label">
							<InputText
                                className="w-full" id="username" name="username"
                                invalid={!!formErrors.username}
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
							<label htmlFor="username">Username</label>
						</span>
                        <small className="p-error">{formErrors.username}</small>
                    </div>

                    <div className="mb-5 text-left">
						<span className="p-float-label">
							<InputText
                                className="w-full" id="email" name="email"
                                invalid={!!formErrors.email}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
							<label htmlFor="email">Email</label>
						</span>
                        <small className="p-error">{formErrors.email}</small>
                    </div>

                    <div className="mb-5 text-left">
						<span className="p-float-label">
							<Password
                                className="w-full"
                                inputClassName="w-full"
                                feedback={false}
                                inputId="password"
                                name="password"
                                invalid={!!formErrors.password}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
							<label htmlFor="password">Password</label>
						</span>
                        <small className="p-error">{formErrors.password}</small>
                    </div>

                    <div className="mb-5 text-left">
						<span className="p-float-label">
							<Password
                                className="w-full"
                                inputClassName="w-full"
                                feedback={false}
                                inputId="confirmPassword"
                                name="confirmPassword"
                                invalid={!!formErrors.confirmPassword}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
							<label htmlFor="confirmPassword">Confirm Password</label>
						</span>
                        <small className="p-error">{formErrors.confirmPassword}</small>
                    </div>

                    <div>
                        <Button label="Register" severity="success" loading={loading}/>
                    </div>
                </div>
            </div>
        </form>
    );
}


export default Register;