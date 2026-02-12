import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection,
    doc,
    setDoc,
    getDoc,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const API_BASE = '/api';

// Premium Notification System
function showNotification(title, message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    let icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'info') icon = 'fa-info-circle';

    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;

    container.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('active'), 100);

    // Remove notification
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// Helper for Backend APIs (IPC, Prediction Logic)
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Something went wrong');
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showNotification("Action Failed", error.message, "error");
        throw error;
    }
}

// Password Visibility Toggle
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// Password Validation Logic
function initPasswordValidation() {
    const signupPass = document.getElementById('signup-password');
    if (!signupPass) return;

    signupPass.addEventListener('input', (e) => {
        const password = e.target.value;
        const requirements = {
            length: password.length >= 8,
            capital: /[A-Z]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            number: /[0-9]/.test(password)
        };

        // Update UI Items
        Object.keys(requirements).forEach(id => {
            const item = document.getElementById(`req-${id}`);
            if (!item) return;
            const icon = item.querySelector('i');
            if (requirements[id]) {
                item.classList.add('met');
                icon.className = 'fas fa-check-circle';
            } else {
                item.classList.remove('met');
                icon.className = 'far fa-circle';
            }
        });

        // Update Strength Bar
        const metCount = Object.values(requirements).filter(v => v).length;
        const barBg = document.getElementById('strength-bar').parentElement;

        barBg.classList.remove('strength-weak', 'strength-medium', 'strength-strong');

        if (metCount >= 4) {
            barBg.classList.add('strength-strong');
        } else if (metCount === 3) {
            barBg.classList.add('strength-medium');
        } else if (metCount >= 1) {
            barBg.classList.add('strength-weak');
        }
    });
}

// Global Auth State
let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Verify User Document Exists in Firestore
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                console.warn("User document not found in Firestore. Signing out...");
                await signOut(auth);
                currentUser = null;
                localStorage.removeItem('user');
                showNotification("Session Expired", "Your account has been deactivated or removed.", "error");
                window.location.href = '/login';
                return;
            }

            currentUser = user;
            const userData = userDoc.data();

            // Persist basic user info
            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                username: userData.username || user.email.split('@')[0]
            }));
        } catch (err) {
            console.error("Auth verification error:", err);
        }
    } else {
        currentUser = null;
        localStorage.removeItem('user');
    }
});

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // Feedback UI
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    btn.disabled = true;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Verify User Document exists before allowing full login
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
            await signOut(auth);
            throw new Error("Your user profile no longer exists. Access denied.");
        }

        showNotification("Login Successful", "Welcome back to InsaafAI!", "success");

        // Handle Pending Redirect with a slight delay
        setTimeout(() => {
            const pending = localStorage.getItem('pending_module');
            window.location.href = '/dashboard';
        }, 1500);
    } catch (error) {
        showNotification("Login Failed", error.message, "error");
        // Reset button on error
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const username = document.getElementById('signup-username').value.trim();

    // Feedback UI
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    btn.disabled = true;

    // Basic Field Checks
    if (!username || username.length < 3) {
        showNotification("Invalid Username", "Username must be at least 3 characters long.", "error");
        btn.innerHTML = originalText; btn.disabled = false;
        return;
    }

    if (!isValidEmail(email)) {
        showNotification("Invalid Email", "Please enter a valid email address.", "error");
        btn.innerHTML = originalText; btn.disabled = false;
        return;
    }

    // Validate Password Requirements
    const passwordRequirements = {
        length: password.length >= 8,
        capital: /[A-Z]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        number: /[0-9]/.test(password)
    };

    if (!Object.values(passwordRequirements).every(v => v)) {
        showNotification("Weak Password", "Please meet all password requirements before signing up.", "error");
        btn.innerHTML = originalText; btn.disabled = false;
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Use setDoc with UID as document ID for easier lookups
        try {
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                username: username,
                email: email,
                createdAt: serverTimestamp()
            });
        } catch (dbErr) {
            console.error("Error saving user profile:", dbErr);
        }

        showNotification("Account Created", "Welcome to the future of legal education!", "success");

        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1500);
    } catch (error) {
        showNotification("Signup Failed", error.message, "error");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function logout() {
    try {
        await signOut(auth);
        localStorage.removeItem('user');
        window.location.href = '/';
    } catch (error) {
        console.error("Logout Error:", error);
    }
}

// Data Functions (Firestore)
async function savePredictionToHistory(data) {
    if (!currentUser) return;
    try {
        await addDoc(collection(db, "history"), {
            userId: currentUser.uid,
            crime_description: data.description,
            prediction: data.outcome,
            ipc_section: data.ipc_section,
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error("Error saving history:", e);
    }
}

async function fetchUserHistory() {
    if (!currentUser) return [];
    try {
        const q = query(collection(db, "history"), where("userId", "==", currentUser.uid), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const results = [];
        querySnapshot.forEach((doc) => {
            const d = doc.data();
            // Format timestamp locally
            let dateStr = "";
            if (d.timestamp) {
                dateStr = new Date(d.timestamp.seconds * 1000).toLocaleString();
            }
            results.push({
                crime: d.crime_description,
                prediction: d.prediction,
                date: dateStr
            });
        });
        return results;
    } catch (e) {
        console.error("Error fetching history:", e);
        // Fallback or index error protection
        if (e.message.includes("requires an index")) {
            console.warn("Firestore index needed. Check console link.");
        }
        return [];
    }
}

async function saveQuizScore(level, score) {
    if (!currentUser) return;
    try {
        await addDoc(collection(db, "quiz_scores"), {
            userId: currentUser.uid,
            level: level,
            score: score,
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error("Error saving score:", e);
    }
}

async function fetchUserStats() {
    if (!currentUser) return {
        username: 'Guest',
        email: 'N/A',
        stats: { predictions_made: 0, quizzes_taken: 0, average_quiz_score: '0%' }
    };

    try {
        // Fetch History Count
        // To save reads, we ideally should keep counters on the user doc, but for now we query.
        const histQ = query(collection(db, "history"), where("userId", "==", currentUser.uid));
        const histSnap = await getDocs(histQ);
        const predCount = histSnap.size;

        // Fetch Quiz Stats
        const quizQ = query(collection(db, "quiz_scores"), where("userId", "==", currentUser.uid));
        const quizSnap = await getDocs(quizQ);
        const quizCount = quizSnap.size;

        let totalScore = 0;
        quizSnap.forEach(doc => {
            totalScore += doc.data().score || 0;
        });
        const avgScore = quizCount > 0 ? Math.round(totalScore / quizCount) : 0;

        // Get basic profile from user object or stored
        // Note: We use auth.currentUser for email
        const userProfile = JSON.parse(localStorage.getItem('user') || '{}');

        return {
            username: userProfile.username || currentUser.email.split('@')[0],
            email: currentUser.email,
            joined_at: currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Recently',
            stats: {
                predictions_made: predCount,
                quizzes_taken: quizCount,
                average_quiz_score: `${avgScore}%`
            }
        };

    } catch (e) {
        console.error("Error stats:", e);
        return {
            username: 'Student',
            stats: { predictions_made: 0, quizzes_taken: 0, average_quiz_score: '0%' }
        };
    }
}

// Expose to window for app.js (legacy calls)
window.apiCall = apiCall;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.logout = logout;
window.savePredictionToHistory = savePredictionToHistory;
window.fetchUserHistory = fetchUserHistory;
window.saveQuizScore = saveQuizScore;
window.fetchUserStats = fetchUserStats;
window.togglePasswordVisibility = togglePasswordVisibility;

// Email Validation Logic
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Initializations
// Initializations
function initApp() {
    console.log("Initializing InsaafAI App...");
    initPasswordValidation();

    // robust form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log("Login form found, attaching listener");
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.warn("Login form not found - if this is login page, check IDs");
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        console.log("Signup form found, attaching listener");
        signupForm.addEventListener('submit', handleSignup);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM already ready
    initApp();
}

// Also expose checkAuth equivalent
window.checkAuth = () => {
    // Rely on firebase auth state or localstorage cache for synchronous checks
    // The real auth check is async, effectively handled by onAuthStateChanged
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
};
