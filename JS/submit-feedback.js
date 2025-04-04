document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Handle file input
    const fileInput = document.getElementById('attachment');
    const fileInputButton = document.querySelector('.file-input-button');
    const fileName = document.querySelector('.file-name');
    
    fileInputButton.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            fileName.textContent = fileInput.files[0].name;
        } else {
            fileName.textContent = 'No file chosen';
        }
    });
    
    // Check if editing feedback
    const editFeedback = JSON.parse(sessionStorage.getItem('editFeedback'));
    if (editFeedback) {
        // Fill form with current data
        document.getElementById('feedbackType').value = editFeedback.type;
        document.getElementById('subject').value = editFeedback.subject;
        document.getElementById('message').value = editFeedback.message;
        
        if (editFeedback.attachment) {
            fileName.textContent = editFeedback.attachment;
        }
        
        // Remove edit data
        sessionStorage.removeItem('editFeedback');
    }
    
    // Form submission
    const feedbackForm = document.getElementById('feedbackForm');
    const successMessage = document.getElementById('successMessage');
    
    feedbackForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get values from form
        const feedbackType = document.getElementById('feedbackType').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        const attachment = fileName.textContent !== 'No file chosen' ? fileName.textContent : null;
        
        // Validate form
        if (!feedbackType || !subject || !message) {
            // Show error for empty fields
            return;
        }
        
        // Create feedback object
        const feedback = {
            id: generateUniqueId(),
            username: currentUser.username,
            type: feedbackType,
            subject: subject,
            message: message,
            attachment: attachment,
            date: new Date().toISOString(),
            status: 'pending',
            response: null,
            sentToAdmin: false
        };
        
        // Save to user's feedbacks
        saveUserFeedback(feedback);
        
        // Store in session storage for undo functionality
        sessionStorage.setItem('undoFeedback', JSON.stringify(feedback));
        
        // Show success message
        successMessage.classList.add('show');
        
        // Hide success message after 2 seconds and redirect
        setTimeout(function() {
            successMessage.classList.remove('show');
            
            // Redirect to home page
            window.location.href = 'home.html';
        }, 2000);
    });
    
    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    
    cancelBtn.addEventListener('click', function() {
        // Redirect back to home page
        window.location.href = 'home.html';
    });
    
    // Navigation
    const navLinks = document.querySelectorAll('.nav-links li');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const linkText = this.querySelector('span').textContent;
            
            // Handle navigation
            switch(linkText) {
                case 'Home':
                    window.location.href = 'home.html';
                    break;
                case 'Submit Feedback':
                    // Already on this page, do nothing
                    break;
                case 'View Feedback':
                    window.location.href = 'view-feedback.html';
                    break;
                case 'Logout':
                    // Remove current user from session storage
                    sessionStorage.removeItem('currentUser');
                    window.location.href = 'login.html';
                    break;
            }
        });
    });
});

// Generate unique ID for feedback
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Save user feedback to local storage
function saveUserFeedback(feedback) {
    // Get current user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Get user's feedbacks
    const userFeedbackKey = `userFeedbacks_${currentUser.username}`;
    const userFeedbacks = JSON.parse(localStorage.getItem(userFeedbackKey)) || [];
    
    // Add new feedback
    userFeedbacks.push(feedback);
    
    // Save to local storage
    localStorage.setItem(userFeedbackKey, JSON.stringify(userFeedbacks));
    
    // Update storage usage
    updateStorageUsage();
}

// Update storage usage information
function updateStorageUsage() {
    // Calculate total storage used
    let totalSize = 0;
    
    // Calculate size of each storage item
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += (key.length + value.length) * 2; // Approximate size in bytes (UTF-16 encoding)
    }
    
    // Convert to KB
    const sizeInKB = (totalSize / 1024).toFixed(2);
    
    // Calculate percentage of 5MB (typical local storage limit)
    const percentUsed = ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2);
    
    // Store usage information
    localStorage.setItem('storageUsage', JSON.stringify({
        bytes: totalSize,
        kilobytes: sizeInKB,
        percent: percentUsed,
        timestamp: new Date().getTime()
    }));
}
