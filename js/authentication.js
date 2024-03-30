document.addEventListener("DOMContentLoaded", function() {
    checkIfLoggedIn();
    initializeLogoutListener();

    // Will only load if the page is ~/login.html
    initializeLoginListener();

    // Will only load if the page is ~/registration.html
    initializeRegisterListener();
});

function getCurrentPathname () {
    let currentPathName = window.location.pathname;
    let fileName = currentPathName.substring(currentPathName.lastIndexOf("/") + 1);
    return fileName;
}

function generateTrainerId () {
    let trainerId = '';
    for (let i = 0; i < 4; i++) {
        trainerId += Math.floor(Math.random() * 10000).toString().padStart(4, '0') + ' ';
    }
    trainerIdInput.value = trainerId.trim();
}

function showError (message) {
    errorDisplay.textContent = message;
    errorDisplay.style.color = 'red';
    registerForm.insertBefore(errorDisplay, registerForm.firstChild);
}

function checkIfLoggedIn() {
    const profile = localStorage.getItem("CurrentLoginEmail");
    if (profile) {
        // If profile exists (user is logged in), show sign out and profile links
        document.querySelector('.iconProfile').innerHTML = `
            <a href="index.html" class="logout">Logout</a>
            <a href="profile.html" class="sign-icons">Profile</a>
        `;
    } else {
        // If profile doesn't exist (user is not logged in), show sign up and sign in links
        document.querySelector('.iconProfile').innerHTML = `
            <a href="registration.html" class="sign-icons">Sign Up</a>
            <a href="login.html" class="sign-icons">Sign In</a>
        `;
    }
}

function validateEmail (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword (password) {
    return password.length >= 8;
}

function verifyLogin(email, password) {
    // Retrieve user data string from localStorage
    const usersDataString = localStorage.getItem('usersData') || '';

    // Split the string into an array of user data
    const usersDataArray = usersDataString.split(';');

    // Find a user whose email and password match the entered ones
    const userData = usersDataArray.find(userData => {
        const [storedEmail, storedPassword, storedIgn] = userData.split(',');
        return email === storedEmail && password === storedPassword;
    });

    // If user data is found, return an object with all information, otherwise return null
    if (userData) {
        const [storedEmail, storedPassword, storedTrainerId, storedIgn] = userData.split(',');
        return {email: storedEmail, password: storedPassword, trainerId: storedTrainerId, ign: storedIgn};
    } else {
        return null;
    }
}

function logoutUser() {
    Swal.fire({
        title: "Do you really want to logout?",
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Logout",
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.href = 'index.html';
        }
    });
}

function initializeLoginListener () {
    let currentPathName = getCurrentPathname();

    if (currentPathName == "login.html") {
        const loginForm = document.getElementById('login-form');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        // Event listener for form submission
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission behavior

            // Get the entered email and password
            const email = emailInput.value;
            const password = passwordInput.value;

            // Verify the login credentials
            const userData = verifyLogin(email, password);
            if (userData) {
                // Redirect user to index.html if login is successful
                localStorage.setItem('CurrentLoginEmail', userData.email); // Store user email in localStorage
                localStorage.setItem('CurrentLoginPassword', userData.password); // Store user password in localStorage
                localStorage.setItem('CurrentLoginIgn', userData.ign); // Store user IGN in localStorage
                localStorage.setItem('CurrentLoginTrainerId', userData.trainerId); // Store user IGN in localStorage
                window.location.href = 'index.html';
            } else {
                // Display error message if login fails
                alert('Invalid email or password. Please try again.');
            }
        });
    }
}

function initializeRegisterListener() {
    let currentPathName = getCurrentPathname();

    if (currentPathName == "registration.html") {
        generateTrainerId();

        const registerForm = document.getElementById('register-form');
        const trainerIdInput = document.getElementById('trainer-id');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const ignInput = document.getElementById('ign');
        const errorDisplay = document.createElement('p');

        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();

            let errorMessage = '';

            // Reset previous error messages
            errorDisplay.textContent = '';
            passwordInput.style.borderColor = ''; // Reset border color

            // Check email validity
            if (!validateEmail(emailInput.value)) {
                errorMessage = 'Please enter a valid email address.';
            } else if (!validatePassword(passwordInput.value)) {
                errorMessage = 'Password must be at least 8 characters long.';
                passwordInput.style.borderColor = 'red';
            } else if (passwordInput.value !== confirmPasswordInput.value) {
                errorMessage = 'Passwords do not match.';
            } else if (!ignInput.value) {
                errorMessage = 'Please enter your in-game name (IGN).';
            }

            if (errorMessage) {
                showError(errorMessage);
            } else {
                // Retrieve existing user data from localStorage
                let usersDataString = localStorage.getItem('usersData') || '';

                // Construct user data string
                const userDataString = `${ emailInput.value },${ passwordInput.value },${ trainerIdInput.value },${ ignInput.value }`;

                // Add new user data to the existing string
                if (usersDataString) {
                    usersDataString += `;${ userDataString }`;
                } else {
                    usersDataString = userDataString;
                }

                // Save the updated string back to localStorage
                localStorage.setItem('usersData', usersDataString);

                alert('Registration successful!');
                window.location.href = 'login.html';
            }
        });
    }
}

function initializeLogoutListener() {
    const logoutButton = document.querySelector('.logout');

    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault();
            logoutUser();
        });
    }
}

