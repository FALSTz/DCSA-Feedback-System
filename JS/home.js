document.addEventListener('DOMContentLoaded', function() {
    // Tsek kung naka-log in ang user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        // I-redirect sa login page kung hindi naka-log in
        window.location.href = 'login.html';
        return;
    }
    
    // I-update ang pangalan ng user sa header
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = `Hello, ${currentUser.username}`;
    }
    
    // Kunin ang mga card elements
    const newFeedbackCard = document.getElementById('newFeedback');
    const viewFeedbackCard = document.getElementById('viewFeedback');
    
    // Magdagdag ng click event listener sa mga card
    newFeedbackCard.addEventListener('click', function() {
        // Pumunta sa page ng feedback submission
        window.location.href = 'submit-feedback.html';
    });

    viewFeedbackCard.addEventListener('click', function() {
        // Pumunta sa page ng feedback history
        window.location.href = 'view-feedback.html';
    });

    // Kunin ang lahat ng nav links
    const navLinks = document.querySelectorAll('.nav-links li');
    
    // Magdagdag ng click event listener sa mga nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Kunin ang text content ng na-click na link
            const linkText = this.querySelector('span').textContent;
            
            // Ayusin ang navigation batay sa na-click na link
            switch(linkText) {
                case 'Home':
                    window.location.href = 'home.html';
                    break;
                case 'Logout':
                    // I-clear ang session storage
                    sessionStorage.removeItem('currentUser');
                    window.location.href = 'login.html';
                    break;
            }
        });
    });
    
    // Tsek kung may undo notification
    const undoData = JSON.parse(sessionStorage.getItem('undoFeedback'));
    if (undoData) {
        showUndoNotification(undoData);
    }
});

// Function para magpakita ng undo notification
function showUndoNotification(feedbackData) {
    // Gumawa ng notification element
    const notification = document.createElement('div');
    notification.className = 'undo-notification';
    
    // Gumawa ng countdown element
    const countdown = document.createElement('div');
    countdown.className = 'countdown';
    
    // Gumawa ng message
    const message = document.createElement('span');
    message.textContent = 'Feedback submitted. ';
    
    // Gumawa ng undo button
    const undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';
    undoButton.className = 'undo-button';
    
    // Gumawa ng countdown text
    const countdownText = document.createElement('span');
    countdownText.className = 'countdown-text';
    
    // Idagdag ang mga elements sa notification
    countdown.appendChild(countdownText);
    notification.appendChild(message);
    notification.appendChild(undoButton);
    notification.appendChild(countdown);
    
    // Idagdag ang notification sa body
    document.body.appendChild(notification);
    
    // Itakda ang countdown duration (5 segundo)
    let timeLeft = 5;
    countdownText.textContent = `(${timeLeft}s)`;
    
    // Simulan ang countdown
    const countdownInterval = setInterval(() => {
        timeLeft--;
        countdownText.textContent = `(${timeLeft}s)`;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            notification.remove();
            
            // I-submit ang feedback sa admin
            submitFeedbackToAdmin(feedbackData);
            
            // I-clear ang undo data
            sessionStorage.removeItem('undoFeedback');
        }
    }, 1000);
    
    // Magdagdag ng handler para sa click ng undo button
    undoButton.addEventListener('click', () => {
        clearInterval(countdownInterval);
        notification.remove();
        
        // I-clear ang undo data
        sessionStorage.removeItem('undoFeedback');
        
        // I-redirect sa submit feedback page gamit ang data
        sessionStorage.setItem('editFeedback', JSON.stringify(feedbackData));
        window.location.href = 'submit-feedback.html';
    });
    
    // Ipakita ang notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
}

// Function para magsubmit ng feedback sa admin
function submitFeedbackToAdmin(feedbackData) {
    // Kunin ang mga existing na feedback
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    
    // Idagdag ang feedback sa array
    feedbacks.push(feedbackData);
    
    // I-save sa local storage
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    
    // I-update ang storage usage
    updateStorageUsage();
}

// Update ang impormasyon ng storage usage
function updateStorageUsage() {
    // Kalkulahin ang kabuuang storage na nagamit
    let totalSize = 0;
    
    // Kalkulahin ang size ng bawat storage item
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += (key.length + value.length) * 2; // Tinatayang size sa bytes (UTF-16 encoding)
    }
    
    // I-convert sa KB
    const sizeInKB = (totalSize / 1024).toFixed(2);
    
    // Kalkulahin ang porsyento ng 5MB (karaniwang limit ng local storage)
    const percentUsed = ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2);
    
    // I-save ang usage information
    localStorage.setItem('storageUsage', JSON.stringify({
        bytes: totalSize,
        kilobytes: sizeInKB,
        percent: percentUsed,
        timestamp: new Date().getTime()
    }));
}
