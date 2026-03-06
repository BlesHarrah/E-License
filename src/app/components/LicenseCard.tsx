import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Shield, CheckCircle } from 'lucide-react';

interface LicenseCardProps {
  driver: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    licenseNumber: string;
    licenseClass: string;
    issueDate: string;
    expiryDate: string;
    nationalId: string;
    phoneNumber: string;
  };
}

export function LicenseCard({ driver }: LicenseCardProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-indigo-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">E-License</h2>
                <p className="text-sm opacity-90">Digital Driving License</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-500 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              MOSIP Verified
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* License Number - Prominent Display */}
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">License Number</p>
              <p className="text-3xl font-bold font-mono text-indigo-600">{driver.licenseNumber}</p>
            </div>

            {/* Driver Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-semibold text-gray-900">{driver.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">National ID</p>
                <p className="font-semibold text-gray-900">{driver.nationalId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-semibold text-gray-900">{driver.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">License Class</p>
                <Badge variant="outline" className="text-sm font-semibold">
                  Class {driver.licenseClass}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-semibold text-gray-900">{driver.phoneNumber}</p>
              </div>
            </div>

            {/* Address */}
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-semibold text-gray-900">{driver.address}</p>
            </div>

            {/* Validity Dates */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-500">Issue Date</p>
                <p className="font-semibold text-gray-900">{driver.issueDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p className="font-semibold text-gray-900">{driver.expiryDate}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t text-center">
              <p className="text-xs text-gray-500">
                This license has been verified through MOSIP identity authentication system
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Issued by: Digital License Management System (E-License)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
