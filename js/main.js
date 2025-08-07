// Main Quiz Application
class QuizApp {
    constructor() {
        this.currentUser = null;
        this.availableTopics = [];
        this.currentQuiz = null;
        this.quizQuestions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.quizTimer = null;
        this.timeRemaining = 20 * 60; // 20 minutes in seconds
        
        this.initializeElements();
        this.bindEvents();
        this.checkExistingSession();
        this.loadAvailableTopics();
    }

    initializeElements() {
        // Screen elements
        this.loginScreen = document.getElementById('loginScreen');
        this.dashboardScreen = document.getElementById('dashboardScreen');
        this.quizScreen = document.getElementById('quizScreen');
        this.resultsScreen = document.getElementById('resultsScreen');
        this.reviewScreen = document.getElementById('reviewScreen');

        // Login elements
        this.loginForm = document.getElementById('loginForm');
        this.accessCodeInput = document.getElementById('accessCode');
        this.loginError = document.getElementById('loginError');

        // Header elements
        this.studentInfo = document.getElementById('studentInfo');
        this.logoutBtn = document.getElementById('logoutBtn');

        // Dashboard elements
        this.topicsGrid = document.getElementById('topicsGrid');

        // Quiz elements
        this.progressFill = document.getElementById('progressFill');
        this.questionCounter = document.getElementById('questionCounter');
        this.timer = document.getElementById('timer');
        this.questionNumber = document.getElementById('questionNumber');
        this.questionStem = document.getElementById('questionStem');
        this.choicesContainer = document.getElementById('choicesContainer');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.submitBtn = document.getElementById('submitBtn');

        // Results elements
        this.finalScore = document.getElementById('finalScore');
        this.scorePercentage = document.getElementById('scorePercentage');
        this.correctCount = document.getElementById('correctCount');
        this.incorrectCount = document.getElementById('incorrectCount');
        this.unattemptedCount = document.getElementById('unattemptedCount');
        this.reviewBtn = document.getElementById('reviewBtn');
        this.backToDashboardBtn = document.getElementById('backToDashboardBtn');

        // Review elements
        this.backToResultsBtn = document.getElementById('backToResultsBtn');
        this.reviewContent = document.getElementById('reviewContent');
    }

    bindEvents() {
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        this.prevBtn.addEventListener('click', () => this.previousQuestion());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.submitBtn.addEventListener('click', () => this.submitQuiz());
        this.reviewBtn.addEventListener('click', () => this.showReview());
        this.backToDashboardBtn.addEventListener('click', () => this.showDashboard());
        this.backToResultsBtn.addEventListener('click', () => this.showResults());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.quizScreen.classList.contains('active')) {
                switch(e.key) {
                    case 'ArrowLeft':
                        if (!this.prevBtn.disabled) this.previousQuestion();
                        break;
                    case 'ArrowRight':
                        if (!this.nextBtn.disabled) this.nextQuestion();
                        break;
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                        const choiceIndex = parseInt(e.key) - 1;
                        const choices = document.querySelectorAll('.choice');
                        if (choices[choiceIndex]) {
                            choices[choiceIndex].click();
                        }
                        break;
                }
            }
        });
    }

    async checkExistingSession() {
        const userData = sessionStorage.getItem('cognition_user');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.updateHeaderInfo();
                this.showDashboard();
            } catch (error) {
                console.error('Error parsing user data:', error);
                sessionStorage.removeItem('cognition_user');
            }
        }
    }

    async loadAvailableTopics() {
        console.log('🔍 Starting to load available topics...');
        try {
            // Try to load the list of files from the config file
            await this.loadFilesFromConfig();
        } catch (error) {
            console.error('❌ Error loading files from config:', error);
            // Fallback to known files if config loading fails
            await this.loadKnownTopics();
        }
        
        console.log('✅ Topics loading completed. Available topics:', this.availableTopics);
        
        // If we have a current user, immediately try to render topics
        if (this.currentUser) {
            console.log('👤 Current user found, rendering topics for:', this.currentUser.name);
            this.renderTopicsGrid();
        }
    }

    async loadFilesFromConfig() {
        try {
            // Load the files.txt config file
            const response = await fetch('data/config/files.txt');
            if (!response.ok) {
                throw new Error('Could not load files config');
            }
            
            const fileList = await response.text();
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
            const topicsPromises = files.map(filename => 
                this.loadTopicFile(`data/questions/${filename}`)
            );
            
            const loadedTopics = await Promise.all(topicsPromises);
            this.availableTopics = loadedTopics.filter(topic => topic !== null);
            
            // Enhance topics with parsed filename information
            this.availableTopics = this.availableTopics.map((topic, index) => ({
                ...topic,
                ...fileInfoList[index],
                filename: files[index]
            }));
            
            console.log('Successfully loaded topics from config:', this.availableTopics);
            
        } catch (error) {
            console.error('Config file loading failed:', error);
            throw error; // Re-throw to trigger fallback
        }
    }

    parseFilenameInfo(filename) {
        // Regex to handle formats: class[NUMBER]-[SUBJECT]-[TOPIC...].json
        const regex = /^class(\d+)-([a-zA-Z]+)(?:-([\w-]+))?\.json$/;
        const match = filename.match(regex);

        if (match) {
            const [, classNumber, subjectKey, topicKey] = match;

            const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

            const subjectMap = {
                'algebra': 'Mathematics',
                'math': 'Mathematics',
                'mathematics': 'Mathematics',
                'physics': 'Physics',
                'science': 'Science',
                'english': 'English',
            };

            const subject = subjectMap[subjectKey.toLowerCase()] || capitalize(subjectKey);
            
            // If topicKey exists, format it. Otherwise, use the subject as the topic.
            const topic = topicKey ? topicKey.split('-').map(capitalize).join(' ') : subject;

            return {
                parsedClass: classNumber,
                parsedSubject: subject,
                parsedTopic: topic,
                originalFilename: filename
            };
        } else {
            console.warn(`Could not parse filename: ${filename}`);
            const cleanedName = filename.replace('.json', '').replace(/-/g, ' ');
            return {
                parsedClass: 'N/A',
                parsedSubject: 'Unknown',
                parsedTopic: cleanedName,
                originalFilename: filename
            };
        }
    }

    async loadKnownTopics() {
        // Fallback method to load known topic files
        const knownFiles = [
            'class10-algebra-quadratic.json',
            'class11-physics-mechanics.json'
        ];

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
        
        console.log('Loaded topics using fallback method:', this.availableTopics);
    }

    async loadTopicFile(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) return null;
            
            const data = await response.json();
            return {
                ...data,
                filename: url.split('/').pop()
            };
        } catch (error) {
            console.error(`Error loading topic file ${url}:`, error);
            return null;
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const accessCode = this.accessCodeInput.value.trim();
        if (!accessCode) {
            this.showError('Please enter an access code');
            return;
        }

        console.log('Attempting login with code:', accessCode);

        try {
            // First, try to decode the access code to see if it's valid format
            let userData;
            try {
                const decodedData = atob(accessCode);
                userData = JSON.parse(decodedData);
                console.log('Decoded user data:', userData);
                
                // Validate user data structure
                if (!userData.name || !userData.class || !userData.topics) {
                    throw new Error('Invalid user data format');
                }
            } catch (decodeError) {
                console.error('Decode error:', decodeError);
                this.showError('Invalid access code format. Please check your code and try again.');
                return;
            }

            // Now try to fetch and validate against codes.txt
            try {
                const response = await fetch('data/codes.txt');
                if (!response.ok) {
                    console.warn('Could not load codes.txt, but access code format is valid. Proceeding with login.');
                    // If we can't load codes.txt but the code format is valid, allow login
                    this.proceedWithLogin(userData);
                    return;
                }

                const codesText = await response.text();
                console.log('Loaded codes.txt content:', codesText);
                
                // Robustly split by any newline sequence, trim, and filter.
                const codes = codesText.split(/\r?\n/)
                    .map(line => line.trim())
                    .filter(line => line && !line.startsWith('#'));

                console.log('Valid codes found:', codes);

                if (!codes.includes(accessCode)) {
                    this.showError('Access code not found in system. Please contact your instructor.');
                    return;
                }

                // Code is valid and found in codes.txt
                this.proceedWithLogin(userData);

            } catch (fetchError) {
                console.error('Error fetching codes.txt:', fetchError);
                // If codes.txt can't be loaded but the access code format is valid, 
                // allow the login (useful for development/testing)
                console.warn('codes.txt not accessible, but proceeding with valid access code format');
                this.proceedWithLogin(userData);
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed. Please check your access code and try again.');
        }
    }

    proceedWithLogin(userData) {
        console.log('🔑 Proceeding with login for user:', userData.name);
        console.log('📄 Full user data:', userData);
        
        this.currentUser = userData;
        sessionStorage.setItem('cognition_user', JSON.stringify(userData));
        this.updateHeaderInfo();
        this.showDashboard();
        
        // Clear login form
        this.accessCodeInput.value = '';
        this.loginError.classList.remove('show');
        
        console.log('✅ Login successful for:', userData.name);
        console.log('🎯 Now loading dashboard and checking topics...');
    }

    handleLogout() {
        this.currentUser = null;
        sessionStorage.removeItem('cognition_user');
        this.clearQuizData();
        this.showScreen('loginScreen');
        this.studentInfo.textContent = '';
        this.logoutBtn.style.display = 'none';
        this.accessCodeInput.value = '';
    }

    updateHeaderInfo() {
        if (this.currentUser) {
            this.studentInfo.textContent = `Welcome, ${this.currentUser.name} (Class ${this.currentUser.class})`;
            this.logoutBtn.style.display = 'block';
        }
    }

    showDashboard() {
        console.log('🎯 DASHBOARD: Showing dashboard screen');
        console.log('🎯 DASHBOARD: Current user:', this.currentUser);
        console.log('🎯 DASHBOARD: Available topics:', this.availableTopics);
        
        this.showScreen('dashboardScreen');
        this.renderTopicsGrid();
        
        // Force re-render after a short delay if no topics show up
        setTimeout(() => {
            if (this.topicsGrid.innerHTML.includes('No topics assigned')) {
                console.log('🔄 RETRY: No topics found, attempting to reload...');
                this.loadAvailableTopics().then(() => {
                    console.log('🔄 RETRY: Topics reloaded, re-rendering grid...');
                    this.renderTopicsGrid();
                });
            }
        }, 1000);
    }

    renderTopicsGrid() {
        if (!this.currentUser || !this.availableTopics.length) {
            this.topicsGrid.innerHTML = '<p class="loading-text">No topics available</p>';
            return;
        }

        const userTopics = this.currentUser.topics || [];
        console.log('User topics from access code:', userTopics);
        console.log('Available topics loaded:', this.availableTopics);
        
        const filteredTopics = this.availableTopics.filter(topic => {
            const match = userTopics.some(userTopic => {
                // Match using original JSON values (chapter, topic) not parsed values
                const classMatch = userTopic.class === topic.class;
                const chapterMatch = userTopic.chapter === topic.chapter;
                const topicMatch = userTopic.topic === topic.topic;
                
                console.log(`Checking match for ${topic.filename}:`, {
                    userTopic,
                    topicFile: { class: topic.class, chapter: topic.chapter, topic: topic.topic },
                    matches: { classMatch, chapterMatch, topicMatch }
                });
                
                return classMatch && chapterMatch && topicMatch;
            });
            
            console.log(`Topic ${topic.filename} ${match ? 'MATCHED' : 'NOT MATCHED'}`);
            return match;
        });

        console.log('Filtered topics for user:', filteredTopics);

        if (filteredTopics.length === 0) {
            this.topicsGrid.innerHTML = '<p class="loading-text">No topics assigned to your account</p>';
            return;
        }

        this.topicsGrid.innerHTML = filteredTopics.map(topic => `
            <div class="topic-card" data-topic="${topic.filename}">
                <div class="topic-header">
                    <div class="topic-title">${topic.topic}</div>
                    <div class="topic-meta">Class ${topic.class} • ${topic.chapter}</div>
                </div>
                <div class="topic-description">
                    Click to start a 20-question quiz on this topic
                </div>
                <div class="topic-stats" style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                    <span>📝 ${topic.questions?.length || 0} questions available</span>
                    <span style="margin-left: 1rem;">⏱️ 20 minutes</span>
                </div>
            </div>
        `).join('');

        // Add click handlers
        document.querySelectorAll('.topic-card').forEach(card => {
            card.addEventListener('click', () => {
                const topicFilename = card.dataset.topic;
                this.startQuiz(topicFilename);
            });
        });
    }

    async startQuiz(topicFilename) {
        const topic = this.availableTopics.find(t => t.filename === topicFilename);
        if (!topic || !topic.questions || topic.questions.length < 20) {
            alert('This topic does not have enough questions for a quiz (minimum 20 required)');
            return;
        }

        this.currentQuiz = topic;
        this.quizQuestions = this.getRandomQuestions(topic.questions, 20);
        this.userAnswers = new Array(20).fill(null);
        this.currentQuestionIndex = 0;
        this.timeRemaining = 20 * 60; // Reset timer

        this.showScreen('quizScreen');
        this.startTimer();
        this.displayQuestion();
    }

    getRandomQuestions(questions, count) {
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    startTimer() {
        this.updateTimerDisplay();
        this.quizTimer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Change color based on remaining time
        if (this.timeRemaining < 300) { // Less than 5 minutes
            this.timer.style.color = 'var(--error)';
        } else if (this.timeRemaining < 600) { // Less than 10 minutes
            this.timer.style.color = 'var(--warning)';
        } else {
            this.timer.style.color = 'var(--gold-accent)';
        }
    }

    timeUp() {
        clearInterval(this.quizTimer);
        alert('Time is up! Your quiz will be submitted automatically.');
        this.submitQuiz();
    }

    displayQuestion() {
        const question = this.quizQuestions[this.currentQuestionIndex];
        
        // Update progress
        const progress = ((this.currentQuestionIndex + 1) / this.quizQuestions.length) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.questionCounter.textContent = `${this.currentQuestionIndex + 1} / this.quizQuestions.length`;
        
        // Update question content
        this.questionNumber.textContent = `Question ${this.currentQuestionIndex + 1}`;
        this.questionStem.innerHTML = question.stem;
        
        // Render choices
        this.choicesContainer.innerHTML = question.choices.map((choice, index) => `
            <div class="choice-item" data-choice="${index}">
                <input type="radio" name="choice" value="${index}" class="choice-radio" id="choice-${index}">
                <div class="choice-text">${choice}</div>
            </div>
        `).join('');

        // Add choice click handlers
        document.querySelectorAll('.choice-item').forEach(choiceEl => {
            choiceEl.addEventListener('click', () => {
                const choiceIndex = parseInt(choiceEl.dataset.choice);
                this.selectChoice(choiceIndex);
            });
        });

        // Add radio button handlers
        document.querySelectorAll('input[name="choice"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const choiceIndex = parseInt(e.target.value);
                this.selectChoice(choiceIndex);
            });
        });

        // Restore selected answer if exists
        if (this.userAnswers[this.currentQuestionIndex] !== null) {
            this.selectChoice(this.userAnswers[this.currentQuestionIndex], false);
        }

        // Hide the previous button completely during the quiz
        this.prevBtn.style.display = 'none';
        
        // Update navigation buttons
        this.updateNavigationButtons();

        // Re-render MathJax if present
        if (window.MathJax) {
            MathJax.typesetPromise([this.questionStem, this.choicesContainer]).catch(console.error);
        }
    }

    selectChoice(choiceIndex, updateAnswer = true) {
        // Remove previous selection
        document.querySelectorAll('.choice-item').forEach(choice => {
            choice.classList.remove('selected');
        });

        // Add selection to clicked choice
        const choiceEl = document.querySelector(`[data-choice="${choiceIndex}"]`);
        if (choiceEl) {
            choiceEl.classList.add('selected');
            
            if (updateAnswer) {
                this.userAnswers[this.currentQuestionIndex] = choiceIndex;
                this.updateNavigationButtons();
            }
        }
    }

    updateNavigationButtons() {
        this.prevBtn.disabled = this.currentQuestionIndex === 0;
        
        const hasAnswer = this.userAnswers[this.currentQuestionIndex] !== null;
        this.nextBtn.disabled = !hasAnswer;
        
        // Show submit button on last question
        if (this.currentQuestionIndex === this.quizQuestions.length - 1) {
            this.nextBtn.style.display = 'none';
            this.submitBtn.style.display = 'block';
            this.submitBtn.disabled = !hasAnswer;
        } else {
            this.nextBtn.style.display = 'block';
            this.submitBtn.style.display = 'none';
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.quizQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        }
    }

    submitQuiz() {
        const unanswered = this.userAnswers.filter(answer => answer === null).length;
        if (unanswered > 0) {
            const confirmSubmit = confirm(`You have ${unanswered} unanswered questions. Are you sure you want to submit?`);
            if (!confirmSubmit) return;
        }

        clearInterval(this.quizTimer);
        this.calculateResults();
        this.showResults();
    }

    calculateResults() {
        let correct = 0;
        let incorrect = 0;
        let unattempted = 0;

        this.quizQuestions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            if (userAnswer === null) {
                unattempted++;
            } else if (userAnswer === question.answer) {
                correct++;
            } else {
                incorrect++;
            }
        });

        this.results = {
            correct,
            incorrect,
            unattempted,
            total: this.quizQuestions.length,
            percentage: Math.round((correct / this.quizQuestions.length) * 100)
        };
    }

    showResults() {
        this.showScreen('resultsScreen');
        
        // Animate score display
        this.animateScore();
        
        // Update stats
        this.correctCount.textContent = this.results.correct;
        this.incorrectCount.textContent = this.results.incorrect;
        this.unattemptedCount.textContent = this.results.unattempted;
        
        // Update score circle
        this.updateScoreCircle();
    }

    animateScore() {
        let currentScore = 0;
        const targetScore = this.results.correct;
        
        const animation = setInterval(() => {
            if (currentScore <= targetScore) {
                this.finalScore.textContent = currentScore;
                this.scorePercentage.textContent = `${Math.round((currentScore / this.results.total) * 100)}%`;
                currentScore++;
            } else {
                clearInterval(animation);
            }
        }, 100);
    }

    updateScoreCircle() {
        const percentage = this.results.percentage;
        const circle = document.querySelector('.score-circle');
        const degrees = (percentage / 100) * 360;
        
        circle.style.background = `conic-gradient(
            var(--purple-accent) 0deg,
            var(--gold-accent) ${degrees}deg,
            var(--secondary-bg) ${degrees}deg,
            var(--secondary-bg) 360deg
        )`;
    }

    showReview() {
        this.showScreen('reviewScreen');
        this.renderReview();
    }

    renderReview() {
        this.reviewContent.innerHTML = this.quizQuestions.map((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.answer;
            const isUnattempted = userAnswer === null;
            
            let status = 'unattempted';
            let statusText = 'Unattempted';
            
            if (!isUnattempted) {
                status = isCorrect ? 'correct' : 'incorrect';
                statusText = isCorrect ? 'Correct' : 'Incorrect';
            }

            // Create the HTML for correct answer explanation
            const correctAnswerLetter = String.fromCharCode(65 + question.answer);
            const correctAnswerText = question.choices[question.answer];
            const explanationHtml = question.explanation ? 
                `<div class="answer-explanation">
                    <h4>Explanation:</h4>
                    <p>${question.explanation}</p>
                </div>` : '';

            return `
                <div class="review-question ${status}">
                    <div class="review-question-header">
                        <div class="review-question-number">Question ${index + 1}</div>
                        <div class="review-status ${status}">${statusText}</div>
                    </div>
                    <div class="review-question-stem">${question.stem}</div>
                    <div class="review-choices">
                        ${question.choices.map((choice, choiceIndex) => {
                            let choiceClass = 'review-choice';
                            if (choiceIndex === question.answer) {
                                choiceClass += ' correct-answer';
                            }
                            if (choiceIndex === userAnswer && userAnswer !== question.answer) {
                                choiceClass += ' user-answer';
                            }
                            
                            return `
                                <div class="${choiceClass}">
                                    <div class="choice-label">${String.fromCharCode(65 + choiceIndex)}</div>
                                    <div class="choice-text">${choice}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="correct-answer-box">
                        <div class="correct-answer-header">Correct Answer: ${correctAnswerLetter}</div>
                        <div class="correct-answer-content">${correctAnswerText}</div>
                        ${explanationHtml}
                    </div>
                </div>
            `;
        }).join('');

        // Re-render MathJax for review content
        if (window.MathJax) {
            MathJax.typesetPromise([this.reviewContent]).catch(console.error);
        }
    }

    clearQuizData() {
        this.currentQuiz = null;
        this.quizQuestions = [];
        this.userAnswers = [];
        this.currentQuestionIndex = 0;
        this.results = null;
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
            this.quizTimer = null;
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

    showError(message) {
        this.loginError.textContent = message;
        this.loginError.classList.add('show');
        setTimeout(() => {
            this.loginError.classList.remove('show');
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});