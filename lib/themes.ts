
import { ResumeData } from "@/lib/schemas/resume";

export const THEME_DEMOS = [
    {
      id: "modern",
      name: "Modern",
      role: "Marketing Director",
      description: "Professional and clean for corporate roles.",
      data: {
        personalInfo: { 
            fullName: "Emily White", 
            summary: "Data-driven Marketing Director with 10+ years of experience scaling global brands. Proven track record in digital strategy, team leadership, and revenue growth. Passionate about connecting products with people through compelilng storytelling.", 
            email: "emily.white@example.com", 
            phone: "+1 (555) 123-4567",
            location: "New York, NY",
            linkedin: "linkedin.com/in/emilywhite-marketing",
            website: "emilywhite.com",
            jobTitle: "Marketing Director" 
        },
        experience: [
            { 
                id: "exp-1",
                company: "Global Tech Corp", 
                position: "Marketing Director", 
                startDate: "2019-03", 
                endDate: "Present", 
                description: "• Spearheaded global marketing strategy, resulting in a 40% increase in annual revenue.\n• Managed a cross-functional team of 25 marketers, designers, and developers.\n• Oversaw a $5M annual advertising budget, optimizing ROI by 25% year-over-year.\n• Launched 3 major product lines, each achieving top market position within 6 months." 
            },
            { 
                id: "exp-2",
                company: "Growth Agcy", 
                position: "Senior Marketing Manager", 
                startDate: "2015-06", 
                endDate: "2019-02", 
                description: "• Led digital acquisition campaigns for Fortune 500 clients.\n• Increased client retention rate by 30% through improved account management processes.\n• Developed and executed content marketing strategies that drove 1M+ monthly unique visitors." 
            }
        ],
        education: [
            {
                id: "edu-1",
                institution: "Columbia University",
                degree: "Master of Business Administration (MBA)",
                fieldOfStudy: "Marketing & Strategy",
                startDate: "2013-09",
                endDate: "2015-05"
            },
            {
                id: "edu-2",
                institution: "New York University",
                degree: "Bachelor of Science",
                fieldOfStudy: "Communications",
                startDate: "2009-09",
                endDate: "2013-05"
            }
        ],
        skills: ["Digital Strategy", "Brand Management", "Team Leadership", "Data Analytics", "SEO/SEM", "Content Marketing", "Budget Management", "Public Relations"],
        projects: [
            {
                id: "proj-1",
                name: "Rebrand Initiative 2023",
                description: "Led the comprehensive rebranding of Global Tech Corp, resulting in a 15% increase in brand sentiment.",
                url: "globaltech.com/rebrand",
                technologies: ["Brand Strategy", "Design Systems", "Market Research"]
            },
            {
                id: "proj-2",
                name: "Growth Engine Launch",
                description: "Designed and implemented an automated lead generation engine contributing $2M in pipeline.",
                url: "emilywhite.com/growth",
                technologies: ["HubSpot", "Salesforce", "Marketo"]
            }
        ],
        testimonials: [],
        sectionOrder: ["experience", "education", "skills", "projects", "summary"],
        customSections: []
      }
    },
    {
      id: "studio",
      name: "Studio",
      role: "Graphic Designer",
      description: "Bold, agency-style layout for creatives.",
      data: {
        personalInfo: { 
            fullName: "Alex Morgan", 
            summary: "Multidisciplinary Graphic Designer with a focus on brand identity and typography. Believes in design as a problem-solving tool. obsessed with details and crafting visual systems that scale.", 
            email: "alex@morgandesign.com", 
            phone: "+1 (555) 987-6543",
            location: "San Francisco, CA",
            linkedin: "linkedin.com/in/alexmorgan",
            website: "morgandesign.com",
            jobTitle: "Senior Graphic Designer" 
        },
        experience: [
            { 
                id: "exp-1",
                company: "Creative Studio", 
                position: "Senior Designer", 
                startDate: "2020-01", 
                endDate: "Present", 
                description: "• Leading brand identity projects for tech startups and lifestyle brands.\n• Mentoring junior designers and establishing studio design standards.\n• Created award-winning packaging designs featured in Design Weekly." 
            },
            { 
                id: "exp-2",
                company: "Freelance", 
                position: "Visual Designer", 
                startDate: "2017-05", 
                endDate: "2019-12", 
                description: "• Collaborated with diverse clients to deliver logos, websites, and marketing collateral.\n• Managed end-to-end design process from concept to final delivery." 
            }
        ],
        education: [
            {
                id: "edu-1",
                institution: "Rhode Island School of Design",
                degree: "Bachelor of Fine Arts",
                fieldOfStudy: "Graphic Design",
                startDate: "2013-09",
                endDate: "2017-06"
            }
        ],
        skills: ["Typography", "Brand Identity", "Adobe Creative Suite", "Figma", "Motion Design", "Packaging Design", "Art Direction"],
        projects: [
            {
                id: "proj-1",
                name: "Lumina Brand System",
                description: "Complete identity system for a sustainable energy startup, including logo, guidelines, and web assets.",
                url: "morgandesign.com/lumina",
                technologies: ["Illustrator", "Figma", "After Effects"]
            },
            {
                id: "proj-2",
                name: "Type Collection Vol. 1",
                description: "A self-initiated exploration of experimental typography and layout design.",
                url: "morgandesign.com/type",
                technologies: ["InDesign", "Typography", "Print"]
            }
        ],
        testimonials: [],
        sectionOrder: ["projects", "experience", "skills", "education", "summary"],
        customSections: []
      }
    },
    {
      id: "visual",
      name: "Visual",
      role: "Software Engineer",
      description: "Visual-first dark mode for modern tech.",
      data: {
        personalInfo: { 
            fullName: "Sarah Chen", 
            summary: "Full-stack engineer passionate about building scalable, user-centric applications. specialized in React ecosystem and cloud infrastructure. Open source contributor and tech speaker.", 
            email: "sarah.chen@dev.io", 
            phone: "+1 (555) 246-8101",
            location: "Seattle, WA",
            linkedin: "linkedin.com/in/sarahchen-dev",
            website: "sarahchen.dev",
            jobTitle: "Senior Software Engineer" 
        },
        experience: [
            { 
                id: "exp-1",
                company: "Cloud Systems Inc.", 
                position: "Senior Frontend Engineer", 
                startDate: "2021-02", 
                endDate: "Present", 
                description: "• Architecting the core design system used by 15+ product teams.\n• Improved application performance by 35% through code splitting and optimization strategies.\n• Led the migration of legacy codebase to Next.js and TypeScript." 
            },
            { 
                id: "exp-2",
                company: "Startupify", 
                position: "Full Stack Developer", 
                startDate: "2018-06", 
                endDate: "2021-01", 
                description: "• Built and deployed MVP features for a high-growth fintech platform.\n• Integrated Stripe API for payment processing and subscription management.\n• Collaborated closely with product and design to iterate on user feedback." 
            }
        ],
        education: [
            {
                id: "edu-1",
                institution: "University of Washington",
                degree: "Bachelor of Science",
                fieldOfStudy: "Computer Science",
                startDate: "2014-09",
                endDate: "2018-06"
            }
        ],
        skills: ["React", "TypeScript", "Next.js", "Node.js", "AWS", "GraphQL", "Tailwind CSS", "PostgreSQL", "System Design"],
        projects: [
            {
                id: "proj-1",
                name: "DocuBuild SaaS",
                description: "A collaborative documentation platform for engineering teams. Real-time editing and version control.",
                url: "github.com/sarahchen/docubuild",
                technologies: ["Next.js", "WebSockets", "Redis", "Tailwind"]
            },
            {
                id: "proj-2",
                name: "OpenUI Library",
                description: "An open-source accessible UI component library for React applications. 2k+ stars on GitHub.",
                url: "github.com/sarahchen/openui",
                technologies: ["React", "Storybook", "A11y"]
            }
        ],
        testimonials: [],
        sectionOrder: ["skills", "experience", "projects", "education", "summary"],
        customSections: []
      }
    },
    {
      id: "portfolio",
      name: "Portfolio",
      role: "Product Manager",
      description: "Clean, scrollable digital layout.",
      data: {
        personalInfo: { 
            fullName: "Marcus Jenkins", 
            summary: "Strategic Product Manager with 7 years of experience in B2B SaaS. Expert in roadmap planning, agile methodologies, and cross-functional collaboration. Driven by data and customer empathy.", 
            email: "marcus.j@pm.io", 
            phone: "+1 (555) 369-2580",
            location: "Austin, TX",
            linkedin: "linkedin.com/in/marcusj-pm",
            website: "marcusj.io",
            jobTitle: "Lead Product Manager" 
        },
        experience: [
            { 
                id: "exp-1",
                company: "Innovate SaaS", 
                position: "Group Product Manager", 
                startDate: "2021-08", 
                endDate: "Present", 
                description: "• Define and execute the product vision for the Enterprise Analytics suite.\n• Mentoring a team of 4 PMs and coordinating with engineering leads.\n• Launched 'Insights Pro', generating $3M ARR in the first year." 
            },
            { 
                id: "exp-2",
                company: "FinTech Sol", 
                position: "Product Manager", 
                startDate: "2017-04", 
                endDate: "2021-07", 
                description: "• Managed the mobile app product lifecycle from concept to launch.\n• Conducted user research and A/B testing to optimize onboarding flow, increasing conversion by 20%." 
            }
        ],
        education: [
            {
                id: "edu-1",
                institution: "University of Texas at Austin",
                degree: "Master of Business Administration",
                fieldOfStudy: "Entrepreneurship",
                startDate: "2015-08",
                endDate: "2017-05"
            },
             {
                id: "edu-2",
                institution: "Rice University",
                degree: "Bachelor of Arts",
                fieldOfStudy: "Economics",
                startDate: "2011-08",
                endDate: "2015-05"
            }
        ],
        skills: ["Product Strategy", "Agile/Scrum", "Jira & Confluence", "Data Analysis", "User Research", "Roadmapping", "Stakeholder Management"],
        projects: [
            {
                id: "proj-1",
                name: "Analytics Dashboard Redesign",
                description: "Overhauled the core analytics interface based on customer feedback, improving daily active usage by 15%.",
                url: "marcusj.io/case-study/analytics",
                technologies: ["Product Design", "Data Viz", "User Testing"]
            },
            {
                id: "proj-2",
                name: "Mobile Onboarding Flow",
                description: "Led the redesign of the mobile signup process to reduce friction and improve time-to-value.",
                url: "marcusj.io/case-study/mobile",
                technologies: ["Mobile UX", "Growth Hacking", "A/B Testing"]
            }
        ],
        testimonials: [],
        sectionOrder: ["experience", "projects", "skills", "education", "summary"],
        customSections: []
      }
    },
    {
      id: "creative",
      name: "Creative",
      role: "UX Researcher",
      description: "Unique split-layout for storytellers.",
      data: {
        personalInfo: { 
            fullName: "David Kim", 
            summary: "Empathetic User Researcher dedicated to understanding human behavior and translating insights into actionable design improvements. Experience in qualitative and quantitative methods.", 
            email: "david.kim@uxr.com", 
            phone: "+1 (555) 789-0123",
            location: "Chicago, IL",
            linkedin: "linkedin.com/in/davidkim-uxr",
            website: "davidkimresearch.com",
            jobTitle: "Senior UX Researcher" 
        },
        experience: [
            { 
                id: "exp-1",
                company: "Agency X", 
                position: "Senior UX Researcher", 
                startDate: "2020-05", 
                endDate: "Present", 
                description: "• Lead research initiatives for major retail and banking clients.\n• Plan and conduct usability studies, interviews, and diary studies.\n• Present findings to executive stakeholders to influence product strategy." 
            },
            { 
                id: "exp-2",
                company: "Digital Insights", 
                position: "UX Researcher", 
                startDate: "2018-01", 
                endDate: "2020-04", 
                description: "• Supported the design team with rapid usability testing and heuristic evaluations.\n• Created personas and customer journey maps to guide feature development." 
            }
        ],
        education: [
             {
                id: "edu-1",
                institution: "DePaul University",
                degree: "Master of Science",
                fieldOfStudy: "Human-Computer Interaction",
                startDate: "2016-09",
                endDate: "2018-06"
            },
            {
                id: "edu-2",
                institution: "University of Illinois",
                degree: "Bachelor of Science",
                fieldOfStudy: "Psychology",
                startDate: "2012-09",
                endDate: "2016-05"
            }
        ],
        skills: ["Usability Testing", "User Interviews", "Survey Design", "Data Analysis", "Persona Creation", "Journey Mapping", "Figma"],
        projects: [
            {
                id: "proj-1",
                name: "E-commerce Checkout Study",
                description: "A comprehensive study on cart abandonment reasons, leading to a 10% lift in conversion rates.",
                url: "davidkimresearch.com/checkout",
                technologies: ["UserTesting.com", "Surveys", "Heatmaps"]
            },
            {
                id: "proj-2",
                name: "Banking App Accessibility",
                description: "Audit and user testing with diverse user groups to improve app accessibility compliance.",
                url: "davidkimresearch.com/a11y",
                technologies: ["WCAG", "Assistive Tech", "Auditing"]
            }
        ],
        testimonials: [],
        sectionOrder: ["experience", "projects", "education", "skills", "summary"],
        customSections: []
      }
    },
    {
      id: "minimal",
      name: "Minimal",
      role: "Content Writer",
      description: "Distraction-free focus on typography.",
      data: {
        personalInfo: { 
            fullName: "Lisa Ray", 
            summary: "Senior Copywriter and Content Strategist with a knack for brand storytelling. I turn complex ideas into clear, compelling narratives that resonate with audiences.", 
            email: "lisa.ray@write.com", 
            phone: "+1 (555) 654-3210",
            location: "London, UK",
            linkedin: "linkedin.com/in/lisaray-writer",
            website: "lisarayportfolio.com",
            jobTitle: "Senior Copywriter" 
        },
        experience: [
            { 
                id: "exp-1",
                company: "Media House", 
                position: "Senior Editor", 
                startDate: "2019-11", 
                endDate: "Present", 
                description: "• Manage the editorial calendar and content strategy for a leading tech publication.\n• Edit and proofread articles from a team of 10 freelance writers.\n• Increased newsletter open rates by 20% through A/B testing subject lines." 
            },
            { 
                id: "exp-2",
                company: "Brand Agency", 
                position: "Copywriter", 
                startDate: "2016-08", 
                endDate: "2019-10", 
                description: "• Wrote copy for websites, advertising campaigns, and social media.\n• Developed brand voice guidelines for startups and established companies.\n• Collaborated with designers to ensure copy and visuals worked in harmony." 
            }
        ],
        education: [
            {
                id: "edu-1",
                institution: "University of Oxford",
                degree: "Bachelor of Arts",
                fieldOfStudy: "English Literature",
                startDate: "2013-10",
                endDate: "2016-06"
            }
        ],
        skills: ["Copywriting", "Editing", "Content Strategy", "SEO", "Creative Writing", "Social Media", "Brand Voice"],
        projects: [
            {
                id: "proj-1",
                name: "Tech Blog Launch",
                description: "Developed the content strategy and wrote foundational articles for a new tech blog reaching 50k monthly readers.",
                url: "lisarayportfolio.com/tech-blog",
                technologies: ["WordPress", "SEO", "Content Planning"]
            },
            {
                id: "proj-2",
                name: "Rebranding Campaign",
                description: "Created the tagline and brand manifesto for a major retail rebrand.",
                url: "lisarayportfolio.com/rebrand",
                technologies: ["Creative Direction", "Copywriting", "Branding"]
            }
        ],
        testimonials: [],
        sectionOrder: ["experience", "projects", "education", "skills", "summary"],
        customSections: []
      }
    }
] as const;

export function getThemeById(id: string) {
    return THEME_DEMOS.find(t => t.id === id);
}
