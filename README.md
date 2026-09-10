# 💊 MediReminder Pro

<p align="center">
  <strong>Smart medicine reminder and medication management for everyday care.</strong>
</p>

<p align="center">
  <a href="https://github.com/hv086189-dot/MediReminder">Repository</a> •
  <a href="https://github.com/hv086189-dot/MediReminder#-features">Features</a> •
  <a href="https://github.com/hv086189-dot/MediReminder#-how-to-run">How to Run</a> •
  <a href="https://github.com/hv086189-dot/MediReminder#-future-improvements">Future Improvements</a>
</p>

---

## 🔗 Quick Links

| Link | Open |
|---|---|
| 🏠 GitHub Repository | [MediReminder](https://github.com/hv086189-dot/MediReminder) |
| 📂 Source Code | [View Files](https://github.com/hv086189-dot/MediReminder) |
| 🐛 Issues | [Report an Issue](https://github.com/hv086189-dot/MediReminder/issues) |
| 💡 Feature Requests | [Request a Feature](https://github.com/hv086189-dot/MediReminder/issues/new) |

>## 🚀 Live Demo

👉 [Open MediReminder Pro](https://hv086189-dot.github.io/MediReminder/)
## 📌 About the Project

**MediReminder Pro** is a lightweight, browser-based medicine reminder and medication management application.

It is designed to make daily medicine tracking easier by combining medicine scheduling, dosage and frequency information, taken-medicine history, browser notifications, alarms, profile details, doctor information, and emergency contact access in one simple interface.

The project runs entirely in the browser and currently uses `localStorage` for data storage.

---

## ✨ Features

### 👤 Parent Profile
- Save parent name
- Save age
- Save blood group
- Data is stored locally in the browser

### 👨‍⚕️ Doctor Details
- Save doctor name
- Save doctor phone number
- Display saved doctor information

### 🚨 Emergency Contact
- Save emergency contact name
- Save emergency phone number
- Initiate a phone call using the saved number on supported devices

### 💊 Medicine Management
- Add medicine name
- Select medicine type:
  - 💊 Tablet
  - 🧴 Syrup
  - 💉 Injection
  - 💊 Capsule
  - 🩺 Other
- Add dosage
- Select frequency:
  - 🔁 Once Daily
  - 🔁 Twice Daily
  - 🔁 Three Times Daily
  - 🔁 As Needed
- Configure Reminder Time 1, 2, and 3 fields
- Edit medicine information
- Delete medicines
- Search medicines
- Mark medicines as taken

### 🔔 Reminder & Alarm System
- Browser notification support
- Testable audio alarm
- Periodic reminder checking while the page is open
- Manual alarm enabling

### 📊 Dashboard
- Total medicines
- Medicines taken today
- Pending medicines
- Overdue medicines
- Today's health report

### 📋 Medicine History
- Record taken medicines
- View scheduled time
- View date
- View status
- Clear history
- Download a text report

### 🌙 Dark Mode
- Light mode
- Dark mode
- Saved display preference

---

## 🖥️ Interface

The application is organized into simple sections:

```text
🏥 MediReminder Pro
│
├── 👤 Parent Profile
├── 👨‍⚕️ Doctor Details
├── 🚨 Emergency Contact
├── 📊 Dashboard
├── 💊 Add Medicine
├── 🔍 Search Medicine
├── 📋 Medicine List
├── 📊 Medicine History
└── 🔔 Alarm Controls
```

---

## 🛠️ Tech Stack

- **HTML5** — page structure
- **CSS3** — styling and responsive layout
- **JavaScript (Vanilla JS)** — application logic
- **LocalStorage API** — browser-side data persistence
- **Web Notifications API** — browser reminders
- **Web Audio API** — alarm sound

No backend server or database is required for the current version.

---

## 📁 Project Structure

```text
MediReminder/
├── index.html
├── script.js
├── style.css
└── README.md
```

---

## 🚀 How to Run

### Option 1 — Run locally

1. Clone the repository:

```bash
git clone https://github.com/hv086189-dot/MediReminder.git
```

2. Open the project folder:

```bash
cd MediReminder
```

3. Open `index.html` in a modern web browser.

4. Allow browser notifications when prompted.

5. Click **🔔 Enable Alarm** to enable audio reminders.

### Option 2 — Download ZIP

Open the repository:

👉 [Download/View Repository](https://github.com/hv086189-dot/MediReminder)

Then choose **Code → Download ZIP**.

Extract the ZIP and open `index.html`.

---

## 🧪 Example Medicine

```text
Medicine: Paracetamol
Type: Tablet
Dosage: 1 tablet
Frequency: Three Times Daily

Reminder Time 1: 08:00 AM
Reminder Time 2: 02:00 PM
Reminder Time 3: 08:00 PM
```

---

## 💾 Data Storage

MediReminder Pro currently stores its data using the browser's `localStorage`.

This means:

- Data is stored on the current browser/device.
- No remote database is required.
- Data can be lost if browser/site storage is cleared.
- Moving to another device does not automatically transfer the stored data.

---

## ⚠️ Current Limitations

The current project is a browser-based application and the reminder page needs to remain open for its JavaScript reminder engine to run.

The interface supports multiple reminder-time fields, but the current automatic reminder logic still relies primarily on the main `time` value.

Future versions can make each configured reminder time trigger independently.

---

## 🔮 Future Improvements

- 🔔 Independent alarms for every reminder time
- ⏰ Snooze reminder
- ⚠️ Missed-dose tracking
- 📦 Medicine stock and refill alerts
- 📅 Medicine start and end dates
- 📈 Adherence percentage and statistics
- 🖨️ Printable / PDF reports
- 📱 More elderly-friendly UI
- ☁️ Optional cloud backup
- 🔐 Optional user login
- 📲 Progressive Web App support

---

## 🔒 Privacy

MediReminder Pro is currently a client-side project.

Personal information, medicine details, doctor details, emergency contact information, and medicine history are stored locally in the browser and are not required to be sent to a remote application server.

---

## ✅ Tested

The current project has been tested for:

- Adding medicines
- Editing medicines
- Dosage and frequency fields
- Multiple reminder-time fields
- Marking medicines as taken
- Medicine history
- Parent profile saving
- Doctor details
- Emergency contact
- Dark mode
- Alarm testing
- Report download

---

## 🐛 Bugs & Issues

Found a bug or want to suggest an improvement?

👉 [Open an Issue](https://github.com/hv086189-dot/MediReminder/issues)

---

## 💡 Feature Requests

Have an idea for the next version?

👉 [Request a Feature](https://github.com/hv086189-dot/MediReminder/issues/new)

---

## 📌 Project Status

**Current stage:** Active development 🚧

The current version focuses on the core medicine reminder and tracking workflow. More advanced scheduling and reporting features can be added in future versions.

---

## 📜 License

No license has been specified yet.

When you decide how you want others to use, modify, and distribute this project, add the appropriate license file to the repository.

---

## 👨‍💻 Repository

**MediReminder Pro**

👉 https://github.com/hv086189-dot/MediReminder

---

<p align="center">
  💊 <strong>MediReminder Pro</strong> — Making daily medicine tracking simpler.
</p>
