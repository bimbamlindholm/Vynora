import { motion } from "framer-motion";
import PersonalRecordsTable from "../PersonalRecordsTable";

function PersonalAttendanceLogSection({
  filteredHistoryRows,
  historyFilter,
  setHistoryFilter,
  historyStart,
  setHistoryStart,
  historyEnd,
  setHistoryEnd,
  historySearch,
  setHistorySearch,
  historyStatusFilter,
  setHistoryStatusFilter,
  role,
  setShowCorrectionModal,
  setShowAddModal,
  handleExportCsv,
  handlePrintDtr,
  openEditRow,
  handleDeleteRow,
  setShowLeaveModal
}) {
  return (
    <motion.div
      key="history"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PersonalRecordsTable
        recentOnly={false}
        filteredHistoryRows={filteredHistoryRows}
        historyFilter={historyFilter}
        setHistoryFilter={setHistoryFilter}
        historyStart={historyStart}
        setHistoryStart={setHistoryStart}
        historyEnd={historyEnd}
        setHistoryEnd={setHistoryEnd}
        historySearch={historySearch}
        setHistorySearch={setHistorySearch}
        historyStatusFilter={historyStatusFilter}
        setHistoryStatusFilter={setHistoryStatusFilter}
        onAddLogClick={() => role === "employee" ? setShowCorrectionModal(true) : setShowAddModal(true)}
        onExportCsv={handleExportCsv}
        onPrintDtr={handlePrintDtr}
        onEditRow={(row) => role === "employee" ? setShowCorrectionModal(true) : openEditRow(row)}
        onDeleteRow={handleDeleteRow}
        role={role}
        onFileLeaveClick={() => setShowLeaveModal(true)}
      />
    </motion.div>
  );
}

export default PersonalAttendanceLogSection;
