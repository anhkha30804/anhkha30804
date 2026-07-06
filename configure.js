const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const questions = [
  { key: 'NAME', question: 'Enter your Full Name (e.g. Alain): ', default: 'Alain' },
  { key: 'ROLE', question: 'Enter your Professional Role (e.g. Full-Stack Web Developer): ', default: 'Web & Backend Developer' },
  { key: 'GITHUB_USERNAME', question: 'Enter your GitHub Username: ', required: true },
  { key: 'WAKATIME_USERNAME', question: 'Enter your Wakatime Username (press Enter to use GitHub username): ', default: '' },
  { key: 'WAKATIME_USER_ID', question: 'Enter your Wakatime Badge User ID (UUID from wakatime.com/share) (press Enter to skip): ', default: '' },
  { key: 'LINKEDIN_URL', question: 'Enter your LinkedIn URL (press Enter to skip): ', default: '#' },
  { key: 'EMAIL_ADDRESS', question: 'Enter your Email Address: ', required: true },
  { key: 'PORTFOLIO_URL', question: 'Enter your Portfolio/Website URL (press Enter to skip): ', default: '#' }
];

const answers = {};

console.log('\x1b[36m==================================================\x1b[0m');
console.log('\x1b[35m✨  GitHub Profile README Auto-Configurator  ✨\x1b[0m');
console.log('\x1b[36m==================================================\x1b[0m\n');
console.log('This script will help customize your README with your own details.\n');

function askQuestion(index) {
  if (index === questions.length) {
    rl.close();
    generateReadme();
    return;
  }

  const q = questions[index];
  const promptText = `${q.question}${q.default && q.default !== '#' ? `(\x1b[90mdefault: ${q.default}\x1b[0m) ` : ''}`;

  rl.question(promptText, (answer) => {
    let finalAnswer = answer.trim();
    if (!finalAnswer && q.default) {
      finalAnswer = q.default;
    }

    if (q.required && !finalAnswer) {
      console.log('\x1b[31mThis field is required. Please enter a value.\x1b[0m');
      askQuestion(index);
    } else {
      answers[q.key] = finalAnswer;
      askQuestion(index + 1);
    }
  });
}

function generateReadme() {
  console.log('\nGenerating your README.md...');
  try {
    const templatePath = path.join(__dirname, 'README_template.md');
    const outputPath = path.join(__dirname, 'README.md');

    if (!fs.existsSync(templatePath)) {
      throw new Error('README_template.md template file not found! Please make sure it is in the same directory.');
    }

    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Fallbacks and cleanup for Wakatime
    if (!answers['WAKATIME_USERNAME']) {
      answers['WAKATIME_USERNAME'] = answers['GITHUB_USERNAME'];
    }
    
    if (!answers['WAKATIME_USER_ID'] || answers['WAKATIME_USER_ID'] === '#') {
      // Cleanly remove the Wakatime badge if no ID is provided
      template = template.replace(/<a href="https:\/\/wakatime\.com\/@{{WAKATIME_USER_ID}}"><img src="https:\/\/wakatime\.com\/badge\/user\/{{WAKATIME_USER_ID}}\.svg" alt="wakatime" \/><\/a>/g, '');
    }

    // Replace all placeholders
    for (const [key, value] of Object.entries(answers)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, value);
    }
    
    fs.writeFileSync(outputPath, template, 'utf8');
    console.log('\n\x1b[32m==================================================\x1b[0m');
    console.log('\x1b[32m🎉 SUCCESS: README.md generated successfully! 🎉\x1b[0m');
    console.log('\x1b[32m==================================================\x1b[0m\n');
    console.log(`Saved to: ${outputPath}\n`);
    console.log('👉 Next Steps:');
    console.log('1. Review and test your new README.md locally.');
    console.log('2. Create a new public repository on GitHub named exactly after your GitHub username.');
    console.log('3. Commit and push this README.md to that repository.');
    console.log('4. Enjoy your brand new gorgeous GitHub Profile! 🚀\n');
  } catch (err) {
    console.error('\x1b[31mError generating README.md:\x1b[0m', err.message);
  }
}

askQuestion(0);
