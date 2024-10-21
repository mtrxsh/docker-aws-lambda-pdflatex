# docker-aws-lambda-pdflatex
A Docker-based LaTeX PDF generation service using LuaTeX with AWS Lambda integration

## Features

- **LaTeX with LuaTeX**: Generate PDFs using LaTeX templates.
- **AWS Lambda Compatible**: Optimized for deployment on AWS Lambda.

## Getting Started
### Prerequisites

- Docker installed on your local machine
- LaTeX template
- Optional for AWS lambda deployment:
    - AWS Lambda (optional for deployment)
    - AWS SecretsManager secrets with S3 access permissions: `s3-access-key-id`, `s3-secret-access-key`

### Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:mtrxsh/docker-aws-lambda-pdflatex.git
   ```
   
2. Pull the Docker image:

   ```bash
   docker pull tunatr/aws-lambda-pdflatex:v1
   ```

3. Build the Docker image:

   ```bash
   docker build --platform linux/amd64 -t pdflatex . --rm
   ```

4. Run the container:

   ```bash
   docker run --platform linux/amd64 -it -p 8080:8080 pdflatex
   ```

5. Run client (local):

  ```javascript
  try {
    let templateB64; // .tex or .zip, base64 encoded  
    let payload = {
      templateZipBase64: templateB64,
      inputFileName: "main.tex",
      outputFileName: "main.pdf",
    };
    let data = Buffer.from(JSON.stringify(payload)).toString("base64");
    const response = await axios.post(
      `http://localhost:8080/2015-03-31/functions/function/invocations`,
      {
        data,
      }
    );
    let responseData = response.data;
    console.log("Server response:", responseData);
    let result = JSON.parse(responseData.body);
    parseBase64ToFile(
      result.content,
      path.join(__dirname, "output/output.pdf")
    );
  } catch (error) {
    console.error("Error calling server:", error.message);
  }
  ```

6. Run client with AWS Lambda integration:
    ```javascript
    let payload = {
      "templateBucketName": "s3_template_bucket",
      "templateObjectKey": "templates/template_folder",
      "inputBucketName": "s3_input_bucket",
      "inputObjectKey": "input/test.tex",
      "outputBucketName": "s3_output_bucket",
      "outputObjectKey": "output/test.pdf”
    };
    ```

## Acknowledgments

This project was made possible with the help of the following repositories and resources:

- [aws-lambda-nodejs](https://github.com/jrichardsz/aws-lambda-nodejs).
- [TeX Live (LaTeX/pdflatex) for AWS Lambda](https://github.com/serverlesspub/latex-aws-lambda-layer).



   
