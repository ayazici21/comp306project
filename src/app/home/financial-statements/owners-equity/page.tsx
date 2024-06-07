'use client'

import React, {useEffect, useRef, useState} from "react";
import {Toast} from "primereact/toast";
import type {OwnersEquity} from "@/lib/statements";
import {Card} from "primereact/card";
import {ProgressSpinner} from "primereact/progressspinner";
import {formatCurrency} from "@/app/home/financial-statements/currency";


const getOwnersEquityData = async () => {
    try {
        const res =
            await fetch(`/api/financial-statements?userId=${localStorage.getItem('userId')}&type=owners-equity`);

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
        if (!loading) {
            return;
        }
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
        <div>
            <Toast ref={toast}/>
            {
                loading ? (
                        <div className="w-full h-screen flex flex-column m-auto justify-content-center">
                            <ProgressSpinner/>
                        </div>
                    ) :
                    <div className="p-grid p-dir-col owners-equity">
                        <div className="p-col">
                            <Card title="Owner's Equity" className="owners-equity-card">
                                <div className="p-fluid">
                                    <div className="p-field p-grid p-align-center p-justify-between">
                                        <label className="p-col-fixed font-semibold text-base" style={{width: '150px'}}>Beginning
                                            Capital:</label>
                                        <div className="p-col">
                                            <span>{formatCurrency(beginningEquity)}</span>
                                        </div>
                                    </div>
                                    <div className="p-field p-grid p-align-center p-justify-between">
                                        <label className="p-col-fixed font-semibold text-base" style={{width: '150px'}}>Net
                                            Income:</label>
                                        <div className="p-col">
                                            <span>{formatCurrency(netIncome)}</span>
                                        </div>
                                    </div>
                                    <div className="p-field p-grid p-align-center p-justify-between">
                                        <label className="p-col-fixed font-semibold text-base" style={{width: '150px'}}>Owner
                                            Contribution:</label>
                                        <div className="p-col">
                                            <span>{formatCurrency(contribution)}</span>
                                        </div>
                                    </div>
                                    <div className="p-field p-grid p-align-center p-justify-between">
                                        <label className="p-col-fixed font-semibold text-base" style={{width: '150px'}}>Owner
                                            Withdrawal:</label>
                                        <div className="p-col">
                                            <span>{formatCurrency(withdrawal)}</span>
                                        </div>
                                    </div>
                                    <div className="p-field p-grid p-align-center p-justify-between">
                                        <label className="p-col-fixed font-semibold text-base" style={{width: '150px'}}>Ending
                                            Capital:</label>
                                        <div className="p-col">
                                            <span>{formatCurrency(endingEquity)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
            }
        </div>

    )

}


export default OwnersEquity;