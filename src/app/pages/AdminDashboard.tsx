import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Shield, UserPlus, Trash2, LogOut, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'licensing' | 'traffic';
  createdAt: string;
}

interface SystemLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'licensing' | 'traffic'>('licensing');

  useEffect(() => {
    // Check if user is admin
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      navigate('/login');
      return;
    }

    // Load initial data
    const storedUsers = localStorage.getItem('users');
    const storedLogs = localStorage.getItem('systemLogs');
    
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    
    if (storedLogs) {
      setSystemLogs(JSON.parse(storedLogs));
    }
  }, [navigate]);

  const addLog = (action: string) => {
    const newLog: SystemLog = {
      id: Date.now().toString(),
      action,
      user: localStorage.getItem('username') || 'Admin',
      timestamp: new Date().toLocaleString(),
    };
    
    const updatedLogs = [newLog, ...systemLogs];
    setSystemLogs(updatedLogs);
    localStorage.setItem('systemLogs', JSON.stringify(updatedLogs));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser: User = {
      id: Date.now().toString(),
      username,
      fullName,
      role,
      createdAt: new Date().toLocaleString(),
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    addLog(`Created ${role} officer: ${fullName}`);
    toast.success(`${role === 'licensing' ? 'Licensing' : 'Traffic'} Officer created successfully!`);
    
    // Reset form
    setFullName('');
    setUsername('');
    setPassword('');
    setRole('licensing');
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    addLog(`Deleted user: ${userName}`);
    toast.success('User deleted successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">E-License Management System</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="create-users" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="create-users">Create Users</TabsTrigger>
            <TabsTrigger value="manage-users">Manage Users</TabsTrigger>
            <TabsTrigger value="system-logs">System Logs</TabsTrigger>
          </TabsList>

          {/* Create Users Tab */}
          <TabsContent value="create-users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Create Officer Account
                </CardTitle>
                <CardDescription>
                  Create new Licensing Officer or Traffic Officer accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={(value: 'licensing' | 'traffic') => setRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="licensing">Licensing Officer</SelectItem>
                        <SelectItem value="traffic">Traffic Officer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Officer
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Users Tab */}
          <TabsContent value="manage-users">
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>
                  View and manage all system users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No users created yet. Create your first user in the Create Users tab.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.fullName}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.role === 'licensing' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role === 'licensing' ? 'Licensing Officer' : 'Traffic Officer'}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">{user.createdAt}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.fullName)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Logs Tab */}
          <TabsContent value="system-logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Logs
                </CardTitle>
                <CardDescription>
                  View all system activities and changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {systemLogs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No system logs yet. System activities will appear here.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.user}</TableCell>
                          <TableCell className="text-sm text-gray-500">{log.timestamp}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
