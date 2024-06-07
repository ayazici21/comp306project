'use client'

import {Button} from "primereact/button";
import {useRouter} from "next/navigation";
import {Card} from "primereact/card";

const StatementsPage = () => {
    const router = useRouter();
    return (
        <div className="w-12 h-screen flex justify-content-center align-items-center">
            <Card title="Financial Statements" className="w-full h-full ">
                <div className="flex justify-content-center align-items-center h-full">
                    <div className="w-9 md:w-8 lg:w-6 flex flex-column align-items-center gap-3 m-auto">
                        <Button label="Balance Sheet" className="p-button-primary w-full"
                                onClick={() => router.push("/home/financial-statements/balance-sheet")}/>
                        <Button label="Income Statement" className="p-button-primary w-full"
                                onClick={() => router.push("/home/financial-statements/income-statement")}/>
                        <Button label="Statement of Owner's Equity" className="p-button-primary w-full"
                                onClick={() => router.push("/home/financial-statements/owners-equity")}/>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default StatementsPage;