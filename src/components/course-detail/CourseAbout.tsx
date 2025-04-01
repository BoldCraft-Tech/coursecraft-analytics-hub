
interface CourseAboutProps {
  description: string;
}

const CourseAbout = ({ description }: CourseAboutProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">About This Course</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Practical knowledge applicable to rural settings</li>
          <li>Hands-on skills you can apply immediately</li>
          <li>Best practices specific to your field</li>
          <li>Solutions to common challenges in rural areas</li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Requirements</h3>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Basic understanding of the subject area</li>
          <li>Willingness to learn and apply new concepts</li>
          <li>Access to basic tools relevant to the course</li>
        </ul>
      </div>
    </div>
  );
};

export default CourseAbout;
