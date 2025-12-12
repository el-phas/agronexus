import { useQuery } from '@tanstack/react-query';
import insightsService from '@/services/insights';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import chatbotService from '@/services/chatbot';
import weatherService from '@/services/weather';
import productsService from '@/services/products';
import tasksService from '@/services/tasks';

const Insights = () => {
  const { data: insights = {} } = useQuery({ queryKey: ['insights'], queryFn: insightsService.getInsights });
  const farmingTips = chatbotService.getFarmingTips();
  const buyingTips = chatbotService.getBuyingTips();
  const { data: products = [] } = useQuery({ queryKey: ['products', 'insights'], queryFn: () => productsService.getProducts({ limit: 100 }) });
  const [weather, setWeather] = useState<any>(null);
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => tasksService.getTasks(), enabled: false });

  const defaultLearningResources = [
    { title: 'Top 5 ways to boost tomato yield', type: 'article' },
    { title: 'Best drip irrigation methods', type: 'video' },
    { title: 'How to prevent fall armyworm', type: 'guide' },
  ];

  useQuery({ queryKey: ['weather', 'insights'], queryFn: () => weatherService.getWeatherByCity('Nairobi'), onSuccess: (w) => setWeather(w) });

  const avgPricesByCategory = (products || []).reduce((acc: any, p: any) => {
    if (!p.category) return acc;
    acc[p.category] = acc[p.category] || { sum: 0, count: 0 };
    acc[p.category].sum += p.price || 0;
    acc[p.category].count += 1;
    return acc;
  }, {});

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
                    <li key={p._id} className="py-2 border-b flex justify-between"><span>{p.name}</span><span className="text-muted-foreground">KES {p.price}</span></li>
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
            <Card>
              <CardHeader>
                <CardTitle>Key Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Personalized Farming Tips</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {(insights.personalized?.tips?.length ? insights.personalized.tips : farmingTips.slice(0,4)).map((t: any, i: number) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Weather-Driven Insight</h4>
                  <div className="text-sm text-muted-foreground">{insights.weatherInsights?.irrigation?.[0] || (weather ? `Conditions: ${weather.condition}, ${weather.temperature}°C` : 'No weather data')}</div>
                  <div className="text-sm text-muted-foreground mt-2">{insights.weatherInsights?.heatStress?.[0] || (weather ? weatherService.getAgricultureRecommendations(weather).map((r:any,i:number)=>(<div key={i}>{r}</div>)) : '')}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Market Trends & Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">Average Prices by Category</div>
                <ul>
                  {(insights.market?.priceAgg || avgPricesByCategory || []).map((c: any) => (
                    <li key={c.category} className="flex justify-between py-2 border-b">{c.category}<span>KES {Math.round(c.avgPrice || 0)}</span></li>
                  ))}
                </ul>
                <div className="mt-2 text-sm text-muted-foreground">Top regional best-sellers:</div>
                <ul>
                  {(insights.market?.bestSelling || []).map((s: any) => (
                    <li key={s.product.name} className="flex justify-between py-1 border-b">{s.product.name}<span className="text-muted-foreground">Sold: {s.sold}</span></li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <section className="mt-8">
            <h2 className="font-display font-bold text-2xl mb-4">Recommended Actions</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personalized Farming Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {farmingTips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>AI Productivity Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {chatbotService.getFarmingTips().slice(0,3).map((t,i)=>(<li key={i}>{t}</li>))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="grid lg:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardHeader><CardTitle>Soil & Crop Health Alerts</CardTitle></CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground">
                    {(insights.soilCropAlerts || []).slice(0,5).map((a:any, i:number) => (
                      <li key={i}>{a.keyword ? `${a.keyword} — ${a.snippet || ''}` : a.snippet}</li>
                    ))}
                    {(!insights.soilCropAlerts || insights.soilCropAlerts.length === 0) && (
                      <>
                        <li>Early signs of nutrient deficiency in maize — consider soil test</li>
                        <li>Monitor for fall armyworm during the wet season</li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Seasonal Recommendations</CardTitle></CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground">
                    {(insights.seasonal?.recommendations || []).map((s:any,i:number) => <li key={i}>{s}</li>)}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Farm Activity Reminders</CardTitle></CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground">
                    {(insights.activityReminders || []).map((r:any,i:number) => (
                      <li key={i}>{r.title} — {new Date(r.due_date).toLocaleDateString()}</li>
                    ))}
                    {(!insights.activityReminders || insights.activityReminders.length === 0) && (
                      <>
                        <li>Fertilizer application due in 7 days</li>
                        <li>Next irrigation scheduled in 3 days (weather dependent)</li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="grid lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader><CardTitle>Market Trends & Prices (AI)</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">{insights.market?.bestSelling?.length ? `Top pick: ${insights.market.bestSelling[0].product.name} — consider listing more stock.` : 'Best-selling data not yet available'}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Learning Resources</CardTitle></CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground">
                    {(insights.learningResources || defaultLearningResources || []).map((r:any,i:number) => (
                      <li key={i}>{r.title} — <span className="text-muted-foreground">{r.type}</span></li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="mt-6">
              <Card>
                <CardHeader><CardTitle>Alert & Warnings</CardTitle></CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground">
                    {(insights.alerts || []).map((a:any,i:number) => (
                      <li key={i}>{a.type ? `${a.type}: ${a.message || ''}` : a.message}</li>
                    ))}
                    {(insights.alerts || []).length === 0 && (
                      <>
                        <li>Pest outbreak alert: Monitor fields this month</li>
                        <li>Market price drop for maize expected next week</li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Insights;
