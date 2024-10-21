# Get a base image
FROM public.ecr.aws/ubuntu/ubuntu:22.04

# Set some defaults
ARG LAMBDA_TASK_ROOT="/app"
ARG LAMBDA_RUNTIME_DIR="/usr/local/bin"
ARG PLATFORM="linux/amd64"

RUN groupadd --gid 1000 node; \
    useradd --uid 1000 --gid node --shell /bin/bash --create-home node

# node
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION v20.13.0
RUN mkdir -p /usr/local/nvm && apt-get update && echo "y" | apt-get install curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
RUN /bin/bash -c "source $NVM_DIR/nvm.sh && nvm install $NODE_VERSION && nvm use --delete-prefix $NODE_VERSION"
ENV NODE_PATH $NVM_DIR/versions/node/$NODE_VERSION/bin
ENV PATH $NODE_PATH:$PATH

WORKDIR /app

## Install aws-lambda-ric & pdflatex

ENV DEBIAN_FRONTEND=noninteractive
ENV DEBIAN_FRONTEND=teletype

RUN apt-get update; \
    apt-get install -y \
        g++ \
        make \
        cmake \
        unzip \
        libcurl4-openssl-dev \
        autoconf \
        automake \
        build-essential \
        libtool \
        m4 \
        python3 \
        unzip \
        libssl-dev;
RUN npm install aws-lambda-ric -g

# Install pdflatex/luatex
# * Prevent this error
# Package fontspec Error: The font "Arial" cannot be found
# https://tex.stackexchange.com/questions/204145/some-fonts-not-recognized-by-lualatex
# Install msttcorefonts (includes Arial) and accept EULA
# Install additional fonts (optional alternatives to Arial)
# Update font cache after installing new fonts
RUN apt-get update && apt-get install -y \
        texlive-latex-base \
        texlive-latex-recommended \
        texlive-fonts-recommended \
        texlive-fonts-extra \
        texlive-luatex \
        fonts-liberation;
RUN apt-get update && yes | apt-get install -y ttf-mscorefonts-installer

# Prevent this error
# FATAL ERROR luaotfload | load : × Failed to load "fontloader" module "basics-gen"
# luaotfload-init.lua:301: system : no writeable cache path, quiting
RUN mkdir -p /tmp/texlive-cache && chown -R node:node /tmp/texlive-cache && chmod -R 775 /tmp/texlive-cache
ENV TEXMFCACHE=/tmp/texlive-cache

RUN fc-cache -f -v
RUN luaotfload-tool --cache=erase
RUN luaotfload-tool --update
RUN texhash

# Clean up
RUN rm -rf /var/lib/apt/lists/*;

# Prevent this warn
# npm WARN logfile Error: ENOENT: no such file or directory, scandir '/home/sbx_user1051/.npm/_logs'
# https://stackoverflow.com/a/73394694/3957754
RUN mkdir -p /tmp/.npm/_logs
ENV npm_config_cache /tmp/.npm

# (Optional) Add Lambda Runtime Interface Emulator and use a script in the ENTRYPOINT for simpler local runs
WORKDIR ${LAMBDA_TASK_ROOT}
ADD "https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie" "/usr/bin/aws-lambda-rie"
COPY entry.sh /
RUN chmod 755 "/usr/bin/aws-lambda-rie" "/entry.sh"

# Copy your function code
COPY ./src/ ${LAMBDA_TASK_ROOT}/
RUN npm install 

ENTRYPOINT [ "/entry.sh" ]
CMD [ "index.handler" ]