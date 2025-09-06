import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, Edit, Trash2, Mail, Shield, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'cashier' | 'chef' | 'stock';
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
}

const defaultUsers: User[] = [
  {
    id: '1',
    fullName: 'Admin User',
    email: 'admin@spot.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    fullName: 'John Cashier',
    email: 'john@spot.com',
    role: 'cashier',
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: '3',
    fullName: 'Maria Chef',
    email: 'maria@spot.com',
    role: 'chef',
    status: 'active',
    createdAt: '2024-02-01'
  }
];

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'cashier' as User['role'],
    status: 'active' as User['status']
  });

  const roleColors = {
    admin: 'bg-gradient-brand text-white shadow-lg',
    cashier: 'bg-primary/10 text-primary border border-primary/20',
    chef: 'bg-secondary/10 text-secondary-dark border border-secondary/20',
    stock: 'bg-green-100 text-green-700 border border-green-200'
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'cashier',
      status: 'active'
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.fullName || !formData.email || (!editingUser && !formData.password)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingUser) {
      // Edit existing user
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData }
          : user
      ));
      toast({
        title: "User updated",
        description: `${formData.fullName} has been updated successfully.`,
      });
    } else {
      // Add new user
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
      toast({
        title: "User added",
        description: `${formData.fullName} has been added successfully.`,
      });
    }

    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) {
      toast({
        title: "Cannot delete",
        description: "Cannot delete the last admin user.",
        variant: "destructive",
      });
      return;
    }

    setUsers(users.filter(u => u.id !== userId));
    toast({
      title: "User deleted",
      description: "User has been removed from the system.",
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">
            User Management
          </h2>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="btn-professional hover-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Update user information and permissions.' 
                  : 'Create a new user account with appropriate permissions.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">
                  Password {!editingUser && '*'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder={editingUser ? "Leave empty to keep current" : "Enter password"}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value: User['role']) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Full Access</SelectItem>
                    <SelectItem value="cashier">Cashier - Billing & Sales</SelectItem>
                    <SelectItem value="chef">Chef - Kitchen Management</SelectItem>
                    <SelectItem value="stock">Stock Manager - Inventory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: User['status']) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="hover-glow">
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="hover-lift border-0 shadow-md bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-gradient-brand text-white">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg">{user.fullName}</h3>
                      <Badge 
                        className={roleColors[user.role]}
                        variant="secondary"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                      <Badge 
                        variant={user.status === 'active' ? 'default' : 'secondary'}
                        className={user.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {user.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {user.email}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Since {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(user)}
                    className="hover-lift"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                    disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;