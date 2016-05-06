import React, { Component, PropTypes } from 'react';
import styles from '../styles/main.css';

const Logout = () => (
  <div>
    <div className={styles.login}>
      <form action="http://127.0.0.1:1337/logout">
        <input type="submit" className={styles.button} value="Logout" />
      </form>
    </div>
  </div>
);

export default Logout
