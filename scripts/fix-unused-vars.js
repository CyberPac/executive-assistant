#!/usr/bin/env node

/**
 * Script to fix unused variable lint errors by adding underscore prefixes
 * This addresses the ESLint rule: @typescript-eslint/no-unused-vars with pattern /^_/u
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common patterns to fix
const UNUSED_PATTERNS = [
  // Function parameters
  { pattern: /([a-zA-Z][a-zA-Z0-9]*): ([^)]*)\) \{/g, replacement: '_$1: $2) {' },
  // Variable assignments
  { pattern: /const ([a-zA-Z][a-zA-Z0-9]*) = /g, replacement: 'const _$1 = ' },
  // Import aliases
  { pattern: /import \{ ([^}]+) \} from/g, handler: 'imports' },
  // Destructuring parameters
  { pattern: /\(([a-zA-Z][a-zA-Z0-9]*), ([a-zA-Z][a-zA-Z0-9]*)\) =>/g, replacement: '(_$1, _$2) =>' }
];

// Get lint errors to identify which files need fixing
function getLintErrors() {
  try {
    const lintOutput = execSync('npm run lint 2>&1', { encoding: 'utf8', cwd: '/workspaces/executive-assistant' });
    return lintOutput;
  } catch (error) {
    return error.stdout || '';
  }
}

// Parse lint output to get specific unused variable issues
function parseUnusedVars(lintOutput) {
  const lines = lintOutput.split('\n');
  const issues = [];
  
  for (const line of lines) {
    if (line.includes('@typescript-eslint/no-unused-vars') && line.includes('is defined but never used')) {
      const match = line.match(/^(.+):(\d+):(\d+)\s+error\s+'([^']+)' is defined but never used/);
      if (match) {
        const [, filePath, lineNum, colNum, varName] = match;
        issues.push({ filePath: filePath.trim(), lineNum: parseInt(lineNum), colNum: parseInt(colNum), varName });
      }
    }
  }
  
  return issues;
}

// Apply underscore prefix to unused variables
function fixUnusedVarsInFile(filePath, issues) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');
    
    // Group issues by line number (descending to avoid line number shifts)
    const fileIssues = issues.filter(i => i.filePath === filePath).sort((a, b) => b.lineNum - a.lineNum);
    
    for (const issue of fileIssues) {
      if (lines[issue.lineNum - 1]) {
        const line = lines[issue.lineNum - 1];
        const varName = issue.varName;
        
        // Skip if already has underscore prefix
        if (varName.startsWith('_')) continue;
        
        // Apply various fixes based on context
        let newLine = line;
        
        // Function parameters
        newLine = newLine.replace(new RegExp(`\\b${varName}:\\s*`, 'g'), `_${varName}: `);
        newLine = newLine.replace(new RegExp(`\\b${varName}\\s*,`, 'g'), `_${varName},`);
        newLine = newLine.replace(new RegExp(`\\(${varName}\\b`, 'g'), `(_${varName}`);
        newLine = newLine.replace(new RegExp(`,\\s*${varName}\\b`, 'g'), `, _${varName}`);
        
        // Variable declarations
        newLine = newLine.replace(new RegExp(`const ${varName} =`, 'g'), `const _${varName} =`);
        newLine = newLine.replace(new RegExp(`let ${varName} =`, 'g'), `let _${varName} =`);
        
        // Import statements
        newLine = newLine.replace(new RegExp(`import \\{([^}]*\\b)${varName}(\\b[^}]*)\\}`, 'g'), `import {$1${varName} as _${varName}$2}`);
        
        lines[issue.lineNum - 1] = newLine;
      }
    }
    
    const newContent = lines.join('\n');
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed unused variables in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Main execution
function main() {
  console.log('🔧 Fixing unused variable lint errors...');
  
  const lintOutput = getLintErrors();
  const issues = parseUnusedVars(lintOutput);
  
  console.log(`Found ${issues.length} unused variable issues across ${new Set(issues.map(i => i.filePath)).size} files`);
  
  // Group by file and fix
  const fileGroups = {};
  for (const issue of issues) {
    if (!fileGroups[issue.filePath]) fileGroups[issue.filePath] = [];
    fileGroups[issue.filePath].push(issue);
  }
  
  for (const filePath of Object.keys(fileGroups)) {
    fixUnusedVarsInFile(filePath, fileGroups[filePath]);
  }
  
  console.log('✅ Unused variable fixes complete');
}

if (require.main === module) {
  main();
}