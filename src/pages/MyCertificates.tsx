
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Calendar, Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);
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
        setLoading(true);
        console.log('Fetching certificates for user:', user.id);
        
        const { data, error } = await supabase
          .from('certificates')
          .select(`
            *,
            course:courses(id, title, category, level)
          `)
          .eq('user_id', user.id)
          .order('issue_date', { ascending: false });

        if (error) throw error;

        console.log('Certificates data:', data);
        setCertificates(data as Certificate[]);
        
        if (highlightedCourseId && data && data.length > 0) {
          const highlighted = data.find(cert => cert.course.id === highlightedCourseId);
          if (highlighted) {
            setSelectedCertificate(highlighted as Certificate);
            setShowCertificateModal(true);
          }
        }
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
  }, [user, toast, highlightedCourseId]);

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

  const downloadCertificateAsPDF = async (certificate: Certificate) => {
    try {
      setDownloadingCertificate(true);
      const certificateElement = document.getElementById('certificate-template');
      if (!certificateElement) {
        toast({
          title: 'Certificate not found',
          description: 'Please try again',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Generating PDF',
        description: 'Please wait while we generate your certificate',
      });

      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
      });
      
      const imgWidth = 297;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${certificate.course.title}-Certificate.pdf`);
      
      toast({
        title: 'Certificate downloaded',
        description: 'Your certificate has been downloaded successfully',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error downloading certificate',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setDownloadingCertificate(false);
    }
  };

  const viewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
  };

  const CertificateTemplate = ({ certificate }: { certificate: Certificate }) => {
    const [userName, setUserName] = useState('');
    
    useEffect(() => {
      if (user) {
        const fetchUserProfile = async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
            
          if (!error && data) {
            setUserName(data.full_name || user.email || 'Student');
          }
        };
        
        fetchUserProfile();
      }
    }, [user]);

    return (
      <div id="certificate-template" className="bg-gradient-to-r from-blue-50 to-indigo-50 p-10 rounded-lg border-8 border-double border-blue-200 w-full max-w-3xl mx-auto text-center">
        <div className="mb-8">
          <div className="text-center mb-2">
            <Award className="h-20 w-20 mx-auto text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Certificate of Completion</h1>
          <p className="text-gray-600">This certifies that</p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-serif text-blue-900 border-b-2 border-blue-200 inline-block px-4 py-2">{userName}</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600">has successfully completed the course</p>
          <h3 className="text-xl font-bold text-blue-800 mt-2">{certificate.course.title}</h3>
          <p className="text-gray-600 mt-2">
            {certificate.course.category} • {certificate.course.level}
          </p>
        </div>
        
        <div className="mb-8">
          <p className="text-gray-600">Issued on {new Date(certificate.issue_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        
        <div className="flex justify-center space-x-8">
          <div className="text-center">
            <div className="w-40 border-t-2 border-gray-400 mx-auto pt-2">
              <p className="text-gray-700 font-semibold">Rural Skills Learning Platform</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CertificateModal = () => {
    if (!selectedCertificate) return null;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Certificate</h2>
              <button 
                onClick={() => setShowCertificateModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <CertificateTemplate certificate={selectedCertificate} />
          </div>
          
          <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCertificateModal(false)}>
              Close
            </Button>
            <Button 
              onClick={() => downloadCertificateAsPDF(selectedCertificate)}
              disabled={downloadingCertificate}
            >
              {downloadingCertificate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
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
                            onClick={() => viewCertificate(certificate)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            View & Download
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
      {showCertificateModal && <CertificateModal />}
      <Footer />
    </div>
  );
};

export default MyCertificates;
