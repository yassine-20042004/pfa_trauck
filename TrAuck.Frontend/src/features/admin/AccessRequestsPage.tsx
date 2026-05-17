import { useEffect, useState } from "react";
import { CheckCircle2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccessRequestDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  requestedRole: string;
  companyOrReason: string;
  requestedAt: string;
  status: string;
}

export function AccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequestDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5198/api/v1/AccessRequests/pending');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Failed to fetch pending requests", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5198/api/v1/AccessRequests/${id}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        // Remove from list or refetch
        setRequests(prev => prev.filter(r => r.id !== id));
      } else {
        console.error("Failed to approve request");
      }
    } catch (error) {
      console.error("Network error during approval", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <UserPlus className="w-8 h-8 text-blue-500" />
          Access Requests
        </h1>
      </div>

      <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-white/5 border-b border-white/10 text-xs uppercase font-semibold text-zinc-300">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Requested Role</th>
                <th className="px-6 py-4">Company/Reason</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No pending access requests.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{request.firstName} {request.lastName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 capitalize">
                        {request.requestedRole}
                      </span>
                    </td>
                    <td className="px-6 py-4">{request.companyOrReason}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button 
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300 border border-green-500/30 rounded-lg px-4 py-2 flex items-center gap-2 h-auto"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
