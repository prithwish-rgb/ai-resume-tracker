export type ParsedResume = {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  skills?: string[];
  education?: string[];
  experience?: string[];
};

export function parseResumeText(text: string): ParsedResume {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\d{10}/);
  const linkedinMatch = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/[A-z0-9_-]+/i);
  const githubMatch = text.match(/(https?:\/\/)?(www\.)?github\.com\/[A-z0-9_-]+/i);

  // Very naive keyword extraction (later we can improve with AI)
  const skills: string[] = [];
  const skillKeywords = ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "C++", "Java", "SQL", "MongoDB"];
  skillKeywords.forEach(skill => {
    if (text.toLowerCase().includes(skill.toLowerCase())) skills.push(skill);
  });

  // Capture education section (simple heuristic)
  const education: string[] = lines.filter(l =>
    /(B\.?Tech|Bachelor|Master|BCA|MCA|University|College|School)/i.test(l)
  );

  // Capture experience section
  const experience: string[] = lines.filter(l =>
    /(Intern|Developer|Engineer|Experience|Worked at|Project)/i.test(l)
  );

  return {
    name: lines[0], // usually first line is candidate name
    email: emailMatch?.[0],
    phone: phoneMatch?.[0],
    linkedin: linkedinMatch?.[0],
    github: githubMatch?.[0],
    skills,
    education,
    experience,
  };
}
