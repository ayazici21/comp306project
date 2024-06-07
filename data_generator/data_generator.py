import random
from faker import Faker
import pandas as pd

fake = Faker()

NUM_ENTRIES = 250
NUM_ENTRY_ITEMS = 1000

ASSET = [
    ("Cash", 10000, False, None),
    ("Accounts Receivable", 9000, False, None),
    ("Office Supplies", 8000, False, None),
    ("Equipment", 7000, False, None),
    ("Accumulated Depreciation - Equipment", 6999, False, "Equipment"),
    ("Building", 6000, False, None),
    ("Accumulated Depreciation - Building", 5999, False, "Building"),
    ("Land", 5000, False, None),
]

LIABILITY = [
    ("Accounts Payable", 4000, False, None),
    ("Service Revenue", 4000, False, None),
    ("Salaries Payable", 4000, False, None),
    ("Interest Payable", 4000, False, None),
    ("Notes Payable", 3000, False, None),
]

EQUITY = [
    ("Owner's Capital", 2500, False, None),
    ("Owner's Withdrawal", 1500, True, None),
    ("Sales Revenue", 1000, True, None),
    ("Interest Revenue", 1000, True, None),
    ("Rent Revenue", 1000, True, None),
    ("Dividend Revenue", 1000, True, None),
    ("Operating Revenue", 1000, True, None),
    ("Insurance Expense", 500, True, None),
    ("Salaries Expense", 500, True, None),
    ("Utilities Expense", 500, True, None),
    ("Rent Expense", 500, True, None),
    ("Bank Expense", 500, True, None),
]

accounts = []
for account_type, account_names in {"ASSET": ASSET, "LIABILITY": LIABILITY, "EQUITY": EQUITY}.items():
    for account_name, liquidity, is_temp, contra_of in account_names:
        accounts.append({
            "name": account_name,
            "is_temp": is_temp,
            "liquidity": liquidity,
            "contra_of": contra_of,
            "type": account_type
        })

NUM_ACCOUNTS = len(accounts)

entries = []
for i in range(NUM_ENTRIES):
    entries.append({
        "id": i + 1,
        "owner_id": 2,
        "date_entered": fake.date()
    })

entry_items = []
entry_id_to_items = {i + 1: [] for i in range(NUM_ENTRIES)}

for entry_id in range(1, NUM_ENTRIES + 1):
    num_items = random.randint(2, 5)
    total_value = 0
    for _ in range(num_items - 1):
        item_type = random.choice(["DEBIT", "CREDIT"])
        value = fake.random_int(min=200, max=5000)
        account_ref = random.choice(range(1, NUM_ACCOUNTS + 1))
        entry_items.append({
            "entry_ref": entry_id,
            "account_ref": account_ref,
            "item_type": item_type,
            "value": value
        })
        entry_id_to_items[entry_id].append((item_type, value))
        total_value += value if item_type == "DEBIT" else -value

    balance_item_type = "DEBIT" if total_value < 0 else "CREDIT"
    balance_value = abs(total_value)
    account_ref = random.choice(range(1, NUM_ACCOUNTS + 1))
    entry_items.append({
        "entry_ref": entry_id,
        "account_ref": account_ref,
        "item_type": balance_item_type,
        "value": balance_value
    })
    entry_id_to_items[entry_id].append((balance_item_type, balance_value))

user_accounts = []
entry_items_df = pd.DataFrame(entry_items)
entries_df = pd.DataFrame(entries)

for index, row in entry_items_df.iterrows():
    entry_ref = row['entry_ref']
    account_ref = row['account_ref']
    user_accounts.append({
        "id": account_ref,
        "uid": 2
    })

user_accounts_df = pd.DataFrame(user_accounts).drop_duplicates()

accounts_df = pd.DataFrame(accounts)
entries_df = pd.DataFrame(entries)
entry_items_df = pd.DataFrame(entry_items)

accounts_df.to_csv('accounts.csv', index=False)
entries_df.to_csv('entries.csv', index=False)
entry_items_df.to_csv('entry_items.csv', index=False)
user_accounts_df.to_csv('user_accounts.csv', index=False)
