#!/bin/zsh
set -eu
cd -- "${0:A:h}"

# List active Ethernet and Wi-Fi IPv4 addresses, skipping VPN tunnels.
preview_ips=$(/sbin/ifconfig -a | awk '
  /^[^[:space:]]/ { lan = ($1 ~ /^en[0-9]+:$/ && /<UP,/) }
  lan && $1 == "inet" { print $2 }
')

exec python3 - "$preview_ips" <<'PY'
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys

PORT = 8123
ROOT = Path.cwd()
SITE_FILES = {"index.html", "books.json", "site.json", "og-card.jpg",
              "assets/css/app.css", "assets/js/app.js"}


class PreviewHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = Path(self.translate_path(self.path))
        if path == ROOT:
            path = ROOT / "index.html"
        resolved = path.resolve()
        is_site_file = resolved.is_relative_to(ROOT) and resolved.relative_to(ROOT).as_posix() in SITE_FILES
        is_cover = ROOT / "covers" in resolved.parents
        if path != resolved or not (is_site_file or is_cover) or not resolved.is_file():
            self.send_error(404)
            return None
        return super().send_head()


try:
    with ThreadingHTTPServer(("0.0.0.0", PORT), PreviewHandler) as server:
        print(f"Mac editor: http://localhost:{PORT}/", flush=True)
        addresses = sys.argv[1].split()
        for address in addresses:
            print(f"iPhone preview: http://{address}:{PORT}/", flush=True)
        if addresses:
            print("Open the preview in Safari with your iPhone on the same local network.")
        else:
            print("Connect your Mac to Wi-Fi or Ethernet, then relaunch for an iPhone link.")
        print("Press Control-C to stop.", flush=True)
        server.serve_forever()
except KeyboardInterrupt:
    print()
except OSError as error:
    sys.exit(f"Could not start the preview server on port {PORT}: {error}")
PY
