import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error: null,
      loading: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const { username, password } = this.state;
    this.setState({ loading: true, error: null });
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      const data = await response.json();
      // Handle successful login, e.g., redirect or store token
      console.log('Login successful:', data);
    } catch (err) {
      this.setState({ error: err.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { username, password, error, loading } = this.state;
    return (
      <div>
        <Header />
        <main>
          <h2>Login</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={this.handleSubmit}>
            <div>
              <label>
                Username:
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={this.handleChange}
                  required
                />
              </label>
            </div>
            <div>
              <label>
                Password:
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={this.handleChange}
                  required
                />
              </label>
            </div>
            <div>
              <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </main>
        <Footer />
      </div>
    );
  }
}

export default Login;
