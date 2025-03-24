
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, Award, BarChart3, Calendar, Users, ChevronRight, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="container px-4 mx-auto py-12">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="mb-2">Welcome back, Alex</h1>
              <p className="text-muted-foreground">Track your progress and continue learning</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button variant="outline" className="button-animation">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button className="button-animation">Browse Courses</Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <div className="text-3xl font-medium">7</div>
                    <div className="text-xs text-muted-foreground">3 in progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Learning Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <div className="text-3xl font-medium">24.5</div>
                    <div className="text-xs text-muted-foreground">This month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-amber-500 mr-3" />
                  <div>
                    <div className="text-3xl font-medium">3</div>
                    <div className="text-xs text-muted-foreground">2 this year</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <div className="text-3xl font-medium">85%</div>
                    <div className="text-xs text-muted-foreground">+5% from last month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="col-span-2 space-y-8">
              <Tabs defaultValue="inProgress">
                <TabsList className="mb-6">
                  <TabsTrigger value="inProgress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="saved">Saved</TabsTrigger>
                </TabsList>
                
                <TabsContent value="inProgress" className="space-y-4">
                  {/* Course Progress Cards */}
                  <Card className="glass-card hover-lift cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-40 h-24 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-lg flex items-center justify-center sm:mr-6 mb-4 sm:mb-0">
                          <BookOpen className="h-8 w-8 text-primary/60" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-medium">Sustainable Farming Techniques</h3>
                              <p className="text-sm text-muted-foreground">12 of 24 lessons completed</p>
                            </div>
                            <Link to="/courses/1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                          <Progress value={50} className="h-2 mb-2" />
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">50% complete</span>
                            <span className="text-primary font-medium">Continue Learning</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass-card hover-lift cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-40 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center sm:mr-6 mb-4 sm:mb-0">
                          <BookOpen className="h-8 w-8 text-blue-500/60" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-medium">Digital Marketing for Small Businesses</h3>
                              <p className="text-sm text-muted-foreground">8 of 32 lessons completed</p>
                            </div>
                            <Link to="/courses/2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                          <Progress value={25} className="h-2 mb-2" />
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">25% complete</span>
                            <span className="text-primary font-medium">Continue Learning</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass-card hover-lift cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-40 h-24 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center sm:mr-6 mb-4 sm:mb-0">
                          <BookOpen className="h-8 w-8 text-green-500/60" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-medium">Community Healthcare Basics</h3>
                              <p className="text-sm text-muted-foreground">3 of 18 lessons completed</p>
                            </div>
                            <Link to="/courses/3">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                          <Progress value={16} className="h-2 mb-2" />
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">16% complete</span>
                            <span className="text-primary font-medium">Continue Learning</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="completed" className="space-y-4">
                  <Card className="glass-card hover-lift cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-40 h-24 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg flex items-center justify-center sm:mr-6 mb-4 sm:mb-0">
                          <Award className="h-8 w-8 text-amber-500/60" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-medium">Introduction to Rural Entrepreneurship</h3>
                              <p className="text-sm text-muted-foreground">Completed on June 15, 2023</p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm text-green-500 font-medium mr-2">Certificate Earned</span>
                              <Link to="/certificates">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                          <Progress value={100} className="h-2 mb-2 bg-green-100 dark:bg-green-900">
                            <div className="h-full bg-green-500 rounded-full"></div>
                          </Progress>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">100% complete</span>
                            <span className="text-primary font-medium">View Course</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="saved" className="space-y-4">
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No saved courses</h3>
                    <p className="text-muted-foreground mb-6">Browse courses and save them for later</p>
                    <Link to="/courses">
                      <Button>Browse Courses</Button>
                    </Link>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Recent Activity */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your learning activities in the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="rounded-full bg-primary/10 p-2 mr-4">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Completed lesson: Drip Irrigation Systems</p>
                            <p className="text-sm text-muted-foreground">Sustainable Farming Techniques</p>
                          </div>
                          <span className="text-xs text-muted-foreground">2 days ago</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="rounded-full bg-blue-500/10 p-2 mr-4">
                        <Award className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Earned a badge: Water Conservationist</p>
                            <p className="text-sm text-muted-foreground">For completing Water Conservation module</p>
                          </div>
                          <span className="text-xs text-muted-foreground">3 days ago</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="rounded-full bg-green-500/10 p-2 mr-4">
                        <Calendar className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Joined virtual workshop: Composting Basics</p>
                            <p className="text-sm text-muted-foreground">With 12 other students</p>
                          </div>
                          <span className="text-xs text-muted-foreground">5 days ago</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="rounded-full bg-amber-500/10 p-2 mr-4">
                        <Users className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Joined Community Group: Rural Farmers Network</p>
                            <p className="text-sm text-muted-foreground">Connect with 240 members</p>
                          </div>
                          <span className="text-xs text-muted-foreground">1 week ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column / Sidebar */}
            <div className="space-y-8">
              {/* Learning Streak */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Learning Streak</CardTitle>
                  <CardDescription>You're on a 7-day streak. Keep it up!</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <div key={day} className="flex flex-col items-center">
                        <div className={`rounded-full w-10 h-10 flex items-center justify-center mb-1 ${
                          index < 7 ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {index < 7 ? '✓' : ''}
                        </div>
                        <span className="text-xs text-muted-foreground">{day}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Upcoming Events */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Scheduled learning sessions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Live Q&A: Crop Rotation</h3>
                        <p className="text-sm text-muted-foreground mb-2">With Dr. Sarah Johnson</p>
                      </div>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        Tomorrow
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>3:00 PM - 4:30 PM</span>
                    </div>
                  </div>
                  
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Group Discussion: Rural Marketing</h3>
                        <p className="text-sm text-muted-foreground mb-2">With 8 other students</p>
                      </div>
                      <span className="px-2 py-1 bg-secondary text-muted-foreground text-xs rounded-full">
                        In 3 days
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>5:00 PM - 6:00 PM</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    View All Events
                  </Button>
                </CardContent>
              </Card>
              
              {/* Recommended Courses */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Recommended For You</CardTitle>
                  <CardDescription>Based on your interests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-purple-500/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">Water Conservation and Management</h4>
                      <p className="text-sm text-muted-foreground">5 weeks • Beginner</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-md bg-gradient-to-br from-green-500/20 to-teal-500/20 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-green-500/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">Renewable Energy Solutions</h4>
                      <p className="text-sm text-muted-foreground">7 weeks • Intermediate</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    View All Recommendations
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
