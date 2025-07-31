#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generates project files and folders from a JSON structure.
 * @param {string} jsonFilePath - The path to the input JSON file.
 * @param {string} outputDir - The directory where the project will be created.
 */
function generateProject(jsonFilePath, outputDir) {
  try {
    // 1. Resolve paths
    const resolvedJsonPath = path.resolve(jsonFilePath);
    const projectRoot = path.resolve(outputDir);
    
    console.log(`Reading project structure from: ${resolvedJsonPath}`);
    console.log(`Generating project in: ${projectRoot}\n`);

    // 2. Read and parse the JSON file
    if (!fs.existsSync(resolvedJsonPath)) {
      throw new Error(`Input file not found at: ${resolvedJsonPath}`);
    }
    const rawData = fs.readFileSync(resolvedJsonPath, 'utf8');
    const projectData = JSON.parse(rawData);

    // 3. Validate the JSON structure
    if (!projectData.project_files || !Array.isArray(projectData.project_files)) {
      throw new Error('JSON file must have a root key "project_files" which is an array.');
    }

    // 4. Create the root project directory if it doesn't exist
    if (!fs.existsSync(projectRoot)) {
      fs.mkdirSync(projectRoot);
      console.log(`📁 Created root directory: ${outputDir}`);
    }

    // 5. Iterate over the files and create them
    projectData.project_files.forEach(file => {
      if (!file.name || typeof file.content === 'undefined') {
        console.warn('⚠️  Skipping invalid file entry:', file);
        return;
      }
      
      const filePath = path.join(projectRoot, file.name);
      const dirName = path.dirname(filePath);

      // Create directory for the file if it doesn't exist
      if (!fs.existsSync(dirName)) {
        // The { recursive: true } option creates parent directories as needed.
        fs.mkdirSync(dirName, { recursive: true });
        console.log(`   📁 Created directory: ${path.relative(projectRoot, dirName)}`);
      }

      // Write the file content
      fs.writeFileSync(filePath, file.content, 'utf8');
      console.log(`      📄 Created file: ${file.name}`);
    });

    console.log('\n✅ Project generation complete!');

  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('❌ Error: Invalid JSON in the input file.', error.message);
    } else {
      console.error('❌ An error occurred:', error.message);
    }
    process.exit(1); // Exit with an error code
  }
}

// --- Script Execution ---

// Get command-line arguments
const jsonFilePath = process.argv[2];
const outputDir = process.argv[3] || 'generated-project'; // Default to 'generated-project'

if (!jsonFilePath) {
  console.error('Error: Please provide the path to the JSON structure file.');
  console.log('\nUsage:');
  console.log('  node generate-project.js <path-to-your-json-file.json> [output-directory-name]');
  console.log('\nExample:');
  console.log('  node generate-project.js project-structure.json my-new-app');
  process.exit(1);
}

generateProject(jsonFilePath, outputDir);