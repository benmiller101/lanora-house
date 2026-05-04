import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PayPalButton from '@/components/PayPalButton';
import { Helmet } from 'react-helmet';

export default function PayPalTest() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>PayPal Integration Test | Lanora House</title>
        <meta name="description" content="Test PayPal payment integration" />
      </Helmet>

      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">PayPal Integration Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Test PayPal payment integration with the new SDK
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Amount: £10.00 GBP
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 flex justify-center">
              <PayPalButton 
                amount="10.00"
                currency="GBP"
                intent="CAPTURE"
              />
            </div>

            <div className="text-xs text-gray-500 text-center">
              Click the PayPal button above to test the payment flow
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}