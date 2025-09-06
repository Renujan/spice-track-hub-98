import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { demoProducts, categories, Product } from "@/data/products";
import { Search, Plus, Edit, Trash2, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Beverages",
    description: "",
    sku: "",
    active: true,
    stock: "",
    image: ""
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    if (!formData.name || !formData.price || !formData.sku) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      description: formData.description,
      sku: formData.sku,
      active: formData.active,
      stock: parseInt(formData.stock) || 0,
      image: formData.image || '/placeholder-product.jpg'
    };

    setProducts([...products, newProduct]);
    setFormData({
      name: "",
      price: "",
      category: "Beverages",
      description: "",
      sku: "",
      active: true,
      stock: "",
      image: ""
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Product added",
      description: `${newProduct.name} has been added successfully.`,
    });
  };

  const handleEditProduct = () => {
    if (!editingProduct || !formData.name || !formData.price || !formData.sku) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const updatedProduct: Product = {
      ...editingProduct,
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      description: formData.description,
      sku: formData.sku,
      active: formData.active,
      stock: parseInt(formData.stock) || 0,
      image: formData.image || '/placeholder-product.jpg'
    };

    setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
    setEditingProduct(null);
    setFormData({
      name: "",
      price: "",
      category: "Beverages",
      description: "",
      sku: "",
      active: true,
      stock: "",
      image: ""
    });
    
    toast({
      title: "Product updated",
      description: `${updatedProduct.name} has been updated successfully.`,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setProducts(products.filter(p => p.id !== productId));
    
    toast({
      title: "Product deleted",
      description: `${product?.name} has been deleted successfully.`,
    });
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      sku: product.sku,
      active: product.active,
      stock: product.stock.toString(),
      image: product.image
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a server and get back a URL
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
      
      toast({
        title: "Image uploaded",
        description: "Product image has been uploaded successfully.",
      });
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2">
            Manage your restaurant's menu items
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product for your menu
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Chicken Tikka"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (Rs) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {categories.filter(cat => cat !== "All").map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="e.g., CHK001"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="image">Product Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: !!checked }))}
                />
                <Label htmlFor="active">Active (available for sale)</Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleAddProduct} className="flex-1">
                  Add Product
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
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
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-product.jpg';
                          }}
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell className="font-semibold">Rs. {product.price}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock < 10 ? "destructive" : "secondary"}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Product</DialogTitle>
                              <DialogDescription>
                                Update product information
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* Same form fields as add dialog */}
                              <div>
                                <Label htmlFor="edit-name">Product Name *</Label>
                                <Input
                                  id="edit-name"
                                  value={formData.name}
                                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="edit-price">Price (Rs) *</Label>
                                  <Input
                                    id="edit-price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-stock">Stock</Label>
                                  <Input
                                    id="edit-stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="edit-active"
                                  checked={formData.active}
                                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: !!checked }))}
                                />
                                <Label htmlFor="edit-active">Active</Label>
                              </div>
                              <div className="flex gap-3 pt-4">
                                <Button onClick={handleEditProduct} className="flex-1">
                                  Update Product
                                </Button>
                                <Button variant="outline" onClick={() => setEditingProduct(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{product.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;