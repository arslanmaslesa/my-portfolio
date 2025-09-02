'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function ContactFooter() {
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errors, setErrors] = useState({});
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const subjectRef = useRef(null);

  const validate = () => {
    const err = {};
    const email = (emailRef.current?.value || '').trim();
    const name = (nameRef.current?.value || '').trim();
    const subject = (subjectRef.current?.value || '').trim();

    if (!name) err.name = 'Please enter your name';
    if (!email) err.email = 'Please enter your email';
    else if (!/^\S+@\S+\.\S+$/.test(email)) err.email = 'Enter a valid email';
    if (!subject) err.subject = 'Please enter a reason';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');

    setTimeout(() => {
      if (Math.random() < 0.95) {
        setStatus('success');
        nameRef.current.value = '';
        emailRef.current.value = '';
        subjectRef.current.value = '';
      } else {
        setStatus('error');
      }
    }, 700);
  };

  return (
    <footer className="w-full h-full bg-black text-white py-28 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold mb-12"
        >
          Let's Work
        </motion.h2>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={onSubmit}
          className="grid gap-6"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <input
              ref={nameRef}
              placeholder="Your Name"
              className={`p-4 rounded-lg bg-slate-800 border border-transparent focus:border-indigo-500 outline-none ${
                errors.name ? 'ring-1 ring-red-500' : ''
              }`}
            />
            <input
              ref={emailRef}
              placeholder="Your Email"
              className={`p-4 rounded-lg bg-slate-800 border border-transparent focus:border-indigo-500 outline-none ${
                errors.email ? 'ring-1 ring-red-500' : ''
              }`}
            />
          </div>

          <input
            ref={subjectRef}
            placeholder="Reason / Subject"
            className={`p-4 rounded-lg bg-slate-800 border border-transparent focus:border-indigo-500 outline-none ${
              errors.subject ? 'ring-1 ring-red-500' : ''
            }`}
          />

          <button
            type="submit"
            disabled={status === 'sending'}
            className="bg-indigo-500 hover:bg-indigo-600 transition-colors rounded-lg py-4 font-semibold text-lg disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>

          {status === 'success' && <p className="text-green-400 mt-2">Message sent! ✅</p>}
          {status === 'error' && <p className="text-red-400 mt-2">Something went wrong. ❌</p>}
        </motion.form>

        <p className="mt-12 text-sm text-slate-400">
          © {new Date().getFullYear()} Your Name — Built with ❤️
        </p>
      </div>
    </footer>
  );
}
