const path = require("path");
const {
  downloadZipS3,
  downloadFolderS3,
  downloadFileS3,
  uploadFileS3,
} = require("../s3/s3");
const {
  parseBase64ToFile,
  unzipFile,
  getFileContentAsBase64,
} = require("./file-op");
const { compilePdfLatex } = require("../pdflatex/compile");

async function generateViaS3({
  templateBucketName,
  templateObjectKey,
  inputBucketName,
  inputObjectKey,
  outputBucketName,
  outputObjectKey,
  isTemplateFolder,
  isTemplateZip,
  workdir,
  inputFile,
  outputFile,
}) {
  if (
    !inputBucketName ||
    !inputObjectKey ||
    !outputBucketName ||
    !outputObjectKey ||
    !templateBucketName ||
    !templateObjectKey
  ) {
    return {
      error:
        "Required inputs " +
        "(inputBucketName, inputObjectKey, outputBucketName, outputObjectKey, templateBucketName, templateObjectKey)" +
        " are missing",
    };
  }

  console.log(
    "converting",
    inputBucketName,
    inputObjectKey,
    "using",
    inputFile
  );

  // download latex template from s3 (a zip or a folder or a file)
  if (isTemplateZip) {
    await downloadZipS3({
      bucket: templateBucketName,
      key: templateObjectKey,
      filePath: workdir,
    });
  } else if (isTemplateFolder) {
    await downloadFolderS3({
      bucket: templateBucketName,
      key: templateObjectKey,
      filePath: workdir,
    });
  } else {
    await downloadFileS3({
      bucket: templateBucketName,
      key: templateObjectKey,
      filePath: workdir,
    });
  }

  // download input file from s3
  await downloadFileS3({
    bucket: inputBucketName,
    key: inputObjectKey,
    filePath: inputFile,
  });

  // generate pdf
  await compilePdfLatex({ inputFile, workdir });

  // upload output file to s3
  await uploadFileS3({
    bucket: outputBucketName,
    key: outputObjectKey,
    filePath: outputFile,
  });

  return {
    outputBucketName,
    outputObjectKey,
  };
}

async function generateViaData({
  inputFile,
  outputFile,
  workdir,
  templateZipBase64,
}) {
  if (!templateZipBase64) {
    return {
      error: "Required inputs " + "(templateZipBase64)" + " are missing",
    };
  }

  console.log("converting tex template (base64)", "using", inputFile);

  let zipFile = path.join(workdir, "template.zip");
  await parseBase64ToFile(templateZipBase64, zipFile);
  await unzipFile({ zipFile, filePath: workdir });

  // generate pdf
  await compilePdfLatex({ inputFile, workdir });

  let b64Content = await getFileContentAsBase64(outputFile);

  return {
    outputFile,
    content: b64Content,
    contentType: "base64",
  };
}

module.exports = {
  generateViaS3,
  generateViaData,
};
