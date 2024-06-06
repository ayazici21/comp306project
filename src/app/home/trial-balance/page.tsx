'use client'

import React, {useEffect, useRef, useState} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Toast} from 'primereact/toast';
import {ProgressSpinner} from "primereact/progressspinner";
import {Card} from "primereact/card";

type TrialBalance = {
    trialBalanceData: {
        accountName: string,
        total: number
    }[],
    totalDebits: number,
    totalCredits: number,
};

const getTrialBalanceData = async (): Promise<TrialBalance | null> => {
    const res = await fetch(`/api/trial-balance?userId=${localStorage.getItem('userId')}`);

    if (res.status === 200) {
        return await res.json();
    }
    return null;
}

const TrialBalancePage = () => {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(true);
    const [balances, setBalances] = useState<{accountName: string, debit: number, credit: number}[]>([]);

    useEffect(() => {
        getTrialBalanceData().then((data) => {
            if (data === null) {
                toast.current!.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to fetch trial balance data",
                    life: 3000,
                });
            } else {
                const trialBalanceData = data.trialBalanceData.map(({accountName, total}) => {
                    return {
                        accountName,
                        debit: total > 0 ? total : 0,
                        credit: total < 0 ? -total : 0
                    }
                });
                trialBalanceData.push({accountName: "Total", debit: data.totalDebits, credit: data.totalCredits});

                setLoading(false);
                setBalances(trialBalanceData);
            }
        });
    }, []);

    return (
        <div>
            <Toast ref={toast}/>

            {
                loading ? (
                    <div className="w-full h-screen flex flex-column m-auto justify-content-center">
                        <ProgressSpinner />
                    </div>
                ) :
                    <Card title="Trial Balance">
                        <DataTable value={balances} emptyMessage="" rowClassName={data => {
                            if (data.accountName === "Total" && data.debit != data.credit) {
                                return "text-red-700";
                        }}}>
                            <Column field="accountName" header="Account Name"/>
                            <Column field="debit" header="Debit"/>
                            <Column field="credit" header="Credit"/>
                        </DataTable>
                    </Card>
            }
        </div>
    );
};

export default TrialBalancePage;
