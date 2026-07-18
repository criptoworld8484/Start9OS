# cloudflared container version is defined in startos/manifest/index.ts
ARG CLOUDFLARED_IMAGE=cloudflare/cloudflared:latest

# used to copy the cloudflared binary
FROM $CLOUDFLARED_IMAGE AS cloudflared

# run on debian trixie slim
FROM debian:13-slim

RUN \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y \
        ca-certificates \
        curl && \
    apt-get autoclean && \
    rm -rf \
      /var/lib/apt/lists/* \
      /var/tmp/* \
      /tmp/*

# add cloudflared binary
COPY --chmod=0755 --from=cloudflared /usr/local/bin/cloudflared /usr/local/bin/cloudflared
