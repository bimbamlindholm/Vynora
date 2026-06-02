import { useState, useEffect, useRef } from "react";
import { HelpCircle, X, ChevronRight, ChevronLeft, BookOpen, Clock, Shield, DollarSign } from "lucide-react";

export default function HelpSystem({ role = "employee" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);
  const [tourStep, setTourStep] = useState(0);
  const [isTourActive, setIsTourActive] = useState(false);

  // Position and Drag States
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const totalDragDelta = useRef(0);

  // Derived state to sync/reset guides when role prop changes
  const [prevRole, setPrevRole] = useState(role);
  if (role !== prevRole) {
    setPrevRole(role);
    setActiveTopic(null);
    setIsTourActive(false);
    setTourStep(0);
  }

  const handleClose = () => {
    setIsOpen(false);
    setActiveTopic(null);
    setIsTourActive(false);
    setTourStep(0);
  };

  // Drag Handlers for Mouse
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only allow left-clicks
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    totalDragDelta.current = 0;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    
    // Accumulate travel distance to distinguish drag vs tap click
    const dx = newX - position.x;
    const dy = newY - position.y;
    totalDragDelta.current += Math.sqrt(dx * dx + dy * dy);

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Drag Handlers for Touch (Mobile Devices)
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragStart.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    };
    totalDragDelta.current = 0;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.current.x;
    const newY = touch.clientY - dragStart.current.y;

    const dx = newX - position.x;
    const dy = newY - position.y;
    totalDragDelta.current += Math.sqrt(dx * dx + dy * dy);

    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handlersRef = useRef({});
  useEffect(() => {
    handlersRef.current = { handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd };
  });

  // Smooth window-level capture listeners using a ref closure to avoid re-binding on each movement frame
  useEffect(() => {
    const onMouseMove = (e) => handlersRef.current.handleMouseMove?.(e);
    const onMouseUp = () => handlersRef.current.handleMouseUp?.();
    const onTouchMove = (e) => handlersRef.current.handleTouchMove?.(e);
    const onTouchEnd = () => handlersRef.current.handleTouchEnd?.();

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging]);

  const handleButtonClick = (e) => {
    // If the movement delta was high, it was a drag, so don't open the modal
    if (totalDragDelta.current > 8) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsOpen(true);
  };

  const adminTopics = [
    {
      id: "geofence",
      title: "Geofencing & AI Security",
      icon: <Shield size={18} className="text-cyan-400" />,
      description: "How to restrict clock-ins and audit employee logs.",
      content: [
        {
          subtitle: "1. Precise Geofence Boundary",
          text: "Under Settings > Geofence, you can specify coordinates and radius. Employees can ONLY clock in or out if they are physically within this radius.",
        },
        {
          subtitle: "2. Anti-Spoofing AI Face Matching",
          text: "When employees clock in via camera, their facial features are checked. You can inspect actual verification selfies in the DTR Details dialog to verify identities.",
        },
        {
          subtitle: "3. Location Overrides",
          text: "If field errands are enabled, employees can register locations outside the geofence for legitimate off-site work (like client meetings or bank runs).",
        }
      ]
    },
    {
      id: "payroll",
      title: "Payroll Batches & Deductions",
      icon: <DollarSign size={18} className="text-emerald-400" />,
      description: "Manage cutoff periods and freeze approved payslips.",
      content: [
        {
          subtitle: "1. The 3 Batch Statuses",
          text: "Batches start as 'Pending' (draft estimates). Once verified, you change it to 'Approved'. Finally, setting it to 'Released' locks it and makes it visible to employees.",
        },
        {
          subtitle: "2. Permanent Tamper-Proof Locking",
          text: "Once a batch status is 'Released', it is permanently locked. To update a released batch, it must be archived and audited, maintaining rigorous ledger integrity.",
        },
        {
          subtitle: "3. Target-Specific Deductions",
          text: "Custom deductions can be pushed globally to everyone or targeted to specific employees using the Global Deductions assignment checklist.",
        }
      ]
    },
    {
      id: "scheduling",
      title: "Multi-Shift Scheduling",
      icon: <Clock size={18} className="text-violet-400" />,
      description: "Schedule stacked shifts and save reusable presets.",
      content: [
        {
          subtitle: "1. Multiple Daily Shift Blocks",
          text: "You can schedule multiple distinct shifts on a single calendar day (e.g. Morning Shift + Evening Shift). Shifts stack chronologically in visual cells.",
        },
        {
          subtitle: "2. Custom Presets Saving",
          text: "Clicking 'Save to Presets' records your customized hours configuration inside local storage, letting you reuse complex configurations instantly.",
        },
        {
          subtitle: "3. Auto-Overlapping Adjustments",
          text: "The system dynamically parses stacked shift boundaries to calculate late-minutes, undertime, and overtime without overlap double-counting.",
        }
      ]
    }
  ];

  const employeeTopics = [
    {
      id: "timekeeping",
      title: "Secure DTR & Offline Clock-In",
      icon: <Clock size={18} className="text-cyan-400" />,
      description: "How to log shifts safely even with poor internet.",
      content: [
        {
          subtitle: "1. Registering AI Face Profile",
          text: "If face matching is active, you must click 'Enroll Face Profile' to register your photo. This ensures secure and verified attendance recording.",
        },
        {
          subtitle: "2. Dynamic Offline Mode",
          text: "If your network disconnects, your DTR clicks are queued locally. Once connection is restored, click the Sync button to push offline events safely.",
        },
        {
          subtitle: "3. Logging Errand Breaks",
          text: "For off-site duties, use the Field Errand tracker. You can log arrival/completion coordinates and submit notes straight to the admin feed.",
        }
      ]
    },
    {
      id: "payslips",
      title: "Payslip Transparency & Gates",
      icon: <DollarSign size={18} className="text-emerald-400" />,
      description: "Understand your rates, deductions, and releases.",
      content: [
        {
          subtitle: "1. Release Safety Restriction",
          text: "Your payslips are safely hidden until the HR Admin officially checks and marks the batch as 'Released'. Draft estimates are never visible.",
        },
        {
          subtitle: "2. Statutory Share Computations",
          text: "Gross pay minus taxes, SSS (4.5%), PhilHealth (2.5%), Pag-IBIG, late deductions, and undertime are calculated automatically according to your base rates.",
        },
        {
          subtitle: "3. 13th Month Accrual",
          text: "The system displays a live 13th Month card showing your monthly earned accrual, estimating your year-end bonus transparently.",
        }
      ]
    },
    {
      id: "schedules",
      title: "Interactive Shift Schedules",
      icon: <BookOpen size={18} className="text-violet-400" />,
      description: "Read your calendar and stacked work blocks.",
      content: [
        {
          subtitle: "1. Visual Calendar Grid",
          text: "Each calendar cell displays color-coded badges for all active shifts scheduled for that date, in chronological order.",
        },
        {
          subtitle: "2. Detailed Shift Tooltips",
          text: "Clicking or hovering over scheduled badges displays shift times, expected work hours, and late grace periods.",
        },
        {
          subtitle: "3. Overlapping Double Shifts",
          text: "If scheduled for consecutive or overlapping shifts, the system organizes DTR logs to match the correct shift segment cleanly.",
        }
      ]
    }
  ];

  const tourSteps = [
    {
      title: "Welcome to Vynora V3!",
      text: "Vynora V3 is a premium workspace tracking suite designed for automated, secure, and transparent attendance and payroll.",
      icon: "🚀"
    },
    {
      title: "High-Security Geofencing",
      text: "Clock-ins are restricted to workspace boundaries and secured with AI Face matching. No more buddy-punching or location spoofing.",
      icon: "🎯"
    },
    {
      title: "Flexible Shift Scheduling",
      text: "Support for multiple stacked shifts per day, overnight blocks, and interactive calendar badges for both employees and managers.",
      icon: "📅"
    },
    {
      title: "Audit-Ready Payroll Lock",
      text: "Cutoff batches progress from Draft to Approved, then Released. Once released, they are locked permanently to guarantee data integrity.",
      icon: "🔒"
    }
  ];

  const activeTopics = role === "admin" ? adminTopics : employeeTopics;

  return (
    <>
      {/* Floating help button - Highly compact and draggable */}
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleButtonClick}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          touchAction: "none"
        }}
        className="fixed bottom-[115px] right-4 z-[70] flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/25 cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-shadow select-none"
        aria-label="Open helper guide"
        type="button"
      >
        <HelpCircle size={20} className="drop-shadow-md pointer-events-none" />
      </button>

      {/* Slide-out Sidebar Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm">
          {/* Backdrop closer click */}
          <div className="flex-1" onClick={handleClose}></div>

          <div className="relative h-full w-full max-w-md border-l border-white/10 bg-slate-950/95 p-6 shadow-2xl overflow-y-auto text-slate-200 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">Vynora V3 Helper</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Context: {role.toUpperCase()}</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:border-cyan-500/30 hover:text-cyan-300 cursor-pointer"
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Main Menu or Active Topic Content */}
              {!isTourActive && !activeTopic && (
                <div className="mt-6 space-y-4">
                  {/* Quick Tour Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5 shadow-inner">
                    <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-cyan-400/10 blur-xl"></div>
                    <span className="text-2xl">✨</span>
                    <h4 className="mt-2 text-sm font-black text-white">New to Vynora V3?</h4>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      Take our interactive quick tour to learn the core upgrades in DTR, schedules, and payroll.
                    </p>
                    <button
                      onClick={() => setIsTourActive(true)}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer"
                      type="button"
                    >
                      Start Quick Tour
                    </button>
                  </div>

                  <h4 className="text-xs font-black uppercase tracking-[0.16em] text-slate-400 mt-6">Knowledge Base Topics</h4>
                  <div className="grid gap-3">
                    {activeTopics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => setActiveTopic(topic)}
                        className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4.5 cursor-pointer transition hover:border-cyan-500/30 hover:bg-cyan-500/[0.03]"
                      >
                        <div className="mt-0.5 rounded-lg border border-white/5 bg-white/[0.04] p-2 shrink-0">
                          {topic.icon}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-white text-sm">{topic.title}</h5>
                          <p className="mt-1 text-xs text-slate-400 leading-relaxed">{topic.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Topic Detail View */}
              {activeTopic && (
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTopic(null)}
                    className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-cyan-300 transition"
                    type="button"
                  >
                    &larr; Back to Topics
                  </button>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="rounded-lg border border-white/5 bg-white/[0.04] p-2 shrink-0">
                      {activeTopic.icon}
                    </div>
                    <h4 className="text-lg font-black text-white">{activeTopic.title}</h4>
                  </div>
                  <div className="space-y-4">
                    {activeTopic.content.map((slide, index) => (
                      <div key={index} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs">
                        <h5 className="font-black text-cyan-300 uppercase tracking-wide">{slide.subtitle}</h5>
                        <p className="mt-2 text-slate-300 leading-relaxed font-medium">{slide.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Quick Tour Component */}
              {isTourActive && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">Quick Walkthrough</span>
                    <span className="text-xs text-slate-400 font-bold">Step {tourStep + 1} of {tourSteps.length}</span>
                  </div>
                  
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center min-h-[260px] flex flex-col justify-center items-center shadow-lg relative overflow-hidden">
                    <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-cyan-500/5 blur-3xl"></div>
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/5 blur-3xl"></div>
                    
                    <span className="text-4xl mb-4 transform hover:scale-110 transition duration-300">{tourSteps[tourStep].icon}</span>
                    <h5 className="text-base font-black text-white">{tourSteps[tourStep].title}</h5>
                    <p className="mt-3 text-xs leading-relaxed text-slate-300 max-w-xs">{tourSteps[tourStep].text}</p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <button
                      onClick={() => tourStep > 0 ? setTourStep(tourStep - 1) : setIsTourActive(false)}
                      className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-transparent text-xs font-black uppercase tracking-wider text-slate-300 transition hover:bg-white/5 active:scale-95 cursor-pointer"
                      type="button"
                    >
                      <ChevronLeft size={16} /> {tourStep === 0 ? "Exit" : "Back"}
                    </button>
                    <button
                      onClick={() => {
                        if (tourStep < tourSteps.length - 1) {
                          setTourStep(tourStep + 1);
                        } else {
                          setIsTourActive(false);
                          setTourStep(0);
                        }
                      }}
                      className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-xs font-black uppercase tracking-wider text-white transition active:scale-95 cursor-pointer shadow-md hover:shadow-cyan-500/10"
                      type="button"
                    >
                      {tourStep === tourSteps.length - 1 ? "Complete" : "Next"} <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 pt-4 mt-6 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Vynora V3 Helper &bull; Active</span>
              <span>v3.2.0</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
