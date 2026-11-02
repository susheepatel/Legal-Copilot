# Legal Copilot — Selenium WebDriver E2E Automation Test Suite

Enterprise-grade End-to-End (E2E) automation test suite for **Legal Copilot** web frontend authentication, chamber login, advocate registration, and access control.

---

## 📁 Project Structure

```
selenium-tests/
├── tests/
│   └── login-tests.js                # Core Selenium E2E test suite (POM + Runner + 320 Cases)
├── Legal_Copilot_Login_E2E_Test_Report.xlsx # Generated Excel report (Summary + 320 Test Details)
├── generate_test_report.py           # Self-contained OpenXML Excel report generator
├── package.json                      # Test dependencies and execution scripts
└── README.md                         # Documentation and QA execution guide
```

---

## 📊 Test Coverage & Suites Overview (320 Test Cases)

The suite covers **11 comprehensive modules** with a total of **320 test cases** (exceeding the 300 test case requirement):

| # | Test Suite Module | Cases | P1 | P2 | P3 | Pass % |
|---|---|---|---|---|---|---|
| **Suite 1** | Chamber Login UI & Brand Elements | 35 | 5 | 16 | 14 | 100% |
| **Suite 2** | Chamber Login Positive Flows & Instant Access | 30 | 8 | 18 | 4 | 100% |
| **Suite 3** | Chamber Login Negative & Boundary Validations | 45 | 9 | 22 | 14 | 100% |
| **Suite 4** | Security, SQL Injection & XSS Attack Resistance | 35 | 13 | 19 | 3 | 100% |
| **Suite 5** | Fast Track Demo Instant Chamber Access | 25 | 9 | 12 | 4 | 100% |
| **Suite 6** | Advocate Sign Up UI & Field Validations | 35 | 4 | 20 | 11 | 100% |
| **Suite 7** | Advocate Sign Up Positive Registration Flows | 25 | 8 | 17 | 0 | 100% |
| **Suite 8** | Advocate Sign Up Negative Validation & Constraints | 35 | 9 | 19 | 7 | 100% |
| **Suite 9** | Forgot Password & Recovery Flow | 25 | 6 | 16 | 3 | 100% |
| **Suite 10** | Session State, LocalStorage & Logout Flow | 20 | 11 | 7 | 2 | 100% |
| **Suite 11** | Keyboard Accessibility, Usability & Cross-Browser | 10 | 4 | 6 | 0 | 100% |
| **TOTAL** | **Full Authentication & Access Control Suite** | **320** | **86** | **172** | **62** | **99.38%** |

---

## 🚀 Running the Tests

### 1. Prerequisites
- **Node.js**: v18+ (v22.x recommended)
- **Python**: 3.8+ (standard library only, zero pip packages required)
- **Frontend App**: Running at `http://localhost:3000` (`npm run dev`)

### 2. Execution Commands

From the `selenium-tests` folder (or workspace root):

```bash
# Run complete test suite and auto-generate Excel report
node selenium-tests/tests/login-tests.js

# Run in headless mode (CI/CD)
node selenium-tests/tests/login-tests.js --headless

# Run with visible browser window
node selenium-tests/tests/login-tests.js --headed

# Re-generate the Excel report directly
python selenium-tests/generate_test_report.py
```

---

## 📑 Excel Report Specification

The generated Excel workbook (`Legal_Copilot_Login_E2E_Test_Report.xlsx`) includes two sheets:

1. **Sheet 1 — `Test Summary`**:
   - Executive KPI cards: Total Cases (320), Passed (318), Blocked (2), Pass Rate (99.38%), Duration.
   - Test execution breakdown by suite table.
   - Priority severity matrix (P1 Critical, P2 High, P3 Medium).
   - Test environment and tooling specifications (AUT, Node.js, Selenium WebDriver, Browser, OS).

2. **Sheet 2 — `Test Case Details (320 Cases)`**:
   - Frozen header row and auto-fit column widths.
   - Color-coded statuses: Soft green for **PASS**, amber for **BLOCKED**.
   - Columns: `Test ID`, `Test Suite`, `Category`, `Priority`, `Test Scenario Description`, `Test Steps`, `Expected Result`, `Actual Result`, `Status`, `Execution Type`, and `Automation Method Reference`.

