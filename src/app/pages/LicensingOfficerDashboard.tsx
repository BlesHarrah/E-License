import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { IdCard, UserPlus, LogOut, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { verifyWithMosip, MosipVerificationRequest } from '../services/mosipService';
import { LicenseCard } from '../components/LicenseCard';

interface Driver {
  id: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  nationalId: string;
  licenseNumber: string;
  licenseClass: string;
  issueDate: string;
  expiryDate: string;
  status: 'pending' | 'verified';
  registeredBy: string;
  registeredAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  mosipVerified: boolean;
}

export default function LicensingOfficerDashboard() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showLicenseCard, setShowLicenseCard] = useState(false);
  const [issuedDriver, setIssuedDriver] = useState<Driver | null>(null);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [licenseClass, setLicenseClass] = useState('B');

  useEffect(() => {
    // Check if user is licensing officer
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'licensing') {
      navigate('/login');
      return;
    }

    // Load drivers
    const storedDrivers = localStorage.getItem('drivers');
    if (storedDrivers) {
      setDrivers(JSON.parse(storedDrivers));
    }
  }, [navigate]);

  const generateLicenseNumber = () => {
    const prefix = 'DL';
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix}${random}`;
  };

  const calculateExpiryDate = (issueDate: Date) => {
    const expiryDate = new Date(issueDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 5); // 5 years validity
    return expiryDate.toISOString().split('T')[0];
  };

  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsVerifying(true);
    
    try {
      // Verify with MOSIP first
      const mosipRequest: MosipVerificationRequest = {
        nationalId,
        fullName,
        dateOfBirth,
      };
      
      toast.info('Verifying identity with MOSIP...');
      const mosipResponse = await verifyWithMosip(mosipRequest);
      
      if (!mosipResponse.success) {
        toast.error(`MOSIP Verification Failed: ${mosipResponse.message}`);
        setIsVerifying(false);
        return;
      }
      
      toast.success('MOSIP verification successful!');
      
      // If MOSIP verification is successful, register the driver
      const issueDate = new Date().toISOString().split('T')[0];
      const newDriver: Driver = {
        id: Date.now().toString(),
        fullName,
        dateOfBirth,
        address: mosipResponse.data?.address || address,
        phoneNumber,
        nationalId,
        licenseNumber: generateLicenseNumber(),
        licenseClass,
        issueDate,
        expiryDate: calculateExpiryDate(new Date()),
        status: 'pending',
        registeredBy: localStorage.getItem('username') || 'Licensing Officer',
        registeredAt: new Date().toLocaleString(),
        mosipVerified: true,
      };
      
      const allDrivers = [...drivers, newDriver];
      setDrivers(allDrivers);
      localStorage.setItem('drivers', JSON.stringify(allDrivers));
      
      // Show license card
      setIssuedDriver(newDriver);
      setShowLicenseCard(true);
      
      toast.success(`License issued successfully! License: ${newDriver.licenseNumber}`);
      
      // Reset form
      setFullName('');
      setDateOfBirth('');
      setAddress('');
      setPhoneNumber('');
      setNationalId('');
      setLicenseClass('B');
      
    } catch (error) {
      toast.error('An error occurred during registration');
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const stats = {
    total: drivers.length,
    pending: drivers.filter(d => d.status === 'pending').length,
    verified: drivers.filter(d => d.status === 'verified').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <IdCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Licensing Officer Dashboard</h1>
                <p className="text-sm text-gray-500">Driver Registration & Management</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Drivers</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Verification</CardDescription>
              <CardTitle className="text-3xl text-orange-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Verified Licenses</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.verified}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="register" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="register">Register Driver</TabsTrigger>
            <TabsTrigger value="drivers">All Drivers</TabsTrigger>
          </TabsList>

          {/* Register Driver Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Register New Driver
                </CardTitle>
                <CardDescription>
                  Fill in the driver's information. Identity will be verified through MOSIP.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegisterDriver} className="space-y-4 max-w-2xl">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>MOSIP Integration:</strong> The system will verify the driver's identity using their National ID through the MOSIP authentication system before issuing the license.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationalId">National ID Number *</Label>
                    <Input
                      id="nationalId"
                      placeholder="Enter national ID number (min 10 characters)"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      required
                      minLength={10}
                    />
                    <p className="text-xs text-gray-500">This will be used for MOSIP verification</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter residential address (will be verified via MOSIP)"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Address will be auto-filled from MOSIP if available</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="Enter phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseClass">License Class *</Label>
                      <Select value={licenseClass} onValueChange={setLicenseClass}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Class A - Motorcycles</SelectItem>
                          <SelectItem value="B">Class B - Cars & Light Vehicles</SelectItem>
                          <SelectItem value="C">Class C - Trucks</SelectItem>
                          <SelectItem value="D">Class D - Buses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying with MOSIP...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Register Driver & Issue License
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Drivers Tab */}
          <TabsContent value="drivers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Registered Drivers
                </CardTitle>
                <CardDescription>
                  View all registered drivers and their license status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {drivers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No drivers registered yet. Register your first driver in the Register Driver tab.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>License Number</TableHead>
                          <TableHead>Full Name</TableHead>
                          <TableHead>National ID</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Issue Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {drivers.map((driver) => (
                          <TableRow key={driver.id}>
                            <TableCell className="font-mono">{driver.licenseNumber}</TableCell>
                            <TableCell>{driver.fullName}</TableCell>
                            <TableCell className="font-mono text-sm">{driver.nationalId}</TableCell>
                            <TableCell>
                              <Badge variant="outline">Class {driver.licenseClass}</Badge>
                            </TableCell>
                            <TableCell>{driver.phoneNumber}</TableCell>
                            <TableCell className="text-sm text-gray-500">{driver.issueDate}</TableCell>
                            <TableCell>
                              <Badge variant={driver.status === 'verified' ? 'default' : 'secondary'}>
                                {driver.status === 'verified' ? 'Verified' : 'Pending'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* License Card Dialog */}
      <Dialog open={showLicenseCard} onOpenChange={setShowLicenseCard}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>License Issued Successfully</DialogTitle>
            <DialogDescription>
              The driver's license has been issued after successful MOSIP verification.
            </DialogDescription>
          </DialogHeader>
          {issuedDriver && <LicenseCard driver={issuedDriver} />}
          <Button onClick={() => setShowLicenseCard(false)} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}