# 📱 Legal Copilot — Native Android Application

Welcome to the **Legal Copilot** Native Android application. This Android project packages the full-featured Legal Copilot Indian Practice Management & Statutory AI Assistant into a high-performance native Android container with direct Supabase cloud database synchronization and offline chamber vault persistence.

---

## 🌟 Key Android Features

1. **Full Feature Parity with Web App:**
   - 📂 **Litigation Docket Management:** CNR numbers, courts, opposing counsel, case statuses.
   - 📅 **Hearing Cause Lists & Timeline:** Daily cause lists, upcoming urgent 3-day listings.
   - 👥 **Client CRM & KYC Directory:** Retainers, contact details, representation history.
   - 💼 **Billing, Fee Memos & Invoices:** Itemized legal billing with GST tax computation.
   - 🤖 **AI Statutory Copilot:** BNS 2023 transition matrix, bail drafting, and limitation calculations.
2. **Same Supabase Cloud Database Syncing:**
   - Pre-configured to point directly to `https://fgcmspgfxdieljbhliuq.supabase.co`.
   - Real-time two-way synchronization for cases, hearings, clients, tasks, and fee memos.
   - Row Level Security (RLS) policies enforced.
3. **Offline Chamber Vault:**
   - Bundled web assets in `app/src/main/assets/public/` allow full offline access when advocates are inside courtrooms with poor network coverage.
   - Local storage keeps records cached and queues updates until connectivity resumes.
4. **Native Device Hardware Integrations:**
   - Hardware back button navigation handling.
   - Native pull-to-refresh (`SwipeRefreshLayout`) to trigger database re-sync.
   - Haptic feedback vibration bridge (`WebAppInterface.vibrateDevice`).

---

## 📁 Android Project Structure

```
android/
├── app/
│   ├── build.gradle                                    # Android application configuration & dependencies
│   ├── proguard-rules.pro                              # Proguard optimization rules
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml                     # App permissions, MainActivity, dark theme
│           ├── java/in/legalcopilot/app/
│           │   ├── MainActivity.java                   # Main Android Activity with Chrome WebView & fallbacks
│           │   ├── LegalDatabaseSyncBridge.java        # JavaScript interface for Supabase database sync
│           │   └── WebAppInterface.java                # JavaScript interface for native device haptics/toasts
│           ├── assets/public/                          # Pre-bundled offline production web assets
│           │   ├── index.html
│           │   └── assets/
│           │       ├── index-*.css
│           │       └── index-*.js
│           └── res/
│               ├── values/
│               │   ├── strings.xml                     # App strings & Supabase endpoint
│               │   ├── colors.xml                      # Brand color palette (Slate 950, Indigo 600)
│               │   └── styles.xml                      # Full-screen dark theme
│               ├── xml/
│               │   └── network_security_config.xml     # Cleartext traffic for 10.0.2.2 & HTTPS for Supabase
│               └── drawable/
│                   └── ic_launcher_foreground.xml      # Vector Scales of Justice emblem icon
├── gradle/wrapper/
│   └── gradle-wrapper.properties                       # Gradle 8.4 wrapper specification
├── build.gradle                                        # Root Gradle build script
├── settings.gradle                                     # Module inclusions
├── gradle.properties                                   # JVM settings & AndroidX flags
└── README.md                                           # This guide
```

---

## 🚀 How to Open & Build the Android App

### Option A: Open in Android Studio (Recommended)
1. Open **Android Studio**.
2. Select **File ➔ Open...**
3. Navigate to and select the `c:\Users\susheel\Downloads\legal-copilot\android` folder.
4. Android Studio will automatically sync the Gradle project and index all files.
5. Click the green **Run ▶** button to launch on an Android Emulator or connected physical phone.

### Option B: Build APK via Command Line
Run the following command from the `android/` directory:

```bash
# Windows
.\gradlew.bat assembleDebug

# Linux / macOS
./gradlew assembleDebug
```

The compiled APK will be generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔄 Refreshing the Bundled Web Assets
Whenever you make updates to the frontend React code and want to refresh the bundled Android assets:

```bash
# 1. Rebuild production web dist bundle
npm run build

# 2. Copy into Android assets directory
npm run android:sync
```

*(Added to the root `package.json` for convenience)*
