import { useQuery } from '@tanstack/react-query';
import insightsService from '@/services/insights';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

const Insights = () => {
  const { data: insights = {} } = useQuery({ queryKey: ['insights'], queryFn: insightsService.getInsights });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <h1 className="font-display font-bold text-3xl mb-4">Insights</h1>
          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Counts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul>
                  {(insights.categoryCounts || []).map((c: any) => (
                    <li key={c.category} className="flex justify-between py-2 border-b">{c.category}<span>{c.count}</span></li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">KES {insights.totalSales?.totalSales ?? 0}</div>
                <div className="text-sm text-muted-foreground">{insights.totalSales?.orders ?? 0} orders</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <ul>
                  {(insights.topProducts || []).map((p: any) => (
                    <li key={p._id} className="py-2 border-b">{p.name} — {p.price}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Sellers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul>
                  {(insights.topSellers || []).map((s: any) => (
                    <li key={s.farmer?._id || s._id} className="py-2 border-b">{s.farmer?.farm_name || 'Unknown'} — {s.count} products</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Insights;
