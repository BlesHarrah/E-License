import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ShieldCheck, Search, LogOut, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  mosipVerified?: boolean;
}

export default function TrafficOfficerDashboard() {
  const navigate = useNavigate();
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [verifiedDrivers, setVerifiedDrivers] = useState<Driver[]>([]);
  const [searchLicense, setSearchLicense] = useState('');
  const [searchResult, setSearchResult] = useState<Driver | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    // Check if user is traffic officer
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'traffic') {
      navigate('/login');
      return;
    }

    // Load drivers
    loadDrivers();
  }, [navigate]);

  const loadDrivers = () => {
    const storedDrivers = localStorage.getItem('drivers');
    if (storedDrivers) {
      const drivers: Driver[] = JSON.parse(storedDrivers);
      setAllDrivers(drivers);
      // Only show verified drivers in the list
      setVerifiedDrivers(drivers.filter(d => d.status === 'verified'));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const driver = allDrivers.find(d => 
      d.licenseNumber.toLowerCase() === searchLicense.toLowerCase()
    );

    if (driver) {
      setSearchResult(driver);
      toast.success('License found!');
    } else {
      setSearchResult(null);
      toast.error('License not found in the system!');
    }
  };

  const handleVerifyLicense = (driver: Driver) => {
    const updatedDrivers = allDrivers.map(d => 
      d.id === driver.id 
        ? { 
            ...d, 
            status: 'verified' as const,
            verifiedBy: localStorage.getItem('username') || 'Traffic Officer',
            verifiedAt: new Date().toLocaleString(),
          } 
        : d
    );
    
    setAllDrivers(updatedDrivers);
    setVerifiedDrivers(updatedDrivers.filter(d => d.status === 'verified'));
    localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
    
    if (searchResult?.id === driver.id) {
      setSearchResult({ ...driver, status: 'verified' });
    }
    
    toast.success(`License ${driver.licenseNumber} verified successfully!`);
  };

  const isLicenseExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const stats = {
    totalVerified: verifiedDrivers.length,
    pendingVerification: allDrivers.filter(d => d.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Traffic Officer Dashboard</h1>
                <p className="text-sm text-gray-500">License Verification System</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Verified Licenses</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.totalVerified}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Verification</CardDescription>
              <CardTitle className="text-3xl text-orange-600">{stats.pendingVerification}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="verify" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="verify">Verify License</TabsTrigger>
            <TabsTrigger value="verified-licenses">Verified Licenses</TabsTrigger>
          </TabsList>

          {/* Verify License Tab */}
          <TabsContent value="verify">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Verify Driver License
                </CardTitle>
                <CardDescription>
                  Search for a license by license number to verify its authenticity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4 max-w-xl mb-6">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="searchLicense">License Number</Label>
                      <Input
                        id="searchLicense"
                        placeholder="Enter license number (e.g., DL123456)"
                        value={searchLicense}
                        onChange={(e) => setSearchLicense(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>
                </form>

                {searchResult && (
                  <div className="mt-6 p-6 border rounded-lg bg-white">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">License Details</h3>
                        <p className="text-sm text-gray-500">License Number: {searchResult.licenseNumber}</p>
                      </div>
                      {isLicenseExpired(searchResult.expiryDate) ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Expired
                        </Badge>
                      ) : searchResult.status === 'verified' ? (
                        <Badge variant="default" className="flex items-center gap-1 bg-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Pending
                        </Badge>
                      )}
                    </div>

                    {searchResult.mosipVerified && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <strong>MOSIP Verified:</strong> This driver's identity has been authenticated through MOSIP
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{searchResult.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">National ID</p>
                        <p className="font-medium font-mono">{searchResult.nationalId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">{searchResult.dateOfBirth}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">License Class</p>
                        <p className="font-medium">Class {searchResult.licenseClass}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium">{searchResult.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Issue Date</p>
                        <p className="font-medium">{searchResult.issueDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expiry Date</p>
                        <p className="font-medium">{searchResult.expiryDate}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{searchResult.address}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Registered By</p>
                        <p className="font-medium">{searchResult.registeredBy} on {searchResult.registeredAt}</p>
                      </div>
                    </div>

                    {searchResult.status === 'pending' && !isLicenseExpired(searchResult.expiryDate) && (
                      <Button 
                        onClick={() => handleVerifyLicense(searchResult)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify This License
                      </Button>
                    )}

                    {searchResult.status === 'verified' && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Verified by:</strong> {searchResult.verifiedBy}
                        </p>
                        <p className="text-sm text-green-800">
                          <strong>Verified at:</strong> {searchResult.verifiedAt}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verified Licenses Only Tab */}
          <TabsContent value="verified-licenses">
            <Card>
              <CardHeader>
                <CardTitle>Verified Driver Licenses</CardTitle>
                <CardDescription>
                  View all verified driver licenses (separate verification system)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verifiedDrivers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No verified licenses yet. Use the Verify License tab to verify drivers.</p>
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
                          <TableHead>Expiry Date</TableHead>
                          <TableHead>Verified By</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {verifiedDrivers.map((driver) => (
                          <TableRow key={driver.id}>
                            <TableCell className="font-mono">{driver.licenseNumber}</TableCell>
                            <TableCell>{driver.fullName}</TableCell>
                            <TableCell className="font-mono text-sm">{driver.nationalId}</TableCell>
                            <TableCell>
                              <Badge variant="outline">Class {driver.licenseClass}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {driver.expiryDate}
                              {isLicenseExpired(driver.expiryDate) && (
                                <span className="text-red-600 ml-2">(Expired)</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">{driver.verifiedBy}</TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedDriver(driver)}
                                  >
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>License Details</DialogTitle>
                                    <DialogDescription>
                                      License Number: {driver.licenseNumber}
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  {driver.mosipVerified && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                                      <p className="text-sm text-blue-800 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        <strong>MOSIP Verified Identity</strong>
                                      </p>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-4 py-4">
                                    <div>
                                      <p className="text-sm text-gray-500">Full Name</p>
                                      <p className="font-medium">{driver.fullName}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">National ID</p>
                                      <p className="font-medium font-mono">{driver.nationalId}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Date of Birth</p>
                                      <p className="font-medium">{driver.dateOfBirth}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">License Class</p>
                                      <p className="font-medium">Class {driver.licenseClass}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Phone Number</p>
                                      <p className="font-medium">{driver.phoneNumber}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Issue Date</p>
                                      <p className="font-medium">{driver.issueDate}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Expiry Date</p>
                                      <p className="font-medium">{driver.expiryDate}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-sm text-gray-500">Address</p>
                                      <p className="font-medium">{driver.address}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-sm text-gray-500">Registered By</p>
                                      <p className="font-medium">{driver.registeredBy} on {driver.registeredAt}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-sm text-gray-500">Verified By</p>
                                      <p className="font-medium">{driver.verifiedBy} on {driver.verifiedAt}</p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
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
    </div>
  );
}