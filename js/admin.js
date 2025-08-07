// Admin Panel for Code Generation
class AdminPanel {
    constructor() {
        this.availableTopics = [];
        this.isLoggedIn = false;
        
        this.initializeElements();
        this.bindEvents();
        // Show login screen by default
        this.showScreen('adminLoginScreen');
        
        // For debugging - remove in production
        console.log("Admin Panel initialized");
    }

    initializeElements() {
        // Screen elements
        this.adminLoginScreen = document.getElementById('adminLoginScreen');
        this.adminPanelScreen = document.getElementById('adminPanelScreen');

        // Login elements
        this.adminLoginForm = document.getElementById('adminLoginForm');
        this.adminLoginBtn = document.getElementById('adminLoginBtn');
        this.adminUsername = document.getElementById('adminUsername');
        this.adminPassword = document.getElementById('adminPassword');
        this.adminLoginError = document.getElementById('adminLoginError');

        // Dashboard elements
        this.adminLogoutBtn = document.getElementById('adminLogoutBtn');
        this.codeGeneratorForm = document.getElementById('codeGeneratorForm');
        this.generateCodeBtn = document.getElementById('generateCodeBtn');
        this.studentName = document.getElementById('studentName');
        this.topicsContainer = document.getElementById('topicsContainer');
        this.generatedCodeSection = document.getElementById('generatedCodeSection');
        this.generatedCode = document.getElementById('generatedCode');
        this.copyCodeBtn = document.getElementById('copyCodeBtn');
        this.generateNewBtn = document.getElementById('generateNewBtn');
        this.availableTopicsRef = document.getElementById('availableTopicsRef');
        this.studentInfoSection = document.getElementById('studentInfoSection');
        
        console.log("Elements initialized:", 
                    !!this.adminLoginForm, 
                    !!this.adminUsername, 
                    !!this.adminPassword);
    }

    bindEvents() {
        // Use the direct button click instead of form submit
        if (this.adminLoginBtn) {
            this.adminLoginBtn.addEventListener('click', () => {
                console.log("Login button clicked");
                this.handleAdminLogin();
            });
        } else {
            console.error("Admin login button not found!");
        }
        
        if (this.adminLogoutBtn) {
            this.adminLogoutBtn.addEventListener('click', () => this.handleAdminLogout());
        }
        
        // Use direct button click for code generation instead of form submit
        if (this.generateCodeBtn) {
            this.generateCodeBtn.addEventListener('click', () => {
                console.log("Generate code button clicked");
                this.generateAccessCode();
            });
        } else {
            console.error("Generate code button not found!");
        }
        
        if (this.copyCodeBtn) {
            this.copyCodeBtn.addEventListener('click', () => this.copyCode());
        }
        
        if (this.generateNewBtn) {
            this.generateNewBtn.addEventListener('click', () => this.resetForm());
        }
        
        console.log("Events bound successfully");
    }

    async loadAvailableTopics() {
        console.log('Starting to load available topics...');
        try {
            // Try to load the list of files from the config file
            await this.loadFilesFromConfig();
        } catch (error) {
            console.error('Error loading files from config:', error);
            // Fallback to known files if config loading fails
            await this.loadKnownTopics();
        }

        console.log('Topics loaded, now rendering...');
        console.log('Available topics:', this.availableTopics);
        this.renderTopicsCheckboxes();
        this.renderAvailableTopicsReference();
    }

    async loadFilesFromConfig() {
        try {
            console.log('Loading files from config...');
            
            // Load the files.txt config file
            const response = await fetch('data/config/files.txt');
            if (!response.ok) {
                throw new Error(`Could not load files config: ${response.status} ${response.statusText}`);
            }
            
            const fileList = await response.text();
            console.log('Raw config file content:', fileList);
            
            const files = fileList.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'));
            
            console.log('Found files in config:', files);
            
            if (files.length === 0) {
                throw new Error('No files found in config');
            }
            
            // Parse filename information using regex
            const fileInfoList = files.map(filename => this.parseFilenameInfo(filename));
            console.log('Parsed file info:', fileInfoList);
            
            // Load each file from the list
            const topicsPromises = files.map(filename => {
                const url = `data/questions/${filename}`;
                console.log('Loading topic file:', url);
                return this.loadTopicFile(url);
            });
            
            const loadedTopics = await Promise.all(topicsPromises);
            console.log('Raw loaded topics:', loadedTopics);
            
            this.availableTopics = loadedTopics.filter(topic => topic !== null);
            console.log('Filtered topics:', this.availableTopics);
            
            // Enhance topics with parsed filename information
            this.availableTopics = this.availableTopics.map((topic, index) => {
                const enhanced = {
                    ...topic,
                    ...fileInfoList[index],
                    filename: files[index]
                };
                console.log(`Enhanced topic ${index}:`, enhanced);
                return enhanced;
            });
            
            console.log('Successfully loaded and enhanced topics from config:', this.availableTopics);
            
            if (this.availableTopics.length === 0) {
                throw new Error('No valid topics could be loaded');
            }
            
        } catch (error) {
            console.error('Config file loading failed:', error);
            throw error; // Re-throw to trigger fallback
        }
    }

    async loadTopicFile(url) {
        try {
            console.log('Fetching topic file:', url);
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
                return null;
            }
            
            const data = await response.json();
            console.log(`Successfully loaded ${url}:`, data);
            
            return {
                ...data,
                filename: url.split('/').pop()
            };
        } catch (error) {
            console.error(`Error loading topic file ${url}:`, error);
            return null;
        }
    }

    parseFilenameInfo(filename) {
        // Extract information from filename using regex
        // Expected format: class[NUMBER]-[SUBJECT]-[TOPIC].json
        const regex = /^class(\d+)-([a-zA-Z]+)-([a-zA-Z]+)\.json$/;
        const match = filename.match(regex);
        
        if (match) {
            const [, classNumber, subject, topicKey] = match;
            
            // Convert subject abbreviations to full names
            const subjectMap = {
                'algebra': 'Mathematics',
                'geometry': 'Mathematics', 
                'math': 'Mathematics',
                'physics': 'Physics',
                'chemistry': 'Chemistry',
                'biology': 'Biology',
                'english': 'English',
                'history': 'History',
                'geography': 'Geography'
            };
            
            // Convert topic keys to readable names
            const topicMap = {
                'quadratic': 'Quadratic Equations',
                'linear': 'Linear Equations',
                'circles': 'Circles',
                'triangles': 'Triangles',
                'mechanics': 'Mechanics',
                'thermodynamics': 'Thermodynamics',
                'waves': 'Waves and Sound',
                'electricity': 'Electricity',
                'organic': 'Organic Chemistry',
                'inorganic': 'Inorganic Chemistry',
                'atoms': 'Atomic Structure'
            };
            
            return {
                parsedClass: classNumber,
                parsedSubject: subjectMap[subject.toLowerCase()] || subject,
                parsedTopic: topicMap[topicKey.toLowerCase()] || topicKey,
                originalFilename: filename
            };
        } else {
            console.warn(`Could not parse filename: ${filename}`);
            return {
                parsedClass: 'Unknown',
                parsedSubject: 'Unknown',
                parsedTopic: 'Unknown', 
                originalFilename: filename
            };
        }
    }

    async loadKnownTopics() {
        // Final fallback method - load files we know exist
        const knownFiles = [
            'class10-algebra-quadratic.json',
            'class11-physics-mechanics.json'
        ];

        console.log('Loading fallback known files:', knownFiles);

        const topicsPromises = knownFiles.map(filename => 
            this.loadTopicFile(`data/questions/${filename}`)
        );

        const loadedTopics = await Promise.all(topicsPromises);
        this.availableTopics = loadedTopics.filter(topic => topic !== null);
        
        // Add parsed filename info to fallback topics
        this.availableTopics = this.availableTopics.map((topic, index) => ({
            ...topic,
            ...this.parseFilenameInfo(knownFiles[index]),
            filename: knownFiles[index]
        }));
        
        console.log('Loaded topics using known files fallback:', this.availableTopics);
    }

    handleAdminLogin() {
        console.log('Login attempt triggered');
        
        const username = this.adminUsername.value.trim();
        const password = this.adminPassword.value.trim();

        console.log('Username:', username, 'Password:', password);

        // Simple hardcoded authentication
        if (username === 'admin' && password === 'admin') {
            console.log('Login successful');
            this.isLoggedIn = true;
            this.adminLoginError.classList.remove('show');
            this.adminLogoutBtn.style.display = 'block';
            this.showScreen('adminPanelScreen');
            // Load topics once admin is logged in
            this.loadAvailableTopics();
        } else {
            console.log('Login failed');
            this.showAdminError('Invalid username or password');
        }
    }

    handleAdminLogout() {
        this.isLoggedIn = false;
        this.showScreen('adminLoginScreen');
        this.adminUsername.value = '';
        this.adminPassword.value = '';
        this.adminLoginError.classList.remove('show');
        this.adminLoginError.textContent = '';
        this.adminLogoutBtn.style.display = 'none';
        this.resetForm();
    }

    renderTopicsCheckboxes() {
        if (this.availableTopics.length === 0) {
            this.topicsContainer.innerHTML = '<p class="loading-text">No topics available. Add JSON files to data/questions/</p>';
            return;
        }

        // Group topics by parsed class information
        const topicsByClass = this.availableTopics.reduce((acc, topic) => {
            // Use parsed class if available, fallback to original class
            const classKey = `Class ${topic.parsedClass || topic.class}`;
            if (!acc[classKey]) acc[classKey] = [];
            acc[classKey].push(topic);
            return acc;
        }, {});

        this.topicsContainer.innerHTML = Object.entries(topicsByClass)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([className, topics]) => `
                <div class="class-group" style="margin-bottom: 1rem;">
                    <h4 style="color: var(--purple-accent); margin-bottom: 0.5rem; font-size: 1rem;">${className}</h4>
                    ${topics.map(topic => `
                        <div class="topic-checkbox-item">
                            <input type="checkbox" 
                                   id="topic-${topic.filename}" 
                                   value="${JSON.stringify({
                                       class: topic.parsedClass || topic.class, 
                                       chapter: topic.chapter || topic.parsedSubject, 
                                       topic: topic.topic || topic.parsedTopic
                                   })}"
                                   name="topics"
                                   class="topic-checkbox">
                            <label for="topic-${topic.filename}" class="topic-label">
                                <strong>${topic.parsedSubject || topic.chapter}</strong> - ${topic.parsedTopic || topic.topic}
                                <span style="color: var(--text-secondary); font-size: 0.85em; display: block;">
                                    ${topic.questions?.length || 0} questions • ${topic.originalFilename}
                                </span>
                            </label>
                        </div>
                    `).join('')}
                </div>
            `).join('');
    }

    renderAvailableTopicsReference() {
        if (this.availableTopics.length === 0) {
            this.availableTopicsRef.innerHTML = '<p>No topics available</p>';
            return;
        }

        this.availableTopicsRef.innerHTML = this.availableTopics.map(topic => `
            <div class="available-topic-item">
                <div class="available-topic-title">${topic.parsedTopic || topic.topic}</div>
                <div class="available-topic-meta">
                    Class ${topic.parsedClass || topic.class} • ${topic.parsedSubject || topic.chapter} • ${topic.questions?.length || 0} questions
                </div>
                <div style="color: var(--text-muted); font-size: 0.8em; margin-top: 0.25rem;">
                    File: ${topic.originalFilename || topic.filename}
                </div>
            </div>
        `).join('');
    }

    generateAccessCode() {
        console.log('=== GENERATE ACCESS CODE FUNCTION CALLED ===');

        const name = this.studentName.value.trim();
        console.log('Student name:', name);

        // Debug: Check all checkboxes on the page
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        console.log('All checkboxes found:', allCheckboxes.length);
        allCheckboxes.forEach((cb, index) => {
            console.log(`Checkbox ${index}:`, {
                id: cb.id,
                name: cb.name,
                checked: cb.checked,
                value: cb.value
            });
        });

        // Debug: Check checkboxes with name="topics"
        const topicCheckboxes = document.querySelectorAll('input[name="topics"]');
        console.log('Topic checkboxes found:', topicCheckboxes.length);
        topicCheckboxes.forEach((cb, index) => {
            console.log(`Topic checkbox ${index}:`, {
                id: cb.id,
                checked: cb.checked,
                value: cb.value.substring(0, 50) + '...'
            });
        });

        // Debug: Check checked checkboxes
        const checkedCheckboxes = document.querySelectorAll('input[name="topics"]:checked');
        console.log('Checked topic checkboxes:', checkedCheckboxes.length);
        checkedCheckboxes.forEach((cb, index) => {
            console.log(`Checked checkbox ${index}:`, {
                id: cb.id,
                value: cb.value
            });
        });

        // Parse selected topics with better error handling
        const selectedTopics = [];
        
        // Try multiple selection methods
        const methods = [
            () => Array.from(document.querySelectorAll('input[name="topics"]:checked')),
            () => Array.from(document.querySelectorAll('.topic-checkbox:checked')),
            () => Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).filter(cb => cb.name === 'topics'),
            () => Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).filter(cb => cb.classList.contains('topic-checkbox'))
        ];

        let foundCheckboxes = null;
        for (let i = 0; i < methods.length; i++) {
            try {
                const checkboxes = methods[i]();
                console.log(`Method ${i + 1} found ${checkboxes.length} checked checkboxes`);
                if (checkboxes.length > 0) {
                    foundCheckboxes = checkboxes;
                    break;
                }
            } catch (error) {
                console.error(`Method ${i + 1} failed:`, error);
            }
        }

        if (foundCheckboxes && foundCheckboxes.length > 0) {
            console.log('Found checked checkboxes:', foundCheckboxes.length);
            
            foundCheckboxes.forEach((checkbox, index) => {
                console.log(`Processing checkbox ${index}:`, checkbox.value);
                try {
                    const topicData = JSON.parse(checkbox.value);
                    selectedTopics.push(topicData);
                    console.log(`Successfully parsed topic ${index}:`, topicData);
                } catch (e) {
                    console.error(`Error parsing checkbox ${index} value:`, checkbox.value, e);
                    
                    // Fallback: try to create topic data from the checkbox element
                    const label = document.querySelector(`label[for="${checkbox.id}"]`);
                    if (label) {
                        const labelText = label.textContent || label.innerText;
                        console.log('Label text:', labelText);
                        
                        // Try to extract class, chapter, and topic from label
                        const parts = labelText.split(' - ');
                        if (parts.length >= 2) {
                            const fallbackTopic = {
                                class: "10", // Default class
                                chapter: parts[0].trim(),
                                topic: parts[1].split('\n')[0].trim() // Remove additional text after newline
                            };
                            selectedTopics.push(fallbackTopic);
                            console.log('Created fallback topic:', fallbackTopic);
                        }
                    }
                }
            });
        } else {
            console.error('No checked checkboxes found with any method!');
            
            // Final debugging: manually check the DOM
            console.log('Manual DOM inspection:');
            const container = document.getElementById('topicsContainer');
            if (container) {
                console.log('Topics container found');
                const inputs = container.querySelectorAll('input');
                console.log('Inputs in container:', inputs.length);
                inputs.forEach((input, index) => {
                    console.log(`Input ${index}:`, {
                        type: input.type,
                        name: input.name,
                        checked: input.checked,
                        id: input.id,
                        hasValue: !!input.value
                    });
                });
            } else {
                console.error('Topics container not found!');
            }
        }

        console.log('Final selected topics:', selectedTopics);

        // Validation with more helpful error messages
        if (!name) {
            this.showBigAlert('❌ ERROR', 'Please enter student name', '#ef4444');
            return;
        }

        if (selectedTopics.length === 0) {
            // Show detailed error message
            const totalCheckboxes = document.querySelectorAll('input[name="topics"]').length;
            const checkedCount = document.querySelectorAll('input[name="topics"]:checked').length;
            
            let errorMessage = 'Please select at least one topic';
            if (totalCheckboxes === 0) {
                errorMessage += '\n\nNo topics are available. Please wait for topics to load or refresh the page.';
            } else if (checkedCount === 0) {
                errorMessage += `\n\n${totalCheckboxes} topics are available but none are selected. Please click on the checkboxes to select topics.`;
            } else {
                errorMessage += `\n\n${checkedCount} checkboxes appear selected but could not be processed. This may be a browser compatibility issue.`;
            }
            
            this.showBigAlert('❌ ERROR', errorMessage, '#ef4444');
            
            // Also try to highlight the topics container
            const container = document.getElementById('topicsContainer');
            if (container) {
                container.style.border = '3px solid #ef4444';
                container.style.animation = 'pulse 2s infinite';
                setTimeout(() => {
                    container.style.border = '';
                    container.style.animation = '';
                }, 5000);
            }
            
            return;
        }

        // Continue with code generation if we have topics
        console.log('Proceeding with code generation...');

        // Automatically determine the primary class from selected topics
        const classes = [...new Set(selectedTopics.map(topic => topic.class))];
        const primaryClass = classes.length === 1 ? classes[0] : classes.sort()[0];

        // Create user data object
        const userData = {
            name: name,
            class: primaryClass,
            topics: selectedTopics,
            createdAt: new Date().toISOString(),
            createdBy: 'admin'
        };

        try {
            // Encode to base64
            const encodedData = btoa(JSON.stringify(userData));
            
            console.log('='.repeat(60));
            console.log('GENERATED ACCESS CODE:');
            console.log(encodedData);
            console.log('='.repeat(60));

            // Create a comprehensive display with all methods
            this.displayAccessCodeComprehensive(encodedData, userData);

        } catch (error) {
            console.error('Error generating access code:', error);
            this.showBigAlert('❌ ERROR', 'Failed to generate access code. Please try again.', '#ef4444');
        }
    }

    showBigAlert(title, message, color = '#8b5cf6') {
        // Remove any existing alerts
        document.querySelectorAll('.big-alert').forEach(el => el.remove());

        const alert = document.createElement('div');
        alert.className = 'big-alert';
        alert.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            border: 3px solid ${color};
            border-radius: 15px;
            padding: 30px;
            max-width: 90%;
            z-index: 10001;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
        `;

        alert.innerHTML = `
            <h2 style="color: ${color}; margin: 0 0 15px 0; font-size: 24px;">${title}</h2>
            <p style="color: white; margin: 0 0 20px 0; font-size: 16px;">${message}</p>
            <button onclick="this.parentElement.remove();" 
                    style="background: ${color}; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                OK
            </button>
        `;

        document.body.appendChild(alert);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    displayAccessCodeComprehensive(encodedData, userData) {
        // Remove any existing displays
        document.querySelectorAll('.temp-code-display, .big-alert').forEach(el => el.remove());

        // Create main display container
        const container = document.createElement('div');
        container.className = 'temp-code-display';
        container.id = 'mainCodeDisplay';
        container.style.cssText = `
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 4px solid #fbbf24;
            border-radius: 20px;
            padding: 40px;
            margin: 40px 0;
            box-shadow: 0 15px 40px rgba(251, 191, 36, 0.4);
            animation: successGlow 2s infinite alternate;
            position: relative;
        `;

        // Add success animation
        if (!document.getElementById('successGlowStyle')) {
            const style = document.createElement('style');
            style.id = 'successGlowStyle';
            style.textContent = `
                @keyframes successGlow {
                    from { 
                        box-shadow: 0 15px 40px rgba(251, 191, 36, 0.4);
                        border-color: #fbbf24;
                    }
                    to { 
                        box-shadow: 0 20px 50px rgba(251, 191, 36, 0.7);
                        border-color: #f59e0b;
                    }
                }
                .code-box {
                    background: #000 !important;
                    border: 2px solid #fbbf24 !important;
                    color: #fbbf24 !important;
                    font-family: 'Courier New', monospace !important;
                    font-size: 14px !important;
                    padding: 20px !important;
                    border-radius: 10px !important;
                    width: 100% !important;
                    min-height: 120px !important;
                    resize: vertical !important;
                    cursor: pointer !important;
                    word-break: break-all !important;
                }
                .code-box:focus {
                    outline: 3px solid #8b5cf6 !important;
                }
            `;
            document.head.appendChild(style);
        }

        container.innerHTML = `
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #10b981; margin: 0; font-size: 32px; text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);">
                    🎉 SUCCESS! ACCESS CODE GENERATED! 🎉
                </h1>
                <div style="background: linear-gradient(90deg, #8b5cf6, #fbbf24); padding: 15px; border-radius: 10px; margin: 20px 0;">
                    <p style="color: white; margin: 0; font-size: 18px; font-weight: bold;">
                        Student: <span style="color: #000; background: #fbbf24; padding: 2px 8px; border-radius: 4px;">${userData.name}</span> | 
                        Class: <span style="color: #000; background: #fbbf24; padding: 2px 8px; border-radius: 4px;">${userData.class}</span> | 
                        Topics: <span style="color: #000; background: #fbbf24; padding: 2px 8px; border-radius: 4px;">${userData.topics.length}</span>
                    </p>
                </div>
            </div>

            <!-- Main Code Display -->
            <div style="background: #0a0a0a; padding: 30px; border-radius: 15px; margin: 30px 0; border: 2px solid #8b5cf6;">
                <h3 style="color: #8b5cf6; margin: 0 0 15px 0; text-align: center; font-size: 20px;">
                    📋 ACCESS CODE (Click anywhere in the box to select all)
                </h3>
                <textarea readonly 
                          class="code-box"
                          onclick="this.select(); this.setSelectionRange(0, 99999); navigator.clipboard.writeText('${encodedData}').then(() => { this.style.background='#10b981'; this.style.color='white'; setTimeout(() => { this.style.background='#000'; this.style.color='#fbbf24'; }, 1000); alert('✅ Code copied to clipboard!'); }).catch(() => alert('✅ Code selected! Press Ctrl+C (or Cmd+C) to copy'));"
                          title="Click to select and copy">${encodedData}</textarea>
                
                <!-- Verification Display -->
                <div style="background: #374151; padding: 15px; border-radius: 10px; margin-top: 15px;">
                    <h4 style="color: #fbbf24; margin: 0 0 10px 0;">🔍 Code Verification:</h4>
                    <p style="color: #d1d5db; margin: 5px 0; font-family: monospace; font-size: 12px;">
                        <strong>Length:</strong> ${encodedData.length} characters<br>
                        <strong>First 20 chars:</strong> ${encodedData.substring(0, 20)}...<br>
                        <strong>Last 20 chars:</strong> ...${encodedData.substring(encodedData.length - 20)}
                    </p>
                </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 30px 0;">
                <button onclick="navigator.clipboard.writeText('${encodedData}').then(() => { this.style.background='#10b981'; this.textContent='✅ Copied!'; setTimeout(() => { this.style.background='#8b5cf6'; this.textContent='📋 Copy to Clipboard'; }, 2000); }).catch(() => alert('Please select the text and copy manually'));" 
                        style="background: #8b5cf6; color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s;">
                    📋 Copy to Clipboard
                </button>
                
                <button onclick="const newWin = window.open('', '_blank', 'width=600,height=400'); newWin.document.write('<html><head><title>Access Code</title></head><body style=\\'font-family:monospace;padding:20px;background:#1a1a1a;color:#fbbf24\\'><h2 style=\\'color:#8b5cf6\\'>Access Code for ${userData.name}</h2><textarea style=\\'width:100%;height:200px;background:#000;color:#fbbf24;border:2px solid #fbbf24;padding:10px;font-family:monospace\\'>${encodedData}</textarea><br><br><button onclick=\\'navigator.clipboard.writeText(\\"${encodedData}\\").then(() => alert(\\"Copied!\\"))\\'\\' style=\\'background:#10b981;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer\\'>Copy Code</button></body></html>'); newWin.document.close();" 
                        style="background: #f59e0b; color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s;">
                    🪟 Open in New Window
                </button>
                
                <button onclick="console.log('=== ACCESS CODE FOR ${userData.name} ==='); console.log('${encodedData}'); console.log('='.repeat(50)); alert('Code logged to browser console (F12)');" 
                        style="background: #6366f1; color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s;">
                    🖥️ Log to Console
                </button>
                
                <button onclick="const email = prompt('Enter email address to send code (will open email client):'); if(email) { const subject = encodeURIComponent('Access Code for ${userData.name}'); const body = encodeURIComponent('Access Code for student ${userData.name} (Class ${userData.class}):\\n\\n${encodedData}\\n\\nPlease add this code to data/codes.txt in the repository.'); window.open('mailto:' + email + '?subject=' + subject + '&body=' + body); }" 
                        style="background: #ec4899; color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s;">
                    📧 Email Code
                </button>
            </div>

            <!-- Instructions -->
            <div style="background: linear-gradient(135deg, #374151 0%, #4b5563 100%); padding: 25px; border-radius: 15px; margin-top: 30px; border-left: 5px solid #fbbf24;">
                <h3 style="color: #fbbf24; margin: 0 0 15px 0; font-size: 18px;">📝 Next Steps:</h3>
                <ol style="color: #e5e7eb; margin: 0; padding-left: 25px; line-height: 1.8;">
                    <li><strong>Copy the access code</strong> using any method above</li>
                    <li><strong>Open your repository</strong> and navigate to <code style="background: #1f2937; padding: 3px 8px; border-radius: 4px; color: #fbbf24;">data/codes.txt</code></li>
                    <li><strong>Add the code</strong> on a new line at the end of the file</li>
                    <li><strong>Commit and push</strong> the changes to GitHub</li>
                    <li><strong>Share the code</strong> with <span style="color: #fbbf24; font-weight: bold;">${userData.name}</span></li>
                </ol>
                
                <div style="background: #1f2937; padding: 15px; border-radius: 10px; margin-top: 15px;">
                    <h4 style="color: #8b5cf6; margin: 0 0 10px 0;">📚 Student Topics:</h4>
                    <ul style="color: #d1d5db; margin: 0; padding-left: 20px;">
                        ${userData.topics.map(topic => `
                            <li><strong>${topic.chapter}</strong> - ${topic.topic} (Class ${topic.class})</li>
                        `).join('')}
                    </ul>
                </div>
            </div>

            <!-- Close Button -->
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="this.parentElement.parentElement.remove(); document.querySelectorAll('.temp-code-display').forEach(el => el.remove());" 
                        style="background: #ef4444; color: white; border: none; padding: 15px 30px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 16px;">
                    ❌ Close This Display
                </button>
            </div>
        `;

        // Insert the display
        if (this.codeGeneratorForm && this.codeGeneratorForm.parentNode) {
            this.codeGeneratorForm.parentNode.insertBefore(container, this.codeGeneratorForm.nextSibling);
        } else {
            // Fallback: append to admin panel screen
            const adminPanel = document.getElementById('adminPanelScreen');
            if (adminPanel) {
                adminPanel.appendChild(container);
            }
        }

        // Also update the original elements if they exist
        if (this.generatedCode) {
            this.generatedCode.value = encodedData;
            this.generatedCode.textContent = encodedData;
            this.generatedCodeSection.style.display = 'block';
        }

        // Show student info
        this.showStudentInfo(userData);

        // Scroll to the display
        setTimeout(() => {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        // Show success alert
        setTimeout(() => {
            alert(`✅ ACCESS CODE GENERATED SUCCESSFULLY!\n\nStudent: ${userData.name}\nClass: ${userData.class}\nTopics: ${userData.topics.length}\n\nThe code is displayed below. Please scroll down to see it.`);
        }, 500);

        console.log('✅ ACCESS CODE DISPLAY COMPLETED');
    }

    copyCode() {
        const code = this.generatedCode.textContent;
        navigator.clipboard.writeText(code).then(() => {
            // Visual feedback
            const originalText = this.copyCodeBtn.textContent;
            this.copyCodeBtn.textContent = '✓ Copied!';
            this.copyCodeBtn.style.backgroundColor = 'var(--success)';
            
            setTimeout(() => {
                this.copyCodeBtn.textContent = originalText;
                this.copyCodeBtn.style.backgroundColor = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy code:', err);
            
            // Fallback: select the text
            const range = document.createRange();
            range.selectNode(this.generatedCode);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            
            alert('Code selected. Please copy it manually (Ctrl+C or Cmd+C)');
        });
    }

    resetForm() {
        this.studentName.value = '';
        document.querySelectorAll('input[name="topics"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.generatedCodeSection.style.display = 'none';
        if (this.studentInfoSection) {
            this.studentInfoSection.style.display = 'none';
        }
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.add('active');
    }

    showAdminError(message) {
        this.adminLoginError.textContent = message;
        this.adminLoginError.classList.add('show');
        setTimeout(() => {
            this.adminLoginError.classList.remove('show');
        }, 5000);
    }

    showStudentInfo(userData) {
        if (this.studentInfoSection) {
            const studentDetails = document.getElementById('studentDetails');
            if (studentDetails) {
                studentDetails.innerHTML = `
                    <div style="margin-bottom: 1rem;">
                        <strong>Name:</strong> ${userData.name}<br>
                        <strong>Class:</strong> ${userData.class}<br>
                        <strong>Topics Assigned:</strong> ${userData.topics.length}
                    </div>
                    <div>
                        <strong>Topics:</strong>
                        <ul style="margin-left: 1rem; margin-top: 0.5rem;">
                            ${userData.topics.map(topic => `
                                <li>${topic.chapter} - ${topic.topic}</li>
                            `).join('')}
                        </ul>
                    </div>
                `;
                this.studentInfoSection.style.display = 'block';
            }
        }
    }
}

// Initialize the admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});