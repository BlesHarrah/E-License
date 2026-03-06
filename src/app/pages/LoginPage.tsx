import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';

// Mock users for demonstration
const mockUsers = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'licensing', password: 'licensing123', role: 'licensing' },
  { username: 'traffic', password: 'traffic123', role: 'traffic' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) {
      toast.error('Please select a role!');
      return;
    }

    const user = mockUsers.find(
      u => u.username === username && u.password === password && u.role === role
    );

    if (user) {
      // Store user session
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('username', user.username);
      
      toast.success('Login successful!');
      
      // Navigate based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'licensing') {
        navigate('/licensing-officer');
      } else if (user.role === 'traffic') {
        navigate('/traffic-officer');
      }
    } else {
      toast.error('Invalid credentials!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-4 rounded-full">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">E-License Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Select Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="licensing">Licensing Officer</SelectItem>
                  <SelectItem value="traffic">Traffic Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
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
            
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}