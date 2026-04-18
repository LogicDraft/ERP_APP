// Script to sort students alphabetically and reassign roll numbers
const fs = require('fs');
const path = require('path');

// Read the mockData file
const mockDataPath = path.join(__dirname, 'mockData.js');
let content = fs.readFileSync(mockDataPath, 'utf8');

// Extract the students array using regex
const studentsMatch = content.match(/students:\s*\[([\s\S]*?)\n\s*\],\s*timetable/);
if (!studentsMatch) {
    console.error('Could not find students array');
    process.exit(1);
}

const studentsString = studentsMatch[1];

// Parse students (simple JSON parse)
const studentsArrayString = '[' + studentsString + '\n]';
const students = eval('(' + studentsArrayString + ')');

// Sort students alphabetically by name
students.sort((a, b) => a.name.localeCompare(b.name));

// Reassign roll numbers
students.forEach((student, index) => {
    student.roll = String(index + 1);
    student._id = String(index + 1);
});

// Convert back to formatted string
const formattedStudents = students.map(s => {
    return `        {
            "_id": "${s._id}",
            "auid": "${s.auid}",
            "name": "${s.name}",
            "gender": "${s.gender}",
            "mentor": "${s.mentor}",
            "roll": "${s.roll}"
        }`;
}).join(',\n');

// Replace in content
const newContent = content.replace(
    /students:\s*\[([\s\S]*?)\n\s*\],\s*timetable/,
    `students: [\n${formattedStudents}\n    ],\n    timetable`
);

// Write back
fs.writeFileSync(mockDataPath, newContent, 'utf8');
console.log('✅ Students sorted alphabetically and roll numbers updated!');
console.log(`Total students: ${students.length}`);
