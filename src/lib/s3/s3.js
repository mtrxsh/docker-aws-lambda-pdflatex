const SecretsManager = require("../secret/SecretsManager");
const aws = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const { unzipFile } = require("../util/file-op");

const S3 = async () => {
  try {
    const accessKeyId = await SecretsManager.getSecret(
      "s3-access-key-id"
    );
    const secretAccessKey = await SecretsManager.getSecret(
      "s3-secret-access-key"
    );

    const s3 = new aws.S3({
      accessKeyId,
      secretAccessKey,
      region: process.env.REGION,
    });

    return s3;
  } catch (error) {
    console.error("Error initialising S3", error, error.stack);
  }
  return null;
};

// List all objects under the key (prefix)
const listObjectsS3Helper = async (s3, bucket, prefix) => {
  const params = {
    Bucket: bucket,
    Prefix: prefix,
  };
  console.log(`Listing objects in ${bucket}/${prefix}`);
  return s3.listObjectsV2(params).promise();
};

// Download a single file
const downloadFileS3Helper = async (
  s3,
  bucket,
  key,
  localPath,
  basePath = ""
) => {
  // If key ends with `/`, it's a directory and should be ignored
  if (key.endsWith("/")) {
    return;
  }

  const params = {
    Bucket: bucket,
    Key: key,
  };

  const data = await s3.getObject(params).promise();

  // Create necessary subdirectories based on the S3 key
  let fileName = path.basename(key);
  let relativeFilePath = key.replace(basePath, ""); // Strip the base prefix from the key
  let localFilePath = path.join(localPath, relativeFilePath);
  let localDir = path.dirname(localFilePath);

  // Ensure local directory structure exists
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  // Save file to the corresponding local path
  fs.writeFileSync(path.join(localFilePath), data.Body);
  console.log(`Downloaded ${key} to ${localFilePath}`);

  return localFilePath;
};

/**
 * find the zip located in bucket/key
 * download the zip file and unzip it into the local file system
 * @param {*} param0
 */
async function downloadZipS3({ bucket, key, filePath }) {
  let result;

  try {
    console.log("downloading", bucket, key, "(zip) into", filePath);

    // Ensure local directory exists
    if (!fs.existsSync(filePath)) {
      await mkdir(filePath, { recursive: true });
    }

    const s3 = await S3();

    // List and download all files
    const objects = await listObjectsS3Helper(s3, bucket, key);
    if (objects.Contents.length === 0) {
      console.log(`No files found in ${key}`);
      return;
    }

    let object = objects.Contents.filter((obj) => obj.Key.endsWith(".zip"))[0];

    if (!object) {
      console.log(`No zip file found in ${key}`);
      return;
    }
    console.log(`Found zip file ${object.Key} in ${key}`);

    let zipFile = await downloadFileS3Helper(
      s3,
      bucket,
      object.Key,
      filePath,
      key
    );

    await unzipFile({ zipFile, filePath });

    // List the contents of /tmp to verify the extraction
    const extractedFiles = fs.readdirSync(filePath);
    console.log(`Files in ${filePath}:`, extractedFiles);
  } catch (e) {
    console.log(e, e.stack);
  }

  return result;
}

/**
 * download specified folder from s3 into local file system
 * @param {*} param0
 */
async function downloadFolderS3({ bucket, key, filePath }) {
  let result;

  try {
    console.log("downloading", bucket, key, "into", filePath);

    // Ensure local directory exists
    if (!fs.existsSync(filePath)) {
      await mkdir(filePath, { recursive: true });
    }

    const s3 = await S3();

    // List and download all files
    const objects = await listObjectsS3Helper(s3, bucket, key);
    if (objects.Contents.length === 0) {
      console.log(`No files found in ${key}`);
      return;
    }

    console.log(`Found ${objects.Contents.length} files in ${key}`);

    for (const obj of objects.Contents) {
      await downloadFileS3Helper(s3, bucket, obj.Key, filePath, key);
    }
  } catch (e) {
    console.log(e, e.stack);
  }

  return result;
}

async function downloadFileS3({ bucket, key, filePath }) {
  let result;

  try {
    console.log("downloading", bucket, key, "into", filePath);
    const s3 = await S3();

    await downloadFileS3Helper(s3, bucket, key, filePath, key);
  } catch (e) {
    console.log(e, e.stack);
  }

  return result;
}

async function uploadFileS3({ bucket, filePath, key }) {
  let result;

  try {
    const fileContent = fs.readFileSync(filePath);
    const params = {
      Bucket: bucket,
      Key: key,
      Body: fileContent,
    };
    const s3 = await S3();
    await s3.putObject(params).promise();
    console.log(`File uploaded successfully to ${bucket}/${key}`);
  } catch (error) {
    console.error("Error uploading file:", error);
  }

  return result;
}

module.exports = {
  downloadFolderS3,
  downloadFileS3,
  uploadFileS3,
  downloadZipS3,
};
