document.addEventListener('DOMContentLoaded', function() {
    const emailForm = document.getElementById('emailForm');
    const recipientEmailInput = document.getElementById('recipientEmail');
    const sendButton = document.getElementById('sendButton');
    const buttonText = document.getElementById('buttonText');
    const buttonLoader = document.getElementById('buttonLoader');
    const successNotification = document.getElementById('successNotification');
    const errorNotification = document.getElementById('errorNotification');
    const errorMessage = document.getElementById('errorMessage');

    
    function hideNotifications() {
        successNotification.style.display = 'none';
        errorNotification.style.display = 'none';
    }

    
    function showSuccessNotification() {
        hideNotifications();
        successNotification.style.display = 'flex';
        
        
        setTimeout(() => {
            successNotification.style.display = 'none';
        }, 5000);
    }

    
    function showErrorNotification(message) {
        hideNotifications();
        errorMessage.textContent = message;
        errorNotification.style.display = 'flex';
        
        
        setTimeout(() => {
            errorNotification.style.display = 'none';
        }, 5000);
    }

    
    async function checkSmtpStatus() {
        try {
            const resp = await fetch('/api/status');
            const json = await resp.json();
            if (!json.smtpConfigured) {
                showErrorNotification('SMTP not configured on server. Please check backend .env');
                sendButton.disabled = true;
            } else {
                sendButton.disabled = false;
            }
        } catch (err) {
            console.error('Status check failed', err);
            showErrorNotification('Unable to check server SMTP status. Ensure server is running.');
            sendButton.disabled = true;
        }
    }

    checkSmtpStatus();

    
    emailForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const recipientEmail = recipientEmailInput.value.trim();
        
        
        if (!recipientEmail) {
            showErrorNotification('Please enter a recipient email address');
            return;
        }

        
        sendButton.disabled = true;
        buttonText.textContent = 'Sending...';
        buttonLoader.style.display = 'inline-block';
        hideNotifications();

        try {
            
            const response = await fetch('/api/send-email', {
                method: 'POST',
                function hideNotifications() {
                    successNotification.style.display = 'none';
                    errorNotification.style.display = 'none';
                }

                function showSuccessNotification() {
                    hideNotifications();
                    successNotification.style.display = 'flex';
                    setTimeout(() => {
                        successNotification.style.display = 'none';
                    }, 5000);
                }

                function showErrorNotification(message) {
                    hideNotifications();
                    errorMessage.textContent = message;
                    errorNotification.style.display = 'flex';
                    setTimeout(() => {
                        errorNotification.style.display = 'none';
                    }, 5000);
                }

    recipientEmailInput.addEventListener('input', function() {
        if (successNotification.style.display === 'flex' || errorNotification.style.display === 'flex') {
            hideNotifications();
        }
    });
});

