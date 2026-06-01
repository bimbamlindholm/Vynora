/**
 * Reusable physical GPS geolocation retrieval utility.
 * Promisifies the native browser geolocation API with standard error mappings.
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let msg = "Failed to retrieve physical location. ";
        if (error.code === error.PERMISSION_DENIED) {
          msg += "Please grant location permission in browser settings to record attendance.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg += "Location network details unavailable.";
        } else if (error.code === error.TIMEOUT) {
          msg += "Request timed out.";
        } else {
          msg += error.message;
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
};
