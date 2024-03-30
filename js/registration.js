// register.js

const registerForm = document.getElementById('register-form');
const trainerIdInput = document.getElementById('trainer-id');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const ignInput = document.getElementById('ign');
const errorDisplay = document.createElement('p');

function generateTrainerId() {
  let trainerId = '';
  for (let i = 0; i < 4; i++) {
    trainerId += Math.floor(Math.random() * 10000).toString().padStart(4, '0') + ' ';
  }
  trainerIdInput.value = trainerId.trim();
}

generateTrainerId();

function showError(message) {
  errorDisplay.textContent = message;
  errorDisplay.style.color = 'red';
  registerForm.insertBefore(errorDisplay, registerForm.firstChild);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password.length >= 8;
}

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
    const userDataString = `${emailInput.value},${passwordInput.value},${trainerIdInput.value},${ignInput.value}`;

    // Add new user data to the existing string
    if (usersDataString) {
      usersDataString += `;${userDataString}`;
    } else {
      usersDataString = userDataString;
    }

    // Save the updated string back to localStorage
    localStorage.setItem('usersData', usersDataString);

    alert('Registration successful!');
    window.location.href = 'login.html';
  }
});