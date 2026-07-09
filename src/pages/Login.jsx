import React, { useState } from 'react';
import { authService } from '../api/services';
import { useAuth } from '../context/AuthContext';

const Login = ({ onSwitchToSignup }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.signin(form);
      login(res.data);
      alert('로그인되었습니다.');
    } catch (err) {
      alert('아이디 또는 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-8 text-blue-600 font-sans">로그인</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="아이디" 
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setForm({...form, username: e.target.value})}
          />
          <input 
            type="password" placeholder="비밀번호" 
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setForm({...form, password: e.target.value})}
          />
          <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700">로그인</button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          계정이 없으신가요? <button onClick={onSwitchToSignup} className="text-blue-600 font-bold">회원가입</button>
        </p>
      </div>
    </div>
  );
};

export default Login;