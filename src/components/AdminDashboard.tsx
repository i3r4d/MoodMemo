
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldIcon, UserIcon, LoaderIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  is_premium: boolean;
  premium_expires_at: string | null;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [userIdInput, setUserIdInput] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [premiumDuration, setPremiumDuration] = useState('30');
  
  // Check if current user is admin
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setIsAdmin(!!data?.is_admin);
        
        // If user is admin, fetch all users
        if (data?.is_admin) {
          fetchUsers();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
  const fetchUsers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username, is_premium, premium_expires_at')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserById = async () => {
    if (!userIdInput) {
      toast({
        title: "Error",
        description: "Please enter a user ID.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username, is_premium, premium_expires_at')
        .eq('id', userIdInput)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setSelectedUser(data);
        setSelectedUserId(data.id);
        toast({
          title: "User Found",
          description: `Found user: ${data.email}`,
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        title: "Error",
        description: "User not found with that ID.",
        variant: "destructive",
      });
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user || null);
    setSelectedUserId(userId);
  };
  
  const handleGrantPremium = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('manage-premium-status', {
        body: {
          action: 'grant',
          userId: selectedUserId,
          adminId: user?.id,
          duration: parseInt(premiumDuration),
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Premium Status Updated",
        description: `Successfully granted premium to user.`,
      });
      
      // Refresh user data
      fetchUsers();
      
      // If the selected user is the one we just updated, refresh their data
      if (selectedUser && selectedUser.id === selectedUserId) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, email, username, is_premium, premium_expires_at')
          .eq('id', selectedUserId)
          .single();
          
        if (!userError && userData) {
          setSelectedUser(userData);
        }
      }
    } catch (error: any) {
      console.error('Error granting premium:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update premium status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRevokePremium = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('manage-premium-status', {
        body: {
          action: 'revoke',
          userId: selectedUserId,
          adminId: user?.id,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Premium Status Updated",
        description: `Successfully revoked premium from user.`,
      });
      
      // Refresh user data
      fetchUsers();
      
      // If the selected user is the one we just updated, refresh their data
      if (selectedUser && selectedUser.id === selectedUserId) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, email, username, is_premium, premium_expires_at')
          .eq('id', selectedUserId)
          .single();
          
        if (!userError && userData) {
          setSelectedUser(userData);
        }
      }
    } catch (error: any) {
      console.error('Error revoking premium:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update premium status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If not admin, don't show the component
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="glass-morphism mood-journal-card space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ShieldIcon className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-medium">Admin Dashboard</h2>
      </div>
      
      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="search">Find User</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4 mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Users ({users.length})</h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={fetchUsers}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr 
                        key={user.id} 
                        className={`border-t hover:bg-muted/20 ${
                          selectedUserId === user.id ? 'bg-primary/5' : ''
                        }`}
                      >
                        <td className="p-2">
                          <div className="font-medium">{user.email}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {user.id}
                          </div>
                        </td>
                        <td className="p-2">
                          {user.is_premium ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircleIcon className="h-4 w-4" />
                              <span className="text-xs">Premium</span>
                              {user.premium_expires_at && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (until {format(new Date(user.premium_expires_at), 'MM/dd/yyyy')})
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <XCircleIcon className="h-4 w-4" />
                              <span className="text-xs">Free</span>
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleUserSelect(user.id)}
                          >
                            Select
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          
          {selectedUser && (
            <div className="border rounded-lg p-4 space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                <h3 className="font-medium">User Management</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div><strong>Email:</strong> {selectedUser.email}</div>
                <div><strong>User ID:</strong> {selectedUser.id}</div>
                <div>
                  <strong>Status:</strong> {selectedUser.is_premium ? 'Premium' : 'Free'}
                  {selectedUser.is_premium && selectedUser.premium_expires_at && (
                    <span className="text-muted-foreground ml-1">
                      (until {format(new Date(selectedUser.premium_expires_at), 'MM/dd/yyyy')})
                    </span>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="premiumDuration">Premium Duration (Days)</Label>
                    <Select
                      value={premiumDuration}
                      onValueChange={setPremiumDuration}
                      disabled={loading}
                    >
                      <SelectTrigger id="premiumDuration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="0">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRevokePremium}
                    disabled={loading || !selectedUser.is_premium}
                    className="w-1/2"
                  >
                    Revoke Premium
                  </Button>
                  <Button
                    onClick={handleGrantPremium}
                    disabled={loading || (selectedUser.is_premium && !selectedUser.premium_expires_at)}
                    className="w-1/2 bg-primary"
                  >
                    {selectedUser.is_premium ? 'Update Premium' : 'Grant Premium'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="search" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <div className="flex gap-2">
                <Input
                  id="userId"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  placeholder="Enter user ID"
                  disabled={loading}
                />
                <Button onClick={fetchUserById} disabled={loading || !userIdInput}>
                  {loading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : 'Search'}
                </Button>
              </div>
            </div>
            
            {selectedUser && (
              <div className="border rounded-lg p-4 space-y-4 mt-4">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">User Details</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> {selectedUser.email}</div>
                  <div><strong>User ID:</strong> {selectedUser.id}</div>
                  <div>
                    <strong>Status:</strong> {selectedUser.is_premium ? 'Premium' : 'Free'}
                    {selectedUser.is_premium && selectedUser.premium_expires_at && (
                      <span className="text-muted-foreground ml-1">
                        (until {format(new Date(selectedUser.premium_expires_at), 'MM/dd/yyyy')})
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="searchPremiumDuration">Premium Duration (Days)</Label>
                      <Select
                        value={premiumDuration}
                        onValueChange={setPremiumDuration}
                        disabled={loading}
                      >
                        <SelectTrigger id="searchPremiumDuration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                          <SelectItem value="0">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      onClick={handleRevokePremium}
                      disabled={loading || !selectedUser.is_premium}
                      className="w-1/2"
                    >
                      Revoke Premium
                    </Button>
                    <Button
                      onClick={handleGrantPremium}
                      disabled={loading || (selectedUser.is_premium && !selectedUser.premium_expires_at)}
                      className="w-1/2 bg-primary"
                    >
                      {selectedUser.is_premium ? 'Update Premium' : 'Grant Premium'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
