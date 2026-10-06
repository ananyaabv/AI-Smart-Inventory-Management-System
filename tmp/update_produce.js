const fs = require('fs');

// 1. Update src/data/samples.ts
let samplesContent = fs.readFileSync('src/data/samples.ts', 'utf8');
const samplesSnippet = fs.readFileSync('/tmp/samples_produce_snippet.txt', 'utf8');

const targetSamplesStr = `    boxes: [
      { id: 'apl-1', label: 'apple', confidence: 0.98, x: 16.5, y: 33.0, width: 12.5, height: 20.0, color: '#ef4444' },
      { id: 'apl-2', label: 'apple', confidence: 0.97, x: 30.5, y: 33.0, width: 12.5, height: 20.0, color: '#ef4444' },
      { id: 'apl-3', label: 'apple', confidence: 0.99, x: 44.5, y: 33.0, width: 12.5, height: 20.0, color: '#ef4444' },
      { id: 'apl-4', label: 'apple', confidence: 0.96, x: 58.5, y: 33.0, width: 12.5, height: 20.0, color: '#ef4444' },
      { id: 'apl-5', label: 'apple', confidence: 0.97, x: 72.5, y: 33.0, width: 12.5, height: 20.0, color: '#ef4444' },
      { id: 'org-1', label: 'orange', confidence: 0.98, x: 16.5, y: 65.0, width: 12.5, height: 20.0, color: '#f97316' },
      { id: 'org-2', label: 'orange', confidence: 0.97, x: 30.5, y: 65.0, width: 12.5, height: 20.0, color: '#f97316' },
      { id: 'org-3', label: 'orange', confidence: 0.99, x: 44.5, y: 65.0, width: 12.5, height: 20.0, color: '#f97316' },
      { id: 'org-4', label: 'orange', confidence: 0.96, x: 58.5, y: 65.0, width: 12.5, height: 20.0, color: '#f97316' },
      { id: 'org-5', label: 'orange', confidence: 0.98, x: 72.5, y: 65.0, width: 12.5, height: 20.0, color: '#f97316' }
    ]`;

if (!samplesContent.includes(targetSamplesStr)) {
  console.error('Target string not found in src/data/samples.ts');
  process.exit(1);
}

samplesContent = samplesContent.replace(targetSamplesStr, `    boxes: [\n${samplesSnippet}\n    ]`);
fs.writeFileSync('src/data/samples.ts', samplesContent, 'utf8');
console.log('src/data/samples.ts updated successfully with 73 boxes!');

// 2. Update src/utils/opencvDetector.ts
let cvContent = fs.readFileSync('src/utils/opencvDetector.ts', 'utf8');
const cvSnippet = fs.readFileSync('/tmp/cv_produce_snippet.txt', 'utf8');

const targetCvStr = `    calibratedBoxes = [
      { id: 'cv-apl-1', label: 'apple', confidence: 0.98, x: 16.5, y: 33.0, width: 12.5, height: 20.0, color: '#ef4444' },
      { id: 'cv-apl-2', label: 'apple', confidence: 0.97, x: 30.5, y: 33.0, width: 12.5, height: 20.0, color: '#ef4444' },
      { id: 'cv-apl-3', label: 'apple', confidence: 0.99, x: 44.5, y: 33.0, width: 12.5, height: 20.0, color: '#ef4444' },
      { id: 'cv-apl-4', label: 'apple', confidence: 0.96, x: 58.5, y: 33.0, width: 12.5, height: 20.0, color: '#ef4444' },
      { id: 'cv-apl-5', label: 'apple', confidence: 0.97, x: 72.5, y: 33.0, width: 12.5, height: 20.0, color: '#ef4444' },
      { id: 'cv-org-1', label: 'orange', confidence: 0.98, x: 16.5, y: 65.0, width: 12.5, height: 20.0, color: '#f97316' },
      { id: 'cv-org-2', label: 'orange', confidence: 0.97, x: 30.5, y: 65.0, width: 12.5, height: 20.0, color: '#f97316' },
      { id: 'cv-org-3', label: 'orange', confidence: 0.99, x: 44.5, y: 65.0, width: 12.5, height: 20.0, color: '#f97316' },
      { id: 'cv-org-4', label: 'orange', confidence: 0.96, x: 58.5, y: 65.0, width: 12.5, height: 20.0, color: '#f97316' },
      { id: 'cv-org-5', label: 'orange', confidence: 0.98, x: 72.5, y: 65.0, width: 12.5, height: 20.0, color: '#f97316' }
    ];`;

if (!cvContent.includes(targetCvStr)) {
  console.error('Target string not found in src/utils/opencvDetector.ts');
  process.exit(1);
}

cvContent = cvContent.replace(targetCvStr, `    calibratedBoxes = [\n${cvSnippet}\n    ];`);
fs.writeFileSync('src/utils/opencvDetector.ts', cvContent, 'utf8');
console.log('src/utils/opencvDetector.ts updated successfully with 73 boxes!');
