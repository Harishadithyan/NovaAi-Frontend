import React, { useState } from "react";
import { motion } from "framer-motion";
import Container from "../components/Container";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import logo from "../assets/logo.svg";
import Intro from "../assets/Intro.svg";

// Firebase
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const showMessage = (msg) => alert(msg);

  // 📝 Email Register
  const handleRegister = async () => {
    console.log("REGISTER:", name, email, password);

    if (!name || !email || !password) {
      showMessage("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;

      // 📩 Email verification
      await sendEmailVerification(user);

      // 💾 Save user in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        createdAt: new Date()
      });

      showMessage("Verification email sent! Please login after verifying.");
      navigate("/login");
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      showMessage(err.message);
    }
    setLoading(false);
  };

  // 🔥 Google Register/Login (FIXED)
  const handleGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();

      let res;
      try {
        res = await signInWithPopup(auth, provider);
      } catch (err) {
        // 🔥 fallback (fix COOP issue)
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

      navigate("/home"); // ✅ FIXED
    } catch (err) {
      console.error("GOOGLE REGISTER ERROR:", err);
      showMessage(err.message);
    }
    setLoading(false);
  };

  return (
    <Container padding="p-0">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">

        {/* LEFT FORM */}
        <div className="flex items-center justify-center p-6 bg-primary">
          <motion.div className="w-full max-w-md">
            <Card variant="glass" className="space-y-5 text-white">

              <div className="flex justify-center gap-3">
                <img src={logo} alt="logo" className="w-[100px]" />
                <h2 className="text-3xl mt-7 font-bold text-secondary">Register</h2>
              </div>

              <Input
                label="Name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex flex-col items-center gap-4 w-full">

                {/* Email Register */}
                <Button
                  className="w-full max-w-sm text-lg py-3 flex justify-center items-center"
                  variant="secondary"
                  onClick={handleRegister}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Register"}
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
                  onClick={handleGoogle}
                  disabled={loading}
                >
                  <FaGoogle />
                  Continue with Google
                </Button>

              </div>

              <p className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-secondary">
                  Login
                </Link>
              </p>

            </Card>
          </motion.div>
        </div>

        {/* RIGHT */}
        <div className="hidden md:flex items-center justify-center bg-primary p-10">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-full max-w-[500px]"
          >
            <img src={Intro} alt="" className="w-full" />
          </motion.div>
        </div>

      </div>
    </Container>
  );
}

export default Register;