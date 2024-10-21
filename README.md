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
   git clone https://github.com/<your-username>/docker-pdf-generator.git
   cd docker-pdf-generator
   ```

2. Build the Docker image:

   ```bash
   docker build --platform linux/amd64 -t pdflatex . --rm
   ```

3. Run the container:

   ```bash
   docker run --platform linux/amd64 -it -p 8080:8080 pdflatex
   ```

4. Run client app:

  ```bash
  node app.js
  ```

## Acknowledgments

This project was made possible with the help of the following repositories and resources:

- [aws-lambda-nodejs](https://github.com/jrichardsz/aws-lambda-nodejs).
- [TeX Live (LaTeX/pdflatex) for AWS Lambda](https://github.com/serverlesspub/latex-aws-lambda-layer).



   
