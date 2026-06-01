/**
 * Philippine Holidays and Wage Multipliers for 2026.
 */

// Format: MM-DD for fixed-date holidays
const FIXED_REGULAR_HOLIDAYS = {
  "01-01": "New Year's Day",
  "04-09": "Araw ng Kagitingan (Valor Day)",
  "05-01": "Labor Day",
  "06-12": "Independence Day",
  "11-30": "Bonifacio Day",
  "12-25": "Christmas Day",
  "12-30": "Rizal Day",
};

const FIXED_SPECIAL_HOLIDAYS = {
  "02-25": "EDSA People Power Revolution Anniversary",
  "08-21": "Ninoy Aquino Day",
  "11-01": "All Saints' Day",
  "11-02": "All Souls' Day",
  "12-08": "Feast of the Immaculate Conception",
  "12-24": "Christmas Eve",
  "12-31": "Last Day of the Year (New Year's Eve)",
};

// Format: YYYY-MM-DD for movable holidays in 2026
const MOVABLE_REGULAR_HOLIDAYS = {
  "2026-04-02": "Maundy Thursday",
  "2026-04-03": "Good Friday",
  "2026-08-31": "National Heroes Day", // Last Monday of August
  // 2027
  "2027-03-25": "Maundy Thursday",
  "2027-03-26": "Good Friday",
  "2027-08-30": "National Heroes Day", // Last Monday of August
};

const MOVABLE_SPECIAL_HOLIDAYS = {
  "2026-02-17": "Chinese New Year",
  "2026-04-04": "Black Saturday",
  // 2027
  "2027-01-29": "Chinese New Year",
  "2027-03-27": "Black Saturday",
};

/**
 * Returns the holiday status and multiplier for a given date.
 * 
 * Multipliers:
 * - Regular Holiday: 2.0x base rate
 * - Special Non-Working Day: 1.3x base rate
 * - Normal Day: 1.0x base rate
 * 
 * @param {string} dateStr The date in YYYY-MM-DD format.
 * @returns {Object} { name: string|null, type: 'regular'|'special'|null, multiplier: number }
 */
export function getHolidayDetails(dateStr, customRates = {}) {
  if (!dateStr) return { name: null, type: null, multiplier: 1.0 };

  const regularMultiplier = Number(customRates.holidayRegularRate ?? 2.0);
  const specialMultiplier = Number(customRates.holidaySpecialRate ?? 1.3);
  const customHolidays = customRates.customHolidays ?? customRates.custom_holidays ?? [];

  // Check Dynamic Custom Workspace Holidays first (takes precedence!)
  const matchedCustom = customHolidays.find((h) => h.date === dateStr);
  if (matchedCustom) {
    const isRegular = String(matchedCustom.type).toLowerCase() === "regular";
    return {
      name: matchedCustom.name,
      type: isRegular ? "regular" : "special",
      multiplier: isRegular ? regularMultiplier : specialMultiplier,
    };
  }

  // Get MM-DD part for fixed holidays
  const mmDd = dateStr.substring(5, 10); // e.g. "05-01" from "2026-05-01"

  // Check Regular Holidays
  if (FIXED_REGULAR_HOLIDAYS[mmDd]) {
    return { name: FIXED_REGULAR_HOLIDAYS[mmDd], type: "regular", multiplier: regularMultiplier };
  }
  if (MOVABLE_REGULAR_HOLIDAYS[dateStr]) {
    return { name: MOVABLE_REGULAR_HOLIDAYS[dateStr], type: "regular", multiplier: regularMultiplier };
  }

  // Check Special Non-Working Holidays
  if (FIXED_SPECIAL_HOLIDAYS[mmDd]) {
    return { name: FIXED_SPECIAL_HOLIDAYS[mmDd], type: "special", multiplier: specialMultiplier };
  }
  if (MOVABLE_SPECIAL_HOLIDAYS[dateStr]) {
    return { name: MOVABLE_SPECIAL_HOLIDAYS[dateStr], type: "special", multiplier: specialMultiplier };
  }

  return { name: null, type: null, multiplier: 1.0 };
}
