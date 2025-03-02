document.addEventListener('DOMContentLoaded', function() {
    // Get the login form
    const loginForm = document.getElementById('loginForm');
    
    // Add event listener for form submission
    loginForm.addEventListener('submit', function(event) {
        // Prevent default form submission
        event.preventDefault();
        
        // Get input values
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // For demonstration purposes - hardcoded credentials
        // In a real application, this would validate against a server
        const validUsername = 'admin';
        const validPassword = 'password123';
        
        // Check if credentials are valid
        if (username === validUsername && password === validPassword) {
            // Success - redirect to home page
            window.location.href = 'home.html'; // change to your actual home page
            
            // Optional: Store login status in sessionStorage
            sessionStorage.setItem('loggedIn', 'true');
        } else {
            // Failed login - show error message
            showErrorMessage('Invalid username or password');
        }
    });
    
    // Function to display error message
    function showErrorMessage(message) {
        // Check if error message already exists
        let errorElement = document.getElementById('login-error');
        
        // If not, create it
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'login-error';
            errorElement.className = 'alert alert-danger mt-3';
            loginForm.parentNode.insertBefore(errorElement, loginForm.nextSibling);
        }
        
        // Set the error message
        errorElement.textContent = message;
    }
});