<p align="center">
  <img src="icon.png" alt="Cloudflare Tunnel Logo" width="21%">
</p>

# Cloudflare Tunnel on StartOS (token-based)

Cloudflare Tunnel (`cloudflared`) creates an **outbound-only** connection from your StartOS server to the Cloudflare edge network, letting you expose services publicly on your own domain **without opening any inbound ports** or configuring your router.

This is a minimal, **token-based** package (same model as the Umbrel `cloudflared` app): you paste one **Tunnel Token** and manage all routing from the Cloudflare Zero Trust dashboard.

- Upstream: <https://github.com/cloudflare/cloudflared>
- Docs: <https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/>

## How it works

1. Create a tunnel in **Cloudflare Zero Trust → Networks → Tunnels** and copy its connector **token**.
2. In StartOS, run the **Set Tunnel Token** action and paste the token.
3. The package runs `cloudflared tunnel --no-autoupdate run` with the token via the `TUNNEL_TOKEN` environment variable.
4. Add **Public Hostnames** in the Cloudflare dashboard pointing at `http://<package-id>.startos:<port>` to expose each internal StartOS service.

See [instructions.md](instructions.md) for the full setup walkthrough.

## Package details

| | |
|---|---|
| Package id | `cloudflared` |
| Image | `cloudflare/cloudflared:<version>` on `debian:13-slim` |
| Architectures | `x86_64`, `aarch64` (aarch64 emulated if missing) |
| Command | `cloudflared tunnel --no-autoupdate --metrics 127.0.0.1:20241 run` |
| Token | `TUNNEL_TOKEN` env, saved via the **Set Tunnel Token** action, stored in the `main` volume |
| Health check | `http://127.0.0.1:20241/ready` inside the container; healthy only on HTTP 200, which cloudflared returns only while connected to the edge |
| Interfaces | None. The tunnel is outbound-only, and the metrics endpoint stays on loopback because it serves unauthenticated pprof handlers |
| Routing | Managed in the Cloudflare Zero Trust dashboard (not in StartOS) |
| Dependencies | None |

## Building

Requires the [StartOS SDK](https://docs.start9.com/latest/developer-guide/sdk/installing-the-sdk) (`start-cli`) and Node.js/npm.

```sh
make            # type-check, build, and pack the .s9pk
make install    # sideload the .s9pk onto your node (see ~/.startos/config.yaml)
```

## Limitations

- One token = one tunnel per instance.
- Routing/ingress is configured in the Cloudflare dashboard, not in StartOS.
- Autoupdate is disabled; updates ship as new package versions.

## Credits

Package scaffolding based on the StartOS TypeScript SDK. Inspired by [remcoros/cloudflared-startos](https://github.com/remcoros/cloudflared-startos) (a fuller, API-driven wrapper) and the Umbrel `cloudflared` app.
