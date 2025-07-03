import React from 'react';
import Layout from '../components/Layout';
import styles from '../styles/About.module.css';

const About: React.FC = () => {
  return (
    <Layout
      title="About Us | Your App"
      description="Learn more about our application and the team behind it"
    >
      <div className={styles.container}>
        {/* everything else goes here */}
        <section className={styles.hero}>...</section>
        {/* the rest of your sections */}
      </div>
    </Layout>
  );
};

export default About;