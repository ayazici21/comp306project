'use client'

import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './sidebar.css';  

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
    const toast = useRef<Toast>(null);
    const router = useRouter();

    const logOut = async () => {
        const res = await fetch("/api/auth/logout", {
            method: "POST",
        });

        if (res.status === 401) {
            toast.current!.show({
                severity: "error",
                summary: "Error",
                detail: "You are not logged in"
            });
            router.push("/");
        } else if (res.status === 500) {
            toast.current!.show({
                severity: "error",
                summary: "Error",
                detail: "An unknown error has occurred"
            });
        } else if (res.status === 200) {
            router.push("/");
        }
    };

    return (
        <div className="layout">
            <Toast ref={toast} />
            <div className="sidebar-wrapper">
                <div className="custom-sidebar">
                    <h3>Navigation</h3>
                    <div className="separator"></div>
                    <div className="sidebar-links">
                        <Link href="/home/dashboard" className="sidebar-link">Dashboard</Link>
                        <Link href="/home/accounts" className="sidebar-link">Accounts</Link>
                        <Link href="/home/ledger" className="sidebar-link">Ledger</Link>
                        <Link href="/home/t-balances" className="sidebar-link">T-Balances</Link>
                        <Link href="/home/financial-statements" className="sidebar-link">Financial Statements</Link>
                    </div>
                    <Button label="Logout" icon="pi pi-sign-out" className="p-button-danger" onClick={logOut} />
                </div>
            </div>
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default HomeLayout;
