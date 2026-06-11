'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { formatCFA } from '@/lib/utils';

type ChartEntry = { name: string; total: number };

export function TopProductsChart({ data }: { data: ChartEntry[] }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-text-primary">Top produits</h2>
        <p className="text-sm text-text-secondary">Chiffre d&apos;affaires par produit (factures non-brouillon)</p>
      </div>
      {data.length > 0 ? (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
              <XAxis
                type="number"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value === 0 ? '0' : `${Math.round(value / 100000) / 10}M`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [formatCFA(value), 'CA']}
              />
              <Bar dataKey="total" fill="#0D9488" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-sm text-text-muted">
          Aucune donnée de vente disponible.
        </div>
      )}
    </div>
  );
}
