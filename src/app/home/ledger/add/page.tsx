'use client'

import {FormEvent, useRef, useState} from "react";
import {InputText} from "primereact/inputtext";
import {Calendar} from "primereact/calendar";
import { Toast } from "primereact/toast";
import {Nullable} from "primereact/ts-helpers";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {InputNumber} from "primereact/inputnumber";
import {Button} from "primereact/button";
import {useRouter} from "next/navigation";

const AddEntry = () => {
    const toast = useRef<Toast>(null);
    const [date, setDate] = useState<Nullable<Date>>(new Date());
    const [inputRows, setInputRows] = useState<{[key: string]: number | string}[]>([
        {name: "", debit: 0, credit: 0}
    ]);
    const router = useRouter();

    const handleRowChange = (value: string | number, index: number, field: string) => {
        const newRows = [...inputRows];
        newRows[index][field] = value;
        // Add a new row if the last row is filled
        if (index === newRows.length - 1 && field === "name" && value !== "") {
            newRows.push({name: "", debit: 0, credit: 0});
        }
        while (newRows.length > 1) {
            const lastRow = newRows[newRows.length - 1];
            const secondLastRow = newRows[newRows.length - 2];

            if (lastRow.name === "" && lastRow.debit === 0 && lastRow.credit === 0
                && secondLastRow.name === "" && secondLastRow.debit === 0 && secondLastRow.credit === 0) {
                newRows.pop();
            } else {
                break;
            }
        }

        setInputRows(newRows)
    };


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

        if (date === null || date === undefined) {
            toast.current!.show({
                severity: "error",
                summary: "Error",
                detail: "Enter a valid date",
                life: 3000,
            });
            return;
        }
        const data: {accountName: string, value: number, isDebit: boolean}[] = []

        for (const row of inputRows as {name: string, debit: number, credit: number}[]) {
            if (row.name === "" && row.debit === 0 && row.credit === 0) {
                continue;
            }
            if (row.name !== "" && ((row.debit !== 0) !== (row.credit !== 0))) {
                data.push({
                    accountName: row.name,
                    value: row.debit !== 0 ? row.debit : row.credit,
                    isDebit: row.debit !== 0
                })
            } else {
                if (row.name === "") {
                    toast.current!.show({
                        severity: "error",
                        summary: "Error",
                        detail: "Enter a valid account name",
                        life: 3000,
                    });
                } else {
                    toast.current!.show({
                        severity: "error",
                        summary: "Error",
                        detail: "Only one of debit or credit can be non-zero",
                        life: 3000,
                    });
                }
                return;
            }
        }

        const res = await fetch("/api/entries", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: parseInt(uid),
                date: date.toISOString(),
                entries: data
            }),
        });

        if (res.status === 200) {
            toast.current!.show({
                severity: "success",
                summary: "Success",
                detail: "Entry added successfully",
                life: 3000,
            });
        } else {
            toast.current!.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to add entry",
                life: 3000,
            })
        }
    }

    return (
        <div className="flex justify-content-center">
            <Toast ref={toast} />
            <div className="w-full md:w-8 lg:w-6">
                <h1 className="text-center mb-4"> Add an Entry </h1>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-column align-items-center mb-3">
                        <span className="flex-auto">
                            <label htmlFor="date" className="font-bold block mb-2"> Date </label>
                            <Calendar
                                name="date" id="date" showIcon
                                value={date} onChange={e => setDate(e.value)}/>
                        </span>
                    </div>
                    <div className="flex flex-column align-items-center">
                        <DataTable value={inputRows} className="w-fit" scrollable scrollHeight="50vh">
                            <Column field="accountName" header="Account Name" body={(rowData, options) =>
                                <InputText
                                    value={rowData.name}
                                    onChange={e => handleRowChange(e.target.value, options.rowIndex, 'name')}
                                />
                            } />

                            <Column field="debit" header="Debit" body={(rowData, options) =>
                                <InputNumber
                                    value={rowData.debit} mode="currency" currency="USD" locale="en-us"
                                    onValueChange={e => handleRowChange(e.value ?? 0, options.rowIndex, 'debit')}
                                />
                            } />

                            <Column field="credit" header="Credit" body={(rowData, options) =>
                                <InputNumber
                                    value={rowData.credit} mode="currency" currency="USD" locale="en-us"
                                    onValueChange={e => handleRowChange(e.value ?? 0, options.rowIndex, 'credit')}
                                />
                            } />
                        </DataTable>
                    </div>
                    <div className="flex m-auto w-full mt-4">
                        <Button type="submit" label="Submit" className="w-full" />
                        <Button type="button" label="Back" className="ml-2 w-full" onClick={() => router.push("/home/ledger")}/>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddEntry;