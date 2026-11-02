#!/usr/bin/env python3
"""
=============================================================================
LEGAL COPILOT — ANDROID ASSET SYNC SCRIPT
Copies the latest compiled production web bundle from 'dist/' to
'android/app/src/main/assets/public/' for offline Android packaging.
=============================================================================
"""

import os
import shutil

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(ROOT_DIR, "dist")
ANDROID_ASSETS_DIR = os.path.join(ROOT_DIR, "android", "app", "src", "main", "assets", "public")

def sync():
    print("=" * 70)
    print("   LEGAL COPILOT — ANDROID ASSET SYNCHRONIZATION")
    print("=" * 70)

    if not os.path.exists(DIST_DIR):
        print("[BUILD] dist/ directory not found. Running npm run build...")
        os.system("npm run build")

    os.makedirs(ANDROID_ASSETS_DIR, exist_ok=True)

    # Copy index.html
    dist_html = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(dist_html):
        shutil.copy2(dist_html, os.path.join(ANDROID_ASSETS_DIR, "index.html"))
        print("[OK] Copied index.html")

    # Copy assets
    dist_assets = os.path.join(DIST_DIR, "assets")
    dest_assets = os.path.join(ANDROID_ASSETS_DIR, "assets")
    if os.path.exists(dist_assets):
        if os.path.exists(dest_assets):
            shutil.rmtree(dest_assets)
        shutil.copytree(dist_assets, dest_assets)
        print(f"[OK] Copied {len(os.listdir(dest_assets))} bundle assets to {dest_assets}")

    print("\n[SUCCESS] Android web assets are synchronized and ready for APK packaging.")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    sync()

