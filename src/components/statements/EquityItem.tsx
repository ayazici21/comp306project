'use client'

import {formatCurrency} from "@/app/home/financial-statements/currency";

const EquityItem = ({label, value}: {label: string, value: number}) => {
    return (
        <div className="flex justify-content-start my-3">
            <span className="font-semibold text-base">{label}:</span>
            <span>{formatCurrency(value)}</span>
        </div>
    )
}

export default EquityItem;