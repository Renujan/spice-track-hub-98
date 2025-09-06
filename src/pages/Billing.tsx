import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ProductCard, CartSummary } from "@/components/BillingComponents";
import { generateBillPDF, BillData } from "@/utils/pdfGenerator";
import { demoProducts, categories, Product } from "@/data/products";
import { Search, ShoppingCart, Printer, Download, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  product: Product;
  quantity: number;
}

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sections, setSections] = useState({
    client: true,
    kitchen: false,
    stock: false
  });
  const [paymentType, setPaymentType] = useState("cash");
  const [taxRate, setTaxRate] = useState(0.1); // 10% default
  const [isEditingTax, setIsEditingTax] = useState(false);

  const filteredProducts = demoProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.active;
  });

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQuantity = Math.max(0, item.quantity + change);
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const subtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleCreateBill = async () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to cart before creating a bill.",
        variant: "destructive",
      });
      return;
    }

    const selectedSections = Object.entries(sections)
      .filter(([_, selected]) => selected)
      .map(([section, _]) => section);

    // Generate PDF
    const billData: BillData = {
      items: cart.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          sku: item.product.sku
        },
        quantity: item.quantity
      })),
      subtotal,
      tax,
      taxRate,
      total,
      paymentMethod: paymentType,
      billNumber: `SPOT-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      cashier: "Admin User"
    };

    try {
      await generateBillPDF(billData);
      
      // Simulate printing to multiple printers
      printToMultiplePrinters(cart, selectedSections);
      
      // Reset cart after successful billing
      setCart([]);
      setSections({ client: true, kitchen: false, stock: false });
      
      toast({
        title: "Bill created successfully!",
        description: `PDF generated and order sent to: ${selectedSections.join(', ')}`,
      });
    } catch (error) {
      toast({
        title: "Error generating bill",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const printToMultiplePrinters = (billItems: CartItem[], sections: string[]) => {
    sections.forEach(section => {
      // Simulate printer communication
      setTimeout(() => {
        toast({
          title: `✅ ${section.charAt(0).toUpperCase() + section.slice(1)} Printer`,
          description: "Receipt printed successfully",
        });
      }, Math.random() * 1000);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
      {/* Left Side - Products */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-brand bg-clip-text text-transparent">
            Billing
          </h1>
          <p className="text-muted-foreground mt-2">
            Select products to create a new order
          </p>
        </div>

        {/* Search and Categories */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </div>

      {/* Right Side - Cart */}
      <div className="space-y-6">
        <Card className="shadow-2xl border-0 bg-gradient-card card-hover max-h-[calc(100vh-8rem)] overflow-y-auto">
          <CardHeader className="bg-gradient-brand text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-6 w-6" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white/50 backdrop-blur-sm rounded-b-xl">
            <CartSummary 
              cart={cart}
              subtotal={subtotal}
              tax={tax}
              taxRate={taxRate}
              total={total}
              onUpdateQuantity={updateQuantity}
              onEditTax={setTaxRate}
              isEditingTax={isEditingTax}
              onToggleEditTax={() => setIsEditingTax(!isEditingTax)}
            />

            <Separator className="my-4" />

            {/* Sections */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Send receipt to:</Label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(sections).map(([section, checked]) => (
                  <div key={section} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <Checkbox
                      id={section}
                      checked={checked}
                      onCheckedChange={(checked) => 
                        setSections(prev => ({ ...prev, [section]: !!checked }))
                      }
                    />
                    <Label htmlFor={section} className="text-sm capitalize cursor-pointer flex-1">
                      {section === 'client' ? 'Customer Receipt' : section}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Payment Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Payment Method:</Label>
              <RadioGroup value={paymentType} onValueChange={setPaymentType} className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="text-sm cursor-pointer">Cash</Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="text-sm cursor-pointer">Visa/Card</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button
                variant="outline"
                onClick={handleCreateBill}
                disabled={cart.length === 0}
                className="hover-lift border-2 border-primary/30 hover:bg-primary/5"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Bill
              </Button>
              <Button
                onClick={handleCreateBill}
                disabled={cart.length === 0}
                className="btn-professional hover-glow"
              >
                <Download className="h-4 w-4 mr-2" />
                Generate PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;