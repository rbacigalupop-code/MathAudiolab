import { useState, useCallback } from "react";

const SCHEMA_VERSION = 1;
const PROFILE_KEY = "__mal_profile";
const PROFILES_REGISTRY_KEY = "__mal_profiles_registry";

const INITIAL_STATE = {
  version: SCHEMA_VERSION,
  nivel: 1,
  tabla: 2,
  sesiones: [],
  erroresPorTabla: {},
  rachaGlobal: 0,
  mejorRacha: 0,
  weak_points: {},
  unlocked_effects: [],
  errorLog: {},  // New: granular error tracking
  preferencias: { zenMode: true },  // New: user preferences
};

// Default color palette for profiles
const PROFILE_COLORS = ["#3b82f6", "#ec4899", "#06b6d4", "#8b5cf6", "#f59e0b", "#22c55e"];
const PROFILE_EMOJIS = ["👨", "👩", "🧒", "👦", "👧", "🎓"];

/**
 * Initialize default profiles on first load
 */
function initializeDefaultProfiles() {
  const registry = {
    version: 1,
    profiles: [
      { id: "cristobal", label: "👨 Cristóbal", emoji: "👨", color: "#3b82f6", createdAt: Date.now() },
      { id: "grace", label: "👩 Grace", emoji: "👩", color: "#ec4899", createdAt: Date.now() }
    ]
  };
  localStorage.setItem(PROFILES_REGISTRY_KEY, JSON.stringify(registry));
  return registry;
}

/**
 * Get all profiles from registry
 */
function getAllProfiles() {
  try {
    const stored = localStorage.getItem(PROFILES_REGISTRY_KEY);
    if (!stored) {
      return initializeDefaultProfiles().profiles;
    }
    const parsed = JSON.parse(stored);
    return parsed.profiles || [];
  } catch {
    return initializeDefaultProfiles().profiles;
  }
}

/**
 * Generate a unique profile ID from a name
 */
function generateProfileId(name) {
  let id = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  // Check for collisions
  const allProfiles = getAllProfiles();
  let finalId = id;
  let counter = 1;

  while (allProfiles.some(p => p.id === finalId)) {
    finalId = `${id}-${counter}`;
    counter++;
  }

  return finalId;
}

/**
 * Get the current profile from localStorage
 * Defaults to "cristobal" if not set
 */
function getCurrentProfile() {
  try {
    return localStorage.getItem(PROFILE_KEY) || "cristobal";
  } catch {
    return "cristobal";
  }
}

/**
 * Get the storage key for the current profile
 */
function getStoreKey(profile) {
  return `__mal_${profile}_v1`;
}

export function useLocalStorage() {
  const [profile, setProfile] = useState(() => getCurrentProfile());
  const storeKey = getStoreKey(profile);

  const [store, setStore] = useState(() => {
    try {
      const saved = localStorage.getItem(storeKey);
      if (!saved) return INITIAL_STATE;
      const parsed = JSON.parse(saved);
      if (!parsed.version || parsed.version < SCHEMA_VERSION) {
        return { ...INITIAL_STATE, ...parsed };
      }
      return parsed;
    } catch {
      return INITIAL_STATE;
    }
  });

  const saveStore = useCallback((newStore) => {
    try {
      localStorage.setItem(storeKey, JSON.stringify(newStore));
      setStore(newStore);
    } catch (e) {
      console.warn("Storage error:", e);
    }
  }, [storeKey]);

  const updateStore = useCallback((updater) => {
    setStore((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveStore(next);
      return next;
    });
  }, [saveStore]);

  /**
   * Record an error/attempt for granular tracking
   * @param {string} op1 - First operand (e.g., "5" in "5×7")
   * @param {string} op2 - Second operand (e.g., "7" in "5×7")
   * @param {boolean} isCorrect - Whether the attempt was correct
   * @param {string} symbol - Mathematical operator ("×", "÷", "^")
   * @param {string} banda - Optional band name for analytics
   */
  const recordError = useCallback((op1, op2, isCorrect, symbol = "×", banda = null) => {
    setStore((prev) => {
      const key = `${op1}${symbol}${op2}`;

      // HOTFIX: Ensure errorLog exists and is a valid object
      const errorLog = prev.errorLog || {};
      const entry = errorLog[key] || { intentos: 0, fallos: 0, lastAttempt: null, rate: 0 };

      entry.intentos++;
      if (!isCorrect) entry.fallos++;
      entry.rate = entry.fallos / entry.intentos;
      entry.lastAttempt = Date.now();
      if (banda) entry.banda = banda;

      const next = {
        ...prev,
        errorLog: { ...errorLog, [key]: entry }
      };

      saveStore(next);
      return next;
    });
  }, [saveStore]);

  /**
   * Get the most failed operations (weak points)
   * @param {number} limit - How many to return
   * @returns {Array} Operations sorted by error rate DESC
   */
  const getMostFailedOperations = useCallback((limit = 5) => {
    return Object.entries(store.errorLog)
      .map(([key, data]) => ({ key, ...data }))
      .filter(item => item.rate > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, limit);
  }, [store.errorLog]);

  /**
   * Switch to a different profile
   */
  const switchProfile = useCallback((newProfile) => {
    try {
      // Verify profile exists in registry
      const allProfiles = getAllProfiles();
      if (!allProfiles.some(p => p.id === newProfile)) {
        console.warn(`Profile ${newProfile} not found in registry`);
        return false;
      }

      localStorage.setItem(PROFILE_KEY, newProfile);
      setProfile(newProfile);

      // Load data for new profile
      const newStoreKey = getStoreKey(newProfile);
      const saved = localStorage.getItem(newStoreKey);
      const newStore = saved ? JSON.parse(saved) : INITIAL_STATE;
      setStore(newStore);
      return true;
    } catch (e) {
      console.warn("Profile switch error:", e);
      return false;
    }
  }, []);

  /**
   * Create a new profile
   * @param {string} name - Profile name (displayed to user)
   * @param {string} emoji - Emoji for the profile
   * @param {string} color - Hex color for the profile
   * @returns {object} The created profile or null if failed
   */
  const createProfile = useCallback((name, emoji, color) => {
    try {
      if (!name || name.trim().length < 2) {
        console.warn("Profile name too short");
        return null;
      }

      const profileId = generateProfileId(name);
      const newProfile = {
        id: profileId,
        label: `${emoji} ${name}`,
        emoji,
        color,
        createdAt: Date.now()
      };

      // Add to registry
      const registry = JSON.parse(localStorage.getItem(PROFILES_REGISTRY_KEY));
      registry.profiles.push(newProfile);
      localStorage.setItem(PROFILES_REGISTRY_KEY, JSON.stringify(registry));

      // Initialize profile data
      localStorage.setItem(getStoreKey(profileId), JSON.stringify(INITIAL_STATE));

      return newProfile;
    } catch (e) {
      console.warn("Create profile error:", e);
      return null;
    }
  }, []);

  /**
   * Delete a profile and all its data
   * @param {string} profileId - ID of profile to delete
   * @returns {boolean} Success status
   */
  const deleteProfile = useCallback((profileId) => {
    try {
      const allProfiles = getAllProfiles();

      // Cannot delete if only one profile remains
      if (allProfiles.length <= 1) {
        console.warn("Cannot delete the only profile");
        return false;
      }

      // Remove from registry
      const registry = JSON.parse(localStorage.getItem(PROFILES_REGISTRY_KEY));
      registry.profiles = registry.profiles.filter(p => p.id !== profileId);
      localStorage.setItem(PROFILES_REGISTRY_KEY, JSON.stringify(registry));

      // Delete profile data
      localStorage.removeItem(getStoreKey(profileId));

      // If deleted profile was active, switch to first available profile
      const currentProfile = getCurrentProfile();
      if (currentProfile === profileId) {
        const firstProfile = registry.profiles[0];
        switchProfile(firstProfile.id);
      }

      return true;
    } catch (e) {
      console.warn("Delete profile error:", e);
      return false;
    }
  }, [switchProfile]);

  /**
   * Get all profiles
   */
  const getProfiles = useCallback(() => {
    return getAllProfiles().sort((a, b) => b.createdAt - a.createdAt);
  }, []);

  /**
   * ===== PARENT/TEACHER SYSTEM =====
   */

  /**
   * Generate a unique parent ID
   */
  function generateParentId() {
    return `parent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get parent registry from localStorage
   */
  function getParentRegistry() {
    try {
      const stored = localStorage.getItem("__mal_parents_registry");
      if (!stored) {
        const empty = { version: 1, parents: [] };
        localStorage.setItem("__mal_parents_registry", JSON.stringify(empty));
        return empty;
      }
      return JSON.parse(stored);
    } catch {
      return { version: 1, parents: [] };
    }
  }

  /**
   * Register a new parent account
   * @param {string} email - Parent email
   * @param {string} password - Parent password (will be hashed with btoa)
   * @param {string} name - Parent full name
   * @returns {object|null} New parent object or null if email already exists
   */
  const registerParent = useCallback((email, password, name) => {
    try {
      if (!email || !password || !name) {
        console.warn("Missing parent registration fields");
        return null;
      }

      const registry = getParentRegistry();

      // Check if email already exists
      if (registry.parents.some(p => p.email.toLowerCase() === email.toLowerCase())) {
        console.warn("Email already registered");
        return null;
      }

      // Hash password using btoa (MVP - NOT SECURE)
      const passwordHash = btoa(password);

      const newParent = {
        id: generateParentId(),
        email: email.toLowerCase(),
        name,
        password: passwordHash,
        studentIds: [],
        createdAt: Date.now(),
        lastLogin: null
      };

      registry.parents.push(newParent);
      localStorage.setItem("__mal_parents_registry", JSON.stringify(registry));

      return newParent;
    } catch (e) {
      console.warn("Register parent error:", e);
      return null;
    }
  }, []);

  /**
   * Authenticate a parent and create session
   * @param {string} email - Parent email
   * @param {string} password - Parent password (unhashed)
   * @returns {object|null} Parent session object or null if authentication fails
   */
  const loginParent = useCallback((email, password) => {
    try {
      const registry = getParentRegistry();
      const parent = registry.parents.find(p => p.email.toLowerCase() === email.toLowerCase());

      if (!parent) {
        console.warn("Parent not found");
        return null;
      }

      // Verify password
      const passwordHash = btoa(password);
      if (parent.password !== passwordHash) {
        console.warn("Wrong password");
        return null;
      }

      // Create session with 24-hour expiry
      const now = Date.now();
      const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours

      const session = {
        parentId: parent.id,
        email: parent.email,
        name: parent.name,
        studentIds: parent.studentIds,
        selectedStudentId: parent.studentIds.length > 0 ? parent.studentIds[0] : null,
        loginTime: now,
        expiresAt
      };

      localStorage.setItem("__mal_parent_session", JSON.stringify(session));

      // Update lastLogin
      parent.lastLogin = now;
      localStorage.setItem("__mal_parents_registry", JSON.stringify(registry));

      return session;
    } catch (e) {
      console.warn("Login parent error:", e);
      return null;
    }
  }, []);

  /**
   * Get current parent session if valid
   * @returns {object|null} Parent session or null if no valid session
   */
  const getParentSession = useCallback(() => {
    try {
      const stored = localStorage.getItem("__mal_parent_session");
      if (!stored) return null;

      const session = JSON.parse(stored);
      const now = Date.now();

      // Check if session expired
      if (session.expiresAt && now > session.expiresAt) {
        logoutParent();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }, []);

  /**
   * Logout current parent and clear session
   */
  const logoutParent = useCallback(() => {
    try {
      localStorage.removeItem("__mal_parent_session");
    } catch (e) {
      console.warn("Logout parent error:", e);
    }
  }, []);

  /**
   * Assign a student to a parent
   * @param {string} parentId - Parent ID
   * @param {string} studentId - Student profile ID
   * @returns {boolean} Success status
   */
  const assignStudentToParent = useCallback((parentId, studentId) => {
    try {
      // Verify student exists
      const allProfiles = getAllProfiles();
      if (!allProfiles.some(p => p.id === studentId)) {
        console.warn("Student not found");
        return false;
      }

      const registry = getParentRegistry();
      const parent = registry.parents.find(p => p.id === parentId);

      if (!parent) {
        console.warn("Parent not found");
        return false;
      }

      // Check if already assigned
      if (parent.studentIds.includes(studentId)) {
        return true; // Already assigned
      }

      parent.studentIds.push(studentId);
      localStorage.setItem("__mal_parents_registry", JSON.stringify(registry));

      // Update session if this is the logged-in parent
      const session = getParentSession();
      if (session && session.parentId === parentId) {
        session.studentIds = parent.studentIds;
        localStorage.setItem("__mal_parent_session", JSON.stringify(session));
      }

      return true;
    } catch (e) {
      console.warn("Assign student error:", e);
      return false;
    }
  }, []);

  /**
   * Remove a student from parent's access
   * @param {string} parentId - Parent ID
   * @param {string} studentId - Student profile ID
   * @returns {boolean} Success status
   */
  const removeStudentFromParent = useCallback((parentId, studentId) => {
    try {
      const registry = getParentRegistry();
      const parent = registry.parents.find(p => p.id === parentId);

      if (!parent) {
        console.warn("Parent not found");
        return false;
      }

      parent.studentIds = parent.studentIds.filter(id => id !== studentId);
      localStorage.setItem("__mal_parents_registry", JSON.stringify(registry));

      // Update session if this is the logged-in parent
      const session = getParentSession();
      if (session && session.parentId === parentId) {
        session.studentIds = parent.studentIds;
        if (session.selectedStudentId === studentId) {
          session.selectedStudentId = parent.studentIds.length > 0 ? parent.studentIds[0] : null;
        }
        localStorage.setItem("__mal_parent_session", JSON.stringify(session));
      }

      return true;
    } catch (e) {
      console.warn("Remove student error:", e);
      return false;
    }
  }, []);

  /**
   * Get all students assigned to a parent
   * @param {string} parentId - Parent ID
   * @returns {Array} Array of student profile objects
   */
  const getParentStudents = useCallback((parentId) => {
    try {
      const registry = getParentRegistry();
      const parent = registry.parents.find(p => p.id === parentId);

      if (!parent) {
        console.warn("Parent not found");
        return [];
      }

      const allProfiles = getAllProfiles();
      return allProfiles.filter(p => parent.studentIds.includes(p.id));
    } catch {
      return [];
    }
  }, []);

  /**
   * Load student data for parent viewing
   * @param {string} studentId - Student profile ID
   * @returns {object} Student profile data or null if not found
   */
  const loadStudentDataForParent = useCallback((studentId) => {
    try {
      // Verify student exists in registry
      const allProfiles = getAllProfiles();
      const profile = allProfiles.find(p => p.id === studentId);
      if (!profile) return null;

      // Load student data
      const storeKey = getStoreKey(studentId);
      const saved = localStorage.getItem(storeKey);
      return saved ? JSON.parse(saved) : INITIAL_STATE;
    } catch (e) {
      console.warn("Load student data error:", e);
      return null;
    }
  }, []);

  /**
   * Update selected student in parent session
   * @param {string} studentId - Student profile ID
   * @returns {boolean} Success status
   */
  const setParentSelectedStudent = useCallback((studentId) => {
    try {
      const session = getParentSession();
      if (!session) return false;

      if (!session.studentIds.includes(studentId)) {
        console.warn("Student not assigned to parent");
        return false;
      }

      session.selectedStudentId = studentId;
      localStorage.setItem("__mal_parent_session", JSON.stringify(session));
      return true;
    } catch (e) {
      console.warn("Set selected student error:", e);
      return false;
    }
  }, []);

  return {
    store,
    updateStore,
    recordError,
    getMostFailedOperations,
    profile,
    switchProfile,
    createProfile,
    deleteProfile,
    getProfiles,
    // Parent system
    registerParent,
    loginParent,
    getParentSession,
    logoutParent,
    assignStudentToParent,
    removeStudentFromParent,
    getParentStudents,
    loadStudentDataForParent,
    setParentSelectedStudent
  };
}
