import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (response.ok) {
        setToast({ message: 'Login successful!', type: 'success' });
        const data = await response.json();
        setUser(data.user);
        navigate('/books');
      } else {
        const errorData = await response.json();
        setToast({ message: errorData.error || 'Failed to login', type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setToast({ message: 'Failed to login', type: 'error' });
    }
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  return (
    <div>
      <h2>Login</h2>
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
      <button onClick={handleLogin}>Login</button>
      {toast && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}
    </div>
  );
};

export default Login;
