const fs = require('fs');
const path = require('path');

const pages = [
  '/distributor/index.tsx',
  '/distributor/wallet/index.tsx',
  '/distributor/wallet/transactions/index.tsx',
  '/distributor/wallet/invoices/index.tsx',
  '/distributor/distributorHub/dashboard/index.tsx',
  '/distributor/distributorHub/marketplace/index.tsx',
  '/distributor/distributorHub/orders/index.tsx',
  '/distributor/distributorHub/shipments/index.tsx',
  '/distributor/distributorHub/reports/index.tsx',
  '/retailer/index.tsx',
  '/retailer/wallet/index.tsx',
  '/retailer/wallet/transactions/index.tsx',
  '/retailer/wallet/invoices/index.tsx',
  '/retailer/retailerHub/dashboard/index.tsx',
  '/retailer/retailerHub/marketplace/index.tsx',
  '/retailer/retailerHub/orders/index.tsx',
  '/retailer/retailerHub/shipments/index.tsx',
  '/retailer/retailerHub/reports/index.tsx'
];

const basePath = path.join(__dirname, 'pages');

pages.forEach(page => {
  const fullPath = path.join(basePath, page);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  
  if (!fs.existsSync(fullPath)) {
    const parts = page.split('/');
    let rawTitle = parts[parts.length - 2];
    if (rawTitle === 'distributor' || rawTitle === 'retailer') {
      rawTitle = 'Home';
    }
    const title = rawTitle.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    const content = `import Head from 'next/head';

export default function PlaceholderPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
      <Head>
        <title>${title} | Seed2Shelf</title>
      </Head>
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-[#00d26a]">${title}</h1>
        <p className="text-stone-400">This page is under construction.</p>
      </div>
    </div>
  );
}
`;
    fs.writeFileSync(fullPath, content);
  }
});
console.log('Placeholders created.');
