import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Shield } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 p-6 rounded-full">
            <Shield className="w-16 h-16 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          E-License
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Digital License Management System
        </p>
        
        <p className="text-gray-500 mb-12 max-w-md mx-auto">
          Streamline your license management with our comprehensive digital solution. 
          Manage drivers, verify licenses, and maintain system integrity all in one place.
        </p>
        
        <Button 
          size="lg" 
          className="text-lg px-12 py-6 bg-indigo-600 hover:bg-indigo-700"
          onClick={() => navigate('/login')}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
