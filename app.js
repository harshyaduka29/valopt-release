// DISPOSABLE / TEMPORARY EMAIL BLACKLIST
const DISPOSABLE_DOMAINS = [
    'tempmail.com', 'yopmail.com', 'mailinator.com', 'guerrillamail.com', 
    '10minutemail.com', 'trashmail.com', 'getnada.com', 'dispostable.com', 
    'throwawaymail.com', 'temp-mail.org', 'fakeinbox.com', 'sharklasers.com'
];

// Obfuscated Base64 Download Token to hide plain-text URL in Page Source / F12 DOM
const ENCRYPTED_DL_TOKEN = "aHR0cHM6Ly9naXRodWIuY29tL2hhcnNoeWFkdWthMjkvdmFsb3B0L3JlbGVhc2VzL2Rvd25sb2FkL3YxLjAuMC9WYWxvcmFudE9wdGltaXplclNldHVwLmV4ZQ==";

document.addEventListener('DOMContentLoaded', () => {
    const dlModal = document.getElementById('lead-modal');
    const scrollDlBtns = document.querySelectorAll('.scroll-to-dl');
    const triggerFormBtns = document.querySelectorAll('.trigger-form-modal');
    const closeDlBtn = document.getElementById('modal-close');
    const leadForm = document.getElementById('lead-form');
    const emailInput = document.getElementById('lead-email');
    const emailError = document.getElementById('email-error');
    const successMsg = document.getElementById('download-success-msg');
    const submitBtn = document.getElementById('submit-download-btn');

    // POLICY MODAL ELEMENTS
    const policyModal = document.getElementById('policy-modal');
    const openPrivacyBtn = document.getElementById('open-privacy-btn');
    const openTermsBtn = document.getElementById('open-terms-btn');
    const policyCloseBtn = document.getElementById('policy-close');

    // 1. TOP & HERO BUTTONS: SMOOTH SCROLL TO #DOWNLOAD SECTION
    scrollDlBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const dlSection = document.getElementById('download');
            if (dlSection) {
                dlSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 2. DOWNLOAD SECTION BUTTON: OPEN LEAD REGISTRATION MODAL
    triggerFormBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            dlModal.classList.remove('hidden');
        });
    });

    // CLOSE DOWNLOAD MODAL
    closeDlBtn.addEventListener('click', () => {
        dlModal.classList.add('hidden');
    });

    // OPEN PRIVACY MODAL
    if (openPrivacyBtn) {
        openPrivacyBtn.addEventListener('click', () => {
            policyModal.classList.remove('hidden');
        });
    }

    // OPEN TERMS MODAL
    if (openTermsBtn) {
        openTermsBtn.addEventListener('click', () => {
            policyModal.classList.remove('hidden');
        });
    }

    // CLOSE POLICY MODAL
    if (policyCloseBtn) {
        policyCloseBtn.addEventListener('click', () => {
            policyModal.classList.add('hidden');
        });
    }

    // CLOSE ON OVERLAY CLICK
    window.addEventListener('click', (e) => {
        if (e.target === dlModal) {
            dlModal.classList.add('hidden');
        }
        if (e.target === policyModal) {
            policyModal.classList.add('hidden');
        }
    });

    // DISPOSABLE EMAIL VALIDATOR
    function isDisposableEmail(email) {
        const domain = email.split('@')[1]?.toLowerCase();
        if (!domain) return false;
        return DISPOSABLE_DOMAINS.some(d => domain === d || domain.endsWith('.' + d));
    }

    function triggerObfuscatedDownload() {
        const targetUrl = atob(ENCRYPTED_DL_TOKEN);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = targetUrl;
        downloadAnchor.download = 'ValorantOptimizerSetup.exe';
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
    }

    // FORM SUBMISSION & FIREBASE LEAD REGISTRATION
    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        emailError.style.display = 'none';
        
        const name = document.getElementById('lead-name').value.trim();
        const role = document.getElementById('lead-role').value;
        const city = document.getElementById('lead-city').value.trim();
        const email = emailInput.value.trim();

        // Check disposable email
        if (isDisposableEmail(email)) {
            emailError.textContent = '❌ Temporary/disposable email domains are not allowed. Please use a valid email.';
            emailError.style.display = 'block';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Registering Lead...';

        const leadData = {
            name: name,
            role: role,
            city: city,
            email: email,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        try {
            // POST to Firebase Realtime Database
            await fetch('https://valoopt-622d8-default-rtdb.firebaseio.com/leads.json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            });

            successMsg.style.display = 'block';
            submitBtn.textContent = '✅ Download Started!';

            // TRIGGER OBFUSCATED DOWNLOAD
            setTimeout(() => {
                triggerObfuscatedDownload();

                setTimeout(() => {
                    dlModal.classList.add('hidden');
                    submitBtn.disabled = false;
                    submitBtn.textContent = '🚀 Register & Start Free Download (.exe)';
                    successMsg.style.display = 'none';
                    leadForm.reset();
                }, 2000);
            }, 800);

        } catch (err) {
            console.error('Lead registration failed:', err);
            // Fallback obfuscated download
            triggerObfuscatedDownload();
            dlModal.classList.add('hidden');
        }
    });
});
