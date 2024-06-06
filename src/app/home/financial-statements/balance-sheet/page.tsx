'use client'

import React, {useEffect, useState} from "react";
import {useRef} from "react";
import {Toast} from "primereact/toast";
import type {Assets, BalanceSheet, Equity, Expenses, IncomeStatement, Liabilities, Revenues} from "@/lib/statements";
import {Card} from "primereact/card";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {classNames} from "primereact/utils";
import {formatCurrency} from "@/app/home/financial-statements/currency";
import {ProgressSpinner} from "primereact/progressspinner";

const getBalanceSheetData = async () => {
    const res =
        await fetch(`/api/financial-statements?userId=${localStorage.getItem('userId')}&type=balance-sheet`);

    if (res.status === 200) {
        return await res.json();
    }
    return null;
}

const BalanceSheetPage = () => {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(true);
    const [assetsData, setAssetsData] = useState<Assets>([]);
    const [totalAssets, setTotalAssets] = useState(0);
    const [liabilitiesData, setLiabilitiesData] = useState<Liabilities>([]);
    const [totalLiabilities, setTotalLiabilities] = useState(0);
    const [equityData, setEquityData] = useState<Equity>([]);
    const [totalEquity, setTotalEquity] = useState(0);
    const [totalLiabilitiesAndEquity, setTotalLiabilitiesAndEquity] = useState(0)

    useEffect(() => {
        getBalanceSheetData().then((data: BalanceSheet) => {
            if (data === null) {
                toast.current!.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to fetch income statement data",
                    life: 3000,
                });
            } else {
                setAssetsData(data.assets);
                setTotalAssets(data.totalAssets);
                setLiabilitiesData(data.liabilities);
                setTotalLiabilities(data.totalLiabilities);
                setEquityData(data.equity);
                setTotalEquity(data.totalEquity);
                setTotalLiabilitiesAndEquity(data.totalLiabilitiesAndEquity)
                setLoading(false);
            }
        })
    }, []);

    const isClose = (n1: number, n2: number, precision: number = 3) => {
        return Math.abs(n1 - n2) <= Math.pow(10, -precision);
    }


    return (
        loading ? (
            <div className="w-full h-screen flex flex-column m-auto justify-content-center">
                <ProgressSpinner />
            </div>
            ) :
        <div className="p-grid p-dir-col balance-sheet">
            <Toast ref={toast} />
            <div className="p-col">
                <Card title="Balance Sheet">
                    <div className="p-grid">
                        <div className="p-col-4 assets-section">
                            <h5>Assets</h5>
                            <DataTable value={assetsData} loading={loading} emptyMessage="No assets available.">
                                <Column field="accountName" header="Account Name"/>
                                <Column field="total" header="Total" body={(rowData) => formatCurrency(rowData.total)}/>
                            </DataTable>
                            <div className="total my-2">
                                <span className={isClose(totalAssets, totalLiabilitiesAndEquity) ? "text-secondary" : "text-red-700"}>Total Assets: {formatCurrency(totalAssets)}</span>
                            </div>
                        </div>
                        <div className="p-col-4 liabilities-section">
                            <h5>Liabilities</h5>
                            <DataTable value={liabilitiesData} loading={loading} emptyMessage="No liabilities available.">
                                <Column field="accountName" header="Account Name"/>
                                <Column field="total" header="Total" body={(rowData) => formatCurrency(rowData.total)}/>
                            </DataTable>
                            <div className="total my-2">
                                <span>Total Liabilities: {formatCurrency(totalLiabilities)}</span>
                            </div>
                        </div>
                        <div className="p-col-4 equity-section">
                            <h5>Equity</h5>
                            <DataTable value={equityData} loading={loading} emptyMessage="No equity available.">
                                <Column field="accountName" header="Account Name"/>
                                <Column field="total" header="Total" body={(rowData) => formatCurrency(rowData.total)}/>
                            </DataTable>
                            <div className="total my-2">
                                <span>Total Equity: {formatCurrency(totalEquity)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-grid total-liabilities-equity">
                        <div className="p-col">
                            <span className={isClose(totalAssets, totalLiabilitiesAndEquity) ? "text-secondary" : "text-red-700"}>Total Liabilities and Owner's Equity: {formatCurrency(totalLiabilitiesAndEquity)}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )

}

export default BalanceSheetPage;
