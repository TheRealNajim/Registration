/**
 * Modern Analog & Digital Clock Application
 * High-performance 60fps render loop, Web Audio tick generator,
 * SVG clock-face generator, timezones, and customizable themes.
 */

// ==========================================================================
// DOM Element References
// ==========================================================================
const hrHand = document.getElementById("hrHand");
const minHand = document.getElementById("minHand");
const secHand = document.getElementById("secHand");
const ticksSvg = document.getElementById("ticksSvg");

const digitalTime = document.getElementById("digitalTime");
const digitalAmPm = document.getElementById("digitalAmPm");
const digitalDate = document.getElementById("digitalDate");
const timezoneBadge = document.getElementById("timezoneBadge");

const themeSelect = document.getElementById("themeSelect");
const timezoneSelect = document.getElementById("timezoneSelect");
const motionToggle = document.getElementById("motionToggle");
const formatToggle = document.getElementById("formatToggle");
const soundToggle = document.getElementById("soundToggle");

const motionText = document.getElementById("motionText");
const formatText = document.getElementById("formatText");
const soundText = document.getElementById("soundText");
const soundIcon = document.getElementById("soundIcon");

// ==========================================================================
// State Management & LocalStorage Persistence
// ==========================================================================
let state = {
    theme: localStorage.getItem("clock_theme") || "dark",
    timezone: localStorage.getItem("clock_timezone") || "local",
    isSmooth: localStorage.getItem("clock_smooth") !== "false", // default true
    is24Hour: localStorage.getItem("clock_24h") === "true",
    isSoundOn: localStorage.getItem("clock_sound") === "true",
};

let lastSecond = -1;
let audioCtx = null;

// ==========================================================================
// Render SVG Clock Face Ticks & Numbers
// ==========================================================================
function buildClockFace() {
    const center = 150;
    const outerRadius = 138;
    const majorLength = 14;
    const minorLength = 7;
    const numRadius = 110;

    let svgHtml = "";

    // Render 60 Tick Marks
    for (let i = 0; i < 60; i++) {
        const angleDeg = i * 6;
        const angleRad = (angleDeg - 90) * (Math.PI / 180);
        const isMajor = i % 5 === 0;
        const tickLength = isMajor ? majorLength : minorLength;

        const x1 = center + outerRadius * Math.cos(angleRad);
        const y1 = center + outerRadius * Math.sin(angleRad);
        const x2 = center + (outerRadius - tickLength) * Math.cos(angleRad);
        const y2 = center + (outerRadius - tickLength) * Math.sin(angleRad);

        const strokeWidth = isMajor ? 3 : 1.5;
        const tickClass = isMajor ? "tick-mark major" : "tick-mark";

        svgHtml += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke-width="${strokeWidth}" class="${tickClass}" />`;
    }

    // Render 12 Hour Numbers (1 to 12)
    for (let num = 1; num <= 12; num++) {
        const angleDeg = num * 30;
        const angleRad = (angleDeg - 90) * (Math.PI / 180);

        const nx = center + numRadius * Math.cos(angleRad);
        const ny = center + numRadius * Math.sin(angleRad);

        svgHtml += `<text x="${nx.toFixed(2)}" y="${ny.toFixed(2)}" class="clock-number">${num}</text>`;
    }

    ticksSvg.innerHTML = svgHtml;
}

// ==========================================================================
// Web Audio API Synthesizer (Realistic Mechanical Tick)
// ==========================================================================
function initAudio() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}

function playTickSound() {
    if (!state.isSoundOn || !audioCtx) return;

    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // High frequency transient pop
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.015);

        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.015);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.015);
    } catch (e) {
        // Fallback swallow audio context error if restricted
    }
}

// ==========================================================================
// Time Calculations & Date Helpers
// ==========================================================================
function getZonedDate(timezone) {
    const now = new Date();
    if (timezone === "local") return now;

    try {
        const tzString = now.toLocaleString("en-US", { timeZone: timezone });
        const zonedDate = new Date(tzString);
        zonedDate.setMilliseconds(now.getMilliseconds());
        return zonedDate;
    } catch (e) {
        return now;
    }
}

// ==========================================================================
// 60fps Animation Render Loop
// ==========================================================================
function updateClock() {
    const now = getZonedDate(state.timezone);

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ms = now.getMilliseconds();

    // Hand Angles Calculations
    let secAngle, minAngle, hrAngle;

    if (state.isSmooth) {
        const continuousSec = seconds + ms / 1000;
        const continuousMin = minutes + continuousSec / 60;
        const continuousHr = (hours % 12) + continuousMin / 60;

        secAngle = continuousSec * 6;
        minAngle = continuousMin * 6;
        hrAngle = continuousHr * 30;
    } else {
        secAngle = seconds * 6;
        minAngle = (minutes + seconds / 60) * 6;
        hrAngle = ((hours % 12) + minutes / 60) * 30;
    }

    // Apply hand rotations
    secHand.style.transform = `rotate(${secAngle}deg)`;
    minHand.style.transform = `rotate(${minAngle}deg)`;
    hrHand.style.transform = `rotate(${hrAngle}deg)`;

    // Audio Tick Trigger (Every whole second step)
    if (seconds !== lastSecond) {
        playTickSound();
        lastSecond = seconds;
    }

    // Update Digital Time Display
    updateDigitalDisplay(now, hours, minutes, seconds);

    // Request next animation frame
    requestAnimationFrame(updateClock);
}

function updateDigitalDisplay(dateObj, hours, minutes, seconds) {
    let displayHours = hours;
    let ampm = "";

    if (!state.is24Hour) {
        ampm = hours >= 12 ? "PM" : "AM";
        displayHours = hours % 12 || 12;
    }

    const pad = (n) => n.toString().padStart(2, "0");
    digitalTime.textContent = `${pad(displayHours)}:${pad(minutes)}:${pad(seconds)}`;
    digitalAmPm.textContent = state.is24Hour ? "" : ampm;

    // Date formatting (e.g. Thursday, Aug 13, 2026)
    const options = { weekday: "long", month: "short", day: "numeric", year: "numeric" };
    digitalDate.textContent = dateObj.toLocaleDateString("en-US", options);

    // Timezone badge
    timezoneBadge.textContent = state.timezone === "local" ? "LOCAL TIME" : state.timezone.split("/").pop().replace("_", " ");
}

// ==========================================================================
// Event Listeners & UI Handlers
// ==========================================================================
function applyTheme(themeName) {
    state.theme = themeName;
    document.body.setAttribute("data-theme", themeName);
    themeSelect.value = themeName;
    localStorage.setItem("clock_theme", themeName);
}

function setupEventListeners() {
    // Theme Select
    themeSelect.addEventListener("change", (e) => {
        applyTheme(e.target.value);
    });

    // Timezone Select
    timezoneSelect.addEventListener("change", (e) => {
        state.timezone = e.target.value;
        timezoneSelect.value = state.timezone;
        localStorage.setItem("clock_timezone", state.timezone);
    });

    // Motion Toggle (Smooth vs Step)
    motionToggle.addEventListener("click", () => {
        state.isSmooth = !state.isSmooth;
        motionText.textContent = state.isSmooth ? "Smooth" : "Step";
        motionToggle.classList.toggle("active", state.isSmooth);
        localStorage.setItem("clock_smooth", state.isSmooth);
    });

    // Digital Format Toggle (12h vs 24h)
    formatToggle.addEventListener("click", () => {
        state.is24Hour = !state.is24Hour;
        formatText.textContent = state.is24Hour ? "24H" : "12H";
        formatToggle.classList.toggle("active", state.is24Hour);
        localStorage.setItem("clock_24h", state.is24Hour);
    });

    // Sound Toggle
    soundToggle.addEventListener("click", () => {
        initAudio();
        state.isSoundOn = !state.isSoundOn;
        soundIcon.textContent = state.isSoundOn ? "🔊" : "🔇";
        soundText.textContent = state.isSoundOn ? "Tick" : "Mute";
        soundToggle.classList.toggle("active", state.isSoundOn);
        localStorage.setItem("clock_sound", state.isSoundOn);
    });
}

// ==========================================================================
// Initialization
// ==========================================================================
function init() {
    buildClockFace();
    setupEventListeners();

    // Set initial state from preferences
    applyTheme(state.theme);
    timezoneSelect.value = state.timezone;
    motionText.textContent = state.isSmooth ? "Smooth" : "Step";
    motionToggle.classList.toggle("active", state.isSmooth);
    formatText.textContent = state.is24Hour ? "24H" : "12H";
    formatToggle.classList.toggle("active", state.is24Hour);
    soundIcon.textContent = state.isSoundOn ? "🔊" : "🔇";
    soundText.textContent = state.isSoundOn ? "Tick" : "Mute";
    soundToggle.classList.toggle("active", state.isSoundOn);

    // Start 60fps loop
    requestAnimationFrame(updateClock);
}

// Run when DOM is ready
document.addEventListener("DOMContentLoaded", init);