import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

class Home extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <main>
          <h2>Welcome to the Home Page</h2>
          <p>This is the main content area.</p>
        </main>
        <Footer />
      </div>
    );
  }
}

export default Home;
