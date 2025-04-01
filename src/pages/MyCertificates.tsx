
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Calendar, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Certificate {
  id: string;
  issue_date: string;
  certificate_url: string;
  course: {
    id: string;
    title: string;
    category: string;
    level: string;
  };
}

const MyCertificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const highlightedCourseId = queryParams.get('course');

  useEffect(() => {
    if (!user) return;

    const fetchCertificates = async () => {
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select(`
            *,
            course:courses(id, title, category, level)
          `)
          .eq('user_id', user.id)
          .order('issue_date', { ascending: false });

        if (error) throw error;

        setCertificates(data as Certificate[]);
      } catch (error: any) {
        console.error('Error fetching certificates:', error);
        toast({
          title: 'Error fetching your certificates',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user, toast]);

  const shareCertificate = (certificate: Certificate) => {
    if (navigator.share) {
      navigator.share({
        title: `My ${certificate.course.title} Certificate`,
        text: `I completed the ${certificate.course.title} course and earned a certificate!`,
        url: certificate.certificate_url,
      }).catch((error) => {
        console.error('Error sharing:', error);
        toast({
          title: 'Error sharing certificate',
          description: 'Please try a different method',
          variant: 'destructive',
        });
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(certificate.certificate_url).then(() => {
        toast({
          title: 'Certificate link copied',
          description: 'The certificate link has been copied to your clipboard',
        });
      }).catch(() => {
        toast({
          title: 'Failed to copy link',
          description: 'Please try again',
          variant: 'destructive',
        });
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-12">
          <div className="container px-4 mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
              <p className="text-muted-foreground">Your achievements and completed courses</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-4 text-muted-foreground">Loading your certificates...</p>
              </div>
            ) : (
              <>
                {certificates.length === 0 ? (
                  <div className="glass-panel p-8 rounded-xl text-center">
                    <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-xl font-medium mb-4">You haven't earned any certificates yet</h2>
                    <p className="text-muted-foreground mb-6">Complete courses to earn certificates</p>
                    <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((certificate) => (
                      <Card 
                        key={certificate.id} 
                        className={`hover:shadow-md transition-shadow ${
                          highlightedCourseId === certificate.course.id 
                            ? 'ring-2 ring-primary'
                            : ''
                        }`}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-amber-500" />
                            <span className="line-clamp-1">{certificate.course.title}</span>
                          </CardTitle>
                          <CardDescription>
                            {certificate.course.category} • {certificate.course.level}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center text-sm mb-4">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Issued on {new Date(certificate.issue_date).toLocaleDateString()}</span>
                          </div>
                          <div className="p-4 bg-muted/50 rounded-lg text-center">
                            <Award className="h-16 w-16 mx-auto mb-2 text-amber-500" />
                            <p className="text-sm font-medium">Certificate of Completion</p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => window.open(certificate.certificate_url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => shareCertificate(certificate)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MyCertificates;
