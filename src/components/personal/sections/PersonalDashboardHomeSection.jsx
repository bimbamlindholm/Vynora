import { motion } from "framer-motion";
import PersonalWelcomeCard from "../PersonalWelcomeCard";
import PersonalAnalytics from "../PersonalAnalytics";
import PersonalRecordsTable from "../PersonalRecordsTable";

function PersonalDashboardHomeSection({
  currentTime,
  todayRow,
  dtrButtonsConfig,
  submitting,
  handleClockAction,
  role,
  analyticsSummary,
  goals,
  goalsProgress,
  dailyRows,
  setActiveTab
}) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-12"
    >
      <PersonalWelcomeCard
        currentTime={currentTime}
        todayRow={todayRow}
        dtrButtonsConfig={dtrButtonsConfig}
        submitting={submitting}
        onClockAction={handleClockAction}
        role={role}
      />

      {role !== "employee" && (
        <PersonalAnalytics
          analyticsSummary={analyticsSummary}
          goals={goals}
          goalsProgress={goalsProgress}
        />
      )}

      <PersonalRecordsTable
        recentOnly={true}
        dailyRows={dailyRows}
        setActiveTab={setActiveTab}
        role={role}
      />
    </motion.div>
  );
}

export default PersonalDashboardHomeSection;
