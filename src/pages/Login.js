import React, { useState } from "react";
import { motion } from "framer-motion";
import Container from "../components/Container";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import logo from "../assets/logo.svg";
import Intro1 from "../assets/Intro.png";

// Firebase
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const showMessage = (msg) => alert(msg);

  // 🔐 Email Login
  const handleLogin = async () => {
    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);

    if (!email || !password) {
      showMessage("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;

      if (!user.emailVerified) {
        showMessage("Please verify your email before login.");
        setLoading(false);
        return;
      }

      navigate("/"); 
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      showMessage(err.message);
    }
    setLoading(false);
  };

  // 🔥 Google Login (FIXED)
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();

      let res;
      try {
        res = await signInWithPopup(auth, provider);
      } catch (err) {
        // 🔥 fallback for COOP issue
        await signInWithRedirect(auth, provider);
        return;
      }

      const user = res.user;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          createdAt: new Date()
        });
      }

      navigate("/"); // ✅ FIXED
    } catch (err) {
      console.error("GOOGLE ERROR:", err);
      showMessage(err.message);
    }
    setLoading(false);
  };

  return (
    <Container padding="p-0">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">

        {/* LEFT */}
        <div className="hidden md:flex items-center justify-center bg-primary p-10 relative">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-full max-w-[500px]"
          >
            <img src={Intro1} alt="" className="w-full" />
          </motion.div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-center p-6 bg-primary">
          <motion.div className="w-full max-w-md">
            <Card variant="glass" className="space-y-5 text-white">

              <div className="flex justify-center gap-3">
                <img src={logo} alt="logo" className="w-[100px]" />
                <h2 className="text-3xl font-bold text-secondary">Login</h2>
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* BUTTON SECTION */}
              <div className="flex flex-col items-center gap-4 w-full">

                {/* Email Login */}
                <Button
                  className="w-full max-w-sm text-lg py-3 flex justify-center items-center"
                  variant="secondary"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Login"}
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-2 w-full max-w-sm">
                  <div className="flex-1 h-px bg-gray-600"></div>
                  <span className="text-sm text-gray-400">OR</span>
                  <div className="flex-1 h-px bg-gray-600"></div>
                </div>

                {/* Google */}
                <Button
                  className="w-full max-w-sm text-lg py-3 flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-200"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <FaGoogle />
                  Continue with Google
                </Button>

              </div>

              <p className="text-center text-sm">
                <Link to="/reset-password" className="text-secondary">
                  Forgot Password?
                </Link>
              </p>

              <p className="text-center text-sm">
                Don’t have an account?{" "}
                <Link to="/register" className="text-secondary">
                  Sign up
                </Link>
              </p>

            </Card>
          </motion.div>
        </div>

      </div>
    </Container>
  );
}

export default Login;