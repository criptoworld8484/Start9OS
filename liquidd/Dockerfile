# Build stage: download official Elements Core release tarball,
# verify against the pinned Blockstream release signer (clearsigned SHA256SUMS.asc),
# and extract.
FROM debian:stable-slim AS builder

ARG VERSION
ARG TARGETPLATFORM

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates wget gnupg && rm -rf /var/lib/apt/lists/*

# Firmante de releases de Elements 23.3.x (clearsigned SHA256SUMS.asc)
# Pablo Greco <pgreco@blockstream.com>
ENV PINNED_FINGERPRINT="BD0F3062F87842410B06A0432F656B0610604482"

RUN case "${TARGETPLATFORM}" in \
      "linux/amd64") echo "x86_64-linux-gnu"  > /tarball-arch ;; \
      "linux/arm64") echo "aarch64-linux-gnu" > /tarball-arch ;; \
      *) echo "Unsupported platform: ${TARGETPLATFORM}" && exit 1 ;; \
    esac && \
    echo "elements-${VERSION}-$(cat /tarball-arch).tar.gz" > /tarball-name

RUN url="https://github.com/ElementsProject/elements/releases/download/elements-${VERSION}" && \
    wget -q "${url}/$(cat /tarball-name)" \
            "${url}/SHA256SUMS" \
            "${url}/SHA256SUMS.asc"

COPY assets/release-keys/ /tmp/release-keys/
RUN gpg --import /tmp/release-keys/*.asc && \
    gpg --list-keys "${PINNED_FINGERPRINT}" >/dev/null 2>&1 || { echo "MISSING PINNED KEY"; exit 1; }
RUN rm -rf /tmp/release-keys

# SHA256SUMS.asc es CLEARSIGNED: un solo argumento. Exigir GOODSIG del firmante fijado y 0 BADSIG.
RUN gpg --verify --status-fd 1 SHA256SUMS.asc 2>/dev/null > /tmp/gpg-status; \
    grep -q "^\[GNUPG:\] GOODSIG" /tmp/gpg-status || { echo "NO GOOD SIGNATURE"; exit 1; }; \
    grep -q "^\[GNUPG:\] BADSIG"  /tmp/gpg-status && { echo "BAD SIGNATURE"; exit 1; }; \
    grep -q "^\[GNUPG:\] VALIDSIG .*${PINNED_FINGERPRINT}" /tmp/gpg-status || { echo "SIGNER MISMATCH"; exit 1; }

# Verificar sha256 del tarball contra el contenido descifrado del SHA256SUMS firmado
RUN gpg --output SHA256SUMS.verified --decrypt SHA256SUMS.asc 2>/dev/null && \
    grep " $(cat /tarball-name)$" SHA256SUMS.verified | sha256sum -c
RUN tar -xzf "$(cat /tarball-name)" --strip-components=1

# Final image
FROM debian:stable-slim
ENV ELEMENTS_DATA=/root/.elements
ENV ELEMENTS_PREFIX=/opt/elements
ENV PATH=${ELEMENTS_PREFIX}/bin:$PATH
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates tini && rm -rf /var/lib/apt/lists/*
COPY --from=builder /build/bin/elementsd  ${ELEMENTS_PREFIX}/bin/
COPY --from=builder /build/bin/elements-cli ${ELEMENTS_PREFIX}/bin/
# Cosmetic under StartOS (interfaces come from the manifest); reflects the
# ports elementsd actually binds inside the container: RPC 7041, P2P 57042.
EXPOSE 7041 57042
