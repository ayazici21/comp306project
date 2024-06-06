'use client'

import {FormEvent, useRef, useState} from "react";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";
import {SelectButton} from "primereact/selectbutton";
import {InputNumber} from "primereact/inputnumber";
import {Toast} from "primereact/toast";
import {Button} from "primereact/button";
import {useRouter} from "next/navigation";


const AddAccount = () => {
    const [name, setName] = useState("");
    const [type, setType] = useState("ASSET");
    const [isTemp, setIsTemp] = useState(false);
    const [liquidity, setLiquidity] = useState(0);
    const [contraOf, setContraOf] = useState("");

    const toast = useRef<Toast>(null);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        let uid = localStorage.getItem("userId");

        if (uid === null) {
            toast.current!.show({
                severity: "error",
                summary: "Error",
                detail: "Cannot find user data. Please clear your cookies.",
                life: 3000,
            });
            return;
        }

        if (name === "") {
            toast.current!.show({
                severity: "error",
                summary: "Error",
                detail: "Enter a valid account name",
                life: 3000,
            });
            return;
        } else if (liquidity === 0) {
            toast.current!.show({
                severity: "error",
                summary: "Error",
                detail: "Enter a valid liquidity amount",
                life: 3000,
            });
            return;
        }

        const res = await fetch("/api/accounts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uid: parseInt(uid),
                accountName: name,
                isTemp,
                liquidity,
                contraAcctName: contraOf === "" ? undefined : contraOf,
                type,
            }),
        });

        if (res.status === 200) {
            toast.current!.show({
                severity: "success",
                summary: "Success",
                detail: "Account added successfully",
                life: 3000,
            });
            setName("")
            setLiquidity(0);
            setIsTemp(false);
            setContraOf("");
            setType("ASSET");
        } else if (res.status === 500) {
            toast.current!.show({
                severity: "error",
                summary: "Error",
                detail: "An unknown error has occurred",
                life: 3000,
            });
        } else if (res.status === 400) {
            const {error} = await res.json();
            toast.current!.show({
                severity: "error",
                summary: "Error",
                detail: error,
                life: 3000,
            });
        } else if (res.status === 409) {
            toast.current!.show({
                severity: "error",
                summary: "Error",
                detail: "Cannot create this account",
                life: 3000,
            });
        }

    }

    return (
        <div className="flex justify-content-center">
            <Toast ref={toast}/>
            <div className="w-full md:w-8 lg:w-6">
                <h1 className="text-center mb-4">Add an Account</h1>
                <form onSubmit={handleSubmit} className="p-fluid p-formgrid p-grid gap-4">
                    <div className="p-field p-col-12 py-3">
                        <span className="p-float-label my-1">
                            <InputText
                                className="w-full"
                                name="name"
                                id="name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                aria-label="Name"
                            />
                            <label htmlFor="name">Name</label>
                        </span>
                    </div>

                    <div className="p-field p-col-12 py-3">
                        <Dropdown
                            className="my-1"
                            options={[
                                {label: 'Asset', value: 'ASSET'},
                                {label: 'Liability', value: 'LIABILITY'},
                                {label: 'Equity', value: 'EQUITY'}
                            ]}
                            value={type}
                            id="accountType"
                            name="accountType"
                            onChange={e => setType(e.value)}
                            placeholder="Select an account type"
                            aria-label="Account Type"
                        />
                    </div>

                    <div className="p-field p-col-12 py-3">
                        <SelectButton
                            className="my-1"
                            value={isTemp ? "Temporary" : "Permanent"}
                            onChange={e => setIsTemp(e.value === "Temporary")}
                            options={[
                                {label: "Permanent", value: "Permanent"},
                                {label: "Temporary", value: "Temporary"},
                            ]}
                            aria-label="Account Duration"
                        />
                    </div>

                    <div className="p-field p-col-12 py-3">
                        <span className="p-float-label my-1">
                            <InputNumber
                                value={liquidity ?? ""}
                                onChange={e => setLiquidity(e.value ?? 0)}
                                min={0}
                                name="liquidity"
                                id="liquidity"
                                aria-label="Account Liquidity"
                            />
                            <label htmlFor="liquidity">Account Liquidity</label>
                        </span>
                    </div>

                    <div className="p-field p-col-12 py-3">
                        <span className="p-float-label my-1">
                            <InputText
                                className="w-full"
                                name="contraAccountName"
                                id="contraAccountName"
                                value={contraOf}
                                onChange={e => setContraOf(e.target.value)}
                                aria-label="Contra-Account Name"
                            />
                            <label htmlFor="contraAccountName">Contra-Account Name</label>
                        </span>
                    </div>

                    <div className="p-field p-col-12 text-right py-3 flex">
                        <Button label="Add Account" type="submit" className="p-button-primary mr-2"/>
                        <Button label="Back" type="button" className="p-button-secondary" onClick={() => router.push("/home/accounts")}/>
                    </div>
                </form>
            </div>
        </div>

    )
}

export default AddAccount;