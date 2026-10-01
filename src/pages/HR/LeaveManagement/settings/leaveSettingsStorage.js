const STORAGE_PREFIX = "hrms.leaveSettings";

const clone = (value) => JSON.parse(JSON.stringify(value));

export const readSetting = (key, fallback) => {
  try {
    const stored = localStorage.getItem(
      `${STORAGE_PREFIX}.${key}`
    );

    if (!stored) {
      return clone(fallback);
    }

    return JSON.parse(stored);
  } catch {
    return clone(fallback);
  }
};

export const writeSetting = (key, value) => {
  localStorage.setItem(
    `${STORAGE_PREFIX}.${key}`,
    JSON.stringify(value)
  );
};

export const clearLeaveSettingsStorage = () => {
  Object.keys(localStorage)
    .filter((key) =>
      key.startsWith(`${STORAGE_PREFIX}.`)
    )
    .forEach((key) =>
      localStorage.removeItem(key)
    );
};