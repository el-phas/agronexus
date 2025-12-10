import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  BarChart3,
  Cloud,
  Sun,
  Droplets,
  Wind,
  Plus,
  Bell,
  Settings,
  Calendar,
  ArrowUpRight,
  Leaf
} from "lucide-react";
import dashboardService from "@/services/dashboard";
import weatherService from "@/services/weather";
import tasksService from "@/services/tasks";
import authService from "@/services/auth";
import { AuthModal } from "@/components/AuthModal";



const Dashboard = () => {
  const { data: statsData = [] } = useQuery({ queryKey: ["dashboard", "stats"], queryFn: dashboardService.getDashboardStats });
  const { data: recent = [] } = useQuery({ queryKey: ["dashboard", "recentOrders"], queryFn: dashboardService.getRecentOrders });

  const queryClient = useQueryClient();
  const isAuth = authService.isAuthenticated();
  const user = authService.getUser();
  const [authOpen, setAuthOpen] = useState(false);

  // Weather state
  const [weather, setWeather] = useState<any>(null);

  // New task form state
  const [newTask, setNewTask] = useState({ title: "", description: "", due_date: "", priority: "medium" });
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Tasks (only available to authenticated farmers)
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksService.getTasks(),
    enabled: isAuth,
  });

  const createTaskMutation = useMutation({
    mutationFn: (payload: any) => tasksService.createTask(payload),
    onSuccess: () => queryClient.invalidateQueries(["tasks"]),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, payload }: any) => tasksService.updateTask(id, payload),
    onSuccess: () => queryClient.invalidateQueries(["tasks"]),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => tasksService.deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries(["tasks"]),
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (isAuth && user) {
          // try geolocation first
          try {
            const coords = await weatherService.getCurrentLocation();
            const w = await weatherService.getWeatherByCoords(coords.latitude, coords.longitude);
            setWeather(w);
          } catch (err) {
            // fallback to user location from profile (e.g. "Kiambu, Kenya" -> "Kiambu")
            // Extract city name if format is "City, Country"
            const userLocation = user?.location || 'Kenya';
            const city = userLocation.includes(',') ? userLocation.split(',')[0].trim() : userLocation;
            try {
              const w = await weatherService.getWeatherByCity(city);
              setWeather(w);
            } catch (err2) {
              // final fallback to country-level search
              const w = await weatherService.getWeatherByCity('Kenya');
              setWeather(w);
            }
          }
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
      }
    };

    fetchWeather();
  }, [isAuth]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div>
              <h1 className="font-display font-bold text-3xl mb-2">
                {isAuth && user ? (
                  <>Welcome back, {user.first_name ?? user.username}! 👋</>
                ) : (
                  <>Welcome to AgroNexus 👋</>
                )}
              </h1>
              <p className="text-muted-foreground">
                {isAuth ? "Here's what's happening with your farm today." : "Sign in to view your dashboard and tasks."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!isAuth ? (
                <Button variant="hero" onClick={() => setAuthOpen(true)}>
                  Sign In
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="icon">
                    <Bell className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Settings className="w-5 h-5" />
                  </Button>
                  <Button variant="hero">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Product
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((s: any, idx: number) => (
              <Card key={idx} variant="gradient">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
                      <s.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      s.trend === "up" ? "text-leaf" : "text-destructive"
                    }`}>
                      {s.trend === "up" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {s.change}
                    </div>
                  </div>
                  <h3 className="text-muted-foreground text-sm mb-1">{s.title}</h3>
                  <p className="font-display font-bold text-2xl">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Revenue Chart Placeholder */}
              <Card variant="elevated">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Revenue Overview
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    This Month
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/50 rounded-xl">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Revenue chart visualization</p>
                      <p className="text-sm text-muted-foreground">Coming soon with real data</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card variant="elevated">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Recent Orders
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Order ID</th>
                          <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Buyer</th>
                          <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Product</th>
                          <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Quantity</th>
                          <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Amount</th>
                          <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recent.map((o: any) => (
                          <tr key={o.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-2 font-mono text-sm">{o.id}</td>
                            <td className="py-3 px-2 text-sm">{o.buyer}</td>
                            <td className="py-3 px-2 text-sm">{o.product}</td>
                            <td className="py-3 px-2 text-sm">{o.quantity}</td>
                            <td className="py-3 px-2 text-sm font-semibold">{o.amount}</td>
                            <td className="py-3 px-2">
                              <Badge
                                variant={
                                  o.status === "delivered"
                                    ? "success"
                                    : o.status === "shipped"
                                    ? "info"
                                    : "warning"
                                }
                              >
                                {o.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Weather Widget */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Cloud className="w-5 h-5 text-sky" />
                    Weather Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="font-display font-bold text-4xl">{weather ? `${weather.temperature}°C` : '—'}</p>
                      <p className="text-muted-foreground">{weather ? weather.condition : 'Sign in to view weather'}</p>
                    </div>
                    <Sun className="w-16 h-16 text-harvest" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <Droplets className="w-5 h-5 mx-auto mb-1 text-sky" />
                      <p className="text-sm text-muted-foreground">Humidity</p>
                      <p className="font-semibold">{weather ? `${weather.humidity}%` : '—'}</p>
                    </div>
                    <div className="text-center">
                      <Wind className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Wind</p>
                      <p className="font-semibold">{weather ? `${weather.windSpeed} m/s` : '—'}</p>
                    </div>
                    <div className="text-center">
                      <Droplets className="w-5 h-5 mx-auto mb-1 text-leaf" />
                      <p className="text-sm text-muted-foreground">Rain</p>
                      <p className="font-semibold">{weather ? `${0}%` : '—'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Tasks */}
              <Card variant="elevated">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                    Upcoming Tasks
                  </CardTitle>
                  {isAuth && (
                    <Button variant="ghost" size="sm" onClick={() => setShowTaskForm(!showTaskForm)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isAuth && showTaskForm && (
                      <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2 mb-4">
                        <input
                          type="text"
                          placeholder="Task title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="text"
                          placeholder="Description (optional)"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="date"
                          value={newTask.due_date}
                          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <select
                          value={newTask.priority}
                          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="hero"
                            onClick={() => {
                              createTaskMutation.mutate(newTask);
                              setNewTask({ title: "", description: "", due_date: "", priority: "medium" });
                              setShowTaskForm(false);
                            }}
                            disabled={!newTask.title || createTaskMutation.isPending}
                          >
                            {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setShowTaskForm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {!isAuth && (
                      <div className="text-sm text-muted-foreground">Please log in to view and manage your tasks.</div>
                    )}

                    {isAuth && tasksLoading && (
                      <div className="text-sm text-muted-foreground">Loading tasks...</div>
                    )}

                    {isAuth && !tasksLoading && tasks.length === 0 && (
                      <div className="text-sm text-muted-foreground">No upcoming tasks. Add one to get started.</div>
                    )}

                    {isAuth && !tasksLoading && tasks.map((task: any) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          task.priority === "high"
                            ? "bg-destructive"
                            : task.priority === "medium"
                            ? "bg-harvest"
                            : "bg-leaf"
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => updateTaskMutation.mutate({ id: task.id, payload: { completed: !task.completed } })}>
                            {task.completed ? 'Undo' : 'Done'}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteTaskMutation.mutate(task.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              {isAuth && (
                <Card className="bg-gradient-hero text-primary-foreground overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                        <Leaf className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold">AI Insight</h3>
                        <p className="text-primary-foreground/70 text-sm">Smart recommendation</p>
                      </div>
                    </div>
                    <p className="text-primary-foreground/90 text-sm leading-relaxed mb-4">
                      Based on current weather patterns and market trends, consider harvesting your tomatoes within the next 3 days for optimal pricing.
                    </p>
                    <Button variant="golden" size="sm">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <Chatbot userType="farmer" location="Kenya" />
    </div>
  );
};

export default Dashboard;
