const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(getFiles(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = getFiles('src/components');
let changedFiles = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const initial = content;
  
  content = content.replace(/bg-\[([^\]]+)\]\/\[([^\]]+)\] blur-\[(\d+)px\]/g, (match, color, opacity, blur) => {
    let hexOpacity = Math.round(parseFloat(opacity) * 255).toString(16).padStart(2, '0');
    if (parseFloat(opacity) <= 0.1) hexOpacity = '15'; // Give it a slight boost because radial fades out
    return `style={{ background: 'radial-gradient(circle, ${color}${hexOpacity}, transparent 70%)' }}`;
  });
  
  content = content.replace(/className="([^"]*) style={{([^}]*)}}([^"]*)"/g, (match, p1, p2, p3) => {
    return `className="${p1}${p3}" style={{${p2}}}`;
  });

  if (file.includes('Contact.tsx')) {
    content = content.replace('https://linkedin.com/in/faturachman-alkahfi', 'https://www.linkedin.com/in/faturachman-al-kahfi-662283304/');
    content = content.replace('"faturachman-alkahfi"', '"faturachman-al-kahfi-662283304"');
  }

  if (initial !== content) {
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});
console.log(`Done. Updated ${changedFiles} files.`);
