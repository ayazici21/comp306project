'use client'

import {Button} from "primereact/button";
import {useRouter} from "next/navigation";

const StatementsPage = () => {
    const router = useRouter();
    return (
        <div className="w-9 md:w-8 lg:w-6 h-screen flex m-auto">
            <div className="m-auto">
                <div className="p-buttonset w-full">
                    <Button label="Balance Sheet" className="p-button-primary" onClick={() => router.push("/home/financial-statements/balance-sheet")}/>
                    <Button label="Income Statement" className="p-button-primary mx-3" onClick={() => router.push("/home/financial-statements/income-statement")}/>
                    <Button label="Statement of Owner's Equity" className="p-button-primary" onClick={() => router.push("/home/financial-statements/owners-equity")}/>
                </div>
            </div>
        </div>
    )
}

export default StatementsPage;