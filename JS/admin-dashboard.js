document.addEventListener('DOMContentLoaded', function() {
   // Check if user is logged in as admin
   const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
   if (!currentUser || currentUser.role !== 'admin') {
       // Redirect to login if not logged in as admin
       window.location.href = 'login.html';
       return;
   }
   
   // Initialize local storage if needed
   initializeLocalStorage();
   
   // Load dashboard data
   loadDashboardData();
   
   // Tab navigation
   const navLinks = document.querySelectorAll('.nav-links li[data-tab]');
   const tabContents = document.querySelectorAll('.tab-content');
   
   navLinks.forEach(link => {
       link.addEventListener('click', function() {
           const tabId = this.getAttribute('data-tab');
           
           // Remove active class from all links and tabs
           navLinks.forEach(l => l.classList.remove('active'));
           tabContents.forEach(t => t.classList.remove('active'));
           
           // Add active class to clicked link and corresponding tab
           this.classList.add('active');
           document.getElementById(tabId).classList.add('active');
           
           // Load tab-specific data
           switch(tabId) {
               case 'dashboard':
                   loadDashboardData();
                   break;
               case 'feedbacks':
                   loadFeedbacksData();
                   break;
               case 'students':
                   loadStudentsData();
                   break;
               case 'password-requests':
                   loadPasswordRequestsData();
                   break;
           }
       });
   });
   
   // Logout functionality
   const logoutLink = document.querySelector('.nav-links li:last-child');
   logoutLink.addEventListener('click', function() {
       // Clear session storage
       sessionStorage.removeItem('currentUser');
       window.location.href = 'login.html';
   });
   
   // Add student modal
   const addStudentBtn = document.getElementById('addStudentBtn');
   const addStudentModal = document.getElementById('addStudentModal');
   const cancelAddStudentBtn = document.getElementById('cancelAddStudentBtn');
   const addStudentForm = document.getElementById('addStudentForm');
   const closeAddStudentBtn = addStudentModal.querySelector('.close-btn');
   
   addStudentBtn.addEventListener('click', function() {
       addStudentModal.classList.add('show');
   });
   
   cancelAddStudentBtn.addEventListener('click', function() {
       addStudentModal.classList.remove('show');
       addStudentForm.reset();
   });
   
   closeAddStudentBtn.addEventListener('click', function() {
       addStudentModal.classList.remove('show');
       addStudentForm.reset();
   });
   
   // Add student form submission
   addStudentForm.addEventListener('submit', function(event) {
       event.preventDefault();
       
       const username = document.getElementById('newUsername').value.trim();
       const password = document.getElementById('newPassword').value.trim();
       const email = document.getElementById('newEmail').value.trim();
       
       // Validate inputs
       if (!username || !password || !email) {
           showSuccessMessage('Please fill in all fields', false);
           return;
       }
       
       // Check if username already exists
       const users = JSON.parse(localStorage.getItem('users')) || [];
       if (users.some(user => user.username === username)) {
           showSuccessMessage('Username already exists', false);
           return;
       }
       
       // Add new student
       users.push({
           username: username,
           password: password,
           email: email,
           role: 'student'
       });
       
       // Save to local storage
       localStorage.setItem('users', JSON.stringify(users));
       
       // Update storage usage
       updateStorageUsage();
       
       // Show success message
       showSuccessMessage('Student account created successfully');
       
       // Close modal and reset form
       addStudentModal.classList.remove('show');
       addStudentForm.reset();
       
       // Reload students data
       loadStudentsData();
   });
   
   // Feedback response modal
   const feedbackResponseModal = document.getElementById('feedbackResponseModal');
   const cancelResponseBtn = document.getElementById('cancelResponseBtn');
   const feedbackResponseForm = document.getElementById('feedbackResponseForm');
   const closeFeedbackResponseBtn = feedbackResponseModal.querySelector('.close-btn');
   
   cancelResponseBtn.addEventListener('click', function() {
       feedbackResponseModal.classList.remove('show');
       feedbackResponseForm.reset();
   });
   
   closeFeedbackResponseBtn.addEventListener('click', function() {
       feedbackResponseModal.classList.remove('show');
       feedbackResponseForm.reset();
   });
   
   // Feedback response form submission
   feedbackResponseForm.addEventListener('submit', function(event) {
       event.preventDefault();
       
       const feedbackId = document.getElementById('feedbackId').value;
       const status = document.getElementById('feedbackStatus').value;
       const response = document.getElementById('responseMessage').value.trim();
       
       // Validate inputs
       if (!feedbackId || !status || !response) {
           showSuccessMessage('Please fill in all fields', false);
           return;
       }
       
       // Update feedback
       const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
       const feedbackIndex = feedbacks.findIndex(f => f.id === feedbackId);
       
       if (feedbackIndex !== -1) {
           feedbacks[feedbackIndex].status = status;
           feedbacks[feedbackIndex].response = response;
           
           // Save to local storage
           localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
           
           // Update storage usage
           updateStorageUsage();
           
           // Add to recent activity
           addRecentActivity(`Responded to feedback from ${feedbacks[feedbackIndex].username}`);
           
           // Show success message
           showSuccessMessage('Response sent successfully');
           
           // Close modal and reset form
           feedbackResponseModal.classList.remove('show');
           feedbackResponseForm.reset();
           
           // Reload feedbacks data
           loadFeedbacksData();
       }
   });
   
   // Reset password modal
   const resetPasswordModal = document.getElementById('resetPasswordModal');
   const cancelResetBtn = document.getElementById('cancelResetBtn');
   const resetPasswordForm = document.getElementById('resetPasswordForm');
   const closeResetPasswordBtn = resetPasswordModal.querySelector('.close-btn');
   
   cancelResetBtn.addEventListener('click', function() {
       resetPasswordModal.classList.remove('show');
       resetPasswordForm.reset();
   });
   
   closeResetPasswordBtn.addEventListener('click', function() {
       resetPasswordModal.classList.remove('show');
       resetPasswordForm.reset();
   });
   
   // Reset password form submission
   resetPasswordForm.addEventListener('submit', function(event) {
       event.preventDefault();
       
       const username = document.getElementById('resetUsername').value;
       const newPassword = document.getElementById('newResetPassword').value.trim();
       const requestId = document.getElementById('resetRequestId').value;
       
       // Validate inputs
       if (!username || !newPassword) {
           showSuccessMessage('Please fill in all fields', false);
           return;
       }
       
       // Update user password
       const users = JSON.parse(localStorage.getItem('users')) || [];
       const userIndex = users.findIndex(u => u.username === username);
       
       if (userIndex !== -1) {
           users[userIndex].password = newPassword;
           
           // Save to local storage
           localStorage.setItem('users', JSON.stringify(users));
           
           // Remove password reset request
           const requests = JSON.parse(localStorage.getItem('passwordResetRequests')) || [];
           const updatedRequests = requests.filter(r => r.username !== username);
           localStorage.setItem('passwordResetRequests', JSON.stringify(updatedRequests));
           
           // Update storage usage
           updateStorageUsage();
           
           // Add to recent activity
           addRecentActivity(`Reset password for ${username}`);
           
           // Show success message
           showSuccessMessage('Password reset successfully');
           
           // Close modal and reset form
           resetPasswordModal.classList.remove('show');
           resetPasswordForm.reset();
           
           // Reload password requests data
           loadPasswordRequestsData();
       }
   });
   
   // Search functionality for feedbacks
   const feedbackSearchInput = document.getElementById('feedbackSearchInput');
   const feedbackFilterType = document.getElementById('feedbackFilterType');
   const feedbackFilterStatus = document.getElementById('feedbackFilterStatus');
   
   function filterFeedbacks() {
       const searchTerm = feedbackSearchInput.value.toLowerCase();
       const selectedType = feedbackFilterType.value;
       const selectedStatus = feedbackFilterStatus.value;
       
       const feedbackItems = document.querySelectorAll('#adminFeedbackList .feedback-item');
       const noFeedbacksMessage = document.getElementById('noFeedbacksMessage');
       
       let hasResults = false;
       
       feedbackItems.forEach(item => {
           const subject = item.querySelector('.feedback-subject').textContent.toLowerCase();
           const preview = item.querySelector('.feedback-preview').textContent.toLowerCase();
           const username = item.getAttribute('data-username').toLowerCase();
           const type = item.getAttribute('data-type');
           const status = item.getAttribute('data-status');
           
           const matchesSearch = subject.includes(searchTerm) || preview.includes(searchTerm) || username.includes(searchTerm);
           const matchesType = selectedType === 'all' || type === selectedType;
           const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
           
           if (matchesSearch && matchesType && matchesStatus) {
               item.style.display = 'block';
               hasResults = true;
           } else {
               item.style.display = 'none';
           }
       });
       
       noFeedbacksMessage.style.display = hasResults ? 'none' : 'block';
   }
   
   feedbackSearchInput.addEventListener('input', filterFeedbacks);
   feedbackFilterType.addEventListener('change', filterFeedbacks);
   feedbackFilterStatus.addEventListener('change', filterFeedbacks);
   
   // Search functionality for students
   const studentSearchInput = document.getElementById('studentSearchInput');
   
   studentSearchInput.addEventListener('input', function() {
       const searchTerm = studentSearchInput.value.toLowerCase();
       const studentRows = document.querySelectorAll('#studentsTableBody tr');
       const noStudentsMessage = document.getElementById('noStudentsMessage');
       
       let hasResults = false;
       
       studentRows.forEach(row => {
           const username = row.querySelector('td:first-child').textContent.toLowerCase();
           const email = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
           
           if (username.includes(searchTerm) || email.includes(searchTerm)) {
               row.style.display = '';
               hasResults = true;
           } else {
               row.style.display = 'none';
           }
       });
       
       noStudentsMessage.style.display = hasResults ? 'none' : 'block';
   });
   
   // Initial load of dashboard data
   loadDashboardData();
});

// Initialize local storage with default data if needed
function initializeLocalStorage() {
   // Check if users already exist
   if (!localStorage.getItem('users')) {
       // Create default users
       const defaultUsers = [
           {
               username: 'DatamexStudent123',
               password: 'DTMX123',
               role: 'student',
               email: 'student@datamex.edu'
           },
           {
               username: 'DatamexAdmin123',
               password: 'DTMXADMIN123',
               role: 'admin',
               email: 'admin@datamex.edu'
           }
       ];
       
       // Save to local storage
       localStorage.setItem('users', JSON.stringify(defaultUsers));
   }
   
   // Initialize feedback array if it doesn't exist
   if (!localStorage.getItem('feedbacks')) {
       localStorage.setItem('feedbacks', JSON.stringify([]));
   }
   
   // Initialize password reset requests if they don't exist
   if (!localStorage.getItem('passwordResetRequests')) {
       localStorage.setItem('passwordResetRequests', JSON.stringify([]));
   }
   
   // Initialize recent activity if it doesn't exist
   if (!localStorage.getItem('recentActivity')) {
       localStorage.setItem('recentActivity', JSON.stringify([]));
   }
   
   // Initialize storage usage tracking
   updateStorageUsage();
}

// Load dashboard data
function loadDashboardData() {
   // Get data from local storage
   const users = JSON.parse(localStorage.getItem('users')) || [];
   const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
   const storageUsage = JSON.parse(localStorage.getItem('storageUsage')) || { kilobytes: 0, percent: 0 };
   
   // Count students
   const studentCount = users.filter(user => user.role === 'student').length;
   document.getElementById('totalStudents').textContent = studentCount;
   
   // Count feedbacks
   document.getElementById('totalFeedbacks').textContent = feedbacks.length;
   
   // Count resolved feedbacks
   const resolvedCount = feedbacks.filter(feedback => feedback.status === 'resolved').length;
   document.getElementById('resolvedFeedbacks').textContent = resolvedCount;
   
   // Count pending feedbacks
   const pendingCount = feedbacks.filter(feedback => feedback.status === 'pending').length;
   document.getElementById('pendingFeedbacks').textContent = pendingCount;
   
   // Update storage usage
   const storageProgressBar = document.getElementById('storageProgressBar');
   storageProgressBar.style.width = `${storageUsage.percent}%`;
   
   // Change color based on usage
   if (storageUsage.percent > 80) {
       storageProgressBar.style.backgroundColor = '#F44336'; // Red
   } else if (storageUsage.percent > 60) {
       storageProgressBar.style.backgroundColor = '#FFC107'; // Yellow
   } else {
       storageProgressBar.style.backgroundColor = '#4CAF50'; // Green
   }
   
   document.getElementById('storageDetails').textContent = `${storageUsage.kilobytes} KB used (${storageUsage.percent}%)`;
   
   // Load recent activity
   loadRecentActivity();
}

// Load feedbacks data
function loadFeedbacksData() {
   // Get feedbacks from local storage
   const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
   
   // Get feedback list container
   const feedbackList = document.getElementById('adminFeedbackList');
   const noFeedbacksMessage = document.getElementById('noFeedbacksMessage');
   
   // Clear existing content
   feedbackList.innerHTML = '';
   
   // Check if there are any feedbacks
   if (feedbacks.length === 0) {
       noFeedbacksMessage.style.display = 'block';
       noFeedbacksMessage.querySelector('p').textContent = 'No feedbacks have been submitted yet';
       return;
   }
   
   // Sort feedbacks by date (newest first)
   feedbacks.sort((a, b) => new Date(b.date) - new Date(a.date));
   
   // Create feedback items
   feedbacks.forEach(feedback => {
       // Create feedback item
       const feedbackItem = createAdminFeedbackItem(feedback);
       
       // Add to list
       feedbackList.appendChild(feedbackItem);
   });
   
   // Hide no results message
   noFeedbacksMessage.style.display = 'none';
}

// Create admin feedback item
function createAdminFeedbackItem(feedback) {
   const feedbackItem = document.createElement('div');
   feedbackItem.className = 'feedback-item';
   feedbackItem.setAttribute('data-type', feedback.type);
   feedbackItem.setAttribute('data-status', feedback.status);
   feedbackItem.setAttribute('data-username', feedback.username);
   feedbackItem.setAttribute('data-id', feedback.id);
   
   // Format date
   const date = new Date(feedback.date);
   const formattedDate = `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
   
   // Create HTML structure
   feedbackItem.innerHTML = `
       <div class="feedback-header">
           <div class="feedback-type ${feedback.type}">${capitalizeFirstLetter(feedback.type)}</div>
           <div class="feedback-date">${formattedDate}</div>
       </div>
       <div class="feedback-user">From: <strong>${feedback.username}</strong></div>
       <h3 class="feedback-subject">${feedback.subject}</h3>
       <p class="feedback-preview">${feedback.message.substring(0, 100)}${feedback.message.length > 100 ? '...' : ''}</p>
       <div class="feedback-status">
           <span class="status ${feedback.status}">${capitalizeFirstLetter(feedback.status)}</span>
           <div class="feedback-actions">
               <button class="action-btn respond-btn">Respond</button>
               <button class="action-btn delete-btn">Delete</button>
           </div>
       </div>
   `;
   
   // Add event listeners
   const respondBtn = feedbackItem.querySelector('.respond-btn');
   respondBtn.addEventListener('click', () => showFeedbackResponseModal(feedback));
   
   const deleteBtn = feedbackItem.querySelector('.delete-btn');
   deleteBtn.addEventListener('click', () => deleteFeedback(feedback.id));
   
   return feedbackItem;
}

// Show feedback response modal
function showFeedbackResponseModal(feedback) {
   const modal = document.getElementById('feedbackResponseModal');
   
   // Set modal content
   document.getElementById('responseModalUsername').textContent = feedback.username;
   document.getElementById('responseModalSubject').textContent = feedback.subject;
   document.getElementById('responseModalType').textContent = capitalizeFirstLetter(feedback.type);
   document.getElementById('responseModalMessage').textContent = feedback.message;
   
   // Set current status
   document.getElementById('feedbackStatus').value = feedback.status;
   
   // Set response message if exists
   if (feedback.response) {
       document.getElementById('responseMessage').value = feedback.response;
   } else {
       document.getElementById('responseMessage').value = '';
   }
   
   // Set feedback ID
   document.getElementById('feedbackId').value = feedback.id;
   
   // Show modal
   modal.classList.add('show');
}

// Delete feedback
function deleteFeedback(feedbackId) {
   if (!confirm('Are you sure you want to delete this feedback?')) {
       return;
   }
   
   // Get feedbacks
   const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
   
   // Find feedback
   const feedbackIndex = feedbacks.findIndex(f => f.id === feedbackId);
   
   if (feedbackIndex !== -1) {
       // Get username for activity log
       const username = feedbacks[feedbackIndex].username;
       
       // Remove feedback
       feedbacks.splice(feedbackIndex, 1);
       
       // Save to local storage
       localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
       
       // Update storage usage
       updateStorageUsage();
       
       // Add to recent activity
       addRecentActivity(`Deleted feedback from ${username}`);
       
       // Show success message
       showSuccessMessage('Feedback deleted successfully');
       
       // Reload feedbacks data
       loadFeedbacksData();
   }
}

// Load students data
function loadStudentsData() {
   // Get users from local storage
   const users = JSON.parse(localStorage.getItem('users')) || [];
   
   // Filter students
   const students = users.filter(user => user.role === 'student');
   
   // Get students table body
   const studentsTableBody = document.getElementById('studentsTableBody');
   const noStudentsMessage = document.getElementById('noStudentsMessage');
   
   // Clear existing content
   studentsTableBody.innerHTML = '';
   
   // Check if there are any students
   if (students.length === 0) {
       noStudentsMessage.style.display = 'block';
       return;
   }
   
   // Create student rows
   students.forEach(student => {
       // Count feedbacks for this student
       const userFeedbackKey = `userFeedbacks_${student.username}`;
       const userFeedbacks = JSON.parse(localStorage.getItem(userFeedbackKey)) || [];
       
       // Create table row
       const row = document.createElement('tr');
       
       row.innerHTML = `
           <td>${student.username}</td>
           <td>${student.email}</td>
           <td>${userFeedbacks.length}</td>
           <td>
               <button class="action-btn edit">Reset Password</button>
               <button class="action-btn delete">Delete Account</button>
           </td>
       `;
       
       // Add event listeners
       const resetPasswordBtn = row.querySelector('.edit');
       resetPasswordBtn.addEventListener('click', () => showManualResetPasswordModal(student));
       
       const deleteAccountBtn = row.querySelector('.delete');
       deleteAccountBtn.addEventListener('click', () => deleteStudentAccount(student.username));
       
       // Add to table
       studentsTableBody.appendChild(row);
   });
   
   // Hide no results message
   noStudentsMessage.style.display = 'none';
}

// Show manual reset password modal
function showManualResetPasswordModal(student) {
   const modal = document.getElementById('resetPasswordModal');
   
   // Set modal content
   document.getElementById('resetUsername').value = student.username;
   document.getElementById('resetEmail').value = student.email;
   document.getElementById('newResetPassword').value = '';
   document.getElementById('resetRequestId').value = 'manual';
   
   // Show modal
   modal.classList.add('show');
}

// Delete student account
function deleteStudentAccount(username) {
   if (!confirm(`Are you sure you want to delete the account for ${username}?`)) {
       return;
   }
   
   // Get users
   const users = JSON.parse(localStorage.getItem('users')) || [];
   
   // Remove user
   const updatedUsers = users.filter(user => user.username !== username);
   
   // Save to local storage
   localStorage.setItem('users', JSON.stringify(updatedUsers));
   
   // Remove user feedbacks
   const userFeedbackKey = `userFeedbacks_${username}`;
   localStorage.removeItem(userFeedbackKey);
   
   // Remove user feedbacks from admin list
   const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
   const updatedFeedbacks = feedbacks.filter(feedback => feedback.username !== username);
   localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));
   
   // Update storage usage
   updateStorageUsage();
   
   // Add to recent activity
   addRecentActivity(`Deleted account for ${username}`);
   
   // Show success message
   showSuccessMessage('Student account deleted successfully');
   
   // Reload students data
   loadStudentsData();
   
   // Update dashboard counts
   loadDashboardData();
}

// Load password requests data
function loadPasswordRequestsData() {
   // Get password reset requests
   const requests = JSON.parse(localStorage.getItem('passwordResetRequests')) || [];
   
   // Get requests list container
   const requestsList = document.getElementById('passwordRequestsList');
   const noRequestsMessage = document.getElementById('noRequestsMessage');
   
   // Clear existing content
   requestsList.innerHTML = '';
   
   // Check if there are any requests
   if (requests.length === 0) {
       noRequestsMessage.style.display = 'block';
       return;
   }
   
   // Sort requests by date (newest first)
   requests.sort((a, b) => b.timestamp - a.timestamp);
   
   // Create request items
   requests.forEach(request => {
       // Create request item
       const requestItem = document.createElement('div');
       requestItem.className = 'request-item';
       
       // Format date
       const date = new Date(request.timestamp);
       const formattedDate = `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${date.toLocaleTimeString('en-US')}`;
       
       // Create HTML structure
       requestItem.innerHTML = `
           <div class="request-header">
               <h3>Password Reset Request</h3>
               <span class="request-date">${formattedDate}</span>
           </div>
           <div class="request-info">
               <div>
                   <strong>Username:</strong> ${request.username}
               </div>
               <div>
                   <strong>Email:</strong> ${request.email}
               </div>
           </div>
           <div class="request-actions">
               <button class="btn primary reset-password-btn">Reset Password</button>
               <button class="btn secondary dismiss-btn">Dismiss</button>
           </div>
       `;
       
       // Add event listeners
       const resetPasswordBtn = requestItem.querySelector('.reset-password-btn');
       resetPasswordBtn.addEventListener('click', () => showResetPasswordModal(request));
       
       const dismissBtn = requestItem.querySelector('.dismiss-btn');
       dismissBtn.addEventListener('click', () => dismissPasswordRequest(request.username));
       
       // Add to list
       requestsList.appendChild(requestItem);
   });
   
   // Hide no results message
   noRequestsMessage.style.display = 'none';
}

// Show reset password modal
function showResetPasswordModal(request) {
   const modal = document.getElementById('resetPasswordModal');
   
   // Set modal content
   document.getElementById('resetUsername').value = request.username;
   document.getElementById('resetEmail').value = request.email;
   document.getElementById('newResetPassword').value = '';
   document.getElementById('resetRequestId').value = request.timestamp;
   
   // Show modal
   modal.classList.add('show');
}

// Dismiss password request
function dismissPasswordRequest(username) {
   if (!confirm('Are you sure you want to dismiss this password reset request?')) {
       return;
   }
   
   // Get password reset requests
   const requests = JSON.parse(localStorage.getItem('passwordResetRequests')) || [];
   
   // Remove request
   const updatedRequests = requests.filter(r => r.username !== username);
   
   // Save to local storage
   localStorage.setItem('passwordResetRequests', JSON.stringify(updatedRequests));
   
   // Update storage usage
   updateStorageUsage();
   
   // Add to recent activity
   addRecentActivity(`Dismissed password reset request for ${username}`);
   
   // Show success message
   showSuccessMessage('Password reset request dismissed');
   
   // Reload password requests data
   loadPasswordRequestsData();
}

// Load recent activity
function loadRecentActivity() {
   // Get recent activity
   const activities = JSON.parse(localStorage.getItem('recentActivity')) || [];
   
   // Get activity list container
   const activityList = document.getElementById('recentActivity');
   
   // Clear existing content
   activityList.innerHTML = '';
   
   // Check if there are any activities
   if (activities.length === 0) {
       activityList.innerHTML = '<p class="no-activity">No recent activity</p>';
       return;
   }
   
   // Sort activities by timestamp (newest first)
   activities.sort((a, b) => b.timestamp - a.timestamp);
   
   // Limit to 10 most recent activities
   const recentActivities = activities.slice(0, 10);
   
   // Create activity items
   recentActivities.forEach(activity => {
       // Create activity item
       const activityItem = document.createElement('div');
       activityItem.className = 'activity-item';
       
       // Determine icon based on activity type
       let icon = 'bx-info-circle';
       if (activity.message.includes('created')) icon = 'bx-user-plus';
       if (activity.message.includes('deleted')) icon = 'bx-trash';
       if (activity.message.includes('reset')) icon = 'bx-key';
       if (activity.message.includes('responded')) icon = 'bx-message-dots';
       
       // Format date
       const date = new Date(activity.timestamp);
       const formattedDate = `${date.toLocaleDateString('en-US')} at ${date.toLocaleTimeString('en-US')}`;
       
       // Create HTML structure
       activityItem.innerHTML = `
           <div class="activity-icon">
               <i class='bx ${icon}'></i>
           </div>
           <div class="activity-details">
               <div class="activity-message">${activity.message}</div>
               <div class="activity-time">${formattedDate}</div>
           </div>
       `;
       
       // Add to list
       activityList.appendChild(activityItem);
   });
}

// Add recent activity
function addRecentActivity(message) {
   // Get recent activity
   const activities = JSON.parse(localStorage.getItem('recentActivity')) || [];
   
   // Add new activity
   activities.push({
       message: message,
       timestamp: new Date().getTime()
   });
   
   // Limit to 50 most recent activities
   if (activities.length > 50) {
       activities.sort((a, b) => b.timestamp - a.timestamp);
       activities.splice(50);
   }
   
   // Save to local storage
   localStorage.setItem('recentActivity', JSON.stringify(activities));
   
   // Update storage usage
   updateStorageUsage();
}

// Show success message
function showSuccessMessage(message, isSuccess = true) {
   const successMessage = document.getElementById('successMessage');
   const successMessageText = document.getElementById('successMessageText');
   const storageInfoSmall = document.getElementById('storageInfoSmall');
   
   // Set message
   successMessageText.textContent = message;
   
   // Set color based on success/error
   successMessage.style.backgroundColor = isSuccess ? '#4CAF50' : '#F44336';
   
   // Update storage info
   const storageUsage = JSON.parse(localStorage.getItem('storageUsage')) || { kilobytes: 0, percent: 0 };
   storageInfoSmall.textContent = `Storage: ${storageUsage.kilobytes} KB (${storageUsage.percent}% used)`;
   
   // Show message
   successMessage.classList.add('show');
   
   // Hide message after 3 seconds
   setTimeout(function() {
       successMessage.classList.remove('show');
   }, 3000);
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
   return string.charAt(0).toUpperCase() + string.slice(1);
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

// Also, we need to update the login.js file to handle admin authentication:
document.addEventListener('DOMContentLoaded', function() {
   // Add submit event listener to the login form
   const loginFormElement = document.getElementById('loginForm').querySelector('form');
   loginFormElement.addEventListener('submit', function(event) {
       event.preventDefault();
       
       // Get username and password input values
       const username = document.getElementById('username').value.trim();
       const password = document.getElementById('password').value.trim();
       
       // Get users from local storage
       const users = JSON.parse(localStorage.getItem('users')) || [];
       
       // Find user
       const user = users.find(u => u.username === username && u.password === password);
       
       if (user) {
           // Store user info in session storage
           sessionStorage.setItem('currentUser', JSON.stringify({
               username: user.username,
               role: user.role
           }));
           
           // Redirect based on role
           if (user.role === 'admin') {
               window.location.href = 'admin-dashboard.html';
           } else {
               window.location.href = 'home.html';
           }
       } else {
           // Show error message
           const cautionMessage = document.getElementById('cautionMessage');
           cautionMessage.querySelector('span').textContent = 'Invalid username or password';
           cautionMessage.classList.add('show');
           
           // Hide message after 3 seconds
           setTimeout(() => {
               cautionMessage.classList.remove('show');
           }, 3000);
           
           // Apply vibration effect
           applyVibrationEffect(document.getElementById('username'));
           applyVibrationEffect(document.getElementById('password'));
           
           // Use device vibration if available
           if (navigator.vibrate) {
               navigator.vibrate(100);
           }
       }
   });
});
