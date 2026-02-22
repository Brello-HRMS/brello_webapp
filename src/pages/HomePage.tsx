import styles from './HomePage.module.scss';

const HomePage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to Brello</h1>
      <p className={styles.description}>A production-ready scalable web application.</p>
    </div>
  );
};

export default HomePage;
