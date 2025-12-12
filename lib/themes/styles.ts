import { ThemeType } from "./registry";

export interface ComponentStyles {
  container: string;
  item: string;
  header: string;
  title: string;
  subtitle: string;
  metadata: string;
  description: string;
  deleteButton?: string; // Optional custom style for delete button
  decoration?: React.ReactNode; 
}

export interface ThemeStrategy {
  layout: 'list' | 'grid' | 'masonry';
  datesPosition: 'inline' | 'below-title' | 'absolute';
  alignment: 'left' | 'center' | 'right';
  showDecorations?: boolean;
}

export interface SectionThemeConfig {
  styles: ComponentStyles;
  strategy: ThemeStrategy;
}

export type ThemeToSectionConfig = Record<string, SectionThemeConfig>;

// Default Fallback
const DEFAULT_THEME_STYLE: SectionThemeConfig = {
  styles: {
    container: "space-y-6",
    item: "break-inside-avoid group/item relative", // break-inside-avoid verified
    header: "flex justify-between items-start mb-1 gap-4 break-after-avoid", // added break-after-avoid
    title: "font-bold text-lg text-slate-900 flex-1 min-w-0", 
    subtitle: "font-medium text-slate-700",
    metadata: "text-sm text-slate-500 whitespace-nowrap flex gap-1",
    description: "text-slate-600 text-sm leading-relaxed",
    deleteButton: "text-red-500 hover:bg-red-50 rounded bg-transparent border-none shadow-none w-6 h-6 p-1 transition-opacity"
  },
  strategy: {
    layout: 'list',
    datesPosition: 'inline',
    alignment: 'left'
  }
};

// --- Experience Section Configurations ---
export const EXPERIENCE_STYLES: ThemeToSectionConfig = {
  modern: {
    ...DEFAULT_THEME_STYLE,
    styles: {
      ...DEFAULT_THEME_STYLE.styles,
      item: "break-inside-avoid group/item relative hover:bg-slate-50 p-2 -mx-2 rounded transition-colors",
    }
  },
  minimal: {
    styles: {
      container: "space-y-6",
      item: "break-inside-avoid group/item relative mb-6 text-center",
      header: "flex flex-col items-center text-center relative gap-1 break-after-avoid",
      title: "font-bold text-lg text-slate-900 w-full block", // Already full width
      subtitle: "font-medium text-slate-700 w-full block",
      metadata: "text-sm text-slate-500 justify-center w-full flex gap-1 mt-1",
      description: "text-slate-600 text-sm leading-relaxed w-full block",
      deleteButton: "text-red-500 hover:bg-red-50 rounded bg-transparent border-none shadow-none w-6 h-6 p-1 transition-opacity absolute right-0 top-0"
    },
    strategy: {
      layout: 'list',
      datesPosition: 'inline', // Technically inline but wrapper is centered
      alignment: 'center'
    }
  },
  creative: {
    styles: {
      container: "space-y-8 border-l-2 border-slate-100 pl-6 ml-1",
      item: "break-inside-avoid group/item relative", // No hover bg
      header: "flex justify-between items-start mb-1 gap-4 break-after-avoid",
      title: "font-bold text-lg text-slate-900 flex-1 min-w-0", // Added flex-1
      subtitle: "font-medium text-slate-500", // Company color
      metadata: "text-xs text-slate-400 font-mono mb-2 flex gap-1",
      description: "text-slate-600 text-sm leading-relaxed"
    },
    strategy: {
      layout: 'list',
      datesPosition: 'below-title',
      alignment: 'left',
      showDecorations: true // The dot
    }
  },
  studio: {
    styles: {
      container: "space-y-8",
      item: "break-inside-avoid group/item relative hover:bg-white/5 p-2 -mx-2 rounded transition-colors",
      header: "flex justify-between items-start mb-1 gap-4 break-after-avoid",
      title: "font-bold text-xl tracking-tight text-white flex-1 min-w-0", // Added flex-1
      subtitle: "font-medium text-neutral-500",
      metadata: "text-sm text-neutral-400 whitespace-nowrap flex gap-1",
      description: "text-neutral-400 text-sm leading-relaxed",
      deleteButton: "text-red-400 hover:bg-white/10 rounded bg-transparent border-none shadow-none w-6 h-6 p-1 transition-opacity ml-2"
    },
    strategy: {
      layout: 'list',
      datesPosition: 'inline',
      alignment: 'left'
    }
  },
  portfolio: {
    ...DEFAULT_THEME_STYLE, // Similar to Modern for Experience usually
     styles: {
      ...DEFAULT_THEME_STYLE.styles,
      item: "break-inside-avoid group/item relative hover:bg-slate-50 p-2 -mx-2 rounded transition-colors",
    }
  },
  visual: {
     ...DEFAULT_THEME_STYLE, 
      styles: {
      ...DEFAULT_THEME_STYLE.styles,
      container: "space-y-12",
      title: "font-bold text-2xl tracking-tighter text-white flex-1 min-w-0",
      item: "break-inside-avoid group/item relative border-l-4 border-white/20 pl-6 py-2",
      description: "text-neutral-300 text-sm leading-relaxed",
      metadata: "text-sm text-neutral-400 whitespace-nowrap flex gap-1",
      subtitle: "font-medium text-neutral-400",
    }
  }
};

// --- Projects Section Configurations ---
export const PROJECT_STYLES: ThemeToSectionConfig = {
    modern: {
        styles: {
            container: "grid gap-4 grid-cols-1",
            item: "break-inside-avoid p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-all",
            header: "flex flex-col gap-1 items-start relative break-after-avoid", // Stack vertical, relative for delete button
            title: "font-bold text-base text-slate-900 w-full pr-8", // pr-8 to avoid overlap with absolute delete btn
            subtitle: "hidden", 
            metadata: "text-blue-500 hover:underline text-sm block w-full", // Removed span override, rely on component prop
            description: "text-slate-600 text-sm leading-relaxed",
            deleteButton: "absolute top-0 right-0 text-slate-400 hover:text-red-500 transition-colors" // Absolute positioning
        },
        strategy: {
            layout: 'list',
            datesPosition: 'inline',
            alignment: 'left'
        }
    },
    minimal: {
        styles: {
            container: "grid gap-4 grid-cols-1",
            item: "break-inside-avoid text-center mb-6",
            header: "flex flex-col items-center relative gap-1 break-after-avoid",
            title: "font-bold text-slate-900 w-full block",
            subtitle: "hidden",
            metadata: "text-blue-500 hover:underline text-sm w-full justify-center flex mt-1",
            description: "text-slate-600 text-sm leading-relaxed text-center w-full block"
        },
        strategy: {
            layout: 'list',
            datesPosition: 'inline',
            alignment: 'center'
        }
    },
    portfolio: {
         styles: {
            container: "grid gap-4 grid-cols-1 md:grid-cols-2",
            item: "p-0", // Clean
            header: "flex justify-between items-start gap-3 break-after-avoid",
            title: "font-bold text-lg text-slate-900",
            subtitle: "hidden",
            metadata: "text-blue-500 hover:underline text-sm",
            description: "text-slate-600 text-sm leading-relaxed"
        },
        strategy: {
            layout: 'grid',
            datesPosition: 'inline',
            alignment: 'left'
        }
    },
    creative: {
        styles: {
            container: "space-y-8 border-l-2 border-slate-100 pl-6 ml-1 block",
            item: "break-inside-avoid space-y-2 group/item relative",
            header: "flex justify-between items-start gap-3 break-after-avoid",
            title: "font-bold text-lg text-slate-900",
            subtitle: "hidden",
            metadata: "text-blue-500 hover:underline text-sm",
            description: "text-slate-600 text-sm leading-relaxed"
        },
        strategy: {
            layout: 'list',
            datesPosition: 'inline',
            alignment: 'left',
            showDecorations: true
        }
    },
    studio: {
        styles: {
            container: "grid gap-4 grid-cols-1",
            item: "p-0",
            header: "flex justify-between items-start gap-3 break-after-avoid",
            title: "font-bold text-xl tracking-tight text-white",
            subtitle: "hidden",
            metadata: "text-slate-400 hover:text-white transition-colors text-sm",
            description: "text-neutral-400 text-sm leading-relaxed"
        },
        strategy: {
            layout: 'list',
            datesPosition: 'inline',
            alignment: 'left'
        }
    },
     visual: {
        styles: {
            container: "grid gap-6 grid-cols-1",
            item: "",
            header: "flex justify-between items-start gap-3 break-after-avoid",
            title: "font-bold text-2xl text-white",
            subtitle: "hidden",
            metadata: "text-neutral-400 text-sm",
            description: "text-neutral-300 text-sm leading-relaxed"
        },
        strategy: {
             layout: 'list',
             datesPosition: 'inline',
             alignment: 'left'
        }
     }
}

// --- Skills Section Configurations ---
export const SKILLS_STYLES: ThemeToSectionConfig = {
    modern: {
        styles: {
            container: "flex flex-wrap gap-2",
            item: "break-inside-avoid text-sm font-medium group/skill relative flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors",
            header: "hidden", // Use ResumeSection header
            title: "",
            subtitle: "",
            metadata: "",
            description: "",
            deleteButton: "w-4 h-4 text-slate-500 hover:text-red-500 bg-transparent p-0 border-none transition-opacity"
        },
        strategy: {
            layout: 'list', // Just a wrapping list
            datesPosition: 'inline',
            alignment: 'left'
        }
    },
    minimal: {
        styles: {
            container: "flex flex-wrap gap-2 justify-center",
            item: "break-inside-avoid text-sm font-medium group/skill relative flex items-center gap-1 px-2 border-b border-slate-200 hover:border-slate-400 pb-1 text-slate-900",
            header: "hidden",
            title: "",
            subtitle: "",
            metadata: "",
            description: "",
            deleteButton: "w-4 h-4 text-slate-500 hover:text-red-500 bg-transparent p-0 border-none transition-opacity"
        },
        strategy: {
             layout: 'list',
             datesPosition: 'inline',
             alignment: 'center'
        }
    },
     creative: {
        styles: {
            container: "flex flex-wrap gap-2",
            item: "break-inside-avoid px-2 py-1 bg-slate-700 rounded text-xs flex items-center gap-2 hover:bg-slate-600 transition-colors text-white",
            header: "hidden", // We might use custom header style or ResumeSection? Creative in Skills had different header look (small upper). 
            // ResumeSection 'creative' header is bold 2xl. Skills was "uppercase tracking-widest text-xs".
            // This implies Skills section in Creative theme MIGHT need its own header style override passed to ResumeSection?
            // Or we standardize it. Let's try to standardize but if specific look needed, we can override classname.
            title: "",
            subtitle: "",
            metadata: "",
            description: "",
            deleteButton: "w-4 h-4 text-slate-400 hover:text-red-400 bg-transparent p-0 border-none transition-opacity"
        },
        strategy: {
            layout: 'list',
             datesPosition: 'inline',
             alignment: 'left'
        }
    },
    studio: { // Fallback/Similar
        styles: {
            container: "flex flex-wrap gap-2",
            item: "break-inside-avoid text-sm font-medium group/skill relative flex items-center gap-1 px-3 py-1 bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white rounded-full hover:bg-slate-900/10 dark:hover:bg-white/20 transition-colors",
             header: "",
             title: "", 
             subtitle: "",
             metadata: "",
             description: "",
             deleteButton: "w-4 h-4 text-slate-500 hover:text-red-500 dark:text-white/50 dark:hover:text-white bg-transparent p-0 border-none transition-opacity"
        },
        strategy: {
             layout: 'list',
             datesPosition: 'inline',
             alignment: 'left'
        }
    },
    // Add other themes as fallbacks to modern
    portfolio: { 
        ...DEFAULT_THEME_STYLE,
         styles: {
            container: "flex flex-wrap gap-2",
            item: "break-inside-avoid text-sm font-medium group/skill relative flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors",
            header: "", title: "", subtitle: "", metadata: "", description: ""
         }
    },
    visual: {
         ...DEFAULT_THEME_STYLE,
          styles: {
            container: "flex flex-wrap gap-2",
            item: "break-inside-avoid text-sm font-medium group/skill relative flex items-center gap-1 px-3 py-1 border border-neutral-800 text-white rounded-none hover:bg-white hover:text-black transition-colors",
            header: "", title: "", subtitle: "", metadata: "", description: ""
         }
    },
    'modern-sidebar': {
        styles: {
            container: "flex flex-wrap gap-2",
            item: "break-inside-avoid text-sm font-medium group/skill relative flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors",
            header: "hidden", 
            title: "", subtitle: "", metadata: "", description: "",
            deleteButton: "w-4 h-4 text-slate-500 hover:text-red-500 bg-transparent p-0 border-none transition-opacity"
        },
        strategy: { layout: 'list', datesPosition: 'inline', alignment: 'left' }
    },
    'creative-sidebar': {
        styles: {
            container: "flex flex-wrap gap-2",
            item: "break-inside-avoid px-2 py-1 bg-slate-700 rounded text-xs flex items-center gap-2 hover:bg-slate-600 transition-colors text-white",
            header: "hidden", 
            title: "", subtitle: "", metadata: "", description: "",
            deleteButton: "w-4 h-4 text-slate-400 hover:text-red-400 bg-transparent p-0 border-none transition-opacity"
        },
        strategy: { layout: 'list', datesPosition: 'inline', alignment: 'left' }
    }
};

// --- Summary Section Configurations ---
export const SUMMARY_STYLES: ThemeToSectionConfig = {
     modern: {
        styles: {
            container: "text-sm leading-relaxed text-slate-700",
            item: "", header: "", title: "", subtitle: "", metadata: "", description: ""
        },
        strategy: { layout: 'list', datesPosition: 'inline', alignment: 'left' }
    },
    minimal: {
        styles: {
            container: "text-sm leading-relaxed text-slate-700 text-center",
            item: "", header: "", title: "", subtitle: "", metadata: "", description: ""
        },
        strategy: { layout: 'list', datesPosition: 'inline', alignment: 'center' }
    },
    creative: {
        styles: {
            container: "text-sm leading-relaxed text-slate-700",
             item: "", header: "", title: "", subtitle: "", metadata: "", description: ""
        },
        strategy: { layout: 'list', datesPosition: 'inline', alignment: 'left' }
    },
    studio: {
        styles: {
            container: "text-sm leading-relaxed text-neutral-400",
             item: "", header: "", title: "", subtitle: "", metadata: "", description: ""
        },
        strategy: { layout: 'list', datesPosition: 'inline', alignment: 'left' }
    },
     visual: {
        styles: {
            container: "text-lg leading-relaxed text-neutral-300 font-light text-center",
             item: "", header: "", title: "hidden", subtitle: "", metadata: "", description: ""
        },
        strategy: { layout: 'list', datesPosition: 'inline', alignment: 'center' }
    },
    portfolio: {
        ...DEFAULT_THEME_STYLE
    }
}

// --- Header Section Configurations ---
export const HEADER_STYLES: ThemeToSectionConfig = {
    modern: {
        styles: {
            container: "mb-8 pb-6 text-left border-b border-slate-700/50", // Subtle separator
            title: "font-bold uppercase tracking-tight mb-2 w-full text-4xl text-white", // White Title
            subtitle: "text-lg text-slate-300 mb-4 w-full", // Light Subtitle
            metadata: "text-xs text-slate-400", // Light Meta (ContactManager handles flex/gap)
            item: "flex items-center gap-1",
            header: "", description: "" // Unused
        },
        strategy: { layout: 'masonry', datesPosition: 'inline', alignment: 'left' } 
    },
    minimal: {
        styles: {
            container: "mb-8 text-center pb-8 border-b border-slate-200",
            title: "font-bold uppercase mb-2 w-full text-3xl tracking-widest font-normal text-slate-900",
            subtitle: "text-lg text-slate-500 mb-4 w-full italic text-center",
            metadata: "flex flex-wrap gap-4 text-sm text-slate-500 justify-center [&>div]:w-[30%]", // Max 3 per row
            item: "flex items-center gap-1 [&_span]:whitespace-nowrap",
            header: "", description: ""
        },
        strategy: { layout: 'list', datesPosition: 'inline', alignment: 'center' }
    },
    creative: {
        // Strategy: 'sidebar' implies a completely different structure usually, 
        // but here it is just specific styling in a top-left block if viewed in main flow context?
        // Wait, "Creative" theme usually implies a persistent sidebar.
        // The ContactHeader component for 'creative' returns a <div className="space-y-8">...</div>
        // which sits in the sidebar. 
        // So we need to flag this as 'sidebar' layout or just styling?
        // Let's use styling but generic enough.
        styles: {
            container: "space-y-8",
            title: "text-3xl font-bold leading-tight text-white",
            subtitle: "text-slate-400 text-sm",
            metadata: "space-y-4 text-sm text-slate-300",
            item: "flex items-center gap-2", 
            header: "", description: ""
        },
        strategy: { layout: 'masonry', datesPosition: 'inline', alignment: 'left' } 
        // We'll use 'masonry' to indicate Sidebar/Vertical Stack layout for header
    },
    studio: {
        styles: {
            container: "mb-8 border-none pb-0 text-left",
            title: "font-bold tracking-tight mb-2 w-full text-5xl text-white",
            subtitle: "text-xl text-neutral-400 mb-6 w-full font-light",
            metadata: "flex flex-wrap gap-6 text-sm text-neutral-400",
             item: "flex items-center gap-2",
             header: "", description: ""
        },
        strategy: { layout: 'list', datesPosition: 'inline', alignment: 'left' }
    },
    visual: {
        styles: {
            container: "mb-12 border-none pb-0 text-left",
            title: "font-bold tracking-tighter mb-4 w-full text-7xl text-white",
            subtitle: "text-2xl text-neutral-400 mb-8 w-full font-light",
            metadata: "flex flex-wrap gap-6 text-base text-neutral-400",
             item: "flex items-center gap-2 px-3 py-1 border border-neutral-800 rounded-full",
             header: "", description: ""
        },
        strategy: { layout: 'list', datesPosition: 'inline', alignment: 'left' }
    },
    portfolio: {
        ...DEFAULT_THEME_STYLE
    }
}

// --- Education Section Configurations ---
export const EDUCATION_STYLES: ThemeToSectionConfig = {
    modern: {
        ...DEFAULT_THEME_STYLE,
        styles: {
            ...DEFAULT_THEME_STYLE.styles,
            item: "break-inside-avoid group/item relative", // Clean item style, let component handle card padding
        }
    },
    minimal: EXPERIENCE_STYLES.minimal,
    creative: EXPERIENCE_STYLES.creative,
    studio: EXPERIENCE_STYLES.studio,
    portfolio: EXPERIENCE_STYLES.portfolio,
    visual: EXPERIENCE_STYLES.visual,
    'modern-sidebar': EXPERIENCE_STYLES['modern-sidebar'],
    'creative-sidebar': EXPERIENCE_STYLES['creative-sidebar']
};

export function getSectionTheme(theme: string, section: 'experience' | 'projects' | 'education' | 'custom' | 'skills' | 'summary' | 'header'): SectionThemeConfig {
  if (section === 'experience' || section === 'custom') { // Removed 'education'
    return EXPERIENCE_STYLES[theme] || EXPERIENCE_STYLES['modern'];
  }
  if (section === 'education') {
      return EDUCATION_STYLES[theme] || EDUCATION_STYLES['modern'];
  }
  if (section === 'projects') {
      return PROJECT_STYLES[theme] || PROJECT_STYLES['modern'];
  }
  if (section === 'skills') {
      return SKILLS_STYLES[theme] || SKILLS_STYLES['modern'];
  }
  if (section === 'summary') {
      return SUMMARY_STYLES[theme] || SUMMARY_STYLES['modern'];
  }
  if (section === 'header') {
      return HEADER_STYLES[theme] || HEADER_STYLES['modern'];
  }
  return EXPERIENCE_STYLES['modern'];
}


// --- Generic Resume Section Wrapper Configuration ---
export interface SectionHeaderStyles {
    wrapper: string;
    header: string;
    title: string;
    addButton: string;
    decoration?: boolean | React.ReactNode; 
}

export const SECTION_STYLES: Record<string, SectionHeaderStyles> = {
    modern: {
        wrapper: "mb-8 text-left text-slate-900",
        header: "flex justify-between items-center mb-6 border-b pb-2 border-slate-200 break-after-avoid",
        title: "font-bold uppercase flex items-center gap-2 text-xl",
        addButton: "w-8 h-8 p-0 border-none bg-transparent hover:bg-slate-100 text-slate-500"
    },
    'modern-sidebar': {
        wrapper: "mb-8 text-left text-white", // White wrapper text default for sidebar
        header: "flex justify-between items-center mb-4 border-b pb-2 border-slate-700/50 break-after-avoid",
        title: "font-bold uppercase flex items-center gap-2 text-sm tracking-widest text-white/90", // Elegant Sidebar Header
        addButton: "w-6 h-6 p-0 border-none bg-transparent hover:bg-white/10 text-slate-400"
    },
    minimal: {
        wrapper: "mb-8 text-left text-slate-900",
        header: "flex justify-center items-center mb-6 border-b pb-2 border-slate-200 relative break-after-avoid", // Center align header
        title: "font-bold uppercase flex items-center gap-2 text-sm tracking-widest text-center w-full border-none justify-center", // Centered title
        addButton: "absolute right-8 top-0 w-8 h-8 p-0 border-none bg-transparent hover:bg-slate-100 text-slate-500" // Maybe absolute? Minimal usually hides add button from header or puts it below?
        // Original code didn't strictly handle Add Button position for minimal in header well, let's keep it simple or hide it.
        // Actually the Add Button in header is mainly for custom sections or if explicit.
        // Let's stick to a safe default.
    },
    creative: {
        wrapper: "mb-8", // text-left removed? Creative aligns differently? Original had `theme === "creative" ? "" : "mb-8 text-left"` 
        header: "flex justify-between items-center mb-6 border-b pb-2 border-slate-100 break-after-avoid",
        title: "font-bold uppercase flex items-center gap-2 text-2xl text-slate-900",
        addButton: "border-slate-200",
        decoration: true // Uses the darker dot/dash
    },
    'creative-sidebar': {
         wrapper: "mb-8 text-left text-white",
         header: "flex justify-between items-center mb-6 border-b pb-2 border-slate-700/50 break-after-avoid",
         title: "font-bold uppercase flex items-center gap-2 text-sm tracking-[0.2em] text-white", // Premium tracking
         addButton: "border-slate-700 hover:bg-slate-700 text-slate-300 w-6 h-6",
         // decoration removed for sidebar alignment
    },
    studio: {
        wrapper: "mb-8 text-left",
        header: "flex justify-between items-center mb-6 border-none pb-0 break-after-avoid", // No border
        title: "font-bold uppercase flex items-center gap-2 text-4xl tracking-tight text-white",
        addButton: "bg-transparent text-white border-white/20 hover:bg-white/10"
    },
    visual: {
        wrapper: "mb-12 text-left",
        header: "flex justify-between items-center mb-8 border-none pb-0 break-after-avoid",
        title: "font-bold uppercase flex items-center gap-2 text-4xl md:text-6xl tracking-tighter text-white", // Solid White
        addButton: "bg-transparent text-neutral-400 border-neutral-700 hover:bg-neutral-800"
    },
    portfolio: {
        wrapper: "mb-8 text-left text-slate-900",
        header: "flex justify-between items-center mb-6 border-b pb-2 border-slate-200 break-after-avoid",
        title: "font-bold uppercase flex items-center gap-2 text-lg md:text-xl",
        addButton: "w-8 h-8 p-0 border-none bg-transparent hover:bg-slate-100 text-slate-500"
    }
};

export function getSectionStyles(theme: string): SectionHeaderStyles {
    return SECTION_STYLES[theme] || SECTION_STYLES['modern'];
}
