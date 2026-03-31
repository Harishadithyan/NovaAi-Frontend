import React, { useState } from "react";
import { motion } from "framer-motion";
import Container from "../components/Container";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";
// import resetIllustration from "../assets/reset.svg"; // your custom illustration

// Firebase
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

function PasswordReset() {
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
      setEmail("");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <Container padding="p-0">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        
        {/* LEFT SIDE - FORM */}
        <div className="flex items-center justify-center p-6 bg-primary">
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Card variant="glass" className="space-y-5 text-white">
              <div className="flex flex-col items-center gap-3 mb-6">
                <img
                  src={logo}
                  alt="Nova AI"
                  className="w-[110px] object-contain drop-shadow-[0_0_8px_#08CB00] mt-2"
                />
                <h2 className="text-3xl font-bold text-secondary">Reset Password</h2>
                <p className="text-center text-gray-400 text-sm">
                  Enter your email to receive a password reset link.
                </p>
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                className="w-full text-lg py-3"
                variant="secondary"
                onClick={handleReset}
              >
                Send Reset Link
              </Button>

              <p className="text-center text-sm text-gray-500">
                Remembered your password?
                <span className="text-secondary ml-1 cursor-pointer">
                  <Link to="/login">Login</Link>
                </span>
              </p>
            </Card>
          </motion.div>
        </div>

        {/* RIGHT SIDE - Custom Illustration */}
        <div className="hidden md:flex items-center justify-center bg-primary text-white p-10 relative overflow-hidden">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-full max-w-[420px] md:max-w-[500px] lg:max-w-[600px] aspect-square flex items-center justify-center"
          >
            <img
              src={logo}
              alt="Password Reset Illustration"
              className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(8,203,0,0.6)]"
            />
          </motion.div>
        </div>

      </div>
    </Container>
  );
}

export default PasswordReset;