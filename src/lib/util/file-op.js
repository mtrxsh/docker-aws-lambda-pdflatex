const fs = require("fs");
const unzipper = require("unzipper");

/**
 * Function to unzip a file
 * @param {*} param0
 */
async function unzipFile({ zipFile, filePath }) {
  await fs
    .createReadStream(zipFile)
    .pipe(unzipper.Extract({ path: filePath }))
    .promise();
  console.log(`Extracted ${zipFile} into ${filePath}`);
}

/**
 * Function to read a file and return its Base64-encoded content
 * @param {*} filePath
 * @returns
 */
async function getFileContentAsBase64(filePath) {
  try {
    // Read the file as a buffer
    const fileContent = fs.readFileSync(filePath);

    // Convert the buffer to Base64
    const b64Content = fileContent.toString("base64");
    console.log(`Successfully encoded ${filePath} to Base64`);

    // Return the Base64-encoded content
    return b64Content;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Function to decode Base64 content and write it to a destination path
 * @param {*} b64Content
 * @param {*} destPath
 * @returns
 */
async function parseBase64ToFile(b64Content, destPath) {
  try {
    const fileContent = Buffer.from(b64Content, "base64");
    fs.writeFileSync(destPath, fileContent);
    console.log(`Successfully saved the file to ${destPath}`);

    return {
      message: `File successfully written to ${destPath}`,
      success: true,
    };
  } catch (error) {
    console.error(`Error writing file to ${destPath}:`, error);
    throw error;
  }
}

module.exports = {
  unzipFile,
  getFileContentAsBase64,
  parseBase64ToFile,
};
