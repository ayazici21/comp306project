'use client'

import {Button} from "primereact/button";
import {Toast} from "primereact/toast";
import {useRef} from "react";
import {useRouter} from "next/navigation";

const DashboardPage = () => {
    const toast = useRef<Toast>(null);
    const router = useRouter()

    const logOut = async () => {
        const res = await fetch("/api/auth/logout", {
            method: "POST",
        })

        if (res.status === 401) {
            toast.current!.show({
                severity: "error",
                summary: "Error",
                detail: "You are not logged in"
            })
            router.push("/")
        } else if (res.status === 500) {
            toast.current!.show({
                severity: "error",
                summary: "Error",
                detail: "An unknown error has occurred"
            })
        } else if (res.status === 200) {
            router.push("/")
        }
    }

    return (
        <>
            <Toast ref={toast} />
            <Button label="Log out" severity="danger" onClick={logOut} />
        </>
    )
}

export default DashboardPage;