
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, BookOpen, Award, CheckCircle, ChevronLeft, Play } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock course data - in a real app, you would fetch this based on the ID
  const course = {
    id: id || '1',
    title: 'Sustainable Farming Techniques',
    description: 'Learn modern and sustainable methods to improve crop yields while protecting the environment. This comprehensive course covers soil health, water management, integrated pest management, and much more.',
    category: 'Agriculture',
    level: 'Beginner',
    duration: '6 weeks',
    students: 1250,
    lessons: 24,
    instructor: 'Dr. Sarah Johnson',
    instructorRole: 'Agricultural Scientist',
    rating: 4.8,
    reviews: 142,
    lastUpdated: 'March 2023',
    language: 'English',
    progress: 35,
    modules: [
      {
        id: 'm1',
        title: 'Introduction to Sustainable Farming',
        description: 'Understand the fundamentals of sustainable agriculture.',
        lessons: [
          { id: 'l1', title: 'What is Sustainable Farming?', duration: '15 min', completed: true },
          { id: 'l2', title: 'The History and Evolution of Agricultural Practices', duration: '22 min', completed: true },
          { id: 'l3', title: 'Key Principles of Sustainability in Agriculture', duration: '18 min', completed: false },
        ]
      },
      {
        id: 'm2',
        title: 'Soil Health and Management',
        description: 'Learn how to maintain and improve soil quality naturally.',
        lessons: [
          { id: 'l4', title: 'Understanding Soil Composition', duration: '24 min', completed: false },
          { id: 'l5', title: 'Natural Methods for Improving Soil Fertility', duration: '19 min', completed: false },
          { id: 'l6', title: 'Preventing Soil Erosion', duration: '17 min', completed: false },
          { id: 'l7', title: 'Composting Techniques', duration: '25 min', completed: false },
        ]
      },
      {
        id: 'm3',
        title: 'Water Conservation',
        description: 'Efficient water usage techniques for farming.',
        lessons: [
          { id: 'l8', title: 'Water Needs Assessment', duration: '16 min', completed: false },
          { id: 'l9', title: 'Drip Irrigation Systems', duration: '28 min', completed: false },
          { id: 'l10', title: 'Rainwater Harvesting', duration: '23 min', completed: false },
        ]
      }
    ]
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        {/* Course Header */}
        <div className="bg-secondary/40">
          <div className="container px-4 mx-auto py-12">
            <div className="max-w-4xl">
              <Link to="/courses" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Courses
              </Link>
              <h1 className="mb-4">{course.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">{course.description}</p>
              
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-1.5 h-5 w-5" />
                  {course.duration}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Users className="mr-1.5 h-5 w-5" />
                  {course.students.toLocaleString()} students
                </div>
                <div className="flex items-center text-muted-foreground">
                  <BookOpen className="mr-1.5 h-5 w-5" />
                  {course.lessons} lessons
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Award className="mr-1.5 h-5 w-5" />
                  Certificate
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button size="lg" className="button-animation">
                  Start Learning
                </Button>
                <Button variant="outline" size="lg" className="button-animation">
                  Add to Wishlist
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Course Content */}
        <div className="container px-4 mx-auto py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="curriculum">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="curriculum" className="space-y-6">
                  <h2 className="text-2xl font-medium mb-4">Course Curriculum</h2>
                  
                  <div className="space-y-4">
                    {course.modules.map((module) => (
                      <Accordion type="single" collapsible key={module.id}>
                        <AccordionItem value={module.id} className="glass-panel border-none rounded-lg overflow-hidden">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/50">
                            <div className="text-left">
                              <h3 className="font-medium">{module.title}</h3>
                              <p className="text-sm text-muted-foreground">{module.description}</p>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 pt-0">
                            <div className="space-y-2 mt-2">
                              {module.lessons.map((lesson) => (
                                <div key={lesson.id} className="flex items-center justify-between p-3 rounded-md hover:bg-secondary/50 transition-colors">
                                  <div className="flex items-center">
                                    {lesson.completed ? (
                                      <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                                    ) : (
                                      <Play className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                                    )}
                                    <span className={lesson.completed ? "line-through text-muted-foreground" : ""}>{lesson.title}</span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="overview">
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-medium mb-4">About This Course</h2>
                      <p className="text-muted-foreground">
                        This comprehensive course teaches you everything you need to know about sustainable farming practices that can be applied in rural settings. From soil management to water conservation, you'll learn practical techniques that improve yields while protecting the environment.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-medium mb-3">What You'll Learn</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Implement sustainable farming techniques</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Improve soil health naturally</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Conserve water through efficient irrigation</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Apply integrated pest management</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Plan crop rotations for optimal yield</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Create sustainable business models</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-medium mb-3">Prerequisites</h3>
                      <p className="text-muted-foreground">
                        This course is designed for beginners. No prior farming experience is required, though basic knowledge of agriculture will be helpful.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-medium mb-3">Target Audience</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Small-scale farmers looking to improve productivity</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Agriculture students interested in sustainable practices</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Community leaders involved in agricultural planning</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Anyone interested in starting sustainable farming ventures</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <div className="space-y-8">
                    <h2 className="text-2xl font-medium mb-4">Student Reviews</h2>
                    
                    <div className="glass-panel rounded-xl p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="text-center md:border-r md:border-border md:pr-6">
                          <div className="text-5xl font-medium">{course.rating}</div>
                          <div className="flex items-center justify-center my-2">
                            {Array(5).fill(0).map((_, i) => (
                              <svg key={i} className={`w-5 h-5 ${i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground">Based on {course.reviews} reviews</div>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center">
                            <span className="text-sm w-10 mr-2">5 stars</span>
                            <Progress value={75} className="h-2 flex-1" />
                            <span className="text-sm w-10 ml-2 text-right">75%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm w-10 mr-2">4 stars</span>
                            <Progress value={20} className="h-2 flex-1" />
                            <span className="text-sm w-10 ml-2 text-right">20%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm w-10 mr-2">3 stars</span>
                            <Progress value={5} className="h-2 flex-1" />
                            <span className="text-sm w-10 ml-2 text-right">5%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm w-10 mr-2">2 stars</span>
                            <Progress value={0} className="h-2 flex-1" />
                            <span className="text-sm w-10 ml-2 text-right">0%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm w-10 mr-2">1 star</span>
                            <Progress value={0} className="h-2 flex-1" />
                            <span className="text-sm w-10 ml-2 text-right">0%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Sample Reviews */}
                      <div className="glass-panel rounded-xl p-6">
                        <div className="flex justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary/10 mr-3"></div>
                            <div>
                              <h4 className="font-medium">Michael T.</h4>
                              <div className="text-sm text-muted-foreground">Small Farm Owner</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {Array(5).fill(0).map((_, i) => (
                              <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground">
                          This course transformed how I approach farming. The techniques I learned have already improved my crop yields while reducing my water usage. Dr. Johnson explains complex concepts in a way that's easy to understand and apply.
                        </p>
                      </div>
                      
                      <div className="glass-panel rounded-xl p-6">
                        <div className="flex justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary/10 mr-3"></div>
                            <div>
                              <h4 className="font-medium">Lisa R.</h4>
                              <div className="text-sm text-muted-foreground">Agricultural Student</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {Array(5).fill(0).map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground">
                          Excellent content with practical examples. I especially appreciated the module on soil health and composting. Would have loved more case studies from different climates, but overall a very valuable course.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Instructor Info */}
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="text-xl font-medium mb-4">Your Instructor</h3>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 mr-3"></div>
                    <div>
                      <h4 className="font-medium">{course.instructor}</h4>
                      <div className="text-sm text-muted-foreground">{course.instructorRole}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Dr. Johnson has over 15 years of experience in sustainable agriculture research and implementation in rural communities across the globe.
                  </p>
                  <Button variant="outline" className="w-full">View Profile</Button>
                </div>
                
                {/* Course Info */}
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="text-xl font-medium mb-4">Course Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="font-medium">{course.lastUpdated}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Language</span>
                      <span className="font-medium">{course.language}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-medium">{course.level}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Certificate</span>
                      <span className="font-medium">Yes, on completion</span>
                    </div>
                  </div>
                </div>
                
                {/* Progress */}
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="text-xl font-medium mb-4">Your Progress</h3>
                  <div className="mb-2 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {course.progress}% Complete
                    </span>
                    <span className="text-sm text-primary font-medium">
                      {Math.round(course.progress * course.lessons / 100)}/{course.lessons} Lessons
                    </span>
                  </div>
                  <Progress value={course.progress} className="h-2 mb-6" />
                  <Button className="w-full button-animation">
                    {course.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetail;
