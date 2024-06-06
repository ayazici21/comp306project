'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import HomeLayout from '../layout';

type TBalance = {
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
};

const TBalancesPage = () => {
  const [balances, setBalances] = useState<TBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    const fetchTBalances = async () => {
      try {
        const response = await axios.get('/api/t-balances');
        setBalances(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch T Balances');
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch T Balances'
        });
        setLoading(false);
      }
    };

    fetchTBalances();
  }, []);

  return (
    <HomeLayout>
      <div>
        <Toast ref={toast} />
        <h1>T Balances</h1>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && (
          <DataTable value={balances} responsiveLayout="scroll">
            <Column field="accountName" header="Account Name" />
            <Column field="accountType" header="Account Type" />
            <Column field="debit" header="Debit" />
            <Column field="credit" header="Credit" />
          </DataTable>
        )}
      </div>
    </HomeLayout>
  );
};

export default TBalancesPage;
