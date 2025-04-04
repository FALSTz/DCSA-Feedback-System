document.addEventListener('DOMContentLoaded', function() {
    // Suriin kung nakalogin ang user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        // I-redirect sa login page kung hindi nakalogin
        window.location.href = 'login.html';
        return;
    }
    
    // I-load ang mga feedback ng user
    loadUserFeedbacks();
    
    // Pag-andar para sa paghahanap
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    
    function filterFeedback() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedType = filterType.value;
        
        const feedbackItems = document.querySelectorAll('.feedback-item');
        const noResults = document.querySelector('.no-results');
        
        let hasResults = false;
        
        feedbackItems.forEach(item => {
            const subject = item.querySelector('.feedback-subject').textContent.toLowerCase();
            const preview = item.querySelector('.feedback-preview').textContent.toLowerCase();
            const type = item.getAttribute('data-type');
            
            const matchesSearch = subject.includes(searchTerm) || preview.includes(searchTerm);
            const matchesType = selectedType === 'all' || type === selectedType;
            
            if (matchesSearch && matchesType) {
                item.style.display = 'block';
                hasResults = true;
            } else {
                item.style.display = 'none';
            }
        });
        
        noResults.style.display = hasResults ? 'none' : 'block';
    }
    
    searchInput.addEventListener('input', filterFeedback);
    filterType.addEventListener('change', filterFeedback);
    
    // Pag-andar para sa modal
    const modal = document.getElementById('feedbackModal');
    const closeBtn = document.querySelector('.close-btn');
    
    // Isara ang modal kapag kinlik ang close button
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('show');
    });
    
    // Isara ang modal kapag kinlik sa labas ng modal
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    // Navigasyon
    const navLinks = document.querySelectorAll('.nav-links li');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const linkText = this.querySelector('span').textContent;
            
            // I-handle ang navigasyon
            switch(linkText) {
                case 'Home':
                    window.location.href = 'home.html';
                    break;
                case 'Logout':
                    // Alisin ang current user sa session storage
                    sessionStorage.removeItem('currentUser');
                    window.location.href = 'login.html';
                    break;
            }
        });
    });
});

// I-load ang mga feedback ng user mula sa local storage
function loadUserFeedbacks() {
    // Kunin ang kasalukuyang user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Kunin ang feedback ng user
    const userFeedbackKey = `userFeedbacks_${currentUser.username}`;
    const userFeedbacks = JSON.parse(localStorage.getItem(userFeedbackKey)) || [];
    
    // Kunin ang feedback ng admin (para suriin ang mga response)
    const adminFeedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    
    // Kunin ang container para sa listahan ng feedback
    const feedbackList = document.querySelector('.feedback-list');
    const noResults = document.querySelector('.no-results');
    
    // I-clear ang kasalukuyang laman
    feedbackList.innerHTML = '';
    
    // Suriin kung may feedback man
    if (userFeedbacks.length === 0) {
        noResults.style.display = 'block';
        noResults.querySelector('p').textContent = 'Wala ka pang naisumiteng feedback';
        return;
    }
    
    // I-sort ang mga feedback batay sa petsa (pinakabago muna)
    userFeedbacks.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Gumawa ng mga feedback item
    userFeedbacks.forEach(feedback => {
        // Suriin kung ang feedback ay naipadala na sa admin at may response na
        const adminFeedback = adminFeedbacks.find(f => f.id === feedback.id);
        if (adminFeedback && adminFeedback.response) {
            feedback.response = adminFeedback.response;
            feedback.status = adminFeedback.status;
        }
        
        // Gumawa ng feedback item element
        const feedbackItem = createFeedbackItem(feedback);
        
        // Idagdag sa listahan
        feedbackList.appendChild(feedbackItem);
    });
}

// Gumawa ng element para sa feedback item
function createFeedbackItem(feedback) {
    const feedbackItem = document.createElement('div');
    feedbackItem.className = 'feedback-item';
    feedbackItem.setAttribute('data-type', feedback.type);
    feedbackItem.setAttribute('data-id', feedback.id);
    
    // I-format ang petsa
    const date = new Date(feedback.date);
    const formattedDate = `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    
    // Gumawa ng istraktura ng HTML
    feedbackItem.innerHTML = `
        <div class="feedback-header">
            <div class="feedback-type ${feedback.type}">${capitalizeFirstLetter(feedback.type)}</div>
            <div class="feedback-date">${formattedDate}</div>
        </div>
        <h3 class="feedback-subject">${feedback.subject}</h3>
        <p class="feedback-preview">${feedback.message.substring(0, 100)}${feedback.message.length > 100 ? '...' : ''}</p>
        <div class="feedback-status">
            <span class="status ${feedback.status}">${capitalizeFirstLetter(feedback.status)}</span>
            <div class="feedback-actions">
                <button class="view-details-btn">View Details</button>
                <button class="delete-btn">Delete</button>
            </div>
        </div>
    `;
    
    // Magdagdag ng event listeners
    const viewDetailsBtn = feedbackItem.querySelector('.view-details-btn');
    viewDetailsBtn.addEventListener('click', () => showFeedbackDetails(feedback));
    
    const deleteBtn = feedbackItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteFeedback(feedback.id));
    
    return feedbackItem;
}

// Ipakita ang detalye ng feedback sa modal
function showFeedbackDetails(feedback) {
    const modal = document.getElementById('feedbackModal');
    
    // I-format ang petsa
    const date = new Date(feedback.date);
    const formattedDate = `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    
    // Itakda ang laman ng modal
    document.getElementById('modalType').textContent = capitalizeFirstLetter(feedback.type);
    document.getElementById('modalSubject').textContent = feedback.subject;
    document.getElementById('modalDate').textContent = formattedDate;
    
    const modalStatus = document.getElementById('modalStatus');
    modalStatus.textContent = capitalizeFirstLetter(feedback.status);
    modalStatus.className = 'detail-value status-badge';
    modalStatus.classList.add(feedback.status);
    
    document.getElementById('modalMessage').textContent = feedback.message;
    
    // I-handle ang attachment
    const attachmentRow = document.getElementById('attachmentRow');
    if (feedback.attachment) {
        attachmentRow.style.display = 'flex';
        const modalAttachment = document.getElementById('modalAttachment');
        modalAttachment.querySelector('span').textContent = feedback.attachment;
    } else {
        attachmentRow.style.display = 'none';
    }
    
    // I-handle ang response
    const responseRow = document.getElementById('responseRow');
    if (feedback.response) {
        responseRow.style.display = 'flex';
        document.getElementById('modalResponse').textContent = feedback.response;
    } else {
        responseRow.style.display = 'none';
    }
    
    // Ipakita ang modal
    modal.classList.add('show');
}

// Burahin ang feedback
function deleteFeedback(feedbackId) {
    if (!confirm('Sigurado ka bang gusto mong burahin ang feedback na ito?')) {
        return;
    }
    
    // Kunin ang kasalukuyang user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Kunin ang mga feedback ng user
    const userFeedbackKey = `userFeedbacks_${currentUser.username}`;
    const userFeedbacks = JSON.parse(localStorage.getItem(userFeedbackKey)) || [];
    
    // Burahin ang feedback
    const updatedFeedbacks = userFeedbacks.filter(f => f.id !== feedbackId);
    
    // I-save ang mga updated na feedback
    localStorage.setItem(userFeedbackKey, JSON.stringify(updatedFeedbacks));
    
    // I-update ang paggamit ng storage
    updateStorageUsage();
    
    // I-reload ang mga feedback
    loadUserFeedbacks();
}

// Tulong na function para gawing malaking titik ang unang letra ng string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// I-update ang impormasyon tungkol sa paggamit ng storage
function updateStorageUsage() {
    // Kalkulahin ang kabuuang gamit ng storage
    let totalSize = 0;
    
    // Kalkulahin ang laki ng bawat storage item
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalSize += (key.length + value.length) * 2; // Tinatayang laki sa bytes (UTF-16 encoding)
    }
    
    // I-convert sa KB
    const sizeInKB = (totalSize / 1024).toFixed(2);
    
    // Kalkulahin ang porsyento ng 5MB (karaniwang limitasyon ng local storage)
    const percentUsed = ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2);
    
    // I-save ang impormasyon ng paggamit
    localStorage.setItem('storageUsage', JSON.stringify({
        bytes: totalSize,
        kilobytes: sizeInKB,
        percent: percentUsed,
        timestamp: new Date().getTime()
    }));
}
