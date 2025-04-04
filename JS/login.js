document.addEventListener('DOMContentLoaded', function () {
    // I-setup ang local storage gamit ang default na accounts kung wala pang naka-set
    initializeLocalStorage();

    const loginForm = document.getElementById('loginForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    const cautionMessage = document.getElementById('cautionMessage');

    // Function para magpakita ng caution message
    function showCautionMessage(message, isSuccess = false) {
        const messageSpan = cautionMessage.querySelector('span');
        const icon = cautionMessage.querySelector('i');

        messageSpan.textContent = message;

        // Baguhin ang style batay sa success/error
        if (isSuccess) {
            cautionMessage.style.backgroundColor = '#4CAF50';
            icon.className = 'bx bx-check-circle';
        } else {
            cautionMessage.style.backgroundColor = '#ff3860';
            icon.className = 'bx bx-x-circle';
        }

        cautionMessage.classList.add('show');

        // I-auto-hide lang ang error messages
        if (!isSuccess) {
            setTimeout(() => {
                cautionMessage.classList.remove('show');
            }, 3000);
        }
    }

    // Ipakita ang forgot password form
    forgotPasswordLink.addEventListener('click', function (e) {
        e.preventDefault();
        loginForm.classList.add('slide-login-right');
        forgotPasswordForm.classList.add('slide-forgot-center');
    });

    // Ipakita ang login form
    backToLoginLink.addEventListener('click', function (e) {
        e.preventDefault();
        loginForm.classList.remove('slide-login-right');
        forgotPasswordForm.classList.remove('slide-forgot-center');
    });

    // Magdagdag ng submit event listener sa login form
    const loginFormElement = loginForm.querySelector('form');
    loginFormElement.addEventListener('submit', function (event) {
        event.preventDefault();

        // Kunin ang username at password input values
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // Tsek kung may empty na field
        if (username === '' || password === '') {
            // Ipakita ang caution message
            showCautionMessage('Pakifill ang lahat ng fields');

            // I-apply ang vibration effect sa empty fields
            if (username === '') {
                applyVibrationEffect(document.getElementById('username'));
            }

            if (password === '') {
                applyVibrationEffect(document.getElementById('password'));
            }

            // Gamitin ang device vibration kung available
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }
            return;
        }

        // I-authenticate ang user
        const authResult = authenticateUser(username, password);

        if (authResult.success) {
            // I-save ang current user sa session storage
            sessionStorage.setItem('currentUser', JSON.stringify({
                username: username,
                role: authResult.role
            }));

            // Ipakita ang success message
            showCautionMessage('Login successful! Redirecting...', true);

            // I-disable ang form inputs at button
            document.getElementById('username').disabled = true;
            document.getElementById('password').disabled = true;
            document.querySelector('button[type="submit"]').disabled = true;

            // Maghintay ng delay bago mag-redirect
            setTimeout(() => {
                // Mag-redirect batay sa role
                if (authResult.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'home.html';
                }
            }, 2000); // 2 segundo delay
        } else {
            showCautionMessage('Invalid username or password');
            applyVibrationEffect(document.getElementById('username'));
            applyVibrationEffect(document.getElementById('password'));
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }
        }
    });

    // Magdagdag ng submit event listener sa forgot password form
    const forgotPasswordFormElement = forgotPasswordForm.querySelector('form');
    forgotPasswordFormElement.addEventListener('submit', function (event) {
        event.preventDefault();

        // Kunin ang username at email input values
        const fpUsername = document.getElementById('fpUsername').value.trim();
        const fpEmail = document.getElementById('fpEmail').value.trim();

        // Tsek kung may empty na field
        if (fpUsername === '' || fpEmail === '') {
            // Ipakita ang caution message
            showCautionMessage('Pakifill ang lahat ng fields');

            // I-apply ang vibration effect sa empty fields
            if (fpUsername === '') {
                applyVibrationEffect(document.getElementById('fpUsername'));
            }

            if (fpEmail === '') {
                applyVibrationEffect(document.getElementById('fpEmail'));
            }

            // Gamitin ang device vibration kung available
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }
            return;
        }

        // I-process ang forgot password request
        const requestResult = processForgotPasswordRequest(fpUsername, fpEmail);

        if (requestResult.success) {
            showCautionMessage('Password reset request sent to admin');
            // I-reset ang form at bumalik sa login
            forgotPasswordFormElement.reset();
            setTimeout(() => {
                backToLoginLink.click();
            }, 2000);
        } else {
            showCautionMessage(requestResult.message);
            if (requestResult.field === 'username') {
                applyVibrationEffect(document.getElementById('fpUsername'));
            } else if (requestResult.field === 'email') {
                applyVibrationEffect(document.getElementById('fpEmail'));
            }
        }
    });
});

// Function para mag-apply ng vibration effect
function applyVibrationEffect(inputElement) {
    if (!inputElement) return;

    // Magdagdag ng 'vibrate' class sa input
    inputElement.classList.add('vibrate-input');

    // Hanapin ang parent container
    const container = inputElement.parentElement;
    if (container) {
        // Hanapin ang icon sa loob ng container
        const icon = container.querySelector('i, .icon, svg, img');
        if (icon) {
            // Magdagdag ng ibang vibration class sa icon
            icon.classList.add('vibrate-icon');

            // Alisin ang class pagkatapos ng animation
            setTimeout(function () {
                icon.classList.remove('vibrate-icon');
            }, 500);
        }
    }

    // Alisin ang class pagkatapos ng animation
    setTimeout(function () {
        inputElement.classList.remove('vibrate-input');
    }, 500);
}

// I-setup ang local storage gamit ang default na accounts
function initializeLocalStorage() {
    // Tsek kung may existing na users
    if (!localStorage.getItem('users')) {
        // Gumawa ng default na users
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

        // I-save sa local storage
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    // I-setup ang feedback array kung wala pa
    if (!localStorage.getItem('feedbacks')) {
        localStorage.setItem('feedbacks', JSON.stringify([]));
    }

    // I-setup ang password reset requests kung wala pa
    if (!localStorage.getItem('passwordResetRequests')) {
        localStorage.setItem('passwordResetRequests', JSON.stringify([]));
    }

    // I-setup ang storage usage tracking
    if (!localStorage.getItem('storageUsage')) {
        updateStorageUsage();
    }
}

// I-authenticate ang user
function authenticateUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        return {
            success: true,
            role: user.role
        };
    }

    return {
        success: false
    };
}

// I-process ang forgot password request
function processForgotPasswordRequest(username, email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Tsek kung may user
    const user = users.find(u => u.username === username);

    if (!user) {
        return {
            success: false,
            message: 'Username not found',
            field: 'username'
        };
    }

    // Tsek kung tumutugma ang email
    if (user.email !== email) {
        return {
            success: false,
            message: 'Email does not match our records',
            field: 'email'
        };
    }

    // Magdagdag ng password reset request
    const requests = JSON.parse(localStorage.getItem('passwordResetRequests')) || [];

    // Tsek kung may existing na request
    const existingRequest = requests.find(r => r.username === username);

    if (existingRequest) {
        // I-update ang existing request
        existingRequest.timestamp = new Date().getTime();
    } else {
        // Magdagdag ng bagong request
        requests.push({
            username: username,
            email: email,
            timestamp: new Date().getTime()
        });
    }

    // I-save ang requests
    localStorage.setItem('passwordResetRequests', JSON.stringify(requests));

    // I-update ang storage usage
    updateStorageUsage();

    return {
        success: true
    };
}

// I-update ang storage usage information
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
