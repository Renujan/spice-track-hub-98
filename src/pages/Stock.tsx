import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { demoProducts } from "@/data/products";
import { Search, Package, AlertTriangle, Plus, Edit3, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface StockEntry {
  id: string;
  productId: string;
  productName: string;
  date: string;
  startQuantity: number;
  usedQuantity: number;
  notes?: string;
}

const Stock = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<StockEntry | null>(null);

  // Initialize stock entries with demo data
  useEffect(() => {
    const initialEntries: StockEntry[] = demoProducts.map(product => ({
      id: `stock-${product.id}`,
      productId: product.id,
      productName: product.name,
      date: selectedDate,
      startQuantity: product.stock + Math.floor(Math.random() * 20),
      usedQuantity: Math.floor(Math.random() * 15),
      notes: ""
    }));
    setStockEntries(initialEntries);
  }, []);

  const filteredEntries = stockEntries.filter(entry => {
    const matchesSearch = entry.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = entry.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  const lowStockItems = stockEntries.filter(entry => 
    (entry.startQuantity - entry.usedQuantity) < 10
  );

  const updateStockEntry = (id: string, field: 'startQuantity' | 'usedQuantity', value: number) => {
    setStockEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [field]: Math.max(0, value) } : entry
    ));
    
    toast({
      title: "Stock updated",
      description: "Stock quantity has been updated successfully.",
    });
  };

  const addStockEntry = (productId: string, startQuantity: number) => {
    const product = demoProducts.find(p => p.id === productId);
    if (!product) return;

    const newEntry: StockEntry = {
      id: `stock-${Date.now()}`,
      productId,
      productName: product.name,
      date: selectedDate,
      startQuantity,
      usedQuantity: 0,
      notes: ""
    };

    setStockEntries(prev => {
      const existing = prev.find(e => e.productId === productId && e.date === selectedDate);
      if (existing) {
        return prev.map(e => e.id === existing.id ? { ...e, startQuantity } : e);
      }
      return [...prev, newEntry];
    });

    toast({
      title: "Stock added",
      description: `Stock added for ${product.name}`,
    });
  };

  const totalItems = filteredEntries.length;
  const lowStockCount = lowStockItems.length;
  const lastUpdate = "2 hours ago";

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Management</h1>
          <p className="text-muted-foreground mt-2">
            Track inventory and manage stock levels
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Stock</DialogTitle>
              <DialogDescription>
                Add initial stock quantity for products
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {demoProducts.slice(0, 8).map(product => {
                const existing = stockEntries.find(e => 
                  e.productId === product.id && e.date === selectedDate
                );
                return (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.jpg';
                        }}
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Current: {existing?.startQuantity || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        className="w-20"
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value > 0) {
                            addStockEntry(product.id, value);
                          }
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Products in inventory</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Items below 10 units</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lastUpdate}</div>
            <p className="text-xs text-muted-foreground">Stock last modified</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="by-date">By Date</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {/* Search and Date Filter */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="date">Date:</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Table */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Overview - {format(new Date(selectedDate), 'PPP')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Start Quantity</TableHead>
                      <TableHead>Used Quantity</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map(entry => {
                      const remaining = entry.startQuantity - entry.usedQuantity;
                      const isLowStock = remaining < 10;
                      
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={demoProducts.find(p => p.id === entry.productId)?.image || '/placeholder-product.jpg'}
                                alt={entry.productName}
                                className="h-10 w-10 rounded-lg object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-product.jpg';
                                }}
                              />
                              <div className="font-medium">{entry.productName}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={entry.startQuantity}
                              onChange={(e) => updateStockEntry(entry.id, 'startQuantity', parseInt(e.target.value) || 0)}
                              className="w-20"
                              min="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={entry.usedQuantity}
                              onChange={(e) => updateStockEntry(entry.id, 'usedQuantity', parseInt(e.target.value) || 0)}
                              className="w-20"
                              min="0"
                              max={entry.startQuantity}
                            />
                          </TableCell>
                          <TableCell>
                            <span className={`font-semibold ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                              {remaining}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isLowStock ? "destructive" : "default"}>
                              {isLowStock ? "Low Stock" : "Normal"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-date">
          <Card>
            <CardHeader>
              <CardTitle>Historical Stock Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Historical stock data view - Coming soon!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments">
          <Card>
            <CardHeader>
              <CardTitle>Stock Adjustments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Stock adjustment history - Coming soon!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Stock;