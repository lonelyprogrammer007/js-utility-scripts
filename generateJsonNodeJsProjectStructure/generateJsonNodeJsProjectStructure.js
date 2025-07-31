/**
 * @fileoverview This script reads all files from a given directory and its subdirectories
 * and creates a JSON object representing the directory structure and file contents.
 */

// Import the 'fs' (File System) and 'path' modules.
// 'fs' is used for interacting with the file system (reading files and directories).
// 'path' is used for working with file and directory paths in a platform-independent way.
const fs = require('fs');
const path = require('path');

/**
 * Recursively reads a directory and returns a JSON-like object
 * representing its structure and the content of its files.
 *
 * @param {string} dirPath The path to the directory to read.
 * @returns {object} An object representing the directory structure.
 * Keys are file/directory names. For files, the value is the
 * file content as a UTF-8 string. For directories, the value
 * is another object representing that subdirectory.
 */
function readDirectoryStructure(dirPath) {
  const result = {};

  try {
    // Read all items (files and directories) in the current directory path.
    console.log("LUCHO",  dirPath)
    const items = fs.readdirSync(dirPath);

    // Iterate over each item found in the directory.
    items.forEach(item => {
      // Construct the full path for the current item.
      const itemPath = path.join(dirPath, item);
      // Get statistics about the item to determine if it's a file or a directory.
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        // If the item is a directory, recursively call this function
        // to read its structure and add it to the result object.
        result[item] = readDirectoryStructure(itemPath);
      } else if (stats.isFile()) {
        // If the item is a file, read its content.
        try {
          // Read the file content as a UTF-8 encoded string.
          const content = fs.readFileSync(itemPath, 'utf8');
          result[item] = content;
        } catch (readError) {
          // If there's an error reading the file (e.g., permission issues),
          // store an error message instead of the content.
          console.error(`Could not read file: ${itemPath}`, readError);
          result[item] = `Error reading file: ${readError.message}`;
        }
      }
    });
  } catch (dirError) {
    // If there's an error reading the directory itself, log it and return an error object.
    console.error(`Could not read directory: ${dirPath}`, dirError);
    return { error: `Error reading directory: ${dirError.message}` };
  }

  return result;
}

// --- --- --- --- ---
// --- USAGE ---
// --- --- --- --- ---

// Get the directory path from the command-line arguments.
// process.argv[0] is 'node', process.argv[1] is the script file name.
// The actual arguments start at index 2.
const targetPath = process.argv[2];

// Check if a path was provided.
if (!targetPath) {
  console.error('Error: Please provide a directory path to scan.');
  console.log('Usage: node read-project.js <path-to-directory>');
  process.exit(1); // Exit the script with an error code.
}

// Resolve the path to an absolute path to ensure it's always correct.
const projectPath = path.isAbsolute(targetPath) ? targetPath : path.resolve(targetPath);

// Call the main function with the path provided by the user.
let directoryJSON = readDirectoryStructure(projectPath);

// --- Create a dummy directory and files for demonstration ---
function createDummyProject() {
  if (fs.existsSync(projectPath)) {
    // If the directory already exists, remove it to start fresh.
    // The { recursive: true, force: true } options ensure it deletes subdirectories and files.
    fs.rmSync(projectPath, { recursive: true, force: true });
  }
  fs.mkdirSync(projectPath, { recursive: true });
  fs.mkdirSync(path.join(projectPath, 'src'));
  fs.mkdirSync(path.join(projectPath, 'test'));

  fs.writeFileSync(path.join(projectPath, 'package.json'), '{\n  "name": "dummy-project",\n  "version": "1.0.0"\n}');
  fs.writeFileSync(path.join(projectPath, 'src', 'index.js'), 'console.log("Hello, World!");');
  fs.writeFileSync(path.join(projectPath, 'src', 'utils.js'), 'const add = (a, b) => a + b;');
  fs.writeFileSync(path.join(projectPath, 'test', 'utils.test.js'), '// Test cases for utils.js');
  console.log('Dummy project created for demonstration.');
}

createDummyProject();
// --- End of dummy project creation ---

// Call the main function with the path to your project directory.
directoryJSON = readDirectoryStructure(projectPath);

// Convert the resulting JavaScript object into a formatted JSON string.
// The 'null, 2' arguments make the JSON output nicely indented and human-readable.
const jsonOutput = JSON.stringify(directoryJSON, null, 2);

// Print the final JSON to the console.
console.log('\n--- Generated JSON Structure ---');
console.log(jsonOutput);

// You can also save this JSON to a file.
try {
  fs.writeFileSync(path.join(__dirname, 'project-structure.json'), jsonOutput);
  console.log('\nSuccessfully saved the JSON structure to project-structure.json');
} catch (writeError) {
  console.error('\nError writing JSON to file:', writeError);
}

