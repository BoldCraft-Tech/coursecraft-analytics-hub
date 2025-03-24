
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CourseGrid, { Course } from '@/components/courses/CourseGrid';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search } from 'lucide-react';

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Sustainable Farming Techniques',
    description: 'Learn modern and sustainable methods to improve crop yields while protecting the environment.',
    category: 'Agriculture',
    level: 'Beginner',
    duration: '6 weeks',
    students: 1250,
    lessons: 24,
  },
  {
    id: '2',
    title: 'Digital Marketing for Small Businesses',
    description: 'Master digital marketing strategies to grow your business in rural markets.',
    category: 'Business',
    level: 'Intermediate',
    duration: '8 weeks',
    students: 845,
    lessons: 32,
  },
  {
    id: '3',
    title: 'Community Healthcare Basics',
    description: 'Essential healthcare knowledge for community health workers in rural areas.',
    category: 'Healthcare',
    level: 'Beginner',
    duration: '4 weeks',
    students: 1632,
    lessons: 18,
  },
  {
    id: '4',
    title: 'Rural Entrepreneurship',
    description: 'Start and grow a successful business in rural settings with limited resources.',
    category: 'Business',
    level: 'Advanced',
    duration: '10 weeks',
    students: 720,
    lessons: 42,
  },
  {
    id: '5',
    title: 'Renewable Energy Solutions',
    description: 'Practical guide to implementing renewable energy systems in off-grid communities.',
    category: 'Technology',
    level: 'Intermediate',
    duration: '7 weeks',
    students: 530,
    lessons: 28,
  },
  {
    id: '6',
    title: 'Water Conservation and Management',
    description: 'Techniques for efficient water usage and conservation in drought-prone areas.',
    category: 'Environment',
    level: 'Beginner',
    duration: '5 weeks',
    students: 915,
    lessons: 20,
  },
];

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [duration, setDuration] = useState([12]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(mockCourses);
  
  useEffect(() => {
    let result = mockCourses;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter((course) => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (category) {
      result = result.filter((course) => course.category === category);
    }
    
    // Apply level filter
    if (level) {
      result = result.filter((course) => course.level === level);
    }
    
    // Apply duration filter (weeks)
    if (duration[0] < 12) {
      result = result.filter((course) => {
        const weeks = parseInt(course.duration.split(' ')[0]);
        return weeks <= duration[0];
      });
    }
    
    setFilteredCourses(result);
  }, [searchTerm, category, level, duration]);
  
  const resetFilters = () => {
    setSearchTerm('');
    setCategory('');
    setLevel('');
    setDuration([12]);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-16">
          <div className="container px-4 mx-auto">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h1 className="mb-4">Explore Our Courses</h1>
              <p className="text-muted-foreground text-lg">
                Discover practical courses designed specifically for rural learners. Filter by topic, difficulty, or duration to find the perfect fit for your goals.
              </p>
            </div>
            
            {/* Search and Filters */}
            <div className="glass-panel rounded-xl p-6 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Search */}
                <div className="col-span-1 md:col-span-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search courses..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Category */}
                <div>
                  <Label htmlFor="category" className="block mb-2">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Environment">Environment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Level */}
                <div>
                  <Label htmlFor="level" className="block mb-2">Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Duration */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="duration">Duration (up to {duration[0]} weeks)</Label>
                  </div>
                  <Slider
                    id="duration"
                    defaultValue={[12]}
                    max={12}
                    min={1}
                    step={1}
                    value={duration}
                    onValueChange={setDuration}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </div>
            
            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
              <CourseGrid courses={filteredCourses} />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No courses found</h3>
                <p className="text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
                <Button variant="outline" onClick={resetFilters} className="mt-4">
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Courses;
