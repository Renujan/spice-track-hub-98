import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, Clock, CheckCircle, AlertCircle, Bell, Users, Utensils } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { demoProducts } from "@/data/products";
import { useAuth } from "@/contexts/AuthContext";

interface OrderItem {
  name: string;
  quantity: number;
  notes?: string;
}

interface KitchenOrder {
  id: string;
  billId: string;
  status: 'new' | 'in-progress' | 'done';
  items: OrderItem[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedTime?: number; // in minutes
  priority: 'normal' | 'high' | 'urgent';
  section: 'client' | 'kitchen' | 'stock';
}

interface EmployeeConsumption {
  id: string;
  employeeName: string;
  employeeId: string;
  productName: string;
  quantity: number;
  consumedAt: Date;
  notes?: string;
}

const Kitchen = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<KitchenOrder[]>([
    {
      id: 'ORD001',
      billId: 'BILL001',
      status: 'new',
      items: [
        { name: 'Chicken Biryani', quantity: 2 },
        { name: 'Masala Chai', quantity: 2 }
      ],
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      updatedAt: new Date(Date.now() - 5 * 60 * 1000),
      estimatedTime: 25,
      priority: 'normal',
      section: 'kitchen',
      notes: 'Less spicy'
    },
    {
      id: 'ORD002',
      billId: 'BILL002',
      status: 'in-progress',
      items: [
        { name: 'Fish Curry', quantity: 1 },
        { name: 'Coconut Rice', quantity: 1 },
        { name: 'Papadam', quantity: 2 }
      ],
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      updatedAt: new Date(Date.now() - 10 * 60 * 1000),
      estimatedTime: 20,
      priority: 'high',
      section: 'kitchen'
    },
    {
      id: 'ORD003',
      billId: 'BILL003',
      status: 'new',
      items: [
        { name: 'Vegetable Samosa', quantity: 4 },
        { name: 'Fresh Lime Juice', quantity: 2 }
      ],
      createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      updatedAt: new Date(Date.now() - 2 * 60 * 1000),
      estimatedTime: 10,
      priority: 'urgent',
      section: 'kitchen'
    },
    {
      id: 'ORD004',
      billId: 'BILL004',
      status: 'done',
      items: [
        { name: 'Chicken Roll', quantity: 1 },
        { name: 'Herbal Tea', quantity: 1 }
      ],
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      updatedAt: new Date(Date.now() - 5 * 60 * 1000),
      estimatedTime: 15,
      priority: 'normal',
      section: 'kitchen'
    }
  ]);

  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterSection, setFilterSection] = useState<string>('all');
  
  // Employee consumption state
  const [consumptions, setConsumptions] = useState<EmployeeConsumption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [consumptionQuantity, setConsumptionQuantity] = useState<number>(1);
  const [consumptionNotes, setConsumptionNotes] = useState<string>('');

  const moveOrder = (orderId: string, newStatus: KitchenOrder['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedAt: new Date() }
        : order
    ));

    const order = orders.find(o => o.id === orderId);
    if (order) {
      toast({
        title: "Order Updated",
        description: `Order ${order.billId} moved to ${newStatus.replace('-', ' ')}`,
      });

      // Play notification sound for status changes
      if (newStatus === 'done') {
        // In a real app, you would play a sound here
        console.log('🔔 Order completed sound');
      }
    }
  };

  const addEmployeeConsumption = () => {
    if (!selectedProduct || !user) {
      toast({
        title: "Error",
        description: "Please select a product and ensure you're logged in",
        variant: "destructive"
      });
      return;
    }

    const newConsumption: EmployeeConsumption = {
      id: `CONS${Date.now()}`,
      employeeName: user.name,
      employeeId: user.id,
      productName: selectedProduct,
      quantity: consumptionQuantity,
      consumedAt: new Date(),
      notes: consumptionNotes || undefined
    };

    setConsumptions(prev => [newConsumption, ...prev]);
    setSelectedProduct('');
    setConsumptionQuantity(1);
    setConsumptionNotes('');

    toast({
      title: "Consumption Logged",
      description: `${consumptionQuantity}x ${selectedProduct} logged for ${user.name}`,
    });
  };

  const getFilteredOrders = (status: KitchenOrder['status']) => {
    return orders.filter(order => {
      const matchesStatus = order.status === status;
      const matchesDate = format(order.createdAt, 'yyyy-MM-dd') === filterDate;
      const matchesSection = filterSection === 'all' || order.section === filterSection;
      return matchesStatus && matchesDate && matchesSection;
    });
  };

  const getPriorityColor = (priority: KitchenOrder['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getTimeColor = (createdAt: Date, estimatedTime?: number) => {
    const elapsed = (Date.now() - createdAt.getTime()) / (1000 * 60); // in minutes
    if (!estimatedTime) return 'text-muted-foreground';
    
    if (elapsed > estimatedTime) return 'text-destructive';
    if (elapsed > estimatedTime * 0.8) return 'text-warning';
    return 'text-muted-foreground';
  };

  const OrderCard = ({ order }: { order: KitchenOrder }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{order.billId}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(order.priority)}>
              {order.priority}
            </Badge>
            {order.estimatedTime && (
              <Badge variant="outline" className={getTimeColor(order.createdAt, order.estimatedTime)}>
                {order.estimatedTime}m
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {formatDistanceToNow(order.createdAt, { addSuffix: true })}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-1 px-2 bg-muted/50 rounded">
              <span className="font-medium">{item.name}</span>
              <Badge variant="secondary">×{item.quantity}</Badge>
            </div>
          ))}
        </div>
        
        {order.notes && (
          <div className="p-2 bg-accent/50 rounded-md">
            <p className="text-sm text-accent-foreground">
              <strong>Notes:</strong> {order.notes}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {order.status === 'new' && (
            <Button 
              onClick={() => moveOrder(order.id, 'in-progress')}
              size="sm"
              className="flex-1"
            >
              Start Cooking
            </Button>
          )}
          {order.status === 'in-progress' && (
            <Button 
              onClick={() => moveOrder(order.id, 'done')}
              size="sm"
              variant="success"
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Done
            </Button>
          )}
          {order.status === 'done' && (
            <Button 
              onClick={() => moveOrder(order.id, 'new')}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              Reopen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const newOrders = getFilteredOrders('new');
  const inProgressOrders = getFilteredOrders('in-progress');
  const doneOrders = getFilteredOrders('done');

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ChefHat className="h-8 w-8" />
            Kitchen Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage orders and employee consumption
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <Badge variant="outline">
            {newOrders.length} new orders
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Kitchen Orders
          </TabsTrigger>
          <TabsTrigger value="consumption" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employee Consumption
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6 mt-6">

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="date">Date:</Label>
              <Input
                id="date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="section">Section:</Label>
              <Select value={filterSection} onValueChange={setFilterSection}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* New Orders */}
        <div className="space-y-4">
          <Card className="bg-accent/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  New Orders
                </span>
                <Badge variant="secondary">{newOrders.length}</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {newOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
            {newOrders.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No new orders</p>
              </Card>
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="space-y-4">
          <Card className="bg-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  In Progress
                </span>
                <Badge variant="secondary">{inProgressOrders.length}</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {inProgressOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
            {inProgressOrders.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No orders in progress</p>
              </Card>
            )}
          </div>
        </div>

        {/* Done */}
        <div className="space-y-4">
          <Card className="bg-success/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Done
                </span>
                <Badge variant="secondary">{doneOrders.length}</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {doneOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
            {doneOrders.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No completed orders</p>
              </Card>
            )}
          </div>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="consumption" className="space-y-6 mt-6">
          {/* Add Consumption Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Log Employee Consumption
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {demoProducts.map(product => (
                        <SelectItem key={product.id} value={product.name}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={consumptionQuantity}
                    onChange={(e) => setConsumptionQuantity(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="e.g., breakfast, lunch"
                    value={consumptionNotes}
                    onChange={(e) => setConsumptionNotes(e.target.value)}
                  />
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={addEmployeeConsumption}
                    className="w-full"
                    disabled={!selectedProduct}
                  >
                    Log Consumption
                  </Button>
                </div>
              </div>
              
              {user && (
                <div className="text-sm text-muted-foreground">
                  Logging as: <strong>{user.name}</strong> ({user.role})
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consumption History */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Consumption History</CardTitle>
            </CardHeader>
            <CardContent>
              {consumptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No consumption logged today
                </div>
              ) : (
                <div className="space-y-3">
                  {consumptions.map(consumption => (
                    <div 
                      key={consumption.id} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <div className="font-medium">{consumption.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            {consumption.employeeName} • {format(consumption.consumedAt, 'HH:mm')}
                          </div>
                          {consumption.notes && (
                            <div className="text-sm text-muted-foreground italic">
                              {consumption.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        ×{consumption.quantity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">
                      {consumptions.reduce((sum, c) => sum + c.quantity, 0)}
                    </p>
                  </div>
                  <Utensils className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Products</p>
                    <p className="text-2xl font-bold">
                      {new Set(consumptions.map(c => c.productName)).size}
                    </p>
                  </div>
                  <ChefHat className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Employees</p>
                    <p className="text-2xl font-bold">
                      {new Set(consumptions.map(c => c.employeeId)).size}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Kitchen;