const fs = require('fs');
const path = require('path');

const classes = ['7','8','9','10','11','12'];
const subjects = ['Mathematics','Science','English'];
const questionsDir = path.join(__dirname, '../data/questions');

classes.forEach(cls => {
    subjects.forEach(subject => {
        const filename = `class${cls}-${subject.toLowerCase()}.json`;
        const filePath = path.join(questionsDir, filename);
        const questions = [];
        for (let i = 1; i <= 30; i++) {
            questions.push({
                id: `q${i}`,
                stem: `Placeholder question ${i} for Class ${cls} ${subject} based on ISC/CBSE syllabus`,
                choices: [
                    `Option A`,
                    `Option B`,
                    `Option C`,
                    `Option D`
                ],
                answer: 0,
                explanation: `Placeholder explanation for question ${i}`
            });
        }
        const data = {
            class: cls,
            chapter: subject,
            topic: `${subject}`,
            questions
        };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Generated ${filename}`);
    });
});

console.log('All question files generated.');
