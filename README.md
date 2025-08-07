# Cognition Coaching Center - Quiz Platform

A comprehensive static quiz platform built with HTML, CSS, and vanilla JavaScript for educational institutions. Students can take timed multiple-choice quizzes with formula support, while administrators can manage access codes and question sets.

## 🌟 Features

### Student Features
- **Secure Access**: Login with unique access codes containing topic permissions
- **Timed Quizzes**: 20-minute countdown timer with automatic submission
- **Mathematical Formulas**: Full LaTeX support with MathJax rendering
- **Interactive Review**: Detailed answer explanations after quiz completion
- **Progress Tracking**: Visual progress bar and question navigation
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Admin Features
- **Code Generation**: Create encrypted access codes for students
- **Topic Management**: Assign specific topics to individual students
- **Student Information**: Track student names, classes, and permissions
- **Bulk Operations**: Generate multiple codes efficiently

### Technical Features
- **Static Hosting**: No server required - deploys on GitHub Pages
- **Offline Capable**: Works without internet after initial load
- **Fast Performance**: Optimized CSS and JavaScript
- **Cross-Browser**: Compatible with all modern browsers

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/quiz-platform.git
cd quiz-platform
```

### 2. Test Locally
Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

### 3. Deploy to GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Site will be available at `https://yourusername.github.io/repository-name`

## 📁 Project Structure

```
quiz-platform/
├── index.html                 # Student portal (main entry point)
├── admin.html                 # Administrator panel
├── README.md                  # Project documentation
├── css/
│   └── styles.css            # Complete styling with dark theme
├── js/
│   ├── main.js               # Quiz application logic (800+ lines)
│   └── admin.js              # Admin panel functionality (800+ lines)
├── data/
│   ├── codes.txt             # Valid access codes (one per line)
│   ├── config/
│   │   └── files.txt         # List of available question files
│   └── questions/            # JSON question files
│       ├── class10-algebra-quadratic.json
│       └── class11-physics-mechanics.json
├── assets/
│   └── logo.png              # Institution logo
└── backup/                   # Backup of previous versions
    └── ...
```

## 📝 Question File Format

### JSON Structure
Each question file must follow this exact structure:

```json
{
  "class": "10",
  "chapter": "Mathematics", 
  "topic": "Quadratic Equations",
  "questions": [
    {
      "id": "q1",
      "stem": "Find the roots of $x^2 - 5x + 6 = 0$",
      "choices": [
        "$x = 2, 3$",
        "$x = 1, 6$", 
        "$x = -2, -3$",
        "$x = 0, 5$"
      ],
      "answer": 0,
      "explanation": "Using factoring: $x^2 - 5x + 6 = (x-2)(x-3) = 0$. Therefore, $x = 2$ or $x = 3$."
    },
    {
      "id": "q2",
      "stem": "The discriminant of $2x^2 + 3x - 1 = 0$ is:",
      "choices": [
        "$17$",
        "$5$",
        "$9$", 
        "$1$"
      ],
      "answer": 0,
      "explanation": "Discriminant = $b^2 - 4ac = 3^2 - 4(2)(-1) = 9 + 8 = 17$."
    }
  ]
}
```

### Required Fields
- **class**: Grade level (string)
- **chapter**: Subject or chapter name (string)
- **topic**: Specific topic name (string)
- **questions**: Array of question objects

### Question Object Fields
- **id**: Unique identifier (string, e.g., "q1", "q2")
- **stem**: Question text with LaTeX support (string)
- **choices**: Array of 4 answer options (strings)
- **answer**: Index of correct answer (number, 0-3)
- **explanation**: Detailed solution explanation (string, optional but recommended)

### File Naming Convention
Use pattern: `class[NUMBER]-[SUBJECT]-[TOPIC].json`

**Examples:**
- `class10-math-quadratic.json`
- `class11-physics-mechanics.json`
- `class12-chemistry-organic.json`

### LaTeX Support
Use standard LaTeX syntax for mathematical expressions:

```latex
Inline math: $x^2 + 2x + 1 = 0$
Display math: $$\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$
Fractions: $\frac{1}{2}$, $\frac{a}{b}$
Exponents: $x^2$, $e^{-x}$
Greek letters: $\alpha$, $\beta$, $\gamma$
Operators: $\times$, $\div$, $\pm$, $\geq$, $\leq$
```

## 🔐 Access Code System

### How Access Codes Work
Access codes are base64-encoded JSON objects containing:

```json
{
  "name": "Rahul Sharma",
  "class": "10", 
  "topics": [
    {
      "class": "10",
      "chapter": "Mathematics",
      "topic": "Quadratic Equations"
    },
    {
      "class": "11", 
      "chapter": "Physics",
      "topic": "Mechanics"
    }
  ],
  "createdAt": "2025-08-06T10:00:00.000Z",
  "createdBy": "admin"
}
```

### Generating Access Codes

#### Method 1: Admin Panel (Recommended)
1. Open `admin.html` in browser
2. Login with username: `admin`, password: `admin`
3. Enter student details:
   - Student name
   - Class number
   - Select topics from checkboxes
4. Click "Generate Access Code"
5. Copy the generated code
6. Add code to `data/codes.txt`

#### Method 2: Manual Creation
```javascript
// Create user data object
const userData = {
  name: "Student Name",
  class: "10",
  topics: [
    {
      class: "10", 
      chapter: "Mathematics",
      topic: "Quadratic Equations"
    }
  ],
  createdAt: new Date().toISOString(),
  createdBy: "admin"
};

// Encode to base64
const accessCode = btoa(JSON.stringify(userData));
console.log(accessCode);
```

### Sample Access Code
```
eyJuYW1lIjoiUmFodWwgU2hhcm1hIiwiY2xhc3MiOiIxMCIsInRvcGljcyI6W3siY2xhc3MiOiIxMCIsImNoYXB0ZXIiOiJNYXRoZW1hdGljcyIsInRvcGljIjoiUXVhZHJhdGljIEVxdWF0aW9ucyJ9XSwiY3JlYXRlZEF0IjoiMjAyNS0wOC0wNlQxMDowMDowMC4wMDBaIiwiY3JlYXRlZEJ5IjoiYWRtaW4ifQ==
```

This code allows "Rahul Sharma" from class 10 to access quadratic equations quiz.

## 🎯 User Guide

### For Students

#### 1. Login Process
1. Visit the main page (`index.html`)
2. Enter your access code in the login form
3. Click "Start Quiz" or press Enter

#### 2. Taking a Quiz
1. **Topic Selection**: Choose from your assigned topics
2. **Quiz Interface**: 
   - 20 randomly selected questions
   - 20-minute countdown timer
   - Progress bar showing completion
3. **Navigation**:
   - Click choices to select answers
   - Use "Next" button to proceed (requires answer)
   - Timer automatically submits when time expires
4. **Keyboard Shortcuts**:
   - Arrow keys: Navigate questions
   - Numbers 1-4: Select answer choices

#### 3. Review Results
1. **Score Summary**: View correct/incorrect/unattempted counts
2. **Detailed Review**: 
   - See your answers vs. correct answers
   - Read explanations for each question
   - Green = correct, red = incorrect, gray = unattempted

### For Administrators

#### 1. Access Admin Panel
- URL: `yourdomain.com/admin.html`
- Username: `admin`
- Password: `admin`

#### 2. Student Management
1. **Generate Codes**:
   - Enter student name and class
   - Select topics they can access
   - Generate and copy access code
2. **Code Distribution**:
   - Add codes to `data/codes.txt`
   - Share individual codes with students
   - Codes are unique and contain permissions

#### 3. Content Management
1. **Add Question Files**:
   - Create JSON files in `data/questions/`
   - Follow naming convention
   - Minimum 20 questions per file
2. **Update File List**:
   - Add filenames to `data/config/files.txt`
   - One filename per line

## 🚀 Deployment Guide

### GitHub Pages Deployment

#### 1. Repository Setup
```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit: Quiz Platform"

# Connect to GitHub
git remote add origin https://github.com/yourusername/repository-name.git
git branch -M main
git push -u origin main
```

#### 2. Enable GitHub Pages
1. Go to repository Settings on GitHub
2. Navigate to "Pages" section
3. Source: "Deploy from a branch"
4. Branch: `main`
5. Folder: `/ (root)`
6. Click "Save"
7. Site will be available at: `https://yourusername.github.io/repository-name`

#### 3. Custom Domain (Optional)
1. Add `CNAME` file to repository root:
   ```
   quiz.yourschool.com
   ```
2. Configure DNS with your domain provider
3. Enable "Enforce HTTPS" in Pages settings

### Alternative Hosting Options

#### Netlify
1. Connect GitHub repository
2. Build settings: None (static site)
3. Publish directory: `/`

#### Vercel
1. Import GitHub repository
2. Framework preset: Other
3. Deploy

#### Traditional Web Hosting
1. Upload all files via FTP
2. Ensure `index.html` is in root directory
3. Configure web server (if needed)

## 🔧 Customization

### Theme Customization

Edit CSS variables in `css/styles.css`:

```css
:root {
    /* Colors */
    --bg-primary: #1a1a1a;        /* Main background */
    --bg-secondary: #2d2d2d;      /* Card backgrounds */
    --purple-accent: #8b5cf6;     /* Primary accent color */
    --gold-accent: #fbbf24;       /* Secondary accent color */
    --text-primary: #ffffff;      /* Main text color */
    --text-secondary: #a1a1aa;    /* Secondary text color */
    
    /* Layout */
    --border-radius: 12px;        /* Rounded corners */
    --container-width: 1200px;    /* Max content width */
    
    /* Animation */
    --transition: all 0.3s ease;  /* Smooth transitions */
}
```

### Timer Customization

Change quiz duration in `js/main.js`:

```javascript
// Line ~13
this.timeRemaining = 30 * 60; // 30 minutes instead of 20

// Or make it configurable per topic
async startQuiz(topicFilename) {
    // Set different times based on topic
    const timeMapping = {
        'physics': 25 * 60,     // 25 minutes for physics
        'math': 20 * 60,        // 20 minutes for math
        'chemistry': 30 * 60    // 30 minutes for chemistry
    };
    
    this.timeRemaining = timeMapping[subject] || 20 * 60;
    // ...existing code...
}
```

### Logo Replacement

Replace `assets/logo.png` with your institution's logo:
- **Recommended size**: 200x200 pixels
- **Format**: PNG with transparent background
- **Backup original**: Keep a copy of the original logo

### Admin Credentials

Change admin login in `js/admin.js`:

```javascript
// Line ~270
if (username === 'your-username' && password === 'your-secure-password') {
    // ...existing code...
}
```

## 📊 Analytics and Monitoring

### Student Progress Tracking

The platform stores quiz attempts in browser localStorage. To implement server-side tracking:

1. **Modify `submitQuiz()` function** to send results to your server
2. **Add API endpoints** for result collection
3. **Create dashboard** for progress monitoring

### Performance Monitoring

Monitor site performance using:
- **Google Analytics**: Add tracking code to HTML
- **Google PageSpeed Insights**: Test loading times
- **Browser DevTools**: Check for JavaScript errors

## 🔒 Security Considerations

### Current Security Level
- **Client-side only**: No server-side validation
- **Base64 encoding**: Not true encryption (educational use)
- **Hardcoded credentials**: Suitable for controlled environments

### Enhanced Security Options

#### 1. Server-side Validation
```javascript
// Add server endpoint to validate access codes
async validateAccessCode(code) {
    const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    });
    return response.json();
}
```

#### 2. Encrypted Access Codes
```javascript
// Use crypto library for encryption
const CryptoJS = require('crypto-js');
const secretKey = 'your-secret-key';

// Encrypt
const encrypted = CryptoJS.AES.encrypt(JSON.stringify(userData), secretKey).toString();

// Decrypt  
const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey).toString(CryptoJS.enc.Utf8);
```

#### 3. Time-based Expiration
```javascript
// Add expiration to access codes
const userData = {
    name: "Student Name",
    // ...other fields...
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
};
```

## 🐛 Troubleshooting

### Common Issues

#### Quiz Won't Start
**Symptoms**: Error message or blank screen when starting quiz

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify question file has minimum 20 questions
3. Validate JSON format using [JSONLint](https://jsonlint.com/)
4. Ensure file is properly named and in correct directory

#### Access Code Invalid
**Symptoms**: "Invalid access code" error message

**Solutions**:
1. Verify code is added to `data/codes.txt`
2. Check for extra spaces or line breaks
3. Ensure code was generated correctly in admin panel
4. Try decoding manually: `atob('your-code-here')`

#### Math Formulas Not Rendering
**Symptoms**: LaTeX code visible instead of formatted equations

**Solutions**:
1. Check MathJax is loading (Network tab in DevTools)
2. Verify LaTeX syntax: `$x^2$` not `$x^2 $` (no trailing space)
3. Wait for MathJax to finish loading (may take a few seconds)
4. Clear browser cache and reload

#### Performance Issues
**Symptoms**: Slow loading or freezing during quiz

**Solutions**:
1. Reduce question file sizes (split large files)
2. Optimize images in `assets/` folder
3. Check for memory leaks in browser console
4. Test on different devices and browsers

#### Deployment Issues
**Symptoms**: Site not loading after GitHub Pages deployment

**Solutions**:
1. Check GitHub Pages build status in repository Actions
2. Verify `index.html` is in repository root
3. Ensure all file paths use forward slashes (`/`)
4. Check for case-sensitive filename issues

### Debug Mode

Enable debug logging by adding to browser console:

```javascript
// Enable verbose logging
localStorage.setItem('debug', 'true');

// View stored user session
console.log(JSON.parse(sessionStorage.getItem('cognition_user')));

// Check loaded topics
console.log(window.app?.availableTopics);
```

## 📈 Performance Optimization

### File Size Optimization
- **Minify CSS/JS**: Use tools like UglifyJS or online minifiers
- **Compress Images**: Use WebP format for better compression
- **Reduce Questions**: Split large question sets into multiple files

### Loading Speed
- **Preload MathJax**: Add preload hints in HTML head
- **Lazy Load**: Load question files only when needed
- **Cache Strategy**: Implement service worker for offline access

### Browser Compatibility
- **ES6+ Features**: Ensure target browsers support modern JavaScript
- **Fallbacks**: Provide alternatives for older browsers
- **Testing**: Test on multiple browsers and devices

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit with descriptive messages
5. Submit pull request

### Code Style Guidelines
- **Indentation**: 4 spaces for JavaScript, 2 for CSS
- **Naming**: camelCase for variables, PascalCase for classes
- **Comments**: Document complex logic and public functions
- **Testing**: Test on multiple browsers before submitting

### Reporting Issues
Please include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Console error messages
- Screenshots if applicable

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

### Documentation
- **Setup Guide**: Follow this README step by step
- **API Reference**: Check function comments in JS files
- **Examples**: See sample question files in `data/questions/`

### Community Support
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Share ideas and get help from community
- **Wiki**: Additional documentation and tutorials

### Professional Support
For custom development or deployment assistance, contact your development team.

---

**Cognition Coaching Center** - Empowering education through interactive technology

*Last updated: August 6, 2025*