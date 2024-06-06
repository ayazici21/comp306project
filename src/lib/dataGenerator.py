import random
from faker import Faker
import pandas as pd

fake = Faker()

# Constants
NUM_USERS = 1
NUM_ENTRIES = 250
NUM_ENTRY_ITEMS = 1000

# Account names by type
ASSET = [("Cash", 10000), ("Accounts Receivable", 9000), ("Office Supplies", 8000), ("Equipment", 7000), ("Building", 6000), ("Land", 5000)]
LIABILITY = [("Accounts Payable", 0), ("Notes Payable", 0), ("Service Revenue", 0), ("Salaries Payable", 0), ("Interest Payable", 0),
             ("Interest Revenue", 0), ("Sales Revenue", 0), ("Rent Revenue", 0), ("Dividend Revenue", 0), ("Operating Revenue", 0),
             ("Insurance Expense", 0), ("Salaries Expense", 0), ("Utilities Expense", 0), ("Rent Expense", 0), ("Bank Expense", 0)]
EQUITY = [("Owner's Capital", 0), ("Owner's Withdrawal", 0), ("Owner's Contribution", 0)]

# Generate Accounts
accounts = []
account_id = 1
for account_type, account_names in {"ASSET": ASSET, "LIABILITY": LIABILITY, "EQUITY": EQUITY}.items():
    for account_name, liquidity in account_names:
        accounts.append({
            "id": account_id,
            "name": account_name,
            "is_temp": False,
            "liquidity": liquidity,
            "contra_of": None,
            "type": account_type
        })
        account_id += 1

NUM_ACCOUNTS = len(accounts)

# Generate Users
users = []
for i in range(NUM_USERS):
    users.append({
        "id": i + 1,
        "username": fake.user_name(),
        "email": fake.email(),
        "password_hashed": fake.password(length=10)
    })

# Generate Entries
entries = []
for i in range(NUM_ENTRIES):
    entries.append({
        "id": i + 1,
        "owner_id": random.choice(range(1, NUM_USERS + 1)),
        "date_entered": fake.date_time_this_year()
    })

# Generate EntryItems ensuring balanced debit and credit for each entry
entry_items = []
entry_id_to_items = {i + 1: [] for i in range(NUM_ENTRIES)}

for entry_id in range(1, NUM_ENTRIES + 1):
    num_items = random.randint(2, 5)  # Each entry will have between 2 and 5 items
    total_value = 0
    for _ in range(num_items - 1):  # Generate (num_items - 1) items first
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

    # Generate the last item to balance the entry
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

# Generate UserAccounts based on entries and entry_items
user_accounts = []
entry_items_df = pd.DataFrame(entry_items)
entries_df = pd.DataFrame(entries)

for index, row in entry_items_df.iterrows():
    entry_ref = row['entry_ref']
    account_ref = row['account_ref']
    owner_id = entries_df.loc[entries_df['id'] == entry_ref, 'owner_id'].values[0]
    user_accounts.append({
        "id": account_ref,
        "uid": owner_id
    })

# Ensure unique user accounts
user_accounts_df = pd.DataFrame(user_accounts).drop_duplicates()

# Convert to DataFrames
users_df = pd.DataFrame(users)
accounts_df = pd.DataFrame(accounts)
entries_df = pd.DataFrame(entries)
entry_items_df = pd.DataFrame(entry_items)

# Save to CSV
users_df.to_csv('users.csv', index=False)
accounts_df.to_csv('accounts.csv', index=False)
entries_df.to_csv('entries.csv', index=False)
entry_items_df.to_csv('entry_items.csv', index=False)
user_accounts_df.to_csv('user_accounts.csv', index=False)
