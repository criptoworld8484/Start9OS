# Cloudflare Tunnel Instructions

Cloudflare Tunnel (cloudflared) creates an outbound-only connection from your StartOS server to the Cloudflare edge network. This lets you expose services publicly on your own domain **without opening any inbound ports** or changing your router.

This package follows the simple, token-based model: you paste one **Tunnel Token** and manage all routing from the Cloudflare dashboard.

## Requirements

- A Cloudflare account
- A domain managed by Cloudflare DNS
- Access to the [Cloudflare Zero Trust dashboard](https://one.dash.cloudflare.com/)

## Step 1 — Create a tunnel and copy its token

1. Go to **Zero Trust → Networks → Tunnels** and click **Create a tunnel**.
2. Choose **Cloudflared** as the connector type and give the tunnel a name.
3. On the **Install connector** screen, Cloudflare shows an install command that contains a long token (it usually starts with `eyJ...`). **Copy only that token value.**

## Step 2 — Save the token in StartOS

1. Open this service in StartOS.
2. Run the **Set Tunnel Token** action.
3. Paste the token and save.

The tunnel starts automatically. The **Cloudflare tunnel** health check turns healthy once cloudflared connects to Cloudflare's edge, and the tunnel shows as **HEALTHY** in the Cloudflare dashboard.

## Step 3 — Route public hostnames to your services

All routing is configured in the Cloudflare dashboard (this is the token-based model).

1. In your tunnel, open the **Public Hostname** tab and click **Add a public hostname**.
2. **Subdomain / Domain**: the public address you want (e.g. `app.yourdomain.com`).
3. **Service**: point it at the internal StartOS address of the service you want to expose, using the form:

   ```
   http://<package-id>.startos:<internal-port>
   ```

   For example, to expose a service whose package id is `mempool` on its internal port `80`:

   ```
   http://mempool.startos:80
   ```

### Finding a service's internal address and port

On the StartOS service you want to expose, open its **Interfaces / Addresses** page. The internal (`.startos`) hostname and its port are listed there. Use `http://` for plain-HTTP internal services (Cloudflare provides TLS at the edge) and `https://` only if the internal service itself serves HTTPS.

### Common mistakes (read this if you get "connection refused" / HTTP 502)

- **Do NOT use `localhost`.** Inside this package's container, `localhost` is *cloudflared itself* — not your other service. You will get `dial tcp 127.0.0.1:<port>: connect: connection refused`. Always use `http://<package-id>.startos:<port>`.
- **Use the service's INTERNAL port, not the LAN port.** The high port StartOS shows in a service's LAN address (e.g. `...:63458`) is a host-forwarded port and is usually *not* what the container listens on internally. Use the internal port the service binds (often a well-known one like `80`, `3000`, `50002`, etc.).
- **Only web (HTTP/HTTPS) services work as public hostnames.** TCP-only services such as an Electrum server (Fulcrum) speak a raw TCP protocol, not HTTP — you cannot open them in a browser through a Cloudflare public hostname. Test first with a service that has a web UI. (Raw TCP can be tunneled with `tcp://...` but requires `cloudflared access` / WARP on the client, not a browser.)
- **Scheme must match the service.** Use `http://` for plain-HTTP origins. Only use `https://` if the internal service genuinely serves TLS on that port; otherwise the TLS handshake fails.
- **Self-signed origin certificate → enable "No TLS Verify".** Most StartOS services serve their LAN interface over HTTPS with a *self-signed* certificate. If you point the hostname at such an `https://` origin, cloudflared rejects it with `tls: failed to verify certificate: x509: certificate signed by unknown authority`. Fix it in the hostname's **Additional application settings → TLS → No TLS Verify (ON)**. The public Cloudflare↔browser leg stays fully encrypted; only verification of the origin (on your own LAN) is relaxed.

### Origin address: `.startos` name vs LAN IP

Both of these reach the service, and either is fine:

- `http(s)://<package-id>.startos:<internal-port>` — the internal StartOS hostname.
- `http(s)://<node-LAN-IP>:<LAN-port>` — e.g. `https://192.168.50.200:52308`, using the LAN address/port StartOS shows on the service's Interfaces page.

If you use the HTTPS LAN address (self-signed), remember to turn on **No TLS Verify** as above.

## Exposing non-web (TCP) services — Electrum/Fulcrum, SSH, etc.

Web services (HTTP/HTTPS) work as public hostnames and open in a browser. Raw-**TCP** services — an Electrum server (Fulcrum), a Bitcoin P2P port, SSH… — speak their own protocol, not HTTP, so a public hostname alone is not enough: the client has to "enter" the tunnel. Two supported ways:

### Option A — `cloudflared access` (client-side; simplest for a single computer)

1. In the tunnel, add a **Public Hostname** whose **Service** is the TCP origin, e.g. `tcp://fulcrum.startos:50002` (or `tcp://<node-LAN-IP>:<port>`).
2. In **Zero Trust → Access → Applications**, create a **Self-hosted** application for that hostname and add a policy (e.g. *Allow* your email).
3. On the machine running the wallet, run:
   ```
   cloudflared access tcp --hostname fulcrum.yourdomain.com --url 127.0.0.1:50002
   ```
4. Point the wallet at `127.0.0.1:50002`. Traffic is proxied through the tunnel to your service.

### Option B — WARP + Private Network (phones / multiple devices)

1. In the tunnel's **Private Network** tab, add the service's IP or CIDR (e.g. your node's LAN IP as `/32`) instead of a public hostname.
2. Install the **WARP** client on the wallet's device and enroll it in your Zero Trust organization.
3. Add a Zero Trust policy allowing that device to reach the private network.
4. Point the wallet directly at the service's **private IP:port** — WARP routes it through the tunnel.

### Simpler alternative: Tor

StartOS already publishes a **Tor `.onion`** address for services like Fulcrum. Wallets that support Tor (Sparrow, BlueWallet, …) can connect over `.onion` with no Cloudflare or WARP at all. Use Cloudflare/WARP when you specifically want lower latency or to avoid Tor.

> None of this requires any change to this package — cloudflared runs whatever ingress / private-network configuration you define in the Cloudflare dashboard.

## Connection keeps dropping? (QUIC / UDP 7844)

By default cloudflared connects to Cloudflare over QUIC (UDP port 7844). Some home routers/ISPs block or throttle UDP, which shows up in the logs as repeated `QUIC handshake did not complete in time` or `lookup region1.v2.argotunnel.com: i/o timeout`, and an unstable tunnel.

If you see this, run the **Connection Protocol** action and choose **HTTP/2**. The tunnel restarts itself with the new setting. HTTP/2 uses TCP (port 7844) and works through virtually any network.

## Notes

- **One token = one tunnel.** This package runs a single tunnel.
- **Autoupdate is disabled** (`--no-autoupdate`); cloudflared updates arrive as new versions of this package.
- Your token is stored in this service's volume and is included in StartOS backups.
- For advanced tunnel settings, use the Cloudflare Zero Trust dashboard — everything not covered here behaves like upstream cloudflared.

## Security note about the token in logs

When you submit the token via the **Set Tunnel Token** action, StartOS's own service-log tracing (a StartOS runtime behavior, not this package) records the action's raw input — so the token can appear in plaintext in the downloaded service logs. This package never logs the token itself, and cloudflared masks it (`TUNNEL_TOKEN:*****`), but the StartOS RPC trace is outside this package's control.

Practical guidance: **treat downloaded log files as secrets.** If you share a log file, rotate the tunnel token afterwards — in the Cloudflare Zero Trust dashboard, refresh/rotate the connector token, then paste the new one with **Set Tunnel Token**.
