class User {
  constructor(username, password, email) {
    this.username = username;
    this.password = password;
    this.email = email;
  }
}

class AuthManager {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('users')) || [];
    this.currentUser = null;
  }

  registerUser(username, password, email) {
    if (this.users.some(user => user.username === username)) {
      throw new Error('Username already exists');
    }

    const newUser = new User(username, this.hashPassword(password), email);
    this.users.push(newUser);
    localStorage.setItem('users', JSON.stringify(this.users));
    return true;
  }

  loginUser(username, password) {
    const user = this.users.find(user => user.username === username);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.password !== this.hashPassword(password)) {
      throw new Error('Invalid password');
    }

    this.currentUser = user;
    return user;
  }

  logoutUser() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  hashPassword(password) {
    // Simple hash simulation (not secure for production)
    return btoa(password);
  }
}

// Initialize auth manager
const auth = new AuthManager();

document.addEventListener('DOMContentLoaded', () => {
  // Registration form handling
  document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const username = document.getElementById('register-username').value;
      const password = document.getElementById('register-password').value;
      const email = document.getElementById('register-email').value;
      
      auth.registerUser(username, password, email);
      alert('Registration successful!');
    } catch (error) {
      alert(error.message);
    }
  });

  // Login form handling
  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      
      const user = auth.loginUser(username, password);
      alert(`Login successful! Welcome ${user.username}`);
    } catch (error) {
      alert(error.message);
    }
  });

  // Logout button handling
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    auth.logoutUser();
    alert('You have been logged out');
  });
});