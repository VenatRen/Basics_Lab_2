import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setToast({ message: 'Registration successful! Logging in...', type: 'success' });
        const loginResponse = await fetch('http://localhost:8000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          console.log(loginData);
          navigate('/books');
        } else {
          const loginErrorData = await loginResponse.json();
          setToast({ message: loginErrorData.error || 'Failed to login', type: 'error' });
        }
      } else {
        setToast({ message: data.error || 'Failed to register', type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setToast({ message: 'Failed to register', type: 'error' });
    }
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  return (
    <div>
      <h2>Register</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
      {toast && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}
    </div>
  );
};

export default Register;
