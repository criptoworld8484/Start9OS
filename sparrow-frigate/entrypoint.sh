#!/bin/sh
set -eu

# StartOS: mainnet only
NETWORK="mainnet"
DATA_ROOT="/data"
NETWORK_DIR="${DATA_ROOT}/${NETWORK}"
CONFIG_FILE="${NETWORK_DIR}/config.toml"
BITCOIN_DATA_DIR="/mnt/bitcoind"
ELECTRUM_PORT="57001"
BITCOIN_RPC_URL="http://bitcoind.startos:8332"
BITCOIN_ZMQ="tcp://bitcoind.startos:28333"
ELECTRS_BACKEND="tcp://electrs.startos:50001"

FRIGATE_CACHE_SIZE="${FRIGATE_CACHE_SIZE:-2M}"
FRIGATE_MEMORY_LIMIT="${FRIGATE_MEMORY_LIMIT:-4GB}"
BITCOIN_WAIT_MAX="${BITCOIN_WAIT_MAX:-180}"
BITCOIN_WAIT_INTERVAL="${BITCOIN_WAIT_INTERVAL:-5}"

mkdir -p "${NETWORK_DIR}/db"

resolve_cookie_file() {
  if [ -f "${BITCOIN_DATA_DIR}/.cookie" ]; then
    echo "${BITCOIN_DATA_DIR}/.cookie"
    return 0
  fi
  find "${BITCOIN_DATA_DIR}" -maxdepth 4 -name '.cookie' -type f 2>/dev/null | head -1
}

write_config() {
  COOKIE_FILE=$(resolve_cookie_file || true)
  if [ -z "${COOKIE_FILE}" ] || [ ! -f "${COOKIE_FILE}" ]; then
    echo "ERROR: Bitcoin cookie not found under ${BITCOIN_DATA_DIR}." >&2
    exit 1
  fi

  cat > "${CONFIG_FILE}" <<EOF
[core]
connect = true
server = "${BITCOIN_RPC_URL}"
authType = "COOKIE"
dataDir = "${BITCOIN_DATA_DIR}"
zmqSequenceEndpoint = "${BITCOIN_ZMQ}"

[index]
startHeight = 0
cacheSize = "${FRIGATE_CACHE_SIZE}"

[scan]
computeBackend = "CPU"
memoryLimit = "${FRIGATE_MEMORY_LIMIT}"
dbThreads = 4

[server]
tcp = "tcp://0.0.0.0:${ELECTRUM_PORT}"
backendElectrumServer = "${ELECTRS_BACKEND}"
EOF
  echo "Wrote ${CONFIG_FILE} (mainnet, RPC ${BITCOIN_RPC_URL}, cookie auth)"
}

rpc_getblockchaininfo() {
  COOKIE_FILE=$(resolve_cookie_file || true)
  if [ -n "${COOKIE_FILE}" ] && [ -f "${COOKIE_FILE}" ]; then
    curl -sf -u "$(tr -d '\n\r' < "${COOKIE_FILE}")" \
      -H "content-type: application/json" \
      --data-binary '{"jsonrpc":"1.0","id":"frigate","method":"getblockchaininfo","params":[]}' \
      "${BITCOIN_RPC_URL}/"
    return
  fi
  return 1
}

wait_for_bitcoin() {
  attempt=0
  while [ "${attempt}" -lt "${BITCOIN_WAIT_MAX}" ]; do
    if resp=$(rpc_getblockchaininfo 2>/dev/null); then
      chain=$(echo "${resp}" | sed -n 's/.*"chain"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
      if [ "${chain}" != "main" ]; then
        echo "ERROR: Frigate requires mainnet but bitcoind reports chain='${chain}'." >&2
        exit 1
      fi
      echo "Bitcoin Core reachable (chain=${chain})"
      return 0
    fi
    attempt=$((attempt + 1))
    if [ "${attempt}" = "1" ] || [ $((attempt % 12)) -eq 0 ]; then
      echo "Waiting for Bitcoin Core at ${BITCOIN_RPC_URL} (${attempt}/${BITCOIN_WAIT_MAX})..."
    fi
    sleep "${BITCOIN_WAIT_INTERVAL}"
  done
  echo "ERROR: Bitcoin Core not reachable at ${BITCOIN_RPC_URL}." >&2
  exit 1
}

write_config
wait_for_bitcoin

echo "Starting Frigate mainnet client_port=${ELECTRUM_PORT} backend=${ELECTRS_BACKEND}"
exec /opt/frigate/bin/frigate -d "${DATA_ROOT}" -n "${NETWORK}"
