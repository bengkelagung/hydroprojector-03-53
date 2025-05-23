
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRound, Mail, Phone, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user, refreshSession } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    image: user?.image || ''
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setFormData(prev => ({ ...prev, image: base64String }));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error processing image:", error);
        toast({
          title: "Error",
          description: "Failed to process image",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Use direct updateUser method which doesn't depend on database tables
      const { error } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
          phone: formData.phone,
          image: formData.image
        }
      });

      if (error) {
        throw error;
      }

      // Make sure to refresh the session to get the updated user data
      await refreshSession();

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center border-b pb-8">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-32 h-32 relative rounded-full overflow-hidden bg-hydro-blue flex items-center justify-center">
                {formData.image ? (
                  <img 
                    src={formData.image} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserRound className="w-20 h-20 text-white" />
                )}
              </div>
              {isEditing && (
                <Label 
                  htmlFor="image-upload" 
                  className="absolute bottom-0 right-0 bg-hydro-blue text-white p-2 rounded-full cursor-pointer hover:bg-opacity-90"
                >
                  <Pencil className="w-4 h-4" />
                  <Input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </Label>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {formData.name || 'User Profile'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-4 px-4">
                  <UserRound className="w-6 h-6 text-hydro-blue" />
                  <div className="flex-1">
                    <Label className="text-sm text-gray-500">Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium text-gray-800">{formData.name}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 px-4">
                  <Mail className="w-6 h-6 text-hydro-blue" />
                  <div className="flex-1">
                    <Label className="text-sm text-gray-500">Email</Label>
                    <p className="text-lg font-medium text-gray-800">{formData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 px-4">
                  <Phone className="w-6 h-6 text-hydro-blue" />
                  <div className="flex-1">
                    <Label className="text-sm text-gray-500">Phone</Label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium text-gray-800">{formData.phone || '-'}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end px-4 pt-4">
                  {isEditing ? (
                    <div className="space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setFormData({
                            name: user?.name || '',
                            email: user?.email || '',
                            phone: user?.phone || '',
                            image: user?.image || ''
                          });
                          setIsEditing(false);
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      type="button" 
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
