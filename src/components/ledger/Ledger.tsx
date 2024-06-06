'use client'

import {useEffect, useRef, useState} from "react";
import {Toast} from "primereact/toast";
import {useRouter} from "next/navigation";
import {Button} from "primereact/button";
import {Card} from "primereact/card";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";

const getEntries = async () => {
    const res = await fetch(`/api/entries?userId=${localStorage.getItem('userId')}`);
    if (res.status === 200) {
        return await res.json();
    }

    return null;
}

const Ledger = () => {
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const [entries, setEntries] = useState<any[]>([]);

    useEffect(() => {
        getEntries().then(data => {
            if (data === null) {
                toast.current!.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to fetch accounts",
                    life: 3000,
                });
            } else {
                setLoading(false);
                setEntries(data.flatMap((entry: {
                    entryId: string,
                    date: string,
                    entries: { accountName: string, value: number, isDebit: boolean }[]
                }) => {
                    const date = new Date(entry.date).toLocaleDateString("en-us");
                    return entry.entries.map(e => ({
                        id: entry.entryId,
                        date,
                        accountName: e.accountName,
                        debit: e.isDebit ? e.value : '',
                        credit: !e.isDebit ? e.value : ''
                    }));
                }));
            }
        })
    })

    return (
        <div className="flex justify-content-center w-full">
            <Toast ref={toast}/>

            <div className="w-10 lg:w-8">
                <Button
                    label="Add an Entry" className="p-button-primary w-full my-1"
                    onClick={() => router.push("/home/ledger/add")}
                />

                <div className="w-full my-1">
                    <Card>
                        <DataTable
                            scrollable scrollHeight="75vh" value={entries} loading={loading}
                            groupRowsBy="date" rowGroupMode="subheader">
                            <Column hidden={true} field="id" />
                            <Column
                                field="date" header="Date"
                                body={(rowData, options) => {
                                    if (options.rowIndex === 0 || rowData.id !== entries[options.rowIndex - 1].id) {
                                        return rowData.date;
                                    }
                                }}/>
                            <Column
                                field="accountName" header="Account Name"
                                body={rowData => (
                                    <div className={rowData.credit ? "ml-4" : ""}> {rowData.accountName} </div>
                                )}
                            />
                            <Column
                                field="debit" header="Debit"
                                body={rowData => rowData.debit}/>
                            <Column
                                field="credit" header="Credit"
                                body={rowData => rowData.credit}/>
                        </DataTable>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Ledger;