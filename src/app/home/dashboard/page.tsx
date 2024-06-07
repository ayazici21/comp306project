'use client'

import {Chart} from "primereact/chart";
import {Account, BalanceSheet} from "@/lib/statements";
import React, {useEffect, useRef, useState} from "react";
import {Toast} from "primereact/toast";
import {ProgressSpinner} from "primereact/progressspinner";

const fetchData = async (): Promise<BalanceSheet | null> => {
    const res = await fetch(`/api/financial-statements?userId=${localStorage.getItem('userId')}&type=balance-sheet`);
    if (res.status === 200) {
        return await res.json() as BalanceSheet;
    }
    return null;
}

const DashboardPage = () => {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(true);
    const [totalAssets, setTotalAssets] = useState(0);
    const [totalLiabilities, setTotalLiabilities] = useState(0);
    const [totalEquity, setTotalEquity] = useState(0);
    const [totalAccounts, setTotalAccounts] = useState<Account>([])

    useEffect(() => {
        if (!loading) {
            return;
        }
        fetchData().then(data => {
            if (data === null) {
                toast.current!.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to fetch data",
                    life: 3000,
                });
            } else {
                setTotalAssets(data.totalAssets);
                setTotalLiabilities(data.totalLiabilities);
                setTotalEquity(data.totalEquity);

                const allAccounts = data.assets.concat(data.liabilities).concat(data.equity);
                const threshold = (data.totalAssets + data.totalLiabilities + data.totalEquity) * 0.03;

                let otherTotal = 0;
                const filtered = allAccounts.filter(account => {
                    const tot = Math.abs(account.total);
                    if (tot < threshold) {
                        otherTotal += tot;
                        return false;
                    }
                    return true;
                });

                filtered.push({accountName: 'Other', total: otherTotal});
                setTotalAccounts(filtered);
                setLoading(false);

            }
        })
    })

    return (
        <div>
            <Toast ref={toast} />
            {
                loading ? (
                        <div className="w-full h-screen flex flex-column m-auto justify-content-center">
                            <ProgressSpinner />
                        </div>
                    ) :
                    <div className="flex h-screen flex-column m-auto w-10 md:w-9 lg:w-6">
                        <Chart
                            type="pie" className="p-3"
                            data={{
                                labels: ['Assets', 'Liabilities', 'Equity'],
                                datasets: [{
                                    data: [totalAssets, totalLiabilities, totalEquity],
                                }]
                            }} />

                        <Chart
                            type="pie" className="p-3"
                            data={{
                                labels: totalAccounts.map(account => account.accountName),
                                datasets: [{
                                    data: totalAccounts.map(account => Math.abs(account.total))
                                }]
                            }} />
                    </div>

            }
        </div>
    );
};

export default DashboardPage;
