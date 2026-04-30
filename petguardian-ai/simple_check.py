"""
simple_check.py
───────────────
Minimal sanity check — no ML dependencies required.
Verifies Flask routes are reachable and returns expected JSON structure.

Usage:
    # Terminal 1: start the server
    python app.py

    # Terminal 2: run this check
    python simple_check.py
"""

import json
import sys
import urllib.request
import urllib.error

BASE = "http://localhost:5000"


def get(path: str) -> tuple[int, dict]:
    url = BASE + path
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, {}
    except Exception as exc:
        print(f"  ❌ Cannot reach {url}: {exc}")
        return 0, {}


def check_field(data: dict, field: str, label: str):
    val = data.get(field)
    icon = "✅" if val is not None else "❌"
    print(f"    {icon} {label}: {val}")


def main():
    print("\n" + "═" * 50)
    print("  PetGuardian AI — Simple Connectivity Check")
    print("═" * 50)

    # /health
    print("\n📡 GET /health")
    code, body = get("/health")
    print(f"   Status: {code}")
    if code == 200:
        data = body.get("data", {})
        check_field(data, "status",      "status")
        check_field(data, "modelLoaded", "modelLoaded")
        check_field(data, "service",     "service")
        check_field(data, "version",     "version")
    else:
        print("   ❌ /health returned unexpected status")

    # /api/severity/info
    print("\n📡 GET /api/severity/info")
    code, body = get("/api/severity/info")
    print(f"   Status: {code}")
    if code == 200:
        levels = body.get("data", {}).get("severityLevels", [])
        print(f"   ✅ Severity levels returned: {len(levels)}")
        for lvl in levels:
            print(f"      • {lvl.get('level')}: vetConnect={lvl.get('vetConnect')}")

    # /api/classes
    print("\n📡 GET /api/classes")
    code, body = get("/api/classes")
    print(f"   Status: {code}")
    if code == 200:
        total = body.get("data", {}).get("totalCount", 0)
        print(f"   ✅ {total} disease classes registered")
    elif code == 503:
        print("   ⚠️  Model not loaded — /api/classes returns 503 (expected if no model)")

    # /api/model/info
    print("\n📡 GET /api/model/info")
    code, body = get("/api/model/info")
    print(f"   Status: {code}")
    if code == 200:
        data = body.get("data", {})
        check_field(data, "inputShape",  "inputShape")
        check_field(data, "outputShape", "outputShape")
        check_field(data, "numClasses",  "numClasses")
        check_field(data, "totalParams", "totalParams")
    elif code == 503:
        print("   ⚠️  Model not loaded (expected if no .h5 file present)")

    print("\n" + "═" * 50)
    print("  Check complete. Start server with: python app.py")
    print("═" * 50 + "\n")


if __name__ == "__main__":
    main()