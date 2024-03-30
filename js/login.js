document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Function to check if the entered email and password match any stored user data
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
            return { email: storedEmail, password: storedPassword, trainerId: storedTrainerId, ign: storedIgn };
        } else {
            return null;
        }
    }

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
});
