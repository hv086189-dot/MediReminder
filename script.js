// ===== MediReminder Pro - script.js =====
// Version: 2.1
// Runs entirely in the browser. Data is stored in localStorage.

"use strict";

const MED_KEY = "medicines";
const PROFILE_KEY = "parentProfile";
const DOCTOR_KEY = "doctor";
const EMERGENCY_KEY = "emergencyContact";
const HISTORY_KEY = "medicineHistory";
const DARK_MODE_KEY = "darkMode";
const REMINDER_INTERVAL = 15000; // 15 seconds

let reminderTimer = null;
let audioContext = null;

window.addEventListener("DOMContentLoaded", init);

function init() {
    loadDarkMode();
    loadProfile();
    loadDoctor();
    loadEmergencyContact();
    migrateMedicines();
    resetDailyMedicineState();
    displayMedicines();
    updateHistory();
    updateReport();

    requestNotificationPermission();
    checkReminders();
    reminderTimer = window.setInterval(checkReminders, REMINDER_INTERVAL);

    window.addEventListener("focus", checkReminders);
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            resetDailyMedicineState();
            displayMedicines();
            updateHistory();
            updateReport();
            checkReminders();
        }
    });

    setStatus("Reminder engine is active. Keep this page open for browser reminders.");
}

function getTodayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function getMedicines() {
    try {
        const data = JSON.parse(localStorage.getItem(MED_KEY));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Could not read medicines:", error);
        return [];
    }
}

function saveMedicines(medicines) {
    localStorage.setItem(MED_KEY, JSON.stringify(medicines));
}

function getHistory() {
    try {
        const data = JSON.parse(localStorage.getItem(HISTORY_KEY));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Could not read history:", error);
        return [];
    }
}

function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function makeId() {
    return "m_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

function to12Hour(time24) {
    if (!/^\d{2}:\d{2}$/.test(time24 || "")) return "--";
    let [hours, minutes] = time24.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

function getCurrentTimeMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

function timeToMinutes(time) {
    if (!/^\d{2}:\d{2}$/.test(time || "")) return NaN;
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function normalizeMedicine(med) {
    return {
        id: med.id || makeId(),
        name: String(med.name || "").trim(),
        type: String(med.type || "Tablet"),
        dosage: String(med.dosage || "").trim(),
        frequency: String(med.frequency || "Once Daily"),
        reminderTimes: Array.isArray(med.reminderTimes) && med.reminderTimes.length
            ? med.reminderTimes.filter(t => /^\d{2}:\d{2}$/.test(t))
            : [/^\d{2}:\d{2}$/.test(med.time || "") ? med.time : "08:00"],
        time: /^\d{2}:\d{2}$/.test(med.time || "") ? med.time : "08:00",
        createdDate: med.createdDate || med.date || new Date().toLocaleDateString(),
        takenDate: med.takenDate || (med.taken ? getTodayKey() : null),
        lastNotifiedDate: med.lastNotifiedDate || med.lastNotified || null
    };
}

function migrateMedicines() {
    const medicines = getMedicines().map(normalizeMedicine).filter(m => m.name);
    saveMedicines(medicines);
}

function resetDailyMedicineState() {
    const today = getTodayKey();
    const medicines = getMedicines();
    let changed = false;

    medicines.forEach(med => {
        // Old versions used "taken: true" permanently. Convert that to today's date.
        if (med.takenDate && med.takenDate !== today) {
            med.takenDate = null;
            changed = true;
        }
        if (!med.takenDate && med.taken === true) {
            med.takenDate = today;
            changed = true;
        }
        if (med.lastNotifiedDate && med.lastNotifiedDate !== today) {
            med.lastNotifiedDate = null;
            changed = true;
        }
        if ("taken" in med) {
            delete med.taken;
            changed = true;
        }
        if ("lastNotified" in med) {
            delete med.lastNotified;
            changed = true;
        }
    });

    if (changed) saveMedicines(medicines);
}

function addMedicine() {
    const medicineInput = document.getElementById("medicine");
    const timeInput = document.getElementById("time");
    const typeInput = document.getElementById("medicineType");
    const dosageInput = document.getElementById("dosage");
    const frequencyInput = document.getElementById("frequency");
    const time2Input = document.getElementById("time2");
    const time3Input = document.getElementById("time3");

    const name = medicineInput.value.trim();
    const type = typeInput.value;
    const dosage = dosageInput.value.trim();
    const frequency = frequencyInput.value;
    const time1 = timeInput.value;
    const time2 = time2Input ? time2Input.value : "";
    const time3 = time3Input ? time3Input.value : "";

    if (!name || !dosage || !time1) {
        alert("Please enter medicine name, dosage and Reminder Time 1.");
        return;
    }

    if (frequency === "Twice Daily" && !time2) {
        alert("Please enter Reminder Time 2.");
        return;
    }

    if (frequency === "Three Times Daily" && (!time2 || !time3)) {
        alert("Please enter Reminder Time 2 and Reminder Time 3.");
        return;
    }

    const reminderTimes = [time1];
    if (frequency === "Twice Daily") reminderTimes.push(time2);
    if (frequency === "Three Times Daily") reminderTimes.push(time2, time3);

    const medicines = getMedicines();

    medicines.push({
        id: makeId(),
        name,
        type,
        dosage,
        frequency,
        time: time1,
        reminderTimes,
        createdDate: new Date().toLocaleDateString(),
        takenDate: null,
        lastNotifiedDate: null
    });

    saveMedicines(medicines);

    medicineInput.value = "";
    dosageInput.value = "";
    timeInput.value = "";
    typeInput.value = "Tablet";
    frequencyInput.value = "Once Daily";
    if (time2Input) time2Input.value = "";
    if (time3Input) time3Input.value = "";

    updateReminderTimeFields();
    displayMedicines();
    updateHistory();
    updateReport();
    setStatus(`${name} added successfully.`);
}

function displayMedicines() {
    resetDailyMedicineState();

    const medicines = getMedicines();
    const today = getTodayKey();
    const nowMinutes = getCurrentTimeMinutes();

    document.getElementById("totalCount").textContent = medicines.length;

    const takenCount = medicines.filter(m => m.takenDate === today).length;
    const pendingCount = medicines.length - takenCount;

    document.getElementById("takenCount").textContent = takenCount;
    document.getElementById("pendingCount").textContent = pendingCount;

    const sorted = [...medicines].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    const list = document.getElementById("medicineList");
    list.innerHTML = "";

    sorted.forEach(med => {
        const li = document.createElement("li");
        const isTaken = med.takenDate === today;
        const isOverdue = !isTaken && timeToMinutes(med.time) < nowMinutes;

        const statusHtml = isTaken
            ? '<span class="status taken">✅ Taken today</span>'
            : isOverdue
                ? '<span class="status overdue">⏰ Overdue</span>'
                : '<span class="status pending">❌ Pending</span>';

        li.innerHTML = `
            <div class="medicine-card" data-id="${escapeHtml(med.id)}">
                <h3>💊 ${escapeHtml(med.name)}</h3>
                <p>🕒 ${escapeHtml(to12Hour(med.time))}</p>
                <p>Type: ${escapeHtml(med.type)}</p>
                <p>💉 Dosage: ${escapeHtml(med.dosage || "Not specified")}</p>
                <p>🔁 Frequency: ${escapeHtml(med.frequency || "Once Daily")}</p>
                <p>Added: ${escapeHtml(med.createdDate)}</p>
                <p>Status: ${statusHtml}</p>

                <div class="edit-form" id="edit-${escapeHtml(med.id)}" hidden>
                    <input type="text" id="editName-${escapeHtml(med.id)}" value="${escapeHtml(med.name)}" aria-label="Medicine name">
                    <select id="editType-${escapeHtml(med.id)}" aria-label="Medicine type">
                        ${medicineTypeOptions(med.type)}
                    </select>
                    <input type="text" id="editDosage-${escapeHtml(med.id)}" value="${escapeHtml(med.dosage || "")}" placeholder="Dosage" aria-label="Dosage">
                    <select id="editFrequency-${escapeHtml(med.id)}" aria-label="Frequency">
                        <option value="Once Daily" ${med.frequency === "Once Daily" ? "selected" : ""}>🔁 Once Daily</option>
                        <option value="Twice Daily" ${med.frequency === "Twice Daily" ? "selected" : ""}>🔁 Twice Daily</option>
                        <option value="Three Times Daily" ${med.frequency === "Three Times Daily" ? "selected" : ""}>🔁 Three Times Daily</option>
                        <option value="As Needed" ${med.frequency === "As Needed" ? "selected" : ""}>🔁 As Needed</option>
                    </select>
                    <input type="time" id="editTime-${escapeHtml(med.id)}" value="${escapeHtml(med.time)}" aria-label="Reminder time">
                    <button type="button" onclick="saveEdit('${escapeJs(med.id)}')">Save</button>
                    <button type="button" onclick="cancelEdit('${escapeJs(med.id)}')">Cancel</button>
                </div>

                <button type="button" onclick="markTaken('${escapeJs(med.id)}')" ${isTaken ? "disabled" : ""}>
                    ${isTaken ? "Taken Today" : "Mark Taken"}
                </button>
                <button type="button" onclick="toggleEdit('${escapeJs(med.id)}')">Edit</button>
                <button type="button" onclick="deleteMedicine('${escapeJs(med.id)}')">Delete</button>
            </div>
        `;
        list.appendChild(li);
    });

    document.getElementById("emptyMedicineMessage").hidden = medicines.length !== 0;
}

function medicineTypeOptions(selected) {
    const types = [
        ["Tablet", "💊 Tablet"],
        ["Syrup", "🧴 Syrup"],
        ["Injection", "💉 Injection"],
        ["Capsule", "💊 Capsule"],
        ["Other", "🩺 Other"]
    ];
    return types.map(([value, label]) =>
        `<option value="${value}" ${selected === value ? "selected" : ""}>${label}</option>`
    ).join("");
}

function escapeJs(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function markTaken(id) {
    const medicines = getMedicines();
    const med = medicines.find(item => item.id === id);
    if (!med) return;

    const today = getTodayKey();
    if (med.takenDate === today) return;

    med.takenDate = today;
    saveMedicines(medicines);

    const history = getHistory();
    history.unshift({
        id: makeId(),
        medicineId: med.id,
        name: med.name,
        type: med.type,
        scheduledTime: med.time,
        date: today,
        status: "Taken",
        recordedAt: new Date().toISOString()
    });
    saveHistory(history.slice(0, 500));

    displayMedicines();
    updateHistory();
    updateReport();
    setStatus(`${med.name} marked as taken.`);
}

function deleteMedicine(id) {
    const medicines = getMedicines();
    const med = medicines.find(item => item.id === id);
    if (!med) return;

    if (!confirm(`Delete "${med.name}"?`)) return;

    saveMedicines(medicines.filter(item => item.id !== id));
    displayMedicines();
    updateHistory();
    updateReport();
    setStatus(`${med.name} deleted.`);
}

function toggleEdit(id) {
    const form = document.getElementById("edit-" + id);
    if (form) form.hidden = !form.hidden;
}

function cancelEdit(id) {
    const form = document.getElementById("edit-" + id);
    if (form) form.hidden = true;
}

function saveEdit(id) {
    const nameEl = document.getElementById("editName-" + id);
    const typeEl = document.getElementById("editType-" + id);
    const dosageEl = document.getElementById("editDosage-" + id);
    const frequencyEl = document.getElementById("editFrequency-" + id);
    const timeEl = document.getElementById("editTime-" + id);

    if (!nameEl || !typeEl || !dosageEl || !frequencyEl || !timeEl) {
        alert("Edit fields are missing. Please refresh the page.");
        return;
    }

    const name = nameEl.value.trim();
    const type = typeEl.value;
    const dosage = dosageEl.value.trim();
    const frequency = frequencyEl.value;
    const time = timeEl.value;

    if (!name || !dosage || !time) {
        alert("Please enter medicine name, dosage and reminder time.");
        return;
    }

    const medicines = getMedicines();
    const med = medicines.find(item => item.id === id);
    if (!med) {
        alert("Medicine not found.");
        return;
    }

    med.name = name;
    med.type = type;
    med.dosage = dosage;
    med.frequency = frequency;
    med.time = time;
    med.reminderTimes = [time];
    med.lastNotifiedDate = null;

    saveMedicines(medicines);
    displayMedicines();
    updateHistory();
    updateReport();
    setStatus(`${name} updated successfully.`);
}

function searchMedicine() {
    const input = document.getElementById("searchMedicine").value.trim().toLowerCase();
    const cards = document.querySelectorAll(".medicine-card");

    cards.forEach(card => {
        const matches = card.textContent.toLowerCase().includes(input);
        card.closest("li").hidden = !matches;
    });
}

function updateReport() {
    const medicines = getMedicines();
    const today = getTodayKey();
    const taken = medicines.filter(med => med.takenDate === today).length;
    const pending = medicines.length - taken;
    const overdue = medicines.filter(med =>
        med.takenDate !== today && timeToMinutes(med.time) < getCurrentTimeMinutes()
    ).length;

    document.getElementById("report").innerHTML = `
        Total scheduled: <strong>${medicines.length}</strong><br>
        Taken today: <strong>${taken}</strong><br>
        Pending: <strong>${pending}</strong><br>
        Overdue: <strong>${overdue}</strong>
    `;
}

function updateHistory() {
    const history = getHistory();
    const body = document.getElementById("historyBody");
    body.innerHTML = "";

    if (history.length === 0) {
        body.innerHTML = '<tr><td colspan="4">No medicine history yet.</td></tr>';
        return;
    }

    history.forEach(record => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHtml(record.name)}</td>
            <td>${escapeHtml(to12Hour(record.scheduledTime))}</td>
            <td>${escapeHtml(record.date)}</td>
            <td>✅ ${escapeHtml(record.status || "Taken")}</td>
        `;
        body.appendChild(row);
    });
}

function clearHistory() {
    if (!getHistory().length) {
        alert("There is no history to clear.");
        return;
    }

    if (confirm("Clear all medicine history? This cannot be undone.")) {
        localStorage.removeItem(HISTORY_KEY);
        updateHistory();
        setStatus("Medicine history cleared.");
    }
}

function getStoredObject(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || null;
    } catch {
        return null;
    }
}

function saveProfile() {
    const name = document.getElementById("parentName").value.trim();
    const age = document.getElementById("parentAge").value.trim();
    const blood = document.getElementById("bloodGroup").value.trim();

    if (!name) {
        alert("Please enter the parent name.");
        return;
    }

    localStorage.setItem(PROFILE_KEY, JSON.stringify({ name, age, blood }));
    loadProfile();
    setStatus("Parent profile saved.");
}

function loadProfile() {
    const profile = getStoredObject(PROFILE_KEY);
    if (!profile) return;

    document.getElementById("parentName").value = profile.name || "";
    document.getElementById("parentAge").value = profile.age || "";
    document.getElementById("bloodGroup").value = profile.blood || "";

    document.getElementById("profileDisplay").innerHTML = `
        <p><strong>Name:</strong> ${escapeHtml(profile.name || "")}</p>
        <p><strong>Age:</strong> ${escapeHtml(profile.age || "")}</p>
        <p><strong>Blood Group:</strong> ${escapeHtml(profile.blood || "")}</p>
    `;
}

function saveDoctor() {
    const doctorName = document.getElementById("doctorName").value.trim();
    const doctorPhone = document.getElementById("doctorPhone").value.trim();

    if (!doctorName && !doctorPhone) {
        alert("Please enter doctor details.");
        return;
    }

    localStorage.setItem(DOCTOR_KEY, JSON.stringify({ doctorName, doctorPhone }));
    loadDoctor();
    setStatus("Doctor details saved.");
}

function loadDoctor() {
    const doctor = getStoredObject(DOCTOR_KEY);
    if (!doctor) return;

    document.getElementById("doctorName").value = doctor.doctorName || "";
    document.getElementById("doctorPhone").value = doctor.doctorPhone || "";

    document.getElementById("doctorDisplay").innerHTML = `
        <p>👨‍⚕️ ${escapeHtml(doctor.doctorName || "Doctor")}</p>
        <p>📞 ${escapeHtml(doctor.doctorPhone || "")}</p>
    `;
}

function saveEmergencyContact() {
    const name = document.getElementById("emergencyName").value.trim();
    const phone = document.getElementById("emergencyPhone").value.trim();

    if (!phone) {
        alert("Please enter an emergency phone number.");
        return;
    }

    localStorage.setItem(EMERGENCY_KEY, JSON.stringify({ name, phone }));
    loadEmergencyContact();
    setStatus("Emergency contact saved.");
}

function loadEmergencyContact() {
    const contact = getStoredObject(EMERGENCY_KEY);
    if (!contact) return;

    document.getElementById("emergencyName").value = contact.name || "";
    document.getElementById("emergencyPhone").value = contact.phone || "";

    document.getElementById("emergencyDisplay").innerHTML = `
        <p>🚨 ${escapeHtml(contact.name || "Emergency Contact")}</p>
        <p>📞 ${escapeHtml(contact.phone || "")}</p>
    `;
}

function callEmergency() {
    const contact = getStoredObject(EMERGENCY_KEY);
    const phone = contact?.phone?.trim();

    if (!phone) {
        alert("Please save an emergency contact first.");
        document.getElementById("emergencyPhone").focus();
        return;
    }

    window.location.href = "tel:" + phone.replace(/[^\d+]/g, "");
}

function toggleDarkMode() {
    const enabled = document.body.classList.toggle("dark-mode");
    localStorage.setItem(DARK_MODE_KEY, enabled ? "1" : "0");
    updateDarkModeButton(enabled);
}

function loadDarkMode() {
    const enabled = localStorage.getItem(DARK_MODE_KEY) === "1";
    document.body.classList.toggle("dark-mode", enabled);
    updateDarkModeButton(enabled);
}

function updateDarkModeButton(enabled) {
    const button = document.getElementById("darkModeButton");
    if (button) button.textContent = enabled ? "☀️ Light Mode" : "🌙 Dark Mode";
}

async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        setStatus("Browser notifications are not supported here.");
        return;
    }

    if (Notification.permission === "default") {
        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                setStatus("Browser notifications enabled.");
            }
        } catch (error) {
            console.warn("Notification permission request failed:", error);
        }
    }
}

function showNotification(medicineName) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    try {
        const notification = new Notification("💊 Medicine Reminder", {
            body: `Time to take: ${medicineName}`,
            tag: `medicine-${medicineName}-${getTodayKey()}`
        });

        notification.onclick = () => window.focus();
    } catch (error) {
        console.warn("Notification could not be shown:", error);
    }
}

function getAudioContext() {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        audioContext = new AudioContextClass();
    }
    return audioContext;
}

async function enableAlarms() {
    const context = getAudioContext();
    if (!context) {
        alert("Audio alarms are not supported by this browser.");
        return;
    }

    try {
        if (context.state === "suspended") await context.resume();
        playAlarm();
        setStatus("Alarm enabled. You can test it anytime.");
    } catch (error) {
        console.error(error);
        alert("Could not enable the alarm.");
    }
}

function playAlarm() {
    const context = getAudioContext();
    if (!context) {
        alert("Audio alarms are not supported by this browser.");
        return;
    }

    if (context.state === "suspended") {
        context.resume().then(() => playAlarmTone(context)).catch(console.error);
    } else {
        playAlarmTone(context);
    }
}

function playAlarmTone(context) {
    const now = context.currentTime;

    for (let i = 0; i < 3; i++) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(i % 2 === 0 ? 880 : 660, now + i * 0.35);
        gain.gain.setValueAtTime(0.0001, now + i * 0.35);
        gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.35 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.35 + 0.28);

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(now + i * 0.35);
        oscillator.stop(now + i * 0.35 + 0.3);
    }
}

function checkReminders() {
    resetDailyMedicineState();

    const medicines = getMedicines();
    if (!medicines.length) return;

    const now = new Date();
    const today = getTodayKey();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let changed = false;

    medicines.forEach(med => {
        const scheduledMinutes = timeToMinutes(med.time);
        if (Number.isNaN(scheduledMinutes)) return;

        // Fire when the scheduled time has been reached, even if the 15-second
        // interval does not land on the exact minute.
        if (
            med.takenDate !== today &&
            scheduledMinutes <= currentMinutes &&
            med.lastNotifiedDate !== today
        ) {
            showNotification(med.name);
            playAlarm();
            med.lastNotifiedDate = today;
            changed = true;

            setStatus(`⏰ Reminder: time to take ${med.name}.`);
        }
    });

    if (changed) {
        saveMedicines(medicines);
        displayMedicines();
        updateReport();
    }
}

function updateReminderTimeFields() {
    const frequency = document.getElementById("frequency")?.value;
    const time2Container = document.getElementById("time2Container");
    const time3Container = document.getElementById("time3Container");
    const time2 = document.getElementById("time2");
    const time3 = document.getElementById("time3");

    if (!time2Container || !time3Container) return;

    const needsTime2 = frequency === "Twice Daily" || frequency === "Three Times Daily";
    const needsTime3 = frequency === "Three Times Daily";

    time2Container.hidden = !needsTime2;
    time3Container.hidden = !needsTime3;

    if (!needsTime2 && time2) time2.value = "";
    if (!needsTime3 && time3) time3.value = "";
}

function downloadReport() {
    const profile = getStoredObject(PROFILE_KEY) || {};
    const doctor = getStoredObject(DOCTOR_KEY) || {};
    const emergency = getStoredObject(EMERGENCY_KEY) || {};
    const medicines = getMedicines();
    const history = getHistory();

    let report = "MEDIREMINDER PRO REPORT\n";
    report += "=======================\n\n";

    report += "PARENT PROFILE\n";
    report += `Name: ${profile.name || "-"}\n`;
    report += `Age: ${profile.age || "-"}\n`;
    report += `Blood Group: ${profile.blood || "-"}\n\n`;

    report += "DOCTOR\n";
    report += `Name: ${doctor.doctorName || "-"}\n`;
    report += `Phone: ${doctor.doctorPhone || "-"}\n\n`;

    report += "EMERGENCY CONTACT\n";
    report += `Name: ${emergency.name || "-"}\n`;
    report += `Phone: ${emergency.phone || "-"}\n\n`;

    report += "CURRENT MEDICINES\n";
    report += "-----------------\n";
    medicines.forEach((med, index) => {
        report += `${index + 1}. ${med.name} | ${med.type} | ${to12Hour(med.time)} | ${
            med.takenDate === getTodayKey() ? "Taken today" : "Pending"
        }\n`;
    });

    report += "\nTAKEN HISTORY\n";
    report += "-------------\n";
    if (!history.length) {
        report += "No history recorded.\n";
    } else {
        history.forEach((record, index) => {
            report += `${index + 1}. ${record.date} | ${record.name} | ${to12Hour(record.scheduledTime)} | ${record.status}\n`;
        });
    }

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MediReminder_Report_${getTodayKey()}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setStatus(message) {
    const status = document.getElementById("appStatus");
    if (status) status.textContent = message;
}
