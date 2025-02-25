// ==UserScript==
// @name         <SamXode/> Typing Countdown Tracker.
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Tracks typing with a countdown and displays typing count and timer. Enhanced with modern UI, settings panel, audio notifications, and smoother transitions.
// @author       SamXode
// @match        *://*.discord.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @resource     completeSound https://assets.mixkit.co/active_storage/sfx/767/767-preview.mp3
// @resource     warningSound https://assets.mixkit.co/active_storage/sfx/898/898-preview.mp3
// @connect      assets.mixkit.co
// @grant        GM_getResourceURL
// ==/UserScript==

(function () {
    'use strict';

    // Default settings
    const DEFAULT_SETTINGS = {
        countdownTime: 60,
        enableSounds: true,
        notificationVolume: 0.5,
        warningVolume: 0.3,
        uiTheme: 'default',
        position: 'topRight'
    };

    // State variables
    let typingCount = 0;
    let countdownTime = GM_getValue('countdownTime', DEFAULT_SETTINGS.countdownTime);
    let countdownInterval = null;
    let canType = true;
    let isScriptInitialized = false;
    let isSettingsPanelOpen = false;
    let settings = loadSettings();

    // Audio elements
    const completeSound = new Audio(GM_getResourceURL('completeSound'));
    const warningSound = new Audio(GM_getResourceURL('warningSound'));

    // Create UI elements
    const timerDisplay = document.createElement('div');
    const countDisplay = document.createElement('div');
    const resetButton = document.createElement('button');
    const warningDisplay = document.createElement('div');
    const manualButton = document.createElement('button');
    const readyMessage = document.createElement('div');
    const container = document.createElement('div');
    const settingsButton = document.createElement('button');
    const settingsPanel = document.createElement('div');
    const audioIndicator = document.createElement('div');

    // Load settings from localStorage
    function loadSettings() {
        let savedSettings = {};

        try {
            // Load each setting individually with fallback to defaults
            savedSettings = {
                countdownTime: GM_getValue('countdownTime', DEFAULT_SETTINGS.countdownTime),
                enableSounds: GM_getValue('enableSounds', DEFAULT_SETTINGS.enableSounds),
                notificationVolume: GM_getValue('notificationVolume', DEFAULT_SETTINGS.notificationVolume),
                warningVolume: GM_getValue('warningVolume', DEFAULT_SETTINGS.warningVolume),
                uiTheme: GM_getValue('uiTheme', DEFAULT_SETTINGS.uiTheme),
                position: GM_getValue('position', DEFAULT_SETTINGS.position)
            };
        } catch (e) {
            console.error('Error loading settings:', e);
            savedSettings = {...DEFAULT_SETTINGS};
        }

        return savedSettings;
    }

    // Save settings to localStorage
    function saveSettings() {
        try {
            GM_setValue('countdownTime', settings.countdownTime);
            GM_setValue('enableSounds', settings.enableSounds);
            GM_setValue('notificationVolume', settings.notificationVolume);
            GM_setValue('warningVolume', settings.warningVolume);
            GM_setValue('uiTheme', settings.uiTheme);
            GM_setValue('position', settings.position);
        } catch (e) {
            console.error('Error saving settings:', e);
        }
    }

    // Apply settings
    function applySettings() {
        countdownTime = settings.countdownTime;
        completeSound.volume = settings.notificationVolume;
        warningSound.volume = settings.warningVolume;
        updateDisplays();
        setContainerPosition(settings.position);
    }

    // Set container position based on user preference
    function setContainerPosition(position) {
        // Reset positioning
        container.style.top = '';
        container.style.right = '';
        container.style.bottom = '';
        container.style.left = '';

        // Set new position
        switch (position) {
            case 'topRight':
                container.style.top = '10px';
                container.style.right = '10px';
                break;
            case 'topLeft':
                container.style.top = '10px';
                container.style.left = '10px';
                break;
            case 'bottomRight':
                container.style.bottom = '10px';
                container.style.right = '10px';
                break;
            case 'bottomLeft':
                container.style.bottom = '10px';
                container.style.left = '10px';
                break;
            default:
                container.style.top = '10px';
                container.style.right = '10px';
        }
    }

    // Add animation styles
    GM_addStyle(`
        @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeOut {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(10px); }
        }

        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
        }

        @keyframes resetEffect {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
        }

        @keyframes buttonClickEffect {
            0% { transform: scale(1); }
            50% { transform: scale(0.95); }
            100% { transform: scale(1); }
        }

        @keyframes emojiBounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        .typing-tracker-element {
            transition: all 0.3s ease-in-out;
            font-family: 'Segoe UI', Arial, sans-serif;
            z-index: 10000;
        }

        .typing-tracker-container {
            position: fixed;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 10000;
        }

        .typing-tracker-settings-panel {
            position: fixed;
            background-color: #36393f;
            color: #dcddde;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
            z-index: 10001;
            padding: 15px;
            width: 300px;
            max-height: 500px;
            overflow-y: auto;
            transform-origin: top right;
            animation: fadeIn 0.3s ease-out forwards;
        }

        .typing-tracker-settings-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 1px solid #4f545c;
            padding-bottom: 10px;
        }

        .typing-tracker-settings-title {
            font-weight: bold;
            font-size: 16px;
        }

        .typing-tracker-close-button {
            background: none;
            border: none;
            color: #dcddde;
            cursor: pointer;
            font-size: 16px;
        }

        .typing-tracker-setting-group {
            margin-bottom: 15px;
        }

        .typing-tracker-setting-label {
            display: block;
            margin-bottom: 5px;
            font-size: 14px;
        }

        .typing-tracker-setting-input {
            width: 100%;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #4f545c;
            background-color: #2f3136;
            color: #dcddde;
            margin-bottom: 10px;
        }

        .typing-tracker-setting-select {
            width: 100%;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #4f545c;
            background-color: #2f3136;
            color: #dcddde;
            margin-bottom: 10px;
        }

        .typing-tracker-setting-checkbox {
            margin-right: 8px;
        }

        .typing-tracker-save-button {
            background-color: #5865f2;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 14px;
            width: 100%;
        }

        .typing-tracker-save-button:hover {
            background-color: #4752c4;
        }

        .typing-tracker-reset-defaults {
            background: none;
            border: none;
            color: #dcddde;
            cursor: pointer;
            font-size: 12px;
            text-decoration: underline;
            margin-top: 10px;
            text-align: center;
            width: 100%;
        }

        .typing-tracker-audio-indicator {
            position: fixed;
            bottom: 50px;
            right: 10px;
            background-color: rgba(47, 49, 54, 0.8);
            color: #dcddde;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 14px;
            display: none;
            z-index: 10000;
            animation: fadeIn 0.3s, pulse 1s infinite;
        }

        /* Volume slider styling */
        .typing-tracker-volume-slider {
            -webkit-appearance: none;
            width: 100%;
            height: 5px;
            border-radius: 5px;
            background: #4f545c;
            outline: none;
            margin-bottom: 15px;
        }

        .typing-tracker-volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background: #5865f2;
            cursor: pointer;
        }

        .typing-tracker-volume-slider::-moz-range-thumb {
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background: #5865f2;
            cursor: pointer;
        }
    `);

    // Function to initialize elements
    function initializeElements() {
        if (isScriptInitialized) return;

        // Container styling
        container.className = 'typing-tracker-container';
        setContainerPosition(settings.position);

        // Timer display styling
        timerDisplay.className = 'typing-tracker-element';
        timerDisplay.style.cssText = `
            background-color: #2C3E50;
            color: #F1C40F;
            padding: 5px 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            font-size: 12px;
            animation: fadeIn 0.5s ease-out forwards;
        `;

        // Count display styling
        countDisplay.className = 'typing-tracker-element';
        countDisplay.style.cssText = `
            background-color: #1ABC9C;
            color: #FFFFFF;
            padding: 5px 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            font-size: 12px;
            animation: fadeIn 0.5s ease-out 0.2s forwards;
        `;

        // Reset button styling
        resetButton.className = 'typing-tracker-element';
        resetButton.style.cssText = `
            background-color: #E74C3C;
            color: #FFFFFF;
            padding: 5px 10px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 12px;
            animation: fadeIn 0.5s ease-out 0.4s forwards;
        `;
        resetButton.innerText = 'Reset 🔄';

        // Settings button styling
        settingsButton.className = 'typing-tracker-element';
        settingsButton.style.cssText = `
            background-color: #7289DA;
            color: #FFFFFF;
            padding: 5px 10px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 12px;
            animation: fadeIn 0.5s ease-out 0.6s forwards;
        `;
        settingsButton.innerText = '⚙️ Settings';

        // Manual button styling
        manualButton.className = 'typing-tracker-element';
        manualButton.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 10px;
            background-color: #3498DB;
            color: #FFFFFF;
            padding: 7px 12px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 14px;
            animation: fadeIn 0.5s ease-out;
        `;
        manualButton.innerText = 'Start Countdown ⏱️';

        // Warning display styling
        warningDisplay.className = 'typing-tracker-element';
        warningDisplay.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 10px;
            background-color: #F39C12;
            color: #FFFFFF;
            padding: 10px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            font-size: 14px;
            display: none;
        `;
        warningDisplay.innerText = '⚠️ Please wait until the countdown is over.';

        // Ready message styling
        readyMessage.className = 'typing-tracker-element';
        readyMessage.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 10px;
            background-color: #2ECC71;
            color: #FFFFFF;
            padding: 10px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            font-size: 14px;
            display: none;
        `;
        readyMessage.innerText = '✅ You can now start typing.';

        // Audio indicator styling
        audioIndicator.className = 'typing-tracker-audio-indicator';
        audioIndicator.innerHTML = '🔊 Playing sound...';

        // Create settings panel
        settingsPanel.className = 'typing-tracker-settings-panel';
        settingsPanel.style.display = 'none';

        updateSettingsPanel();

        // Add elements to container
        container.appendChild(timerDisplay);
        container.appendChild(countDisplay);
        container.appendChild(resetButton);
        container.appendChild(settingsButton);

        // Add container and other elements to document
        document.body.appendChild(container);
        document.body.appendChild(warningDisplay);
        document.body.appendChild(readyMessage);
        document.body.appendChild(manualButton);
        document.body.appendChild(settingsPanel);
        document.body.appendChild(audioIndicator);

        // Add event listeners
        resetButton.addEventListener('click', resetCounter);
        manualButton.addEventListener('click', triggerCountdown);
        settingsButton.addEventListener('click', toggleSettingsPanel);
        document.addEventListener('keydown', handleKeyPress);

        // Initialize audio
        completeSound.volume = settings.notificationVolume;
        warningSound.volume = settings.warningVolume;

        // Set initialization flag
        isScriptInitialized = true;

        // Initial display update
        updateDisplays();
    }

    // Update the settings panel content
    function updateSettingsPanel() {
        settingsPanel.innerHTML = `
            <div class="typing-tracker-settings-header">
                <div class="typing-tracker-settings-title">Countdown Settings</div>
                <button class="typing-tracker-close-button">✖</button>
            </div>

            <div class="typing-tracker-setting-group">
                <label class="typing-tracker-setting-label">Countdown Duration (seconds)</label>
                <input type="number" id="countdown-time" class="typing-tracker-setting-input" min="5" max="600" value="${settings.countdownTime}">
            </div>

            <div class="typing-tracker-setting-group">
                <label class="typing-tracker-setting-label">UI Position</label>
                <select id="ui-position" class="typing-tracker-setting-select">
                    <option value="topRight" ${settings.position === 'topRight' ? 'selected' : ''}>Top Right</option>
                    <option value="topLeft" ${settings.position === 'topLeft' ? 'selected' : ''}>Top Left</option>
                    <option value="bottomRight" ${settings.position === 'bottomRight' ? 'selected' : ''}>Bottom Right</option>
                    <option value="bottomLeft" ${settings.position === 'bottomLeft' ? 'selected' : ''}>Bottom Left</option>
                </select>
            </div>

            <div class="typing-tracker-setting-group">
                <label class="typing-tracker-setting-label">
                    <input type="checkbox" id="enable-sounds" class="typing-tracker-setting-checkbox" ${settings.enableSounds ? 'checked' : ''}>
                    Enable Sound Effects
                </label>
            </div>

            <div class="typing-tracker-setting-group">
                <label class="typing-tracker-setting-label">Notification Volume: ${Math.round(settings.notificationVolume * 100)}%</label>
                <input type="range" id="notification-volume" class="typing-tracker-volume-slider" min="0" max="1" step="0.01" value="${settings.notificationVolume}">
                <button id="test-notification-sound" class="typing-tracker-element" style="background-color: #5865f2; color: white; border: none; border-radius: 4px; padding: 3px 8px; font-size: 12px; cursor: pointer;">Test Sound</button>
            </div>

            <div class="typing-tracker-setting-group">
                <label class="typing-tracker-setting-label">Warning Volume: ${Math.round(settings.warningVolume * 100)}%</label>
                <input type="range" id="warning-volume" class="typing-tracker-volume-slider" min="0" max="1" step="0.01" value="${settings.warningVolume}">
                <button id="test-warning-sound" class="typing-tracker-element" style="background-color: #5865f2; color: white; border: none; border-radius: 4px; padding: 3px 8px; font-size: 12px; cursor: pointer;">Test Sound</button>
            </div>

            <button id="save-settings" class="typing-tracker-save-button">Save Settings</button>
            <button id="reset-defaults" class="typing-tracker-reset-defaults">Reset to Defaults</button>
        `;

        // Set position
        settingsPanel.style.top = '10px';
        settingsPanel.style.right = '10px';

        // Add event listeners
        settingsPanel.querySelector('.typing-tracker-close-button').addEventListener('click', closeSettingsPanel);
        settingsPanel.querySelector('#save-settings').addEventListener('click', saveSettingsFromPanel);
        settingsPanel.querySelector('#reset-defaults').addEventListener('click', resetDefaultSettings);
        settingsPanel.querySelector('#test-notification-sound').addEventListener('click', testNotificationSound);
        settingsPanel.querySelector('#test-warning-sound').addEventListener('click', testWarningSound);

        // Live update volume labels
        const notificationVolumeSlider = settingsPanel.querySelector('#notification-volume');
        const warningVolumeSlider = settingsPanel.querySelector('#warning-volume');

        notificationVolumeSlider.addEventListener('input', function() {
            const volumeLabel = settingsPanel.querySelector('label[for="notification-volume"]') ||
                               settingsPanel.querySelectorAll('.typing-tracker-setting-label')[3];
            volumeLabel.textContent = `Notification Volume: ${Math.round(this.value * 100)}%`;
        });

        warningVolumeSlider.addEventListener('input', function() {
            const volumeLabel = settingsPanel.querySelector('label[for="warning-volume"]') ||
                               settingsPanel.querySelectorAll('.typing-tracker-setting-label')[4];
            volumeLabel.textContent = `Warning Volume: ${Math.round(this.value * 100)}%`;
        });
    }

    // Toggle settings panel visibility
    function toggleSettingsPanel() {
        if (isSettingsPanelOpen) {
            closeSettingsPanel();
        } else {
            settingsPanel.style.display = 'block';
            isSettingsPanelOpen = true;

            // Animate the settings button
            settingsButton.style.animation = 'buttonClickEffect 0.3s ease-out';
            setTimeout(() => {
                settingsButton.style.animation = '';
            }, 300);
        }
    }

    // Close settings panel
    function closeSettingsPanel() {
        settingsPanel.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            settingsPanel.style.display = 'none';
            settingsPanel.style.animation = '';
            isSettingsPanelOpen = false;
        }, 300);
    }

    // Save settings from panel inputs
    function saveSettingsFromPanel() {
        // Get values from inputs
        const countdownTimeInput = document.getElementById('countdown-time');
        const enableSoundsInput = document.getElementById('enable-sounds');
        const notificationVolumeInput = document.getElementById('notification-volume');
        const warningVolumeInput = document.getElementById('warning-volume');
        const positionInput = document.getElementById('ui-position');

        // Validate countdown time
        let newCountdownTime = parseInt(countdownTimeInput.value, 10);
        if (isNaN(newCountdownTime) || newCountdownTime < 5) {
            newCountdownTime = 5;
        } else if (newCountdownTime > 600) {
            newCountdownTime = 600;
        }

        // Update settings object
        settings.countdownTime = newCountdownTime;
        settings.enableSounds = enableSoundsInput.checked;
        settings.notificationVolume = parseFloat(notificationVolumeInput.value);
        settings.warningVolume = parseFloat(warningVolumeInput.value);
        settings.position = positionInput.value;

        // Save to localStorage
        saveSettings();

        // Apply settings
        applySettings();

        // Show success feedback
        const saveButton = document.getElementById('save-settings');
        const originalText = saveButton.innerText;
        saveButton.innerText = 'Saved ✓';
        saveButton.style.backgroundColor = '#43B581';

        setTimeout(() => {
            saveButton.innerText = originalText;
            saveButton.style.backgroundColor = '#5865f2';
            closeSettingsPanel();
        }, 1000);
    }

    // Reset to default settings
    function resetDefaultSettings() {
        settings = {...DEFAULT_SETTINGS};
        saveSettings();
        updateSettingsPanel();
        applySettings();

        // Show success feedback
        const resetButton = document.getElementById('reset-defaults');
        resetButton.innerText = 'Defaults Restored ✓';

        setTimeout(() => {
            resetButton.innerText = 'Reset to Defaults';
        }, 1000);
    }

    // Test notification sound
    function testNotificationSound() {
        if (settings.enableSounds) {
            const volume = parseFloat(document.getElementById('notification-volume').value);
            completeSound.volume = volume;
            playSound(completeSound, '🔊 Notification sound');
        } else {
            showAudioIndicator('🔇 Sounds are disabled');
        }
    }

    // Test warning sound
    function testWarningSound() {
        if (settings.enableSounds) {
            const volume = parseFloat(document.getElementById('warning-volume').value);
            warningSound.volume = volume;
            playSound(warningSound, '🔊 Warning sound');
        } else {
            showAudioIndicator('🔇 Sounds are disabled');
        }
    }

    // Play sound with indicator
    function playSound(sound, message) {
        if (settings.enableSounds) {
            // Clone to allow overlapping sounds
            const soundClone = sound.cloneNode();
            soundClone.play();
            showAudioIndicator(message);
        }
    }

    // Show audio indicator
    function showAudioIndicator(message) {
        audioIndicator.innerHTML = message;
        audioIndicator.style.display = 'block';

        setTimeout(() => {
            audioIndicator.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                audioIndicator.style.display = 'none';
                audioIndicator.style.animation = 'fadeIn 0.3s, pulse 1s infinite';
            }, 300);
        }, 2000);
    }

    // Update the displays
    function updateDisplays() {
        timerDisplay.innerHTML = `Countdown: ${countdownTime}s ⌛`;
        countDisplay.innerHTML = `Typing Count: ${typingCount} ✍️`;
    }

    // Reset the counter
    function resetCounter() {
        resetButton.style.animation = 'resetEffect 0.3s ease-out';

        setTimeout(() => {
            resetButton.style.animation = '';
            typingCount = 0;
            countdownTime = settings.countdownTime;
            clearInterval(countdownInterval);
            countdownInterval = null;
            canType = true;
            updateDisplays();
            warningDisplay.style.display = 'none';
            readyMessage.style.display = 'none';
            manualButton.style.display = 'block';
        }, 300);
    }

    // Show the warning message with blinking effect
    function showWarningMessage() {
        warningDisplay.style.animation = 'fadeIn 0.5s ease-out, blink 1s infinite';
        warningDisplay.style.display = 'block';

        // Play warning sound
        if (settings.enableSounds) {
            playSound(warningSound, '🔊 Warning: Countdown started');
        }
    }

    // Start the countdown
    function startCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        countdownTime = settings.countdownTime; // Reset to configured time
        canType = false;
        showWarningMessage();
        readyMessage.style.display = 'none';
        manualButton.style.display = 'none';

        countdownInterval = setInterval(() => {
            if (countdownTime > 0) {
                countdownTime--;
                updateDisplays();
            } else {
                endCountdown();
            }
        }, 1000);
    }

    // End countdown logic
    function endCountdown() {
        clearInterval(countdownInterval);
        countdownInterval = null;
        canType = true;
        updateDisplays();

        // Play completion sound
        if (settings.enableSounds) {
            playSound(completeSound, '🔊 Countdown complete!');
        }

        // Hide warning with animation
        warningDisplay.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
            warningDisplay.style.display = 'none';
            warningDisplay.style.animation = '';

            // Show ready message with animation
            readyMessage.style.display = 'block';
            readyMessage.style.animation = 'fadeIn 0.5s ease-out';

            // Auto-hide ready message after delay
            setTimeout(() => {
                readyMessage.style.animation = 'fadeOut 0.5s ease-out';
                setTimeout(() => {
                    readyMessage.style.display = 'none';
                    readyMessage.style.animation = '';
                }, 500);
            }, 3000);

            // Show manual button again
            manualButton.style.display = 'block';
            manualButton.style.animation = 'fadeIn 0.5s ease-out';
        }, 500);
    }

    // Handle manual button click
    function triggerCountdown() {
        if (canType) {
            manualButton.style.animation = 'buttonClickEffect 0.3s ease-out';
            setTimeout(() => {
                manualButton.style.animation = '';
            }, 300);

            typingCount++;
            countDisplay.style.animation = 'emojiBounce 0.5s ease-out';
            setTimeout(() => {
                countDisplay.style.animation = '';
            }, 500);

            updateDisplays();
            startCountdown();
        }
    }

    // Handle ArrowUp key press
    function handleKeyPress(e) {
        if (e.key === 'ArrowUp') {
            e.preventDefault(); // Prevent default arrow behavior
            triggerCountdown();
        }
    }

    // Initialize after DOM is fully loaded
    function initializeScript() {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            initializeElements();
        } else {
            window.addEventListener('DOMContentLoaded', initializeElements);
        }
    }

    // Initialize script on load
    initializeScript();

    // Reinitialize if SPA navigation occurs (for Discord which is a SPA)
    const originalPushState = history.pushState;
    history.pushState = function() {
        originalPushState.apply(this, arguments);
        setTimeout(initializeElements, 1000); // Delay to ensure DOM is updated
    };

    // Similarly for popstate events (back/forward navigation)
    window.addEventListener('popstate', function() {
        setTimeout(initializeElements, 1000);
    });
})();