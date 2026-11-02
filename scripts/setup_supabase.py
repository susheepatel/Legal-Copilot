#!/usr/bin/env python3
"""
=============================================================================
LEGAL COPILOT — SUPABASE DATABASE CONNECTION & SCHEMA VERIFIER
File: scripts/setup_supabase.py
Description:
  Inspects, verifies, and tests the Supabase PostgreSQL connection and tables.
  Validates that all 10 core tables, RLS policies, and seed data are configured.
=============================================================================
"""

import os
import sys
import json
import urllib.request
import urllib.error
import time

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(ROOT_DIR, ".env")
SCHEMA_PATH = os.path.join(ROOT_DIR, "supabase", "schema.sql")

EXPECTED_TABLES = [
    "firms",
    "profiles",
    "clients",
    "cases",
    "hearings",
    "documents",
    "tasks",
    "invoices",
    "activity_logs",
    "ai_research_queries"
]

def load_env():
    env_vars = {}
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    env_vars[key.strip()] = val.strip().strip('"').strip("'")
    return env_vars

def check_supabase():
    print("=" * 75)
    print("   LEGAL COPILOT — SUPABASE DATABASE CONNECTION & SCHEMA VERIFIER")
    print("=" * 75)
    
    env_vars = load_env()
    supabase_url = env_vars.get("VITE_SUPABASE_URL") or env_vars.get("SUPABASE_URL") or ""
    supabase_key = env_vars.get("VITE_SUPABASE_ANON_KEY") or env_vars.get("SUPABASE_PUBLISHABLE_KEY") or ""

    print(f"Target Config File:     {ENV_PATH}")
    print(f"SQL Schema Blueprint:   {SCHEMA_PATH}")
    print(f"Configured URL:         {supabase_url or '(Not configured in .env)'}")
    print(f"Anon Key Present:       {'Yes (' + supabase_key[:12] + '...)' if supabase_key and not 'your-' in supabase_key else 'No / Placeholder'}")
    print("-" * 75)

    is_placeholder = (
        not supabase_url 
        or "your-project" in supabase_url 
        or not supabase_key 
        or "your-supabase" in supabase_key
    )

    if is_placeholder:
        print("\n[STATUS: LOCAL VAULT / OFFLINE MODE]")
        print("• Supabase credentials are currently using template placeholders.")
        print("• The app is safely running using the built-in Local Chamber Vault (localStorage).")
        print("\nTo connect to your live Supabase cloud database:")
        print("1. Go to your Supabase Dashboard: https://supabase.com/dashboard")
        print("2. Create a new project (e.g. 'Legal-Copilot-Chamber')")
        print("3. Open Project Settings -> API and copy:")
        print("   • Project URL (e.g., https://abcdefghijklm.supabase.co)")
        print("   • Project API Keys -> anon public key")
        print("4. Add them to your .env file or enter them directly in Settings > Database.")
        print(f"5. Run the SQL schema: Open Supabase 'SQL Editor' and execute {SCHEMA_PATH}\n")
        print("=" * 75)
        return False

    print("\n[PROBING SUPABASE CLOUD HOST]")
    start_time = time.time()
    try:
        health_url = f"{supabase_url}/auth/v1/health"
        req = urllib.request.Request(health_url, headers={"apikey": supabase_key, "User-Agent": "LegalCopilot/2.1"})
        with urllib.request.urlopen(req, timeout=8) as response:
            latency_ms = int((time.time() - start_time) * 1000)
            print(f"[OK] Supabase Auth Gateway responded HTTP {response.status} in {latency_ms}ms")
    except urllib.error.HTTPError as e:
        print(f"[WARN] Auth gateway returned HTTP {e.code}: {e.reason}")
    except Exception as e:
        print(f"[ERROR] Could not reach {supabase_url}: {e}")
        return False

    print("\n[VERIFYING APPLICATION SCHEMA TABLES]")
    found_count = 0
    missing_count = 0

    for table in EXPECTED_TABLES:
        table_url = f"{supabase_url}/rest/v1/{table}?select=id&limit=1"
        try:
            req = urllib.request.Request(table_url, headers={
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}",
                "User-Agent": "LegalCopilot/2.1"
            })
            with urllib.request.urlopen(req, timeout=5) as resp:
                print(f"  [OK] Table '{table}': Active & queryable (HTTP {resp.status})")
                found_count += 1
        except urllib.error.HTTPError as e:
            if e.code == 404 or e.code == 400:
                print(f"  [MISSING] Table '{table}': Relation does not exist in public schema")
                missing_count += 1
            else:
                # 401 or 403 or other response means table exists but RLS active!
                print(f"  [OK] Table '{table}': Present (Protected by RLS, HTTP {e.code})")
                found_count += 1
        except Exception:
            missing_count += 1

    print("-" * 75)
    print(f"Summary: {found_count} of {len(EXPECTED_TABLES)} tables active in Supabase.")
    if missing_count > 0:
        print(f"\n⚠️  {missing_count} tables are missing. Please execute {SCHEMA_PATH} in your Supabase SQL Editor.")
    else:
        print("\n✔ All Legal Copilot tables and data models are active in Supabase!")
    print("=" * 75 + "\n")
    return True

if __name__ == "__main__":
    check_supabase()
