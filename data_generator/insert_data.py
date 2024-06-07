import pandas as pd
from sqlalchemy import create_engine

def insert_csv_to_sql_table(csv_file_path, table_name, connection_string):
    df = pd.read_csv(csv_file_path)
    engine = create_engine(connection_string)
    df.to_sql(table_name, con=engine, if_exists='append', index=False)
    # print(f"Data from {csv_file_path} has been inserted into the {table_name} table.")


def start_insertion(my_dict:dict, conn:str):
    for i in my_dict.keys():
        insert_csv_to_sql_table(i, my_dict[i], conn)

dictionary = {'accounts.csv': 'Account',
              'entries.csv': 'Entry',
              'entry_items.csv': 'EntryItem',
              'user_accounts.csv': 'UserAccount',
              'invalid_tokens.csv': 'InvalidToken'}

# TODO: Add username password and database name.
connection = 'mysql+pymysql://username:password@34.165.13.125:3306/db_name'
start_insertion(dictionary, connection)

