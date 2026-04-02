'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, animate } from 'framer-motion';
import styles from '@/app/experience/experience.module.css';

import PathAnimation from './PathAnimation';
import BikeRider from './BikeRider';
import MilestoneMarker from './MilestoneMarker';
import PopupModal from './PopupModal';
import Controls from './Controls';

// A dynamic curved journey path mimicking a valley navigation
const PATH_D = "M 80,780 C 250,800 350,550 550,550 S 800,200 1100,250 S 1350,100 1550,-50";

const milestonesData = [
  {
    id: 0,
    type: "start",
    title: "Start",
    subtitle: "Initialization",
    date: "Day 1",
    progress: 0.01,
    details: {
      description: "The beginning of my professional journey.",
      stack: [],
      impact: ""
    }
  },
  {
    id: 1,
    type: "project",
    title: "Email Admin System",
    subtitle: "Java Application",
    date: "June 2025",
    progress: 0.10,
    details: {
      description: "Developed an application to generate official employee email accounts. Implemented department-based email creation, password checking mechanics, and capacity management.",
      tools: ["Java", "OOP Principles"],
      impact: "Mastered practical object-oriented architecture."
    }
  },
  {
    id: 2,
    type: "experience",
    title: "Technical Co-Head",
    subtitle: "Computer Society of India (CSI), VIT",
    date: "July 2025 - Present",
    progress: 0.19,
    details: {
      responsibilities: [
        "Leading technical planning and execution of CSI events and activities.",
        "Handling backend technical support for competitions and workshops.",
        "Contributed to the structure and technical setup of the CSI website.",
        "Coordinated technical requirements from idea stage to event execution."
      ],
      tools: ["Leadership", "Event Management", "Web Architecture"]
    }
  },
  {
    id: 3,
    type: "project",
    title: "AI Chatbot",
    subtitle: "Rule-Based Core (Java)",
    date: "August 2025",
    progress: 0.29,
    details: {
      description: "Built a rule-based chatbot for interactive communication. Implemented localized keyword matching logic for immediate automated responses via a clean real-time UI.",
      tools: ["Java", "String Processing", "Algorithms"],
      impact: "Automated core standard responses."
    }
  },
  {
    id: 4,
    type: "experience",
    title: "Java Intern",
    subtitle: "CodeAlpha",
    date: "Aug 2025 - Sep 2025",
    progress: 0.39,
    details: {
      responsibilities: [
        "Worked on intensive Java application development using core OOP concepts.",
        "Implemented secure logic building, file handling, and structured data management.",
        "Developed robust console-based systems and heavily strengthened problem-solving skills."
      ],
      tools: ["Java", "File IO", "Data Structures"]
    }
  },
  {
    id: 5,
    type: "project",
    title: "Janvaani",
    subtitle: "SIH Project",
    date: "September 2025",
    progress: 0.47,
    details: {
      description: "A citizen complaint and feedback platform enabling users to actively raise issues, track resolution statuses, and improve transparent communication with authorities.",
      tools: ["HTML", "CSS", "JavaScript", "Python", "SQL"],
      impact: "Advanced Issue Management Architecture"
    }
  },
  {
    id: 6,
    type: "experience",
    title: "Python Intern",
    subtitle: "CodeAlpha",
    date: "Jan 2026 - Feb 2026",
    progress: 0.58,
    details: {
      responsibilities: [
        "Developed powerful Python applications focusing on strict programming logic and task automation.",
        "Masterfully used complex loops, conditionals, functions, and deeply parsed file handling operations.",
        "Rapidly improved internal scripting skills and technical analytical reasoning."
      ],
      tools: ["Python", "Automation Scripts", "Logic Building"]
    }
  },
  {
    id: 7,
    type: "project",
    title: "CPU Scheduling System",
    subtitle: "OS Concept Simulation",
    date: "February 2026",
    progress: 0.70,
    details: {
      description: "Developed a visual system to accurately simulate core CPU algorithms like Round Robin, FCFS, and Priority Scheduling, helping visualize low-level process execution.",
      tools: ["Python", "Data Structures", "OS Concepts"],
      impact: "Deepened Operating System fundamentals."
    }
  },
  {
    id: 8,
    type: "project",
    title: "Parallax",
    subtitle: "Web Experience",
    date: "March 2026",
    progress: 0.82,
    details: {
      description: "Built a highly interactive parallax-driven web project highlighting seamless scrolling workflows and modern UI frontend techniques.",
      tools: ["UI/UX", "Frontend", "Animations"],
      impact: "github.com/JaiChavan040906/Paraallax"
    }
  }
];

export default function ExperienceMap() {
  const pathRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [milestoneCoords, setMilestoneCoords] = useState({});
  const [visibleMilestones, setVisibleMilestones] = useState(new Set());
  
  const animationRef = useRef(null);

  // Motion values
  const progress = useMotionValue(0);
  const bikeX = useMotionValue(-100);
  const bikeY = useMotionValue(1000); // Start offscreen
  const bikeRot = useMotionValue(0);

  // 1. Calculate and store coordinates once path is mounted
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      const coords = {};
      milestonesData.forEach(m => {
        const pt = pathRef.current.getPointAtLength(m.progress * length);
        coords[m.id] = { x: pt.x, y: pt.y };
      });
      setMilestoneCoords(coords);
    }
  }, []);

  // 2. Track motion progress to update Bike position and reveal markers
  useMotionValueEvent(progress, "change", (latest) => {
    if (!pathRef.current) return;
    const node = pathRef.current;
    const length = node.getTotalLength();
    
    // Bike coordinate logic
    const px = Math.max(0, Math.min(length, latest * length));
    const pt = node.getPointAtLength(px);
    bikeX.set(pt.x);
    bikeY.set(pt.y);
    
    if (px > 1) {
      const prevPt = node.getPointAtLength(px - 1);
      const angle = Math.atan2(pt.y - prevPt.y, pt.x - prevPt.x) * (180 / Math.PI);
      bikeRot.set(angle + 90); // Adjusting because SVG arrow points up
    }

    // Marker reveal logic
    setVisibleMilestones(prev => {
      const updated = new Set(prev);
      let changed = false;
      milestonesData.forEach(m => {
        if (latest >= m.progress && !updated.has(m.id)) {
          updated.add(m.id);
          changed = true;
        } else if (latest < m.progress && updated.has(m.id)) {
          updated.delete(m.id);
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  });

  // 3. Setup global animation
  const startAnimation = () => {
    animationRef.current = animate(progress, 1, {
      duration: 40, // Length of cinematic journey (slower more realistic speed)
      ease: "linear",
      onComplete: () => setIsPlaying(false)
    });
  };

  useEffect(() => {
    // Initial start
    startAnimation();
    return () => animationRef.current?.stop();
  }, []);

  // Control Handlers
  const handlePause = () => {
    animationRef.current?.pause();
    setIsPlaying(false);
  };

  const handleResume = () => {
    if (progress.get() >= 1) return handleRestart();
    animationRef.current?.play();
    setIsPlaying(true);
  };

  const handleRestart = () => {
    animationRef.current?.stop();
    progress.set(0);
    startAnimation();
    setIsPlaying(true);
  };

  // Click Marker -> Pause & Open Modal
  const handleMarkerClick = (data) => {
    handlePause();
    setActiveModal(data);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    // Seamlessly and automatically resume the cinematic roadmap exactly where it left off
    handleResume();
  };

  return (
    <div className={styles.mapContainer}>
      {/* Background Ambience / Terrain Wrappers */}
      <div className={styles.darkOverlay} />
      <div className={styles.mapOverlay} />
      <div className={styles.backgroundGlow} />

      {/* Header Info */}
      <header className={styles.hudHeader}>
        <h1 className={styles.hudTitle}>The Journey</h1>
        <p className={styles.hudSubtitle}>Milestones & Professional Growth</p>
      </header>

      {/* Main Canvas Area */}
      <svg 
        className={styles.svgCanvas} 
        viewBox="0 0 1440 900" 
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Removed Region Labels as requested */}

        <PathAnimation pathRef={pathRef} pathD={PATH_D} progress={progress} />
        
        {/* Render markers when coords are ready */}
        {Object.keys(milestoneCoords).length > 0 && (
          <g className={styles.interactiveLayer}>
            {milestonesData.map(m => (
              <MilestoneMarker 
                key={m.id}
                x={milestoneCoords[m.id].x} 
                y={milestoneCoords[m.id].y} 
                data={m}
                isVisible={visibleMilestones.has(m.id)}
                onClick={handleMarkerClick}
              />
            ))}
          </g>
        )}

        <BikeRider bikeX={bikeX} bikeY={bikeY} bikeRot={bikeRot} />
      </svg>

      {/* UI Overlays */}
      <Controls 
        isPlaying={isPlaying} 
        onPlay={handleResume} 
        onPause={handlePause} 
        onRestart={handleRestart} 
      />

      <PopupModal data={activeModal} onClose={handleCloseModal} />
      

    </div>
  );
}
