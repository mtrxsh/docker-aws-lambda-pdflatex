const path = require("path");
const os = require("os");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { generateViaS3, generateViaData } = require("./lib/util/generate");

exports.handler = async (event, context) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  let result = await main(event, context);

  console.log(`RESULT: ${JSON.stringify(result)}`);
  return {
    statusCode: 200,
    //  Uncomment below to enable CORS requests
    //  headers: {
    //      "Access-Control-Allow-Origin": "*",
    //      "Access-Control-Allow-Headers": "*"
    //  },
    body: JSON.stringify(result),
  };
};

async function main(event, context) {
  let result;

  try {
    let input = event.data; // base64_encode(JSON.stringify({...data}))

    try {
      input = JSON.parse(Buffer.from(input, "base64").toString("utf-8"));
    } catch (error) {
      input = null;
      console.log(error, error.stack);
    }

    let {
      templateBucketName,
      templateObjectKey,
      inputBucketName,
      inputObjectKey,
      outputBucketName,
      outputObjectKey,
      isTemplateFolder,
      isTemplateZip,
      inputFileName,
      outputFileName,
      templateZipBase64,
    } = input || {};

    console.log(`Input: ${JSON.stringify(input)}`);

    let extension = ".pdf",
      workdir = os.tmpdir(),
      awsRequestId = context?.awsRequestId;

    // forge one if not provided
    awsRequestId = awsRequestId || uuidv4();
    workdir = path.join(workdir, awsRequestId);
    // Ensure local directory exists
    if (!fs.existsSync(workdir)) {
      fs.mkdirSync(workdir, { recursive: true });
    }

    let inputFile = path.join(
        workdir,
        inputFileName || awsRequestId + path.extname(inputObjectKey)
      ),
      outputFile = path.join(
        workdir,
        outputFileName || awsRequestId + extension
      );

    if (!!templateZipBase64) {
      result = await generateViaData({
        inputFile,
        outputFile,
        workdir,
        templateZipBase64,
      });
    } else {
      result = await generateViaS3({
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
      });
    }
  } catch (e) {
    console.log(e, e.stack);
    result = { error: e.message };
  }

  return result;
}
