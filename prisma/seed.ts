const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { username: 'john_doe', email: 'john.doe@example.com', password_hashed: await bcrypt.hash('password123', 10) },
      { username: 'mary_jane', email: 'mary.jane@example.com', password_hashed: await bcrypt.hash('password123', 10) },
      { username: 'alice_smith', email: 'alice.smith@example.com', password_hashed: await bcrypt.hash('password123', 10) },
      { username: 'bob_brown', email: 'bob.brown@example.com', password_hashed: await bcrypt.hash('password123', 10) },
      { username: 'charlie_williams', email: 'charlie.williams@example.com', password_hashed: await bcrypt.hash('password123', 10) },
    ],
  });

  await prisma.account.createMany({
    data: [
      { name: 'Cash', is_temp: false, liquidity: 5000, type: 'ASSET' },
      { name: 'Bank', is_temp: false, liquidity: 10000, type: 'ASSET' },
      { name: 'Revenue', is_temp: false, liquidity: 15000, type: 'LIABILITY' },
      { name: 'Expenses', is_temp: false, liquidity: 2000, type: 'EQUITY' },
      { name: 'Accounts Receivable', is_temp: false, liquidity: 8000, type: 'ASSET' },
      { name: 'Accounts Payable', is_temp: false, liquidity: 3000, type: 'LIABILITY' },
    ],
  });

  await prisma.entry.createMany({
    data: [
      { owner_id: 1, date_entered: new Date('2023-01-01') },
      { owner_id: 2, date_entered: new Date('2023-02-15') },
      { owner_id: 3, date_entered: new Date('2023-03-20') },
      { owner_id: 4, date_entered: new Date('2023-04-10') },
      { owner_id: 5, date_entered: new Date('2023-05-05') },
    ],
  });

  await prisma.entryItem.createMany({
    data: [
      { entry_ref: 1, account_ref: 1, item_type: 'DEBIT', value: 500 },
      { entry_ref: 1, account_ref: 3, item_type: 'CREDIT', value: 500 },
      { entry_ref: 2, account_ref: 2, item_type: 'DEBIT', value: 1000 },
      { entry_ref: 2, account_ref: 4, item_type: 'CREDIT', value: 1000 },
      { entry_ref: 3, account_ref: 3, item_type: 'DEBIT', value: 1500 },
      { entry_ref: 3, account_ref: 5, item_type: 'CREDIT', value: 1500 },
      { entry_ref: 4, account_ref: 4, item_type: 'DEBIT', value: 2000 },
      { entry_ref: 4, account_ref: 6, item_type: 'CREDIT', value: 2000 },
      { entry_ref: 5, account_ref: 1, item_type: 'DEBIT', value: 2500 },
      { entry_ref: 5, account_ref: 5, item_type: 'CREDIT', value: 2500 },
    ],
  });

  console.log('Seed data created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
