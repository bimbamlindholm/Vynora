import { motion } from "framer-motion";
import PersonalScheduler from "../PersonalScheduler";

function PersonalCalendarSection({
  calendarDate,
  setCalendarDate,
  calendarDays,
  currentTime,
  openEditRow,
  diaryNotes,
  setSelectedDiaryDate,
  setDiaryText,
  setShowDiaryModal,
  role
}) {
  return (
    <motion.div
      key="calendar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PersonalScheduler
        calendarDate={calendarDate}
        setCalendarDate={setCalendarDate}
        calendarDays={calendarDays}
        currentTime={currentTime}
        openEditRow={openEditRow}
        diaryNotes={diaryNotes}
        onOpenDiary={(dateStr) => {
          setSelectedDiaryDate(dateStr);
          setDiaryText(diaryNotes[dateStr] || "");
          setShowDiaryModal(true);
        }}
        role={role}
      />
    </motion.div>
  );
}

export default PersonalCalendarSection;
