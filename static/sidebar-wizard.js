// Sidebar Filter Wizard JavaScript - Refactored for Multi-Window Support

// Access wizard state from the DOM element
function getWizardState(windowId) {
    const win = document.getElementById(windowId);
    if (!win) return null;
    if (!win.wizardState) {
        win.wizardState = {
            step: 1,
            filters: {
                step1: null,
                step2: null,
                step3: null
            }
        };
    }
    return win.wizardState;
}

// Select filter option
window.selectFilterOption = function (windowId, step, value, element) {
    console.log('🟢 selectFilterOption called:', { windowId, step, value });
    const win = document.getElementById(windowId);
    if (!win) return;

    const state = getWizardState(windowId);

    // Remove selection from siblings in this specific container
    const parent = element.parentElement;
    parent.querySelectorAll('.filter-option-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Add selection to clicked element
    element.classList.add('selected');

    // Store selection
    state.filters[`step${step}`] = value;
    console.log('🟢 Updated selectedFilters:', JSON.stringify(state.filters));

    // Enable next button
    const nextBtn = win.querySelector('.wizard-btn-next');
    if (nextBtn) nextBtn.disabled = false;

    console.log('🟢 Next button enabled');
}

// Prepare next step options based on previous selection
async function prepareNextStepOptions(windowId, currentStep, selectedValue) {
    console.log('prepareNextStepOptions called:', { windowId, currentStep, selectedValue });
    const win = document.getElementById(windowId);
    if (!win) return;

    const state = getWizardState(windowId);
    const nextStep = currentStep + 1;
    const optionsContainer = win.querySelector(`.step${nextStep}-options`);

    // If moving to Step 2, load strategies from API
    if (currentStep === 1 && nextStep === 2) {
        console.log('Loading strategies from API for domain:', selectedValue);

        optionsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.6);">
                <div style="margin-bottom: 10px;">Loading strategies...</div>
            </div>
        `;

        try {
            const url = `/api/filter/strategies?domain_id=${selectedValue}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.success && data.strategies && data.strategies.length > 0) {
                optionsContainer.innerHTML = '';
                data.strategies.forEach(strategy => {
                    const card = document.createElement('div');
                    card.className = 'filter-option-card';
                    card.setAttribute('data-value', strategy.value);
                    card.onclick = function () {
                        selectFilterOption(windowId, 2, strategy.value, this);
                    };

                    card.innerHTML = `
                        <div class="option-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                        </div>
                        <div class="option-content">
                            <div class="option-title">${strategy.title}</div>
                            <div class="option-desc">${strategy.description}</div>
                        </div>
                        <div class="option-check">✓</div>
                    `;
                    optionsContainer.appendChild(card);
                });
            } else {
                optionsContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.6);">
                        <div>No strategies found for this domain</div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Error loading strategies:', error);
            optionsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: rgba(255, 100, 100, 0.8);">
                    <div>Error loading strategies</div>
                    <div style="font-size: 12px; margin-top: 10px;">${error.message}</div>
                </div>
            `;
        }
        return;
    }

    // If moving to Step 3, load alerts from API
    if (currentStep === 2 && nextStep === 3) {
        console.log('Loading alerts from API');
        optionsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.6);">
                <div style="margin-bottom: 10px;">Loading alerts...</div>
            </div>
        `;

        try {
            const url = `/api/filter/alerts?domain_id=${state.filters.step1}&strategy_id=${selectedValue}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.success && data.alerts && data.alerts.length > 0) {
                optionsContainer.innerHTML = '';
                data.alerts.forEach(alert => {
                    const card = document.createElement('div');
                    card.className = 'filter-option-card';
                    card.setAttribute('data-value', alert.value);
                    card.onclick = function () {
                        selectFilterOption(windowId, 3, alert.value, this);
                    };
                    card.innerHTML = `
                        <div class="option-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                        </div>
                        <div class="option-content">
                            <div class="option-title">${alert.title}</div>
                            <div class="option-desc">${alert.description}</div>
                        </div>
                        <div class="option-check">✓</div>
                    `;
                    optionsContainer.appendChild(card);
                });
            } else {
                optionsContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.6);">
                        <div>No alerts found</div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Error loading alerts:', error);
            optionsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: rgba(255, 100, 100, 0.8);">
                    <div>Error loading alerts</div>
                </div>
            `;
        }
        return;
    }
}

// Next wizard step
window.nextWizardStep = function (windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;

    // Prevent double-clicks
    const nextBtn = win.querySelector('.wizard-btn-next');
    if (nextBtn && nextBtn.disabled) {
        console.warn('Next button is disabled, ignoring click');
        return;
    }

    const state = getWizardState(windowId);
    const totalWizardSteps = 3;

    console.log('🔵 nextWizardStep called. Current Step:', state.step, 'ID:', windowId);
    console.log('🔵 Current Filters:', JSON.stringify(state.filters));

    // Validate current step before moving
    if (state.step === 1 && !state.filters.step1) {
        console.error('❌ Step 1 incompelete');
        return;
    }
    if (state.step === 2 && !state.filters.step2) {
        console.error('❌ Step 2 incompelete');
        return;
    }

    if (state.step < totalWizardSteps) {
        const previousStep = state.step;
        state.step++;
        console.log('🟢 Advancing to Step', state.step);

        updateWizardUI(windowId);

        if (state.step === 2 && state.filters.step1) {
            prepareNextStepOptions(windowId, previousStep, state.filters.step1);
        } else if (state.step === 3 && state.filters.step2) {
            prepareNextStepOptions(windowId, previousStep, state.filters.step2);
        }
    } else {
        console.log('🏁 Finished steps, applying filters');
        applyWizardFilters(windowId);
    }
}

// Previous wizard step
window.previousWizardStep = function (windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;

    const state = getWizardState(windowId);
    if (state.step > 1) {
        state.step--;
        updateWizardUI(windowId);
    }
}

// Update wizard UI
function updateWizardUI(windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;

    const state = getWizardState(windowId);
    const totalWizardSteps = 3;

    // Update steps visibility
    win.querySelectorAll('.wizard-step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active');
        if (stepNum === state.step) {
            step.classList.add('active');
            step.style.display = 'block';
        } else {
            step.style.display = 'none';
        }
    });

    // Update progress
    win.querySelectorAll('.progress-step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        if (stepNum < state.step) {
            step.classList.add('completed');
        } else if (stepNum === state.step) {
            step.classList.add('active');
        }
    });

    // Update buttons
    const backBtn = win.querySelector('.wizard-btn-back');
    const nextBtn = win.querySelector('.wizard-btn-next');

    backBtn.style.display = state.step > 1 ? 'flex' : 'none';

    if (state.step === totalWizardSteps) {
        nextBtn.innerHTML = `
            Apply Filter
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        `;
    } else {
        nextBtn.innerHTML = `
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
        `;
    }

    // Disable next button if no selection made for current step
    nextBtn.disabled = !state.filters[`step${state.step}`];
}

// Apply wizard filters
function applyWizardFilters(windowId) {
    const state = getWizardState(windowId);

    if (!state.filters.step1 || !state.filters.step2 || !state.filters.step3) {
        alert('Please complete all steps before applying filters');
        return;
    }

    const finalQuery = `SELECT *
FROM svi_alerts.tdc_alert ta
JOIN fdhdata.tm_cases tc 
    ON ta.alert_id = tc.alert_id
WHERE ta.domain_id = '${state.filters.step1}'
  AND alert_status_id = 'ACTIVE'
  AND ta.alert_id = '${state.filters.step3}'
  AND ta.queue_id IN (
      SELECT queue_id
      FROM svi_alerts.tdc_queue
      WHERE domain_id = '${state.filters.step1}'
        AND strategy_id = '${state.filters.step2}'
  );`;

    console.log('📊 Final Query:', finalQuery);
    showAnalysisConfirmation(finalQuery, windowId);
}

// Show analysis confirmation popup
function showAnalysisConfirmation(query, windowId) {
    // ... existing popup logic but maybe scoped? 
    // Ideally popups should be global or appended to body. Keeping global for now.

    const overlay = document.createElement('div');
    overlay.id = 'analysisConfirmationOverlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex; align-items: center; justify-content: center;
        z-index: 10000; backdrop-filter: blur(5px);
    `;

    overlay.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 40px; max-width: 600px; width: 90%; color: white; text-align: center;">
            <h2 style="margin: 0 0 15px 0;">Start AI Analysis?</h2>
            <p style="margin: 0 0 30px 0;">The AI will analyze the selected alert data.</p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="confirmAnalysisBtn" style="background: white; color: #667eea; border: none; padding: 15px 40px; border-radius: 10px; font-weight: 600; cursor: pointer;">Yes, Start Analysis</button>
                <button id="cancelAnalysisBtn" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 15px 40px; border-radius: 10px; font-weight: 600; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#confirmAnalysisBtn').onclick = () => {
        document.body.removeChild(overlay);
        sendQueryToAI(query, windowId);
    };
    overlay.querySelector('#cancelAnalysisBtn').onclick = () => document.body.removeChild(overlay);
}

async function sendQueryToAI(query, windowId) {
    const state = getWizardState(windowId);

    try {
        const response = await fetch('/api/filter/execute-final-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                domain_id: state.filters.step1,
                strategy_id: state.filters.step2,
                alert_id: state.filters.step3
            })
        });

        const data = await response.json();

        if (data.success && data.prompt) {
            const win = document.getElementById(windowId);
            const chatInput = win.querySelector('.message-input');
            if (chatInput) {
                chatInput.value = data.prompt;
                // Trigger send via Enter key
                const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true });
                chatInput.dispatchEvent(enterEvent);

                // Also try clicking the send button as a robust fallback
                // Try specific button in this window first
                const sendBtn = win.querySelector('.send-btn') || win.querySelector('[data-action="send-message"]');
                if (sendBtn) {
                    console.log('🔘 Clicking send button programmatically');
                    sendBtn.click();
                } else {
                    console.warn('⚠️ Send button not found');
                }

                // Return to chat
                toggleSidebarView(windowId, 'history');
                resetWizard(windowId);
            }
        }
    } catch (error) {
        console.error('Error sending query:', error);
        alert('Error executing query');
    }
}

window.resetWizard = function (windowId) {
    const win = document.getElementById(windowId);
    if (!win) return;

    win.wizardState = {
        step: 1,
        filters: { step1: null, step2: null, step3: null }
    };

    win.querySelectorAll('.filter-option-card').forEach(card => card.classList.remove('selected'));
    updateWizardUI(windowId);
}

// Global Init Function
window.initSidebarWizard = async function (windowId) {
    console.log('initializing wizard for window:', windowId);
    const win = document.getElementById(windowId);
    if (!win) return;

    // Load Domains for Step 1
    const container = win.querySelector('.step1-options');
    if (!container) return;

    container.innerHTML = '<div style="text-align: center;">Loading domains...</div>';

    try {
        const response = await fetch('/api/filter/domains');
        const data = await response.json();

        if (data.success && data.domains) {
            container.innerHTML = '';
            data.domains.forEach(domain => {
                const card = document.createElement('div');
                card.className = 'filter-option-card';
                card.onclick = function () { selectFilterOption(windowId, 1, domain.value, this); };
                card.innerHTML = `
                    <div class="option-content">
                        <div class="option-title">${domain.title}</div>
                        <div class="option-desc">${domain.description}</div>
                    </div>
                    <div class="option-check">✓</div>
                `;
                container.appendChild(card);
            });
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = 'Error loading domains';
    }

    // Bind Buttons
    const next = win.querySelector('.wizard-btn-next');
    if (next) next.onclick = () => nextWizardStep(windowId);

    const back = win.querySelector('.wizard-btn-back');
    if (back) back.onclick = () => previousWizardStep(windowId);
}



