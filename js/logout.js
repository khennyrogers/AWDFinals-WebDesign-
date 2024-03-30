function logout() {
    localStorage.removeItem('CurrentLogin');
    alert("LOG OUT SUCCESSFULLY");
    window.location.href = 'index.html';
}
