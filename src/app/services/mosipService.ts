// Mock MOSIP API service for identity verification
// In production, this would connect to actual MOSIP API endpoints

export interface MosipVerificationRequest {
  nationalId: string;
  fullName: string;
  dateOfBirth: string;
}

export interface MosipVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    nationalId: string;
    verified: boolean;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    address: string;
  };
}

// Mock MOSIP authentication
export const verifyWithMosip = async (
  request: MosipVerificationRequest
): Promise<MosipVerificationResponse> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock verification logic
  // In production, this would make actual API call to MOSIP
  // Example: POST https://mosip-api-endpoint/identity/verify
  
  const { nationalId, fullName, dateOfBirth } = request;

  // Mock validation: check if nationalId is at least 10 characters
  if (nationalId.length < 10) {
    return {
      success: false,
      message: 'Invalid National ID format',
    };
  }

  // Mock successful verification
  return {
    success: true,
    message: 'Identity verified successfully',
    data: {
      nationalId,
      verified: true,
      fullName,
      dateOfBirth,
      gender: 'N/A', // Would come from MOSIP
      address: 'Verified Address from MOSIP Database',
    },
  };
};

// Mock API endpoint configuration
export const MOSIP_CONFIG = {
  apiEndpoint: 'https://api.mosip.io/identity/v1/verify',
  apiKey: 'YOUR_MOSIP_API_KEY_HERE',
  timeout: 30000,
};
