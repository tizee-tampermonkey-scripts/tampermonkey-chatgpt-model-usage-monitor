// ==UserScript==
// @name         ChatGPT Model Usage Monitor
// @namespace    https://github.com/tizee/tempermonkey-chatgpt-model-usage-monitor
// @downloadURL  https://raw.githubusercontent.com/tizee/tempermonkey-chatgpt-model-usage-monitor/main/monitor.js
// @updateURL    https://raw.githubusercontent.com/tizee/tempermonkey-chatgpt-model-usage-monitor/main/monitor.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chatgpt.com
// @author       tizee
// @version      1.2
// @description  Elegant usage monitor for ChatGPT models with daily quota tracking
// @match        https://chatgpt.com/
// @match        https://chatgpt.com/c/*
// @match        https://chatgpt.com/g/*/c/*
// @match        https://chatgpt.com/g/*/project?=*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

(function () {
    "use strict";

    // Constants and Configuration
    const COLORS = {
        primary: "#5E9EFF",
        background: "#1A1B1E",
        surface: "#2A2B2E",
        border: "#363636",
        text: "#E5E7EB",
        secondaryText: "#9CA3AF",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        disabled: "#4B5563",
        white: "oklch(.928 .006 264.531)",
        gray: "oklch(.92 .004 286.32)",
        yellow: "oklch(.905 .182 98.111)",
        green: "oklch(.845 .143 164.978)",
    };

    const STYLE = {
        borderRadius: "12px",
        boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)",
        spacing: {
            xs: "4px",
            sm: "8px",
            md: "16px",
            lg: "24px",
        },
        textSize: {
            xs: "0.75rem",
            sm: "0.875rem",
            md: "1rem",
        },
        lineHeight: {
            xs: "calc(1/.75)",
            sm: "calc(1.25/.875)",
            md: "1.5",
        },
    };

    // Helper Functions
    const getToday = () => new Date().toISOString().split("T")[0];

    // Default Configuration
    const defaultUsageData = {
        position: { x: null, y: null },
        lastReset: getToday(),
        models: {
            "o3-mini": {
                displayName: "o3-mini",
                count: 0,
                dailyLimit: 150,
                lastUpdate: "",
            },
            "o3-mini-high": {
                displayName: "o3-mini-high",
                count: 0,
                dailyLimit: 50,
                lastUpdate: "",
            },
        },
    };
    // Updated Styles
    GM_addStyle(`
  #chatUsageMonitor {
    position: fixed;
    bottom: ${STYLE.spacing.lg};
    right: ${STYLE.spacing.lg};
    width: 360px;
    max-height: 500px;
    overflow-y: scroll;
    background: ${COLORS.background};
    color: ${COLORS.text};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    border-radius: ${STYLE.borderRadius};
    box-shadow: ${STYLE.boxShadow};
    z-index: 9999;
    border: 1px solid ${COLORS.border};
    user-select: none;
  }

  #chatUsageMonitor header {
    padding: 0 ${STYLE.spacing.md};
    display: flex;
    border-radius: ${STYLE.borderRadius} ${STYLE.borderRadius} 0 0;
    background: ${COLORS.background};
    flex-direction: row;
    position: relative;
  }

  #chatUsageMonitor .drag-handle {
    width: 12px;
    height: 12px;
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 50%;
    background: ${COLORS.secondaryText};
    cursor: move;
    transition: background-color 0.2s ease;
  }

  #chatUsageMonitor .drag-handle:hover {
    background: ${COLORS.yellow};
  }

  #chatUsageMonitor header button {
    border: none;
    background: none;
    color: ${COLORS.secondaryText};
    cursor: pointer;
    font-weight: 500;
    transition: color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: ${STYLE.spacing.sm};
    padding-top:  ${STYLE.spacing.sm};
  }

  #chatUsageMonitor header button.active {
    color: ${COLORS.yellow};
  }

  #chatUsageMonitor .content {
    padding: ${STYLE.spacing.xs} ${STYLE.spacing.md};
    overflow-y: auto;
  }

   #chatUsageMonitor input {
    width: 80px;
    padding: ${STYLE.spacing.xs} ${STYLE.spacing.sm};
    margin: 0;
    border: none;
    border-radius: 0;
    background: transparent;
    color: ${COLORS.secondaryText};
    font-family: monospace;
    font-size: ${STYLE.textSize.xs};
    line-height: ${STYLE.lineHeight.xs};
    transition: color 0.2s ease;
  }

  #chatUsageMonitor input:focus {
    outline: none;
    color: ${COLORS.yellow};
    background: transparent;
  }

  #chatUsageMonitor input:hover {
    color: ${COLORS.yellow};
  }

  #chatUsageMonitor .progress-bar {
    height: 100%;
    transition: width 0.3s ease, background-color 0.3s ease;
    border-radius: 6px;
  }

  #chatUsageMonitor .btn {
    padding: ${STYLE.spacing.sm} ${STYLE.spacing.md};
    border: none;
    cursor: pointer;
    color: ${COLORS.white};
    font-weight: 500;
    font-size: ${STYLE.textSize.sm};
    transition: all 0.2s ease;
    text-decoration: underline;
  }

  #chatUsageMonitor .btn:hover {
    color: ${COLORS.yellow};
  }

  #chatUsageMonitor .delete-btn {
    padding: ${STYLE.spacing.xs} ${STYLE.spacing.sm};
    margin-left: ${STYLE.spacing.sm};
  }

  #chatUsageMonitor .delete-btn.btn:hover {
     color: ${COLORS.danger};
  }

  #chatUsageMonitor::-webkit-scrollbar {
    width: 8px;
  }

  #chatUsageMonitor::-webkit-scrollbar-track {
    background: ${COLORS.surface};
    border-radius: 4px;
  }

  #chatUsageMonitor::-webkit-scrollbar-thumb {
    background: ${COLORS.border};
    border-radius: 4px;
  }

  #chatUsageMonitor::-webkit-scrollbar-thumb:hover {
    background: ${COLORS.secondaryText};
  }

    #chatUsageMonitor .progress-container {
      width: 100%;
      background: ${COLORS.surface};
      margin-top: ${STYLE.spacing.xs};
      border-radius: 6px;
      overflow: hidden;
      height: 6px;
      margin-top: ${STYLE.spacing.xs};
    }

  #chatUsageMonitor .table-header {
    font-family: monospace;
    color: ${COLORS.white};
    font-size:  ${STYLE.textSize.xs};
    line-height: ${STYLE.lineHeight.xs};
    display : grid;
    align-items: center;
    grid-template-columns: 2fr 1.5fr 1.5fr 2fr;
  }
 #chatUsageMonitor .model-row {
    font-family: monospace;
    color: ${COLORS.secondaryText};
    transition: color 0.2s ease;
    font-size:  ${STYLE.textSize.xs};
    line-height: ${STYLE.lineHeight.xs};
    display : grid;
    grid-template-columns: 2fr 1.5fr 1.5fr 2fr;
    align-items: center;
  }
  #chatUsageMonitor .model-row:hover {
    color: ${COLORS.yellow};
    text-decoration-line: underline;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

`);

    // State Management
    let usageData = GM_getValue("usageData", defaultUsageData);
    if (!usageData.position) {
        usageData.position = { x: null, y: null };
        GM_setValue("usageData", usageData);
    }

    // Component Functions
    function createModelRow(model, modelKey, isSettings = false) {
        const row = document.createElement("div");
        row.className = "model-row";

        if (isSettings) {
            return createSettingsModelRow(model, modelKey, row);
        }
        return createUsageModelRow(model, modelKey, row);
    }

    function createSettingsModelRow(model, modelKey, row) {
        // Model ID cell
        const keyLabel = document.createElement("div");
        keyLabel.textContent = modelKey;
        row.appendChild(keyLabel);

        // Daily Limit cell
        const limitInput = document.createElement("input");
        limitInput.type = "number";
        limitInput.style.gridColumn = "span 2";
        limitInput.value = model.dailyLimit;
        limitInput.placeholder = "limit";
        limitInput.dataset.modelKey = modelKey;
        row.appendChild(limitInput);

        // Delete button cell
        const delBtn = document.createElement("button");
        delBtn.className = "btn delete-btn";
        delBtn.textContent = "Delete";
        delBtn.dataset.modelKey = modelKey;
        delBtn.addEventListener("click", () => handleDeleteModel(modelKey));
        row.appendChild(delBtn);

        return row;
    }

    function createUsageModelRow(model, modelKey) {
        const row = document.createElement("div");
        row.className = "model-row";

        // Model Name cell
        const modelName = document.createElement("div");
        modelName.textContent = model.displayName;
        row.appendChild(modelName);

        // Last Update cell
        const lastUpdateValue = document.createElement("div");
        lastUpdateValue.textContent = model.lastUpdate || "??";
        row.appendChild(lastUpdateValue);

        // Usage cell
        const usageValue = document.createElement("div");
        const dailyLimitDisplay = model.dailyLimit > 0 ? model.dailyLimit : "∞";
        usageValue.textContent = `${model.count} / ${dailyLimitDisplay}`;
        row.appendChild(usageValue);

        // Progress Bar cell (retain default font)
        const progressCell = document.createElement("div");
        progressCell.style.fontFamily = "inherit"; // do not force monospace here
        if (model.dailyLimit > 0) {
            const progressContainer = document.createElement("div");
            progressContainer.className = "progress-container";
            progressContainer.style.margin = "0";
            const progressBar = document.createElement("div");
            progressBar.className = "progress-bar";
            const usedPercent = Math.min((model.count / model.dailyLimit) * 100, 100);
            progressBar.style.width = `${usedPercent}%`;
            const remainingPercent =
                  (model.dailyLimit - model.count) / model.dailyLimit;
            progressBar.style.background = getStatusColor(
                remainingPercent,
                model.dailyLimit
            );
            progressContainer.appendChild(progressBar);
            progressCell.appendChild(progressContainer);
        }
        row.appendChild(progressCell);

        return row;
    }

    function getStatusColor(remainingPercent, hasLimit) {
        if (!hasLimit) return COLORS.success;
        if (remainingPercent <= 0) return COLORS.disabled;
        if (remainingPercent <= 0.2) return COLORS.danger;
        if (remainingPercent <= 0.5) return COLORS.warning;
        return COLORS.success;
    }

    // Event Handlers
    function handleDeleteModel(modelKey) {
        if (confirm(`Delete mapping for model "${modelKey}"?`)) {
            delete usageData.models[modelKey];
            GM_setValue("usageData", usageData);
            updateUI();
        }
    }

    // UI Updates
    function updateUI() {
        const usageContent = document.getElementById("usageContent");
        const settingsContent = document.getElementById("settingsContent");

        if (usageContent) updateUsageContent(usageContent);
        if (settingsContent) updateSettingsContent(settingsContent);
    }

    let sortDescending = true;

    function updateUsageContent(container) {
        container.innerHTML = "";

        // Title Section

        const subtitle = document.createElement("div");
        subtitle.textContent = `${getToday()}`;
        subtitle.style.fontSize = `${STYLE.textSize.xs}`;
        subtitle.style.lineHeight = `${STYLE.lineHeight.xs}`;
        subtitle.style.color = `${COLORS.secondaryText}`;
        container.appendChild(subtitle);

        // Table Header Row (logging window header)
        const tableHeader = document.createElement("div");
        tableHeader.className = "table-header";

        // Header cells:
        const modelNameHeader = document.createElement("div");
        modelNameHeader.textContent = "Model Name";
        tableHeader.appendChild(modelNameHeader);
        const lastUpdateHeader = document.createElement("div");
        lastUpdateHeader.textContent = "Update";
        tableHeader.appendChild(lastUpdateHeader);
        const usageHeader = document.createElement("div");
        usageHeader.textContent = sortDescending ? "Usage ↓" : "Usage ↑";
        usageHeader.style.cursor = "pointer";
        usageHeader.addEventListener("click", () => {
            sortDescending = !sortDescending;
            updateUsageContent(container);
        });
        tableHeader.appendChild(usageHeader);
        const progressHeader = document.createElement("div");
        progressHeader.textContent = "Progress";
        tableHeader.appendChild(progressHeader);
        container.appendChild(tableHeader);

        // Sort models by usage count (descending by default)
        const sortedModels = Object.entries(usageData.models).sort(
            ([, a], [, b]) => {
                return sortDescending ? b.count - a.count : a.count - b.count;
            }
        );

        // Create a row for each model
        sortedModels.forEach(([modelKey, model]) => {
            const row = createUsageModelRow(model, modelKey);
            container.appendChild(row);
        });

        if (sortedModels.length === 0) {
            const emptyState = document.createElement("div");
            emptyState.style.textAlign = "center";
            emptyState.style.color = COLORS.secondaryText;
            emptyState.style.padding = STYLE.spacing.lg;
            emptyState.textContent = "No models configured. Add some in Settings.";
            container.appendChild(emptyState);
        }
    }

    function updateSettingsContent(container) {
        container.innerHTML = "";

        const info = document.createElement("p");
        info.textContent = "Configure model mappings and daily limits:";
        info.style.fontSize = STYLE.textSize.md;
        info.style.fontSize = STYLE.lineHeight.md;
        info.style.color = COLORS.secondaryText;
        container.appendChild(info);

        Object.entries(usageData.models).forEach(([modelKey, model]) => {
            const row = createModelRow(model, modelKey, true);
            container.appendChild(row);
        });

        const addBtn = document.createElement("button");
        addBtn.className = "btn";
        addBtn.textContent = "Add Model Mapping";
        addBtn.addEventListener("click", () => {
            const newModelID = prompt(
                'Enter new model internal ID (e.g., "o3-mini")'
            );
            if (!newModelID) return;

            if (usageData.models[newModelID]) {
                alert("Model mapping already exists.");
                return;
            }

            usageData.models[newModelID] = {
                displayName: newModelID,
                count: 0,
                dailyLimit: undefined,
                lastUpdate: "",
            };

            GM_setValue("usageData", usageData);
            updateUI();
        });
        container.appendChild(addBtn);

        const saveBtn = document.createElement("button");
        saveBtn.className = "btn";
        saveBtn.textContent = "Save Settings";
        saveBtn.style.marginLeft = STYLE.spacing.sm;
        saveBtn.addEventListener("click", () => {
            const inputs = container.querySelectorAll("input");
            let hasChanges = false;

            inputs.forEach((input) => {
                const modelKey = input.dataset.modelKey;
                if (!modelKey || !usageData.models[modelKey]) return;

                if (input.type === "text") {
                    const newDisplayName = input.value.trim();
                    if (
                        newDisplayName &&
                        newDisplayName !== usageData.models[modelKey].displayName
                    ) {
                        usageData.models[modelKey].displayName = newDisplayName;
                        hasChanges = true;
                    }
                } else if (input.type === "number") {
                    const newLimit = parseInt(input.value, 10);
                    if (
                        !isNaN(newLimit) &&
                        newLimit !== usageData.models[modelKey].dailyLimit
                    ) {
                        usageData.models[modelKey].dailyLimit = newLimit;
                        hasChanges = true;
                    }
                }
            });

            if (hasChanges) {
                GM_setValue("usageData", usageData);
                updateUI();
                alert("Settings saved successfully.");
            } else {
                alert("No changes detected.");
            }
        });
        container.appendChild(saveBtn);
    }

    // Model Usage Tracking
    function incrementUsageForModel(modelId) {
        // Ensure daily counts are reset if a new day has started.
        checkAndResetDaily();

        if (!usageData.models[modelId]) {
            console.debug(
                `[monitor] No mapping found for model "${modelId}". Creating new entry.`
      );
        usageData.models[modelId] = {
            displayName: modelId,
            count: 0,
            dailyLimit: 0,
            lastUpdate: "",
        };
    }

      const model = usageData.models[modelId];
      model.count += 1;
      model.lastUpdate = new Date().toLocaleTimeString();

      if (model.dailyLimit > 0 && model.count > model.dailyLimit) {
          console.debug(`[monitor] Daily limit exceeded for model ${model.displayName}`);
      }

      GM_setValue("usageData", usageData);
      updateUI();
  }

    // Daily Reset Check
    function checkAndResetDaily() {
        if (usageData.lastReset !== getToday()) {
            Object.values(usageData.models).forEach((model) => {
                model.count = 0;
                model.lastUpdate = "";
            });
            usageData.lastReset = getToday();
            GM_setValue("usageData", usageData);
        }
    }

    // UI Creation
    function createMonitorUI() {
        if (document.getElementById("chatUsageMonitor")) return;

        const container = document.createElement("div");
        container.id = "chatUsageMonitor";

        // Make container draggable
        container.style.cursor = "move";
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        // Set initial position
        if (usageData.position.x !== null && usageData.position.y !== null) {
            // Ensure position is within viewport
            const maxX = window.innerWidth - 360; // container width
            const maxY = window.innerHeight - 500; // container max-height
            container.style.right = "auto";
            container.style.bottom = "auto";
            container.style.left = `${Math.min(
                Math.max(0, usageData.position.x),
                maxX
            )}px`;
            container.style.top = `${Math.min(
                Math.max(0, usageData.position.y),
                maxY
            )}px`;
        } else {
            // bottom-right by default
            container.style.right = STYLE.spacing.lg;
            container.style.bottom = STYLE.spacing.lg;
            container.style.left = "auto";
            container.style.top = "auto";
        }

        function handleDragStart(e) {
            if (!e.target.classList.contains("drag-handle")) return;

            isDragging = true;

            if (container.style.right !== "auto") {
                const rect = container.getBoundingClientRect();
                container.style.right = "auto";
                container.style.bottom = "auto";
                container.style.left = `${rect.left}px`;
                container.style.top = `${rect.top}px`;
            }

            initialX = e.clientX - container.offsetLeft;
            initialY = e.clientY - container.offsetTop;
        }


        function handleDrag(e) {
            if (!isDragging) return;

            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            // Ensure the container stays within viewport
            const maxX = window.innerWidth - container.offsetWidth;
            const maxY = window.innerHeight - container.offsetHeight;

            currentX = Math.min(Math.max(0, currentX), maxX);
            currentY = Math.min(Math.max(0, currentY), maxY);

            container.style.left = `${currentX}px`;
            container.style.top = `${currentY}px`;
        }

        function handleDragEnd() {
            if (!isDragging) return;

            isDragging = false;
            // Save the final position
            usageData.position = {
                x: currentX,
                y: currentY,
            };
            GM_setValue("usageData", usageData);
        }

        // Create header with icon tabs
        const header = document.createElement("header");

        const dragHandle = document.createElement("div");
        dragHandle.className = "drag-handle";
        header.appendChild(dragHandle);

        // Add drag event listeners
        dragHandle.addEventListener("mousedown", handleDragStart);
        document.addEventListener("mousemove", handleDrag);
        document.addEventListener("mouseup", handleDragEnd);

        const usageTabBtn = document.createElement("button");
        usageTabBtn.innerHTML = `<span>Usage</span>`;
        usageTabBtn.classList.add("active");

        const settingsTabBtn = document.createElement("button");
        settingsTabBtn.innerHTML = `<span>Settings</span>`;

        header.appendChild(usageTabBtn);
        header.appendChild(settingsTabBtn);
        container.appendChild(header);

        container.style.cursor = "default";


        // Create content panels
        const usageContent = document.createElement("div");
        usageContent.className = "content";
        usageContent.id = "usageContent";
        container.appendChild(usageContent);

        const settingsContent = document.createElement("div");
        settingsContent.className = "content";
        settingsContent.id = "settingsContent";
        settingsContent.style.display = "none";
        container.appendChild(settingsContent);

        // Add tab switching logic
        usageTabBtn.addEventListener("click", () => {
            usageTabBtn.classList.add("active");
            settingsTabBtn.classList.remove("active");
            usageContent.style.display = "";
            settingsContent.style.display = "none";
        });

        settingsTabBtn.addEventListener("click", () => {
            settingsTabBtn.classList.add("active");
            usageTabBtn.classList.remove("active");
            settingsContent.style.display = "";
            usageContent.style.display = "none";
        });

        document.body.appendChild(container);
        updateUI();
    }

    // Fetch Interception
    const target_window =
          typeof unsafeWindow === "undefined" ? window : unsafeWindow;
    const originalFetch = target_window.fetch;

    target_window.fetch = new Proxy(originalFetch, {
        apply: async function (target, thisArg, args) {
            const response = await target.apply(thisArg, args);

            try {
                const [requestInfo, requestInit] = args;
                const fetchUrl =
                      typeof requestInfo === "string" ? requestInfo : requestInfo?.href;

                if (
                    requestInit?.method === "POST" &&
                    fetchUrl?.endsWith("/conversation")
                ) {
                    const bodyText = requestInit.body;
                    const bodyObj = JSON.parse(bodyText);

                    if (bodyObj?.model) {
                        console.debug("Detected model usage:", bodyObj.model);
                        incrementUsageForModel(bodyObj.model);
                    }
                }
            } catch (error) {
                console.warn("Failed to process request:", error);
            }

            return response;
        },
    });

    // Initialization
    function initialize() {
        checkAndResetDaily();
        createMonitorUI();
    }

    // Setup Observers and Event Listeners
    if (document.readyState === "loading") {
        target_window.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }

    // Observer for dynamic content changes
    const observer = new MutationObserver(() => {
        if (!document.getElementById("chatUsageMonitor")) {
            initialize();
        }
    });

    observer.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true,
    });

    // Handle navigation events
    window.addEventListener("popstate", initialize);
})();
