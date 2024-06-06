'use client'

import React, {useEffect, useState} from "react";
import {useRef} from "react";
import {Toast} from "primereact/toast";
import type {Expenses, IncomeStatement, Revenues} from "@/lib/statements";
import {Card} from "primereact/card";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {formatCurrency} from "@/app/home/financial-statements/currency";
import {ProgressSpinner} from "primereact/progressspinner";

const getIncomeData = async () => {
    const res =
        await fetch(`/api/financial-statements?userId=${localStorage.getItem('userId')}&type=income`);

    if (res.status === 200) {
        return await res.json();
    }
    return null;
}

const IncomeStatementPage = () => {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState<Revenues>([]);
    const [totalRevenues, setTotalRevenues] = useState(0);
    const [expenseData, setExpenseData] = useState<Expenses>([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [netIncome, setNetIncome] = useState(0);

    useEffect(() => {
        getIncomeData().then((data: IncomeStatement | null) => {
            if (data === null) {
                toast.current!.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to fetch income statement data",
                    life: 3000,
                });
            } else {
                setRevenueData(data.revenues);
                setTotalRevenues(data.totalRevenues);
                setExpenseData(data.expenses);
                setTotalExpenses(data.totalExpenses);
                setNetIncome(data.netIncome);
                setLoading(false);
            }
        })
    }, []);

    return (
        loading ? (
                <div className="w-full h-screen flex flex-column m-auto justify-content-center">
                    <ProgressSpinner />
                </div>
            ) :
        <div className="p-grid p-dir-col">
            <Toast ref={toast} />
            <div className="p-col">
                <Card title="Income Statement" className="income-statement">
                    <div className="p-grid">
                        <div className="p-col">
                            <h5>Revenues</h5>
                            <DataTable value={revenueData} loading={loading} emptyMessage="">
                                <Column field="accountName" header="Account Name"/>
                                <Column field="total" header="Total" body={(rowData) => formatCurrency(rowData.total)}/>
                            </DataTable>
                            <div className="total my-2">
                                <span>Total Revenues: {formatCurrency(totalRevenues)}</span>
                            </div>
                        </div>

                        <div className="p-col">
                            <h5>Expenses</h5>
                            <DataTable value={expenseData} loading={loading} emptyMessage="">
                                <Column field="accountName" header="Account Name"/>
                                <Column field="total" header="Total" body={(rowData) => formatCurrency(rowData.total)}/>
                            </DataTable>
                            <div className="total my-2">
                                <span>Total Expenses: {formatCurrency(totalExpenses)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-grid net-income">
                        <div className="p-col">
                            <h5>Net Income</h5>
                            <span className={netIncome === 0 ? "text-secondary" : netIncome > 0 ? "text-green-700" : "text-red-700"}>{formatCurrency(netIncome)}</span>
                        </div>
                    </div>

                </Card>
            </div>
        </div>
    )
}

export default IncomeStatementPage;