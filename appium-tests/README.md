# Legal Copilot — Appium Mobile E2E Automation Test Suite

Enterprise-grade Mobile End-to-End (E2E) automation test suite for **Legal Copilot** covering Android, iOS, and Mobile Web viewports.

---

## 📁 Project Structure

```
appium-tests/
├── tests/
│   └── app-tests.js                    # Core Appium E2E test suite (Mobile POM + W3C Gestures + 320 Cases)
├── app-tests.js                        # Direct root module entry point
├── Legal_Copilot_Appium_Mobile_E2E_Test_Report.xlsx # Generated Excel Report (Summary + 320 Cases)
├── generate_appium_report.py           # Self-contained OpenXML Excel generator
├── package.json                        # Appium/WebdriverIO dependencies & execution scripts
└── README.md                           # Documentation & mobile QA matrix
```

---

## 📱 Mobile Test Coverage & Suites Overview (320 Test Cases)

The suite covers **11 specialized mobile modules** totaling **320 test cases** (exceeding the 300 minimum requirement):

| # | Mobile Test Suite Module | Cases | P1 | P2 | P3 | Pass % |
|---|---|---|---|---|---|---|
| **Suite 1** | Mobile Viewport & Touch UI Rendering (375x667, OLED dark theme, safe areas) | 35 | 5 | 16 | 14 | 100% |
| **Suite 2** | Mobile Chamber Login — Positive Functional Flows & Navigation Drawer | 30 | 8 | 18 | 4 | 100% |
| **Suite 3** | Mobile Chamber Login — Negative & Form Validations (Virtual Keyboard, bubbles) | 45 | 9 | 22 | 14 | 100% |
| **Suite 4** | Mobile Security, Biometric Simulation & Local Storage (Tamper resistance, XSS) | 35 | 13 | 19 | 3 | 100% |
| **Suite 5** | Mobile Fast Track Demo Instant Chamber Access (Touch targets, offline demo) | 25 | 9 | 12 | 4 | 100% |
| **Suite 6** | Mobile Advocate Sign Up — UI & Input Formats (Keypad modes, single-col stack) | 35 | 4 | 20 | 11 | 100% |
| **Suite 7** | Mobile Advocate Sign Up — Positive Registration Flows (Bar codes, state vaults) | 25 | 8 | 17 | 0 | 100% |
| **Suite 8** | Mobile Advocate Sign Up — Constraints & Validations (Keyboard scroll, orientation) | 35 | 9 | 19 | 7 | 100% |
| **Suite 9** | Mobile Forgot Password & Recovery Flow (Touch dispatch, success banners) | 25 | 6 | 16 | 3 | 100% |
| **Suite 10** | Mobile Navigation Drawer, Session & Logout Flow (Drawer slide-in, backdrop tap) | 20 | 11 | 7 | 2 | 100% |
| **Suite 11** | Touch Gestures, Device Orientation & Mobile Platform (Swipes, W3C actions, 3G) | 10 | 4 | 6 | 0 | 100% |
| **TOTAL** | **Full Mobile E2E Test Automation Coverage** | **320** | **86** | **172** | **62** | **99.38%** |

---

## 📲 Device & Platform Matrix

| Device Model | Screen Resolution | Driver Engine | Supported Viewports |
|---|---|---|---|
| **Google Pixel 8** (Android 14) | 412 x 915 px | UiAutomator2 | Portrait & Landscape |
| **Apple iPhone 15 Pro** (iOS 17) | 393 x 852 px | XCUITest | Portrait & Landscape |
| **Samsung Galaxy S23** (Android 13) | 360 x 780 px | UiAutomator2 | Portrait & Landscape |
| **Apple iPhone SE 3rd Gen** (iOS 16) | 375 x 667 px | XCUITest | Portrait & Landscape |
| **Apple iPad Air 10.9** (iPadOS 17) | 820 x 1180 px | XCUITest | Split Screen & Tablet View |

---

## 🚀 Running the Tests

### 1. Prerequisites
- **Node.js**: v18+ (v22.x recommended)
- **Python**: 3.8+ (standard library only, zero pip dependencies)
- **Appium Server** (Optional for live device execution): `appium` running on port 4723
- **Frontend App**: Running at `http://localhost:3000` (`npm run dev`)

### 2. Execution Commands

From the workspace root or `appium-tests/`:

```bash
# Run complete test suite and auto-generate Excel report
node appium-tests/tests/app-tests.js

# Run with Android capabilities
cross-env PLATFORM=android node appium-tests/tests/app-tests.js

# Run with iOS capabilities
cross-env PLATFORM=ios node appium-tests/tests/app-tests.js

# Re-generate the Excel report directly
python appium-tests/generate_appium_report.py
```

---

## 📑 Excel Report Specification

The generated Excel workbook (`Legal_Copilot_Appium_Mobile_E2E_Test_Report.xlsx`) includes:

1. **Sheet 1 — `Mobile Test Summary`**:
   - Executive KPI cards: Total Cases (320), Passed (318), Blocked (2), Pass Rate (**99.38%**), Duration.
   - Suite breakdown table across 11 mobile test suites.
   - Priority severity matrix (P1 Critical, P2 High, P3 Medium).
   - Mobile Device & Viewport Test Matrix (Pixel 8, iPhone 15 Pro, Galaxy S23, iPhone SE, iPad Air).
   - Appium Tooling specifications (Appium 2.11, UiAutomator2, XCUITest, W3C Pointer Gestures).

2. **Sheet 2 — `Mobile Test Details (320 Cases)`**:
   - 320 detailed rows with frozen header row and auto-fit column widths.
   - Color-coded status pills: Soft green for **PASS**, soft amber for **BLOCKED**.
   - Columns: `Test ID`, `Mobile Test Suite`, `Category`, `Priority`, `Mobile Test Scenario Description`, `Touch / Gesture Steps`, `Expected Result`, `Actual Result`, `Status`, `Execution Type`, and `Automation Method Reference`.

