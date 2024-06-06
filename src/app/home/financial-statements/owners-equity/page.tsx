'use client'

import React, {useEffect, useRef, useState} from "react";
import {Toast} from "primereact/toast";
import type {OwnersEquity} from "@/lib/statements";
import {Card} from "primereact/card";
import EquityItem from "@/components/statements/EquityItem";
import {ProgressSpinner} from "primereact/progressspinner";


const getOwnersEquityData = async () => {
    try {
        const res =
            await fetch(`/api/financial-statements?userId=${localStorage.getItem('userId')}&type=income`);

        if (res.status === 200) {
            return await res.json();
        }
    } catch (error) {
        console.error(error)
    }
    return null;
}


const OwnersEquity = () => {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(true);
    const [beginningEquity, setBeginningEquity] = useState(0);
    const [netIncome, setNetIncome] = useState(0)
    const [contribution, setContribution] = useState(0);
    const [withdrawal, setWithdrawal] = useState(0)
    const [endingEquity, setEndingEquity] = useState(0);

    useEffect(() => {
        getOwnersEquityData().then((data: OwnersEquity | null) => {
            if (data === null) {
                toast.current!.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to fetch income statement data",
                    life: 3000,
                });
            } else {
                setLoading(false);
                setBeginningEquity(data.beginningCapital);
                setNetIncome(data.netIncome);
                setContribution(data.contribution);
                setWithdrawal(data.withdrawal);
                setEndingEquity(data.endingCapital);
            }
        })
    })


    return (
        loading ? (
                <div className="w-full h-screen flex flex-column m-auto justify-content-center">
                    <ProgressSpinner />
                </div>
            ) :
            <div className="p-grid p-dir-col owners-equity">
                <div className="p-col">
                    <Card title="Owner's Equity" className="owners-equity-card">
                        <EquityItem value={beginningEquity} label="Beginning Equity"/>
                        <EquityItem label={"Net Income"} value={netIncome}/>
                        <EquityItem label={"Owner Contribution"} value={contribution}/>
                        <EquityItem label={"Owner Withdrawals"} value={withdrawal}/>
                        <EquityItem label={"Ending Equity"} value={endingEquity}/>

                    </Card>
                </div>
            </div>
    )

}


export default OwnersEquity;