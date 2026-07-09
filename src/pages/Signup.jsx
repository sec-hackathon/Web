// relief-hub/src/pages/Signup.jsx
import React, { useState } from 'react';
import { authService } from '../api/services';
import { useAuth } from '../context/AuthContext';

const Signup = ({ onSwitchToLogin }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.signup(form);
      alert(res.data.message);
      login(res.data); // 가입 성공 시 자동 로그인 처리
    } catch (err) {
      alert('회원가입에 실패했습니다. 정보를 확인해주세요.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-8 text-blue-600">회원가입</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="아이디" required
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setForm({...form, username: e.target.value})}
          />
          <input 
            type="password" placeholder="비밀번호" required
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setForm({...form, password: e.target.value})}
          />
          <input 
            type="email" placeholder="이메일 (test@example.com)" required
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setForm({...form, email: e.target.value})}
          />
          <input 
            type="tel" placeholder="전화번호 (01012345678)" required
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setForm({...form, phone: e.target.value})}
          />
          <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700">가입하기</button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          이미 계정이 있으신가요? <button onClick={onSwitchToLogin} className="text-blue-600 font-bold">로그인</button>
        </p>
      </div>
    </div>
  );
};

export default Signup;