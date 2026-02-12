document.addEventListener('DOMContentLoaded', () => {
    // Direct local check to avoid race condition with api.js module loading
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (user) {
        const nameDisplay = document.getElementById('username-display');
        const bannerName = document.getElementById('user-name-banner');

        // Update UI with fallback to 'User'/email part if username missing
        const displayName = user.username || user.email.split('@')[0] || 'User';

        if (nameDisplay) nameDisplay.textContent = displayName;
        if (bannerName) bannerName.textContent = displayName;

        // Check for pending module redirection
        const pendingModule = localStorage.getItem('pending_module');
        if (pendingModule) {
            localStorage.removeItem('pending_module');
            loadModule(pendingModule);
        }
    } else {
        // If no user found in local storage, redirect to login unless already there
        // (Optional: depending on requirements. For now, we leave as is or redirect)
        // window.location.href = '/'; 
    }
});

// Simple client-side routing/module loader for demo purposes
// In a real app, you might use React/Vue or server-side rendering for each page
const modules = {
    predict: `
        <div class="content-container">
            <button class="back-btn" onclick="loadModule('dashboard')"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
            <h2><i class="fas fa-brain"></i> AI Case Predictor</h2>
            <p style="color:var(--text-light); margin-bottom:1rem;">Input case details to get AI-powered predictions on potential outcomes</p>
            
            <div class="predictor-container">
                <div class="disclaimer-box">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>Legal Disclaimer</strong><br>
                        This AI prediction is for educational purposes only and should not be considered as legal advice. Always consult a qualified legal professional for actual case matters.
                    </div>
                </div>

                <div class="prediction-grid">
                    <!-- Left Column: Case Details -->
                    <div class="card">
                        <h3>Case Details</h3>
                        <p style="margin-bottom:1.5rem;">Provide detailed information about the case for accurate analysis</p>

                        <div class="form-group">
                            <label>Crime Type *</label>
                            <select id="crime-type" style="width:100%; padding:0.75rem; border:1px solid #d1d5db; border-radius:5px;">
                                <option value="">Select crime category</option>
                                <option value="theft">Theft / Robbery</option>
                                <option value="assault">Assault / Battery</option>
                                <option value="fraud">Fraud / Cheating</option>
                                <option value="cyber">Cyber Crime</option>
                                <option value="harassment">Harassment</option>
                                <option value="murder">Homicide / Murder</option>
                                <option value="domestic">Domestic Violence</option>
                                <option value="kidnapping">Kidnapping / Abduction</option>
                                <option value="dowry">Dowry Harassment</option>
                                <option value="corruption">Corruption / Bribery</option>
                                <option value="trespass">Criminal Trespass</option>
                                <option value="forgery">Forgery / Fraud</option>
                                <option value="defamation">Defamation</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Evidence Summary *</label>
                            <textarea id="crime-desc" rows="5" spellcheck="true" style="width:100%; padding:0.75rem; border:1px solid #d1d5db; border-radius:5px;" placeholder="Describe the available evidence, witness statements, and key facts of the case..."></textarea>
                        </div>

                        <div class="form-group">
                            <label>Applicable IPC Sections *</label>
                            <div class="ipc-section-buttons" id="ipc-tags-container">
                                <button class="ipc-tag" onclick="toggleIpc(this)">§ 302</button>
                                <button class="ipc-tag" onclick="toggleIpc(this)">§ 304</button>
                                <button class="ipc-tag" onclick="toggleIpc(this)">§ 307</button>
                                <button class="ipc-tag" onclick="toggleIpc(this)">§ 323</button>
                                <button class="ipc-tag" onclick="toggleIpc(this)">§ 324</button>
                                <button class="ipc-tag" onclick="toggleIpc(this)">§ 354</button>
                                <button class="ipc-tag" onclick="toggleIpc(this)">§ 376</button>
                                <button class="ipc-tag" onclick="toggleIpc(this)">§ 379</button>
                                <button class="ipc-tag" onclick="toggleIpc(this)">§ 380</button>
                                <button class="ipc-tag" onclick="toggleIpc(this)">§ 392</button>
                                <button class="ipc-tag" onclick="toggleIpc(this)">§ 395</button>
                                <button class="ipc-tag" onclick="toggleIpc(this)">§ 420</button>
                                <button class="ipc-tag" onclick="toggleIpc(this)">§ 498A</button>
                                <button class="ipc-tag" onclick="toggleIpc(this)">§ 506</button>
                                <!-- Dropdown for more sections -->
                                <select id="more-ipc" onchange="addIpcFromSelect(this)" style="padding: 0.35rem; border-radius: 20px; border: 1px solid #e5e7eb; font-size: 0.85rem; background: #f3f4f6;">
                                    <option value="">+ Add Section</option>
                                    <option value="120B">§ 120B</option>
                                    <option value="124A">§ 124A</option>
                                    <option value="141">§ 141</option>
                                    <option value="191">§ 191</option>
                                    <option value="299">§ 299</option>
                                    <option value="300">§ 300</option>
                                    <option value="351">§ 351</option>
                                    <option value="378">§ 378</option>
                                    <option value="405">§ 405</option>
                                    <option value="415">§ 415</option>
                                    <option value="441">§ 441</option>
                                    <option value="499">§ 499</option>
                                    <option value="511">§ 511</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Upload Case Document (Optional)</label>
                            <div class="upload-area" onclick="document.getElementById('file-upload').click()">
                                <i class="fas fa-file-upload"></i>
                                <p id="upload-text">Drag and drop PDF files here, or click to browse</p>
                                <input type="file" id="file-upload" style="display: none;" onchange="handleFileUpload(this)">
                            </div>
                        </div>

                        <div class="action-buttons">
                            <button class="btn" onclick="runPrediction()"><i class="fas fa-robot"></i> Analyze Case</button>
                            <button class="btn btn-secondary" onclick="resetPrediction()">Reset</button>
                        </div>
                    </div>

                    <!-- Right Column: AI Prediction -->
                    <div class="card" id="prediction-card">
                        <h3>AI Prediction</h3>
                        <p style="margin-bottom:1rem;">Analysis results will appear here</p>
                        
                        <div id="prediction-placeholder" class="prediction-placeholder">
                            <i class="fas fa-brain"></i>
                            <p>Fill in the case details and click "Analyze Case" to get AI predictions</p>
                        </div>

                        <div id="prediction-result" class="result-box"></div>
                    </div>
                </div>
            </div>
        </div>
    `,
    ipc: `
        <div class="content-container">
            <button class="back-btn" onclick="loadModule('dashboard')"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
            <h2>IPC Browser</h2>
            <div class="card">
                <div class="form-group">
                <div class="search-box">
                    <input type="text" placeholder="Search IPC Section (e.g. 302)..." id="ipc-search">
                </div>
                <div style="display:flex; justify-content:flex-end; margin-top:0.5rem; margin-bottom:1rem;">
                    <select id="ipc-lang" style="padding:0.5rem; border:1px solid #d1d5db; border-radius:5px; width:auto; background-color:white;">
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="mr">Marathi</option>
                        <option value="bn">Bengali</option>
                        <option value="pa">Punjabi</option>
                        <option value="gu">Gujarati</option>
                        <option value="ta">Tamil</option>
                        <option value="te">Telugu</option>
                        <option value="kn">Kannada</option>
                        <option value="ml">Malayalam</option>
                    </select>
                </div>
                <button class="btn" style="width:auto;" onclick="searchIPC()">Search</button>
                <div id="ipc-result" class="result-box">
                    <p>Search for a section to see details.</p>
                </div>
            </div>
        </div>
    `,
    learn: `
        <div class="content-container">
            <button class="back-btn" onclick="loadModule('dashboard')"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
            <h2><i class="fas fa-graduation-cap"></i> Learn Law</h2>
            <p style="color:var(--text-light); margin-bottom:1.5rem;">Explore comprehensive guides on Indian Penal Code topics.</p>
            
            <div id="learn-list" class="grid-container">
                <!-- Basics -->
                <div class="card learn-card" onclick="showLearnDetail('ipc_basics')">
                    <div class="learn-icon"><i class="fas fa-book"></i></div>
                    <h3>IPC Basics</h3>
                    <p>Introduction, History, and Structure of the Code.</p>
                </div>

                <!-- General Exceptions -->
                <div class="card learn-card" onclick="showLearnDetail('general_exceptions')">
                    <div class="learn-icon"><i class="fas fa-shield-alt"></i></div>
                    <h3>General Exceptions</h3>
                    <p>Right to Private Defense, Accident, and Mistake of Fact.</p>
                </div>

                <!-- Crimes Against Person -->
                <div class="card learn-card" onclick="showLearnDetail('crimes_person')">
                    <div class="learn-icon"><i class="fas fa-user-injured"></i></div>
                    <h3>Crimes Against Person</h3>
                    <p>Murder, Culpable Homicide, Hurt, and Kidnapping.</p>
                </div>

                <!-- Crimes Against Property -->
                <div class="card learn-card" onclick="showLearnDetail('crimes_property')">
                    <div class="learn-icon"><i class="fas fa-home"></i></div>
                    <h3>Crimes Against Property</h3>
                    <p>Theft, Extortion, Robbery, and Criminal Trespass.</p>
                </div>

                <!-- Women & Children -->
                <div class="card learn-card" onclick="showLearnDetail('women_child')">
                    <div class="learn-icon"><i class="fas fa-female"></i></div>
                    <h3>Women & Child Laws</h3>
                    <p>Dowry Death, Domestic Violence, and Safety Laws.</p>
                </div>

                <!-- Public Tranquility -->
                <div class="card learn-card" onclick="showLearnDetail('public_order')">
                    <div class="learn-icon"><i class="fas fa-users"></i></div>
                    <h3>Public Tranquility</h3>
                    <p>Unlawful Assembly, Rioting, and Affray.</p>
                </div>

                 <!-- Cyber Laws -->
                <div class="card learn-card" onclick="showLearnDetail('cyber_laws')">
                    <div class="learn-icon"><i class="fas fa-laptop-code"></i></div>
                    <h3>Cyber Laws</h3>
                    <p>IT Act 2000, Hacking, and Data Theft.</p>
                </div>

                 <!-- Defamation -->
                <div class="card learn-card" onclick="showLearnDetail('defamation')">
                    <div class="learn-icon"><i class="fas fa-comment-slash"></i></div>
                    <h3>Defamation & Reputation</h3>
                    <p>Libel, Slander, and Criminal Intimidation.</p>
                </div>

                 <!-- Conspiracy -->
                <div class="card learn-card" onclick="showLearnDetail('conspiracy')">
                    <div class="learn-icon"><i class="fas fa-project-diagram"></i></div>
                    <h3>Abetment & Conspiracy</h3>
                    <p>Criminal Conspiracy (120A) and Abetment types.</p>
                </div>

                 <!-- Attempts -->
                <div class="card learn-card" onclick="showLearnDetail('attempts')">
                    <div class="learn-icon"><i class="fas fa-exclamation-circle"></i></div>
                    <h3>Attempt to Commit Offences</h3>
                    <p>Section 511 and incomplete crimes.</p>
                </div>

            </div>
            <div id="learn-detail" style="display:none;">
                <button class="btn btn-secondary" style="width:auto; margin-bottom:1rem;" onclick="showLearnList()"><i class="fas fa-arrow-left"></i> Back to Topics</button>
                <div id="learn-content" class="card"></div>
            </div>
        </div>
    `,
    quiz: `
        <div class="content-container">
            <button class="back-btn" onclick="loadModule('dashboard')"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
            <h2><i class="fas fa-question-circle"></i> Legal Quiz Challenge</h2>
            <p style="color:var(--text-light); margin-bottom:1.5rem;">Test your knowledge across 10 levels of Indian Penal Code mastery.</p>
            
            <div id="quiz-options-list" class="grid-container">
                <!-- Levels will be auto-generated or hardcoded here -->
                
                <!-- Level 1 -->
                <div class="card quiz-level-card">
                    <h3>Level 1: Basics</h3>
                    <p>Introduction & General Explanations</p>
                    <div class="quiz-meta">
                        <span>10 Questions</span>
                        <button class="btn btn-sm" onclick="startQuiz('level1')">Start</button>
                    </div>
                </div>

                <!-- Level 2 -->
                <div class="card quiz-level-card">
                    <h3>Level 2: Punishments</h3>
                    <p>Fines, Imprisonment & Forfeiture</p>
                    <div class="quiz-meta">
                        <span>10 Questions</span>
                        <button class="btn btn-sm" onclick="startQuiz('level2')">Start</button>
                    </div>
                </div>

                <!-- Level 3 -->
                <div class="card quiz-level-card">
                    <h3>Level 3: Exceptions</h3>
                    <p>Self Defense & General Exceptions</p>
                    <div class="quiz-meta">
                        <span>10 Questions</span>
                        <button class="btn btn-sm" onclick="startQuiz('level3')">Start</button>
                    </div>
                </div>

                <!-- Level 4 -->
                <div class="card quiz-level-card">
                    <h3>Level 4: Abetment</h3>
                    <p>Abetment & Criminal Conspiracy</p>
                    <div class="quiz-meta">
                        <span>10 Questions</span>
                        <button class="btn btn-sm" onclick="startQuiz('level4')">Start</button>
                    </div>
                </div>

                <!-- Level 5 -->
                <div class="card quiz-level-card">
                    <h3>Level 5: State Offences</h3>
                    <p>Waging War & Sedition</p>
                    <div class="quiz-meta">
                        <span>10 Questions</span>
                        <button class="btn btn-sm" onclick="startQuiz('level5')">Start</button>
                    </div>
                </div>

                <!-- Level 6 -->
                <div class="card quiz-level-card">
                    <h3>Level 6: Public Peace</h3>
                    <p>Unlawful Assembly & Rioting</p>
                    <div class="quiz-meta">
                        <span>10 Questions</span>
                        <button class="btn btn-sm" onclick="startQuiz('level6')">Start</button>
                    </div>
                </div>

                <!-- Level 7 -->
                <div class="card quiz-level-card">
                    <h3>Level 7: Public Servants</h3>
                    <p>Bribery & Contempt of Authority</p>
                    <div class="quiz-meta">
                        <span>10 Questions</span>
                        <button class="btn btn-sm" onclick="startQuiz('level7')">Start</button>
                    </div>
                </div>

                <!-- Level 8 -->
                <div class="card quiz-level-card">
                    <h3>Level 8: Body Offences</h3>
                    <p>Murder, Hurt, Kidnapping</p>
                    <div class="quiz-meta">
                        <span>10 Questions</span>
                        <button class="btn btn-sm" onclick="startQuiz('level8')">Start</button>
                    </div>
                </div>

                <!-- Level 9 -->
                <div class="card quiz-level-card">
                    <h3>Level 9: Property</h3>
                    <p>Theft, Extortion, Robbery</p>
                    <div class="quiz-meta">
                        <span>10 Questions</span>
                        <button class="btn btn-sm" onclick="startQuiz('level9')">Start</button>
                    </div>
                </div>

                <!-- Level 10 -->
                <div class="card quiz-level-card">
                    <h3>Level 10: Cyber & Misc</h3>
                    <p>Defamation, Intimidation & IT Act</p>
                    <div class="quiz-meta">
                        <span>10 Questions</span>
                        <button class="btn btn-sm" onclick="startQuiz('level10')">Start</button>
                    </div>
                </div>
                
                 <!-- Coming Soon -->
                <div class="card quiz-level-card coming-soon">
                    <h3>Level 11+</h3>
                    <p>Advanced Case Studies</p>
                    <div class="quiz-meta">
                        <span class="badge-coming-soon">Coming Soon</span>
                    </div>
                </div>
                
            </div>
            <div id="quiz-area" class="quiz-container" style="margin-top:2rem; display:none;"></div>
        </div>
    `,
    chat: `
        <div class="content-container">
            <button class="back-btn" onclick="loadModule('dashboard')"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
            <div style="display:flex; align-items:center; margin-bottom: 1.5rem;">
                <h2 style="margin-bottom:0;"><i class="fas fa-comments"></i> Legal Chat Assistant</h2>
            </div>
            
            <div class="card" style="height: 600px; display:flex; flex-direction:column; position:relative; overflow:hidden;">
                <div id="chat-history" style="flex-grow:1; border:1px solid #eee; padding:1rem; overflow-y:auto; margin-bottom:1rem; border-radius:6px; background:#f9f9f9;">
                    <div class="chat-msg bot-msg" style="margin-bottom:1rem;">
                        <div style="display:inline-block; background:#fff; border:1px solid #e5e7eb; padding:0.75rem 1rem; border-radius:15px 15px 15px 0; max-width:85%;">
                            <strong>Bot:</strong> Hello! I am your legal assistant. I can help you find relevant IPC sections. Try asking "What is the punishment for theft?"
                        </div>
                    </div>
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <input type="text" id="chat-input" placeholder="Type your legal query here..." style="flex-grow:1; padding:0.75rem; border:1px solid #d1d5db; border-radius:4px;" onkeypress="if(event.key==='Enter') sendChat()">
                    <button class="btn" style="width:auto;" onclick="sendChat()"><i class="fas fa-paper-plane"></i> Send</button>
                </div>
            </div>
        </div>
    `,
    profile: `
        <div class="content-container">
            <button class="back-btn" onclick="loadModule('dashboard')"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
            
            <div class="card" style="padding:0; overflow:hidden; border:none;">
                <div class="profile-banner">
                    <div class="profile-avatar-large">U</div>
                </div>
                <div style="padding: 1rem 2rem 2rem 2rem; display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap;">
                    <div style="margin-top: 10px; margin-left: 140px;">
                        <h2 id="profile-name" style="margin-bottom: 0.2rem; font-size: 2rem;">User Name</h2>
                        <p id="profile-role" style="color: var(--text-light);"><i class="fas fa-user-tag"></i> Public Member</p>
                    </div>
                    <div style="margin-top:1rem;">
                         <button class="btn" style="background-color: var(--danger); padding: 0.5rem 1.5rem;" onclick="logout()">
                            <i class="fas fa-sign-out-alt"></i> Logout
                         </button>
                    </div>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="stat-grid" style="margin-top: 2rem;">
                <div class="stat-card">
                    <i class="fas fa-clipboard-list" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 0.5rem;"></i>
                    <h3 id="stat-quiz-count">0</h3>
                    <p style="color: var(--text-light); font-size: 0.9rem;">Quizzes Taken</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-star" style="font-size: 2rem; color: #f59e0b; margin-bottom: 0.5rem;"></i>
                    <h3 id="stat-quiz-score">0%</h3>
                    <p style="color: var(--text-light); font-size: 0.9rem;">Avg Score</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-gavel" style="font-size: 2rem; color: var(--secondary-color); margin-bottom: 0.5rem;"></i>
                    <h3 id="stat-pred-count">0</h3>
                    <p style="color: var(--text-light); font-size: 0.9rem;">Cases Analyzed</p>
                </div>
                 <div class="stat-card">
                    <i class="fas fa-calendar-alt" style="font-size: 2rem; color: #10b981; margin-bottom: 0.5rem;"></i>
                    <h3 id="stat-joined" style="font-size:1.2rem; margin-top:0.5rem;">Feb 2026</h3>
                    <p style="color: var(--text-light); font-size: 0.9rem;">Member Since</p>
                </div>
            </div>

            <div class="grid-container" style="grid-template-columns: 1fr 1fr;">
                <!-- Personal Info -->
                 <div class="card">
                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        <i class="fas fa-id-card"></i> Personal Details
                    </h3>
                    <div class="profile-details-grid" style="gap: 1.5rem;">
                        <div class="detail-item">
                            <label style="font-weight:600; font-size:0.85rem; color:var(--text-light);">Username</label>
                            <div id="detail-name" style="font-size:1.1rem; color:var(--text-color);">User Name</div>
                        </div>
                        <div class="detail-item">
                            <label style="font-weight:600; font-size:0.85rem; color:var(--text-light);">Email Address</label>
                            <div id="detail-email" style="font-size:1.1rem; color:var(--text-color);">user@example.com</div>
                        </div>
                        <div class="detail-item">
                             <label style="font-weight:600; font-size:0.85rem; color:var(--text-light);">Account Status</label>
                            <div style="font-size:1rem; color:#10b981;"><i class="fas fa-check-circle"></i> Active</div>
                        </div>
                         <div class="detail-item">
                             <label style="font-weight:600; font-size:0.85rem; color:var(--text-light);">Subscription</label>
                            <div style="font-size:1rem; color:var(--secondary-color);"><i class="fas fa-crown"></i> Free Plan</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="card">
                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        <i class="fas fa-history"></i> Recent Activity
                    </h3>
                    <div id="activity-list" style="padding-left:0.5rem;">
                         <!-- Timeline items will be injected here -->
                         <div class="timeline-item">
                            <strong>Welcome to InsaafAI</strong>
                            <p style="font-size:0.85rem; color:var(--text-light);">You joined the platform.</p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

// Check if we need to add a dashboard module handler or just reload
// If we want Back to Dashboard to work using loadModule('dashboard'), we need to define it or handle it.
// Since Dashboard is the default page content, reloading or redirecting is easiest.
if (!modules.dashboard) {
    modules.dashboard = null; // Marker to handle in loadModule
}

function loadModule(moduleName) {
    if (moduleName === 'dashboard') {
        window.location.href = '/dashboard';
        return;
    }

    const container = document.getElementById('dynamic-content');
    if (modules[moduleName]) {
        container.innerHTML = modules[moduleName];
        if (moduleName === 'profile') loadProfileData();
        updateSidebarActive(moduleName);
    } else {
        container.innerHTML = '<p>Module not found.</p>';
    }
}

function updateSidebarActive(moduleName) {
    // Remove active class from all links
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => link.classList.remove('active'));

    // Add active class to current module link
    const activeLink = document.getElementById('nav-' + moduleName);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Mobile Nav Logic
    const mobileLinks = document.querySelectorAll('.mobile-bottom-nav a');
    mobileLinks.forEach(link => link.classList.remove('active'));
    const activeMobile = document.getElementById('mobile-nav-' + moduleName);
    if (activeMobile) {
        activeMobile.classList.add('active');
    }
}

async function loadProfileData() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('profile-name').textContent = user.username;
        document.getElementById('detail-name').textContent = user.username;
        // document.getElementById('profile-email').textContent = user.email || 'user@example.com';
        document.getElementById('detail-email').textContent = user.email || 'user@example.com';
        // initials
        const avatar = document.querySelector('.profile-avatar-large');
        if (avatar) avatar.textContent = user.username.charAt(0).toUpperCase();

        // Fetch Stats
        try {
            const statsRes = await fetchUserStats();
            document.getElementById('stat-quiz-count').textContent = statsRes.stats.quizzes_taken;
            document.getElementById('stat-quiz-score').textContent = statsRes.stats.average_quiz_score;
            document.getElementById('stat-pred-count').textContent = statsRes.stats.predictions_made;
            // Format Join Date
            if (statsRes.joined_at) {
                const date = new Date(statsRes.joined_at);
                const options = { year: 'numeric', month: 'short' };
                document.getElementById('stat-joined').textContent = date.toLocaleDateString('en-US', options);
            }
        } catch (e) {
            console.error("Failed to load stats", e);
        }

        // Fetch History
        try {
            const histRes = await fetchUserHistory();
            const activityList = document.getElementById('activity-list');

            if (histRes.length > 0) {
                activityList.innerHTML = histRes.slice(0, 5).map(h => `
                    <div class="timeline-item">
                        <strong style="color:var(--text-color);">${h.prediction}</strong>
                        <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom:0.2rem;">${h.crime.substring(0, 40)}...</p>
                        <span style="font-size: 0.75rem; color: #9ca3af; background:#f3f4f6; padding:2px 8px; border-radius:10px;">${h.date}</span>
                    </div>
                `).join('');
            } else {
                activityList.innerHTML = `
                    <div class="timeline-item">
                        <strong>New Journey</strong>
                        <p style="font-size:0.85rem; color:var(--text-light);">No recent activities. Start by analyzing a case!</p>
                     </div>`;
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }
}


// Helper for IPC tags
function toggleIpc(btn) {
    btn.classList.toggle('selected');
}

function addIpcFromSelect(select) {
    if (select.value) {
        const container = document.getElementById('ipc-tags-container');
        // Check if already exists
        const existing = Array.from(container.getElementsByClassName('ipc-tag')).find(b => b.textContent.includes(select.value));
        if (!existing) {
            const btn = document.createElement('button');
            btn.className = 'ipc-tag selected'; // Auto-select added ones
            btn.textContent = '§ ' + select.value;
            btn.onclick = function () { toggleIpc(this); };
            // Insert before the select dropdown
            container.insertBefore(btn, select);
        }
        select.value = ""; // Reset dropdown
    }
}


function handleFileUpload(input) {
    if (input.files && input.files[0]) {
        document.getElementById('upload-text').textContent = `Selected: ${input.files[0].name}`;
    }
}

function resetPrediction() {
    document.getElementById('crime-type').value = "";
    document.getElementById('crime-desc').value = "";
    document.querySelectorAll('.ipc-tag').forEach(b => b.classList.remove('selected'));
    document.getElementById('prediction-result').style.display = 'none';
    document.getElementById('prediction-placeholder').style.display = 'block';
}

async function runPrediction() {
    const desc = document.getElementById('crime-desc').value;
    const crimeType = document.getElementById('crime-type').value;

    // Get selected IPCs
    const selectedIpcs = Array.from(document.querySelectorAll('.ipc-tag.selected')).map(b => b.textContent.replace('§ ', ''));

    if (!desc && !crimeType) return alert("Please provide at least a crime type or description.");

    const resultBox = document.getElementById('prediction-result');
    const placeholder = document.getElementById('prediction-placeholder');

    placeholder.style.display = 'none';
    resultBox.style.display = 'block';
    resultBox.innerHTML = '<div style="text-align:center; padding:2rem;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Analyzing Evidence and IPC Sections...</p></div>';

    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const fileInput = document.getElementById('file-upload');
        const file = fileInput.files[0];

        const formData = new FormData();
        formData.append('description', desc);
        formData.append('crime_type', crimeType);
        formData.append('sections', JSON.stringify(selectedIpcs));
        if (user) formData.append('user_id', user.id);
        if (file) formData.append('document', file);

        // API Call with FormData (no Content-Type header, browser sets it)
        const response = await fetch('/api/predict', {
            method: 'POST',
            body: formData
        });
        const res = await response.json();

        // Save to History (Directly to Firestore since Backend is now stateless)
        if (user) {
            savePredictionToHistory({
                description: desc,
                outcome: res.outcome,
                ipc_section: res.ipc_section
            });
        }

        resultBox.innerHTML = `
            <div class="prediction-result-card">
                <div class="result-outcome">Outcome: ${res.outcome}</div>
                
                <div class="result-info-grid">
                    <div class="info-box">
                        <span class="info-label">Confidence</span>
                        <span class="info-value">${res.probability}</span>
                    </div>
                    <div class="info-box">
                        <span class="info-label">Applicable Section</span>
                        <span class="info-value">${res.ipc_section}</span>
                    </div>
                </div>

                <div style="margin-bottom: 1rem;">
                    <span class="result-section-title">Explanation:</span>
                    <p class="result-text" style="display:inline;">${res.explanation}</p>
                </div>



                <div style="padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                    <span class="result-section-title">Recommended Action:</span>
                    <p class="result-text">${res.action || 'Consult a lawyer for further steps.'}</p>
                </div>

                ${res.section_details && res.section_details.length > 0 ? `
                <div style="padding-top: 1rem; border-top: 1px solid #e5e7eb; margin-top: 1rem;">
                    <span class="result-section-title">Related IPC Sections (Detected):</span>
                    ${res.section_details.map(sec => `
                        <div style="background: #f8fafc; padding: 10px; border-radius: 6px; margin-top: 10px; border: 1px solid #e2e8f0;">
                            <strong style="color: var(--primary-color);">Section ${sec.section}: ${sec.title}</strong>
                            <p style="font-size: 0.9rem; color: #64748b; margin-top: 5px;">${sec.description.substring(0, 150)}...</p>
                            <button onclick="document.getElementById('nav-ipc').click(); setTimeout(() => { document.getElementById('ipc-search').value = '${sec.section}'; searchIPC(); }, 500);" style="background:none; border:none; color: var(--primary-color); cursor: pointer; padding: 0; font-size: 0.85rem; text-decoration: underline;">Read Full Section</button>
                        </div>
                    `).join('')}
                </div>` : ''}
            </div>
        `;
    } catch (err) {
        resultBox.innerHTML = `<p style="color:var(--danger); text-align:center;">Error: ${err.message}</p>`;
    }
}

async function searchIPC() {
    const query = document.getElementById('ipc-search').value.trim();
    const lang = document.getElementById('ipc-lang').value;
    const resultBox = document.getElementById('ipc-result');
    resultBox.style.display = 'block';

    if (!query) {
        resultBox.innerHTML = '<p>Please enter a section number.</p>';
        return;
    }

    resultBox.innerHTML = '<p>Searching database...</p>';

    try {
        const response = await fetch('/api/ipc/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query, lang: lang })
        });

        const data = await response.json();

        if (response.ok) {
            resultBox.innerHTML = `
                <h3>IPC Section ${data.section}</h3>
                <h4>${data.title}</h4>
                <p><strong>Chapter:</strong> ${data.chapter}</p>
                <div style="max-height: 300px; overflow-y: auto; text-align: left; padding: 10px; background: #f9f9f9; border-radius: 8px;">
                    <p style="white-space: pre-wrap;">${data.description}</p>
                </div>
                <a href="https://indiankanoon.org/search/?formInput=${query}" target="_blank" style="color:var(--primary-color); margin-top: 10px; display: inline-block;">Read more on Indian Kanoon</a>
            `;
        } else {
            resultBox.innerHTML = `<p>${data.message || 'Section not found.'}</p>`;
        }
    } catch (err) {
        console.error(err);
        resultBox.innerHTML = '<p>Error searching IPC database.</p>';
    }
}

async function sendChat() {
    const input = document.getElementById('chat-input');
    const history = document.getElementById('chat-history');
    const msg = input.value.trim();
    if (!msg) return;

    // User Message
    history.innerHTML += `
        <div class="chat-msg user-msg" style="text-align:right; margin-bottom:1rem;">
            <div style="display:inline-block; background:var(--primary-color); color:white; padding:0.75rem 1rem; border-radius:15px 15px 0 15px; max-width:80%; text-align:left;">
                ${msg}
            </div>
        </div>
    `;
    input.value = '';
    history.scrollTop = history.scrollHeight;

    // Loading Indicator
    const loadingId = 'loading-' + Date.now();
    history.innerHTML += `
        <div id="${loadingId}" class="chat-msg bot-msg" style="margin-bottom:1rem;">
            <div style="display:inline-block; background:#fff; border:1px solid #e5e7eb; padding:0.75rem 1rem; border-radius:15px 15px 15px 0; max-width:85%;">
                <i class="fas fa-spinner fa-spin"></i> Analyzing IPC database...
            </div>
        </div>
    `;
    history.scrollTop = history.scrollHeight;

    try {
        const response = await fetch('/api/assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: msg })
        });
        const data = await response.json();

        // Remove loading
        const loader = document.getElementById(loadingId);
        if (loader) loader.remove();

        let botResponseHtml = '';

        if (response.ok && data.matches && data.matches.length > 0) {
            const best = data.matches[0];
            botResponseHtml = `
                <strong>Section ${best.matched_section}: ${best.section_title}</strong><br><br>
                ${best.legal_description}<br><br>
                <div style="background:#f0fdf4; padding:8px; border-radius:4px; border:1px solid #bbf7d0; font-size:0.9rem;">
                    <strong>💡 Explanation:</strong> ${best.simplified_explanation}
                </div>
                <div style="margin-top:5px; font-size:0.8rem; color:#666;">Confidence: ${Math.round(best.confidence * 100)}%</div>
            `;
        } else {
            botResponseHtml = data.message || "I couldn't find a specific IPC section for that. Please try rephrasing.";
        }

        history.innerHTML += `
            <div class="chat-msg bot-msg" style="margin-bottom:1rem;">
                <div style="display:inline-block; background:#fff; border:1px solid #e5e7eb; padding:0.75rem 1rem; border-radius:15px 15px 15px 0; max-width:85%;">
                    ${botResponseHtml}
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Chat Error:", error);
        const loader = document.getElementById(loadingId);
        if (loader) loader.remove();

        history.innerHTML += `
            <div class="chat-msg bot-msg" style="margin-bottom:1rem;">
                <div style="display:inline-block; background:#fff; border:1px solid #e5e7eb; padding:0.75rem 1rem; border-radius:15px 15px 15px 0; max-width:85%; color: var(--danger);">
                    Error: Could not connect to the AI Assistant.
                </div>
            </div>
        `;
    }
    history.scrollTop = history.scrollHeight;
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target.closest('button');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.style.background = '#10b981';
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.background = 'var(--secondary-color)';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy: ', err);
    });
}


// Quiz Data (Mock)
// Quiz Data (Expanded to 10 Levels)
const quizzes = {
    level1: [
        { q: "Which section defines the 'Title and extent of operation of the Code'?", options: ["Section 1", "Section 2", "Section 5", "Section 10"], answer: 0 },
        { q: "Section 2 deals with punishment of offences committed...?", options: ["Outside India", "Within India", "By Foreigners only", "On Ships"], answer: 1 },
        { q: "\"Gender\" is defined in which section?", options: ["Section 8", "Section 9", "Section 10", "Section 11"], answer: 0 },
        { q: "What does Section 11 define?", options: ["Man", "Woman", "Person", "Public"], answer: 2 },
        { q: "Section 21 defines which important term?", options: ["Judge", "Public Servant", "Court of Justice", "Government"], answer: 1 },
        { q: "\"Dishonestly\" is defined under:", options: ["Section 23", "Section 24", "Section 25", "Section 26"], answer: 1 },
        { q: "Section 34 deals with:", options: ["Common Object", "Common Intention", "Abetment", "Conspiracy"], answer: 1 },
        { q: "What is \"Voluntarily\" defined in?", options: ["Section 39", "Section 40", "Section 41", "Section 42"], answer: 0 },
        { q: "Section 52 defines:", options: ["Good Faith", "Oath", "Harbour", "Injury"], answer: 0 },
        { q: "Who is a \"Judge\" according to IPC?", options: ["Section 19", "Section 20", "Section 18", "Section 17"], answer: 0 }
    ],
    level2: [
        { q: "Section 53 lists how many types of punishments?", options: ["3", "4", "5", "6"], answer: 2 },
        { q: "Imprisonment for life is equivalent to how many years for calculation (Sec 57)?", options: ["14", "20", "25", "Life means life"], answer: 1 },
        { q: "Section 73 deals with:", options: ["Solitary Confinement", "Simple Imprisonment", "Capital Punishment", "Forfeiture"], answer: 0 },
        { q: "Maximum limit of Solitary Confinement is?", options: ["1 Month", "2 Months", "3 Months", "6 Months"], answer: 2 },
        { q: "Section 63 states that where no sum is expressed, the fine shall be:", options: ["Unlimited but not excessive", "Limited to 10,000", "Limited to 1 Lakh", "Fixed by Govt"], answer: 0 },
        { q: "Commutation of death sentence is covered under:", options: ["Section 54", "Section 55", "Section 53", "Section 52"], answer: 0 },
        { q: "Section 75 deals with:", options: ["Enhanced punishment for certain offences", "Punishment for murder", "Theft", "Fine only"], answer: 0 },
        { q: "Can a person be punished twice for the same offence?", options: ["Yes", "No (Section 71)", "Depends on Judge", "Only in civil cases"], answer: 1 },
        { q: "Solitary confinement cannot exceed ___ days at a time.", options: ["7", "14", "21", "28"], answer: 1 },
        { q: "What is the lowest duration of imprisonment generally presumed if not specified?", options: ["24 hours", "Till rising of court", "1 month", "There is no minimum"], answer: 1 }
    ],
    level3: [
        { q: "Which Chapter deals with General Exceptions?", options: ["Chapter III", "Chapter IV", "Chapter V", "Chapter VI"], answer: 1 },
        { q: "Section 76 protects acts done by a person bound by law or by mistake of...?", options: ["Fact", "Law", "Both", "None"], answer: 0 },
        { q: "Act of a judge when acting judicially is protected under:", options: ["Section 76", "Section 77", "Section 78", "Section 79"], answer: 1 },
        { q: "Section 82: Nothing is an offence which is done by a child under...?", options: ["5 years", "7 years", "12 years", "14 years"], answer: 1 },
        { q: "Act of a person of unsound mind is protected under:", options: ["Section 84", "Section 85", "Section 86", "Section 83"], answer: 0 },
        { q: "Right of private defense of body extends to causing death in cases of:", options: ["Theft", "Assault", "Fear of death/GBH (Section 100)", "Trespass"], answer: 2 },
        { q: "Intoxication against will is a defense under:", options: ["Section 85", "Section 86", "Section 84", "Section 87"], answer: 0 },
        { q: "Section 96 to 106 deals with:", options: ["Private Defense", "Abetment", "Conspiracy", "Public Servants"], answer: 0 },
        { q: "Is 'accident' a defense?", options: ["Yes (Section 80)", "No", "Only in traffic cases", "Only for children"], answer: 0 },
        { q: "Act done in good faith for benefit of a person without consent:", options: ["Section 92", "Section 93", "Section 94", "Section 95"], answer: 0 }
    ],
    level4: [
        { q: "Abetment is defined in:", options: ["Section 107", "Section 108", "Section 109", "Section 110"], answer: 0 },
        { q: "Criminal Conspiracy was added by which amendment?", options: ["1913", "1950", "1870", "2013"], answer: 0 },
        { q: "Definition of Criminal Conspiracy is in:", options: ["Section 120", "Section 120A", "Section 121", "Section 107"], answer: 1 },
        { q: "Punishment for Criminal Conspiracy:", options: ["Section 120A", "Section 120B", "Section 121", "Section 109"], answer: 1 },
        { q: "Abettor is defined in:", options: ["Section 107", "Section 108", "Section 108A", "Section 109"], answer: 1 },
        { q: "Abetment of a thing can be by:", options: ["Instigation", "Conspiracy", "Aid", "All of the above"], answer: 3 },
        { q: "Section 114: Abettor present when offence is committed is deemed to have...", options: ["Committed the offence", "Abetted only", "No liability", "Witnessed it"], answer: 0 },
        { q: "Concealing design to commit offence punishable with death:", options: ["Section 118", "Section 119", "Section 120", "Section 115"], answer: 0 },
        { q: "If abetted act is not committed, punishment is provided in:", options: ["Section 115 & 116", "Section 109", "Section 110", "No punishment"], answer: 0 },
        { q: "Harbouring an offender is generally punishable under:", options: ["Section 130", "Section 136", "Section 212", "Section 216"], answer: 2 }
    ],
    level5: [
        { q: "Waging war against the Government of India is punishable under:", options: ["Section 121", "Section 122", "Section 123", "Section 124A"], answer: 0 },
        { q: "Sedition is defined in:", options: ["Section 121A", "Section 124A", "Section 153A", "Section 505"], answer: 1 },
        { q: "Collecting arms with intention of waging war:", options: ["Section 122", "Section 121", "Section 123", "Section 124"], answer: 0 },
        { q: "Assaulting President or Governor with intent to compel/restrain:", options: ["Section 124", "Section 125", "Section 126", "Section 121"], answer: 0 },
        { q: "Conspiracy to wage war (Section 121A) punishable by:", options: ["Death", "Life Imprisonment", "10 Years", "Any of the above"], answer: 1 },
        { q: "Waging war against Asiatic Power in alliance with Govt of India:", options: ["Section 125", "Section 126", "Section 127", "Section 128"], answer: 0 },
        { q: "Permitting escape of state prisoner:", options: ["Section 128-130", "Section 121", "Section 110", "Section 124A"], answer: 0 },
        { q: "Sedition punishment can extend up to:", options: ["3 years", "Life Imprisonment", "Both", "7 years"], answer: 2 },
        { q: "Wearing garb of soldier, sailor, airman to deceive:", options: ["Section 140", "Section 171", "Section 170", "Section 419"], answer: 0 },
        { q: "Harbouring a deserter:", options: ["Section 136", "Section 130", "Section 212", "Section 131"], answer: 0 }
    ],
    level6: [
        { q: "Unlawful Assembly requires minimum how many persons?", options: ["3", "4", "5", "7"], answer: 2 },
        { q: "Unlawful Assembly is defined in:", options: ["Section 141", "Section 142", "Section 143", "Section 144"], answer: 0 },
        { q: "Rioting is defined in:", options: ["Section 145", "Section 146", "Section 147", "Section 148"], answer: 1 },
        { q: "Punishment for Rioting:", options: ["Section 147", "Section 148", "Section 146", "Section 151"], answer: 0 },
        { q: "Rioting armed with deadly weapon:", options: ["Section 147", "Section 148", "Section 144", "Section 149"], answer: 1 },
        { q: "Every member of unlawful assembly guilty of offence committed in prosecution of common object:", options: ["Section 34", "Section 149", "Section 120B", "Section 114"], answer: 1 },
        { q: "Affray is defined in:", options: ["Section 159", "Section 160", "Section 146", "Section 141"], answer: 0 },
        { q: "Punishment for Affray:", options: ["1 month", "3 months", "6 months", "1 year"], answer: 0 },
        { q: "Assaulting public servant suppressing riot:", options: ["Section 152", "Section 153", "Section 353", "Section 186"], answer: 0 },
        { q: "Wantonly giving provocation with intent to cause riot:", options: ["Section 153", "Section 153A", "Section 504", "Section 295A"], answer: 0 }
    ],
    level7: [
        { q: "Public servant taking gratification (bribery) - Repealed/Replaced by:", options: ["PCA 1988", "Section 161 (still active)", "Section 162", "Section 165"], answer: 0 },
        { q: "Disobeying law by public servant with intent to cause injury:", options: ["Section 166", "Section 167", "Section 168", "Section 169"], answer: 0 },
        { q: "Public servant unlawfully engaging in trade:", options: ["Section 168", "Section 169", "Section 170", "Section 171"], answer: 0 },
        { q: "Personating a public servant:", options: ["Section 170", "Section 171", "Section 419", "Section 420"], answer: 0 },
        { q: "Absconding to avoid service of summons:", options: ["Section 172", "Section 173", "Section 174", "Section 175"], answer: 0 },
        { q: "Non-attendance in obedience to an order from public servant:", options: ["Section 174", "Section 175", "Section 188", "Section 179"], answer: 0 },
        { q: "Furnishing false information:", options: ["Section 177", "Section 181", "Section 182", "Section 191"], answer: 0 },
        { q: "Obstructing public servant in discharge of public functions:", options: ["Section 186", "Section 353", "Section 332", "Section 189"], answer: 0 },
        { q: "Disobedience to order duly promulgated by public servant:", options: ["Section 188", "Section 186", "Section 144", "Section 187"], answer: 0 },
        { q: "Threat of injury to public servant:", options: ["Section 189", "Section 190", "Section 186", "Section 353"], answer: 0 }
    ],
    level8: [
        { q: "Culpable Homicide is defined in:", options: ["Section 299", "Section 300", "Section 302", "Section 304"], answer: 0 },
        { q: "Murder is defined in:", options: ["Section 299", "Section 300", "Section 301", "Section 302"], answer: 1 },
        { q: "Punishment for Murder:", options: ["Section 300", "Section 302", "Section 304", "Section 307"], answer: 1 },
        { q: "Causing death by negligence:", options: ["Section 304A", "Section 304B", "Section 279", "Section 336"], answer: 0 },
        { q: "Dowry Death is dealt with in:", options: ["Section 304B", "Section 302", "Section 498A", "Section 306"], answer: 0 },
        { q: "Abetment of suicide:", options: ["Section 305", "Section 306", "Section 309", "Section 300"], answer: 1 },
        { q: "Attempt to Murder:", options: ["Section 307", "Section 308", "Section 324", "Section 511"], answer: 0 },
        { q: "Thug is defined in:", options: ["Section 310", "Section 311", "Section 378", "Section 383"], answer: 0 },
        { q: "Causing Miscarriage:", options: ["Section 312", "Section 313", "Section 314", "Section 315"], answer: 0 },
        { q: "Hurt and Grievous Hurt definitions:", options: ["Section 319 & 320", "Section 321 & 322", "Section 323 & 325", "Section 324 & 326"], answer: 0 }
    ],
    level9: [
        { q: "Theft is defined in:", options: ["Section 378", "Section 379", "Section 380", "Section 381"], answer: 0 },
        { q: "Punishment for Theft:", options: ["Section 378", "Section 379", "Section 380", "Section 382"], answer: 1 },
        { q: "Extortion is defined in:", options: ["Section 383", "Section 384", "Section 390", "Section 391"], answer: 0 },
        { q: "Robbery definition:", options: ["Section 390", "Section 391", "Section 392", "Section 393"], answer: 0 },
        { q: "Dacoity requires minimum persons:", options: ["3", "4", "5", "7"], answer: 2 },
        { q: "Punishment for Dacoity:", options: ["Section 395", "Section 396", "Section 397", "Section 391"], answer: 0 },
        { q: "Criminal Misappropriation of Property:", options: ["Section 403", "Section 404", "Section 405", "Section 406"], answer: 0 },
        { q: "Criminal Breach of Trust:", options: ["Section 405", "Section 406", "Section 409", "Section 420"], answer: 0 },
        { q: "Cheating is defined in:", options: ["Section 415", "Section 416", "Section 417", "Section 420"], answer: 0 },
        { q: "Cheating and dishonestly inducing delivery of property:", options: ["Section 420", "Section 419", "Section 417", "Section 406"], answer: 0 }
    ],
    level10: [
        { q: "Mischief is defined in:", options: ["Section 425", "Section 426", "Section 427", "Section 440"], answer: 0 },
        { q: "Criminal Trespass:", options: ["Section 441", "Section 442", "Section 447", "Section 448"], answer: 0 },
        { q: "House-breaking:", options: ["Section 445", "Section 446", "Section 453", "Section 456"], answer: 0 },
        { q: "Forgery is defined in:", options: ["Section 463", "Section 464", "Section 465", "Section 468"], answer: 0 },
        { q: "Defamation is defined in:", options: ["Section 499", "Section 500", "Section 501", "Section 502"], answer: 0 },
        { q: "Punishment for Defamation:", options: ["Section 500", "Section 501", "Section 502", "Section 499"], answer: 0 },
        { q: "Criminal Intimidation:", options: ["Section 503", "Section 506", "Section 504", "Section 509"], answer: 0 },
        { q: "Word, gesture or act intended to insult the modesty of a woman:", options: ["Section 509", "Section 354", "Section 376", "Section 498A"], answer: 0 },
        { q: "Attempt to commit offences punishable with imprisonment (where no express provision):", options: ["Section 511", "Section 510", "Section 500", "Section 109"], answer: 0 },
        { q: "Information Technology Act 2000 supplements IPC for:", options: ["Cyber Crimes", "Murder", "Theft", "Dacoity"], answer: 0 }
    ]
};

let currentQuiz = [];
let glbCurrentIndex = 0;
let glbScore = 0;
let currentQuizType = '';

function startQuiz(type) {
    currentQuiz = quizzes[type] || quizzes['ipc_basics'];
    currentQuizType = type;
    glbCurrentIndex = 0;
    glbScore = 0;

    // Hide buttons, show quiz area
    document.getElementById('quiz-area').style.display = 'block';
    renderQuestion();
}

function renderQuestion() {
    const container = document.getElementById('quiz-area');
    if (glbCurrentIndex >= currentQuiz.length) {
        showResults();
        return;
    }

    const q = currentQuiz[glbCurrentIndex];

    let optionsHtml = '';
    q.options.forEach((opt, idx) => {
        optionsHtml += `<button class="quiz-option" onclick="checkAnswer(this, ${idx})">${opt}</button>`;
    });

    container.innerHTML = `
        <div class="quiz-card">
            <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                <span style="font-size:0.9rem; color:var(--text-light);">Question ${glbCurrentIndex + 1} of ${currentQuiz.length}</span>
                <span tyle="font-size:0.9rem; font-weight:bold;">Score: ${glbScore}</span>
            </div>
            
            <h3 style="margin-bottom:1.5rem;">${q.q}</h3>
            
            <div id="options-container">
                ${optionsHtml}
            </div>

            <div id="next-btn-container" style="margin-top:1.5rem; text-align:right; display:none;">
                <button class="btn" style="width:auto;" onclick="nextQuestion()">Next Question <i class="fas fa-arrow-right"></i></button>
            </div>
        </div>
    `;
}

function checkAnswer(btn, selectedIdx) {
    const q = currentQuiz[glbCurrentIndex];
    const parent = document.getElementById('options-container');
    const options = parent.getElementsByClassName('quiz-option');

    // Disable all clicks
    Array.from(options).forEach(opt => opt.style.pointerEvents = 'none');

    if (selectedIdx === q.answer) {
        btn.classList.add('correct');
        glbScore++;
    } else {
        btn.classList.add('incorrect');
        // Highlight correct one
        options[q.answer].classList.add('correct');
    }

    document.getElementById('next-btn-container').style.display = 'block';
}

function nextQuestion() {
    glbCurrentIndex++;
    renderQuestion();
}

function showResults() {
    const percentage = Math.round((glbScore / currentQuiz.length) * 100);
    const container = document.getElementById('quiz-area');

    // Save Score
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        saveQuizScore(currentQuizType, percentage).catch(e => console.error("Could not save score", e));
    }

    container.innerHTML = `
        <div class="quiz-card" style="text-align:center;">
            <h3>Quiz Completed!</h3>
            <p style="color:var(--text-light); margin-bottom:2rem;">Here is how you performed</p>
            
            <div class="quiz-score-circle" style="background: conic-gradient(var(--primary-color) ${percentage}%, #e5e7eb ${percentage}%);">
                <div class="quiz-score-value">
                    ${percentage}%
                </div>
            </div>
            
            <p style="font-size:1.2rem; margin-bottom:0.5rem;">You scored <strong>${glbScore}</strong> out of <strong>${currentQuiz.length}</strong></p>
            
            <div style="margin-top:2rem;">
                <button class="btn" style="width:auto; margin-right:1rem;" onclick="loadModule('quiz')">Back to Quizzes</button>
                <button class="btn btn-secondary" style="width:auto;" onclick="startQuiz('ipc_basics')">Try Again</button>
            </div>
        </div>
    `;
}


// Detailed Learning Content
const learnTopics = {
    ipc_basics: `
        <h2><i class="fas fa-book"></i> Indian Penal Code (IPC) Basics</h2>
        <div class="learn-section">
            <p>The <strong>Indian Penal Code (IPC)</strong> is the official criminal code of India. It is a comprehensive code intended to cover all substantive aspects of criminal law.</p>
        </div>
        
        <div class="learn-section">
            <h4>History</h4>
            <p>Drafted in 1860 on the recommendations of the First Law Commission of India established in 1834. It came into force on 1st January 1862.</p>
        </div>

        <div class="learn-section">
            <h4>Structure</h4>
            <p>The Code is divided into <strong>23 Chapters</strong> and comprises <strong>511 Sections</strong>. It covers a wide range of offences, defining them and prescribing punishments.</p>
            <ul>
                <li><strong>Chapter I-V:</strong> General Explanations, Punishments, Exceptions.</li>
                <li><strong>Chapter VI-XV:</strong> Offences against the State, Public Tranquility, etc.</li>
                <li><strong>Chapter XVI:</strong> Offences affecting the Human Body.</li>
                <li><strong>Chapter XVII:</strong> Offences against Property.</li>
                <li><strong>Chapter XX:</strong> Offences relating to Marriage.</li>
            </ul>
        </div>
    `,

    general_exceptions: `
        <h2><i class="fas fa-shield-alt"></i> General Exceptions (Chapter IV)</h2>
        <div class="learn-section">
            <p>Sections 76 to 106 cover "General Exceptions". Acts falling under these are <strong>not considered crimes</strong>.</p>
        </div>

        <div class="learn-section">
            <h4>Key Defenses</h4>
            <ul>
                <li><strong>Mistake of Fact (Sec 76, 79):</strong> Act done by reason of a mistake of fact in good faith (e.g., soldier firing on mob by order).</li>
                <li><strong>Judicial Acts (Sec 77, 78):</strong> Acts of judges acting judicially.</li>
                <li><strong>Accident (Sec 80):</strong> Accident in doing a lawful act in a lawful manner.</li>
                <li><strong>Necessity (Sec 81):</strong> Act likely to cause harm, but done without criminal intent to prevent other harm.</li>
                <li><strong>Infancy (Sec 82, 83):</strong> Nothing is an offence which is done by a child under 7 years of age.</li>
                <li><strong>Insanity (Sec 84):</strong> Act of a person of unsound mind involved.</li>
                <li><strong>Intoxication (Sec 85, 86):</strong> Involuntary intoxication is a defense.</li>
            </ul>
        </div>

        <div class="learn-section">
            <h4>Right of Private Defense (Sec 96-106)</h4>
            <p>Every person has a right to defend their own body, and the body of any other person, against any offence affecting the human body.</p>
        </div>
    `,

    crimes_person: `
        <h2><i class="fas fa-user-injured"></i> Offences Affecting the Human Body</h2>
        <div class="learn-section">
            <p><strong>Chapter XVI (Sections 299-377)</strong> deals with offences affecting the life and body of individuals.</p>
        </div>

        <div class="learn-section">
            <h4>Homicide</h4>
            <ul>
                <li><strong>Culpable Homicide (Sec 299):</strong> Causing death with intention or knowledge.</li>
                <li><strong>Murder (Sec 300):</strong> Aggravated form of culpable homicide. Punishable under Section 302.</li>
                <li><strong>Dowry Death (Sec 304B):</strong> Death of a woman within 7 years of marriage due to dowry demands.</li>
            </ul>
        </div>

        <div class="learn-section">
            <h4>Hurt & Assault</h4>
            <ul>
                <li><strong>Hurt (Sec 319):</strong> Causing bodily pain, disease or infirmity.</li>
                <li><strong>Grievous Hurt (Sec 320):</strong> E.g., Emasculation, loss of eye/ear/limb, dangerous injuries.</li>
                <li><strong>Assault (Sec 351):</strong> Making a gesture to cause apprehension of force.</li>
                <li><strong>Kidnapping (Sec 359) & Abduction (Sec 362).</strong></li>
            </ul>
        </div>
    `,

    crimes_property: `
        <h2><i class="fas fa-home"></i> Offences Against Property</h2>
        <div class="learn-section">
            <p><strong>Chapter XVII (Sections 378-462)</strong> covers crimes related to property theft and damage.</p>
        </div>
        
        <div class="learn-section">
            <h4>Theft & Robbery</h4>
            <ul>
                <li><strong>Theft (Sec 378):</strong> Moving movable property out of possession without consent.</li>
                <li><strong>Extortion (Sec 383):</strong> Putting a person in fear of injury to deliver property.</li>
                <li><strong>Robbery (Sec 390):</strong> Theft or extortion coupled with violence or fear of death.</li>
                <li><strong>Dacoity (Sec 391):</strong> Robbery committed by 5 or more persons.</li>
            </ul>
        </div>

        <div class="learn-section">
            <h4>Others</h4>
            <ul>
                <li><strong>Criminal Breach of Trust (Sec 405):</strong> Misappropriating property entrusted to one.</li>
                <li><strong>Cheating (Sec 415):</strong> Deceiving a person to deliver property.</li>
                <li><strong>Mischief (Sec 425):</strong> Destroying or damaging property (e.g., killing cattle, diverting water).</li>
                <li><strong>Criminal Trespass (Sec 441):</strong> Entering property with intent to commit offence.</li>
            </ul>
        </div>
    `,

    women_child: `
        <h2><i class="fas fa-female"></i> Laws for Women & Children</h2>
        <div class="learn-section">
             <p>Special provisions in IPC and other acts protect women and children.</p>
        </div>

        <div class="learn-section">
            <h4>Key Sections</h4>
            <ul>
                <li><strong>Section 354:</strong> Assault or criminal force to woman with intent to outrage her modesty.</li>
                <li><strong>Section 354A:</strong> Sexual Harassment.</li>
                <li><strong>Section 354B:</strong> Assault or use of criminal force to woman with intent to disrobe.</li>
                <li><strong>Section 354C:</strong> Voyeurism.</li>
                <li><strong>Section 354D:</strong> Stalking.</li>
                <li><strong>Section 376:</strong> Punishment for Rape.</li>
                <li><strong>Section 498A:</strong> Husband or relative of husband of a woman subjecting her to cruelty (Dowry).</li>
            </ul>
        </div>
    `,

    public_order: `
        <h2><i class="fas fa-users"></i> Offences Against Public Tranquility</h2>
        <div class="learn-section">
            <p><strong>Chapter VIII (Sections 141-160)</strong> deals with maintaining public order.</p>
        </div>

        <div class="learn-section">
            <ul>
                <li><strong>Unlawful Assembly (Sec 141):</strong> Assembly of 5 or more persons with a common illegal object.</li>
                <li><strong>Rioting (Sec 146):</strong> Force or violence used by an unlawful assembly.</li>
                <li><strong>Affray (Sec 159):</strong> Two or more persons fighting in a public place disturbing public peace.</li>
                <li><strong>Promoting Enmity (Sec 153A):</strong> Promoting enmity between different groups on grounds of religion, race, etc.</li>
            </ul>
        </div>
    `,

    cyber_laws: `
        <h2><i class="fas fa-laptop-code"></i> Cyber Laws (IT Act 2000)</h2>
        <div class="learn-section">
            <p>While IPC applies, the <strong>Information Technology Act, 2000</strong> is the primary law for cyber crimes.</p>
        </div>

        <div class="learn-section">
             <h4>Key Offences</h4>
             <ul>
                <li><strong>Section 66:</strong> Computer Related Offences (Hacking).</li>
                <li><strong>Section 66C:</strong> Identity Theft.</li>
                <li><strong>Section 66D:</strong> Cheating by personation by using computer resource.</li>
                <li><strong>Section 67:</strong> Publishing or transmitting obscene material in electronic form.</li>
             </ul>
        </div>
    `,

    defamation: `
        <h2><i class="fas fa-comment-slash"></i> Defamation (Chapter XXI)</h2>
         <div class="learn-section">
            <p><strong>Section 499</strong> defines Defamation.</p>
            <p>Whoever, by words unlawful, spoken or intended to be read, or by signs or by visible representations, makes or publishes any imputation concerning any person intending to harm the reputation of such person.</p>
        </div>
        <div class="learn-section">
            <h4>Exceptions</h4>
            <ul>
                <li>Imputation of truth which public good requires to be made or published.</li>
                <li>Public conduct of public servants.</li>
                <li>Conduct of any person touching any public question.</li>
            </ul>
            <p><strong>Punishment (Sec 500):</strong> Simple imprisonment for a term which may extend to two years, or with fine, or with both.</p>
        </div>
    `,

    conspiracy: `
        <h2><i class="fas fa-project-diagram"></i> Abetment & Conspiracy</h2>
        <div class="learn-section">
            <h4>Abetment (Sec 107)</h4>
            <p>A person abets the doing of a thing who:</p>
            <ol>
                <li>Instigates any person to do that thing.</li>
                <li>Engages with one or more other person(s) in any conspiracy for the doing of that thing.</li>
                <li>Intentionally aids, by any act or illegal omission, the doing of that thing.</li>
            </ol>
        </div>
         <div class="learn-section">
            <h4>Criminal Conspiracy (Sec 120A)</h4>
            <p>When two or more persons agree to do, or cause to be done:</p>
            <ul>
                <li>An illegal act, or</li>
                <li>An act which is not illegal by illegal means.</li>
            </ul>
        </div>
    `,

    attempts: `
        <h2><i class="fas fa-exclamation-circle"></i> Attempt to Commit Offences</h2>
        <div class="learn-section">
            <p><strong>Section 511</strong> deals with punishment for attempting to commit offences punishable with imprisonment for life or other imprisonment.</p>
        </div>
        <div class="learn-section">
            <h4>Key Principle</h4>
            <p>The IPC punishes not just the completed crime, but often the attempt itself. If no specific section exists for the attempt (like 307 for Murder), Section 511 applies.</p>
            <p><strong>Punishment:</strong> One-half of the imprisonment provided for the offence, or with fine, or with both.</p>
        </div>
    `
};


function showLearnDetail(id) {
    document.getElementById('learn-list').style.display = 'none';
    document.getElementById('learn-detail').style.display = 'block';

    const content = learnTopics[id] || '<p>Content coming soon.</p>';
    document.getElementById('learn-content').innerHTML = content;
}

function showLearnList() {
    document.getElementById('learn-detail').style.display = 'none';
    document.getElementById('learn-list').style.display = 'grid';

}