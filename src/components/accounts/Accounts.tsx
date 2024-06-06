'use client'

import {Card} from "primereact/card";
import {DataTable, DataTableRowClickEvent} from "primereact/datatable";
import {Toast} from "primereact/toast";
import {useEffect, useRef, useState} from "react";
import {Button} from "primereact/button";
import {useRouter} from "next/navigation";
import {Dialog} from "primereact/dialog";
import {Column} from "primereact/column";

const getAccounts = async () => {
    const res = await fetch(`/api/accounts?uid=${localStorage.getItem('userId')}`);
    if (res.status === 200) {
        return await res.json()
    }

    return null
}

const Accounts = () => {
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [isTemp, setIsTemp] = useState(false);
    const [liquidity, setLiquidity] = useState(0);
    const [contraOf, setContraOf] = useState("");
    const [items, setItems] = useState<{
        id: number;
        name: string;
        is_temp: boolean;
        liquidity: number;
        contra_of: string | undefined;
        type: string;
    }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await getAccounts();
            if (res !== null) {
                setItems(res);
                setLoading(false);
            } else {
                toast.current!.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to fetch accounts",
                    life: 3000,
                });
            }
        }

        fetchData().then(() => {});

    }, []);

    const rowClick = (event: DataTableRowClickEvent) => {
        const account = event.data;
        setName(account.name);
        setType(account.type);
        setIsTemp(account.is_temp);
        setLiquidity(account.liquidity);
        setContraOf(account.contra_of);
        setVisible(true);
    }

    const dialogFooter = (
        <div className="p-dialog-footer">
            <button className="p-button p-button-text p-dialog-footer-close" onClick={() => setVisible(false)}>
                Close
            </button>
        </div>
    );

    return (
        <div className="flex justify-content-center w-full">
            <Toast ref={toast} />
            <Dialog
                className="flex justify-content-center"
                visible={visible}
                onHide={() => setVisible(false)}
                modal
                header={`Account Details - ${name}`}
                style={{ width: '450px' }}
                footer={dialogFooter}
            >
                <div className="w-fit p-2">
                    <div className="flex justify-between mb-2">
                        <div className="text-secondary mr-2">Type:</div>
                        <div>{type[0] + type.slice(1).toLowerCase()}</div>
                    </div>

                    <div className="flex justify-between mb-2">
                        <div className="text-secondary mr-2">Liquidity:</div>
                        <div>{liquidity}</div>
                    </div>

                    {isTemp && (
                        <div className="mt-3 text-warning">
                            This account is temporary and will be zeroed during the closing process.
                        </div>
                    )}
                    {contraOf && (
                        <div className="mt-3 text-info">
                            This account is the contra-account of {contraOf}.
                        </div>
                    )}
                </div>
            </Dialog>

            <div className="w-8 md:w-6 lg:w-4">
                <Button
                    label="Add Account" className="p-button-primary w-full my-1"
                    onClick={() => router.push("/home/accounts/add")}
                />

                <div className="w-full my-1">
                    <Card>
                        <DataTable
                            scrollable scrollHeight="75vh" value={items}
                            onRowClick={rowClick} loading={loading}
                            rowHover={true} rowClassName={() => "cursor-pointer"}
                        >
                            <Column field="name" header="Name" />
                        </DataTable>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Accounts;