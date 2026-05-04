import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminNavigation from "@/components/admin/AdminNavigation";

interface Submission {
  id: number;
  userId: string;
  title: string;
  description: string;
  type: string;
  condition: string;
  photos: string[];
  estimatedValue: string;
  status: string;
  adminFeedback: string | null;
  adminValuation: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AllSubmissions() {
  const { user, isLoading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllSubmissions = async () => {
    try {
      // Direct SQL query execution via our API
      const response = await fetch('/api/admin/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: "SELECT * FROM simple_submissions ORDER BY created_at DESC"
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch submissions: ${response.status}`);
      }

      const data = await response.json();
      console.log("SQL results:", data);
      
      // Transform SQL results to match our frontend schema
      const mappedSubmissions = data.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        description: row.description,
        type: row.type,
        condition: row.condition || '',
        photos: Array.isArray(row.photos) ? row.photos : [],
        estimatedValue: row.estimated_value,
        status: row.status || 'pending',
        adminFeedback: row.admin_feedback || null,
        adminValuation: row.admin_valuation || null,
        createdAt: row.created_at,
        updatedAt: row.updated_at || row.created_at
      }));
      
      setSubmissions(mappedSubmissions);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Try also fetching user submissions directly as a fallback
      try {
        const userId = "1747415026121"; // Known user ID for testing
        const fallbackResponse = await fetch(`/api/public-submissions/${userId}`);
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log("Public submissions fallback data:", fallbackData);
          setSubmissions(fallbackData);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  // Manually add a test submission for debugging
  const addTestSubmission = async () => {
    try {
      const response = await fetch('/api/simple-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: "1747415026121",
          title: "Debug Test Submission",
          description: "This is a test submission created from the all-submissions page",
          type: "auction",
          condition: "Excellent",
          photos: ["/uploads/submissions/test.jpg"],
          estimatedValue: "1000"
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create test submission: ${response.status}`);
      }

      const data = await response.json();
      console.log("Test submission created:", data);
      
      // Refresh the list
      fetchAllSubmissions();
    } catch (err) {
      console.error("Error creating test submission:", err);
      alert("Failed to create test submission: " + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  useEffect(() => {
    fetchAllSubmissions();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>You need to be logged in as an admin to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/admin"}>Go to Admin Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNavigation />
      <div className="my-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Submissions (Database View)</h1>
          <div className="space-x-2">
            <Button onClick={fetchAllSubmissions} variant="outline">
              Refresh
            </Button>
            <Button onClick={addTestSubmission}>
              Add Test Submission
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            <p className="font-semibold">Error loading submissions</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <h3 className="text-xl font-medium mb-2">No Submissions Found</h3>
            <p className="text-muted-foreground">
              There are no submissions in the database. Click "Add Test Submission" to create one.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-muted p-4 rounded-md mb-4">
              <p className="font-medium">{submissions.length} submissions found in database</p>
            </div>
            
            {submissions.map((submission) => (
              <Card key={submission.id} className="overflow-hidden border-l-4 border-l-primary">
                <CardHeader className="bg-secondary/20">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                      <CardTitle className="text-lg">{submission.title}</CardTitle>
                      <CardDescription>
                        ID: {submission.id} | User: {submission.userId} | 
                        Created: {new Date(submission.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{submission.type}</Badge>
                      <Badge variant={submission.status === 'pending' ? 'secondary' : 
                               submission.status === 'approved' ? 'default' : 'destructive'}>
                        {submission.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-1">Description</h3>
                      <p className="text-sm text-muted-foreground">{submission.description}</p>
                      
                      <h3 className="font-medium mt-3 mb-1">Condition</h3>
                      <p className="text-sm text-muted-foreground">{submission.condition}</p>
                      
                      <h3 className="font-medium mt-3 mb-1">Estimated Value</h3>
                      <p className="text-sm text-muted-foreground">
                        {submission.estimatedValue ? `£${submission.estimatedValue}` : 'Not provided'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Photos</h3>
                      {submission.photos && submission.photos.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {submission.photos.map((photo, index) => (
                            <div key={index} className="aspect-square bg-muted rounded-md overflow-hidden">
                              <img
                                src={photo}
                                alt={`Submission ${submission.id} photo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No photos</p>
                      )}
                      
                      {submission.adminFeedback && (
                        <div className="mt-3">
                          <h3 className="font-medium mb-1">Admin Feedback</h3>
                          <p className="text-sm text-muted-foreground">{submission.adminFeedback}</p>
                        </div>
                      )}
                      
                      {submission.adminValuation && (
                        <div className="mt-3">
                          <h3 className="font-medium mb-1">Admin Valuation</h3>
                          <p className="text-sm text-muted-foreground">£{submission.adminValuation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}