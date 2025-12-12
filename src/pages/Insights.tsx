import { useQuery } from '@tanstack/react-query';
import insightsService from '@/services/insights';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import chatbotService from '@/services/chatbot';
import authService from '@/services/auth';
import weatherService from '@/services/weather';
import productsService from '@/services/products';
import tasksService from '@/services/tasks';

const Insights = () => {
  const isAuth = authService.isAuthenticated();
  const { data: insights = {} } = useQuery({ queryKey: ['insights'], queryFn: insightsService.getInsights, enabled: isAuth });
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

  const priceList = Array.isArray(insights.market?.priceAgg)
    ? insights.market.priceAgg
    : Object.entries(avgPricesByCategory || {}).map(([category, data]: any) => ({ category, avgPrice: Math.round((data.sum || 0) / (data.count || 1)) }));

  // Safety: ensure arrays are arrays before mapping
  const categoryCounts = Array.isArray(insights.categoryCounts) ? insights.categoryCounts : [];
  const topProducts = Array.isArray(insights.topProducts) ? insights.topProducts : [];
  const topSellers = Array.isArray(insights.topSellers) ? insights.topSellers : [];
  const keySuggestions = Array.isArray(insights.personalized?.tips) ? insights.personalized.tips : farmingTips?.slice(0, 4) || [];
  const marketBestSelling = Array.isArray(insights.market?.bestSelling) ? insights.market.bestSelling : [];
  const soilCropAlerts = Array.isArray(insights.soilCropAlerts) ? insights.soilCropAlerts : [];
  const seasonalRecommendations = Array.isArray(insights.seasonal?.recommendations) ? insights.seasonal.recommendations : [];
  const activityRemindersList = Array.isArray(insights.activityReminders) ? insights.activityReminders : [];
  const learningResourceList = Array.isArray(insights.learningResources) ? insights.learningResources : defaultLearningResources;
  const alertsList = Array.isArray(insights.alerts) ? insights.alerts : [];

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
                  {categoryCounts.map((c: any) => (
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
                  {topProducts.map((p: any) => (
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
                  {topSellers.map((s: any) => (
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
                    {keySuggestions.map((t: any, i: number) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Weather-Driven Insight</h4>
                  <div className="text-sm text-muted-foreground">{insights.weatherInsights?.irrigation?.[0] || (weather ? `Conditions: ${weather.condition}, ${weather.temperature}°C` : 'No weather data')}</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {insights.weatherInsights?.heatStress?.[0] || (weather ? (Array.isArray(weatherService.getAgricultureRecommendations(weather)) ? weatherService.getAgricultureRecommendations(weather).map((r:any,i:number)=>(<div key={i}>{r}</div>)) : <div>{weatherService.getAgricultureRecommendations(weather)}</div>) : '')}
                  </div>
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
                  {priceList.map((c: any) => (
                    <li key={c.category} className="flex justify-between py-2 border-b">{c.category}<span>KES {Math.round(c.avgPrice || 0)}</span></li>
                  ))}
                </ul>
                <div className="mt-2 text-sm text-muted-foreground">Top regional best-sellers:</div>
                <ul>
                  {marketBestSelling.map((s: any) => (
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
                    {soilCropAlerts.slice(0,5).map((a:any, i:number) => (
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
                    {seasonalRecommendations.map((s:any,i:number) => <li key={i}>{s}</li>)}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Farm Activity Reminders</CardTitle></CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground">
                    {activityRemindersList.map((r:any,i:number) => (
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
                  <div className="text-sm text-muted-foreground">{marketBestSelling.length ? `Top pick: ${marketBestSelling[0].product.name} — consider listing more stock.` : 'Best-selling data not yet available'}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Learning Resources</CardTitle></CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground">
                      {learningResourceList.map((r:any,i:number) => (
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
                    {alertsList.map((a:any,i:number) => (
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
