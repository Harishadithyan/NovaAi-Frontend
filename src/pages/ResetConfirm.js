import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  confirmPasswordReset,
  verifyPasswordResetCode
} from "firebase/auth";
import { auth } from "../firebase";

import Container from "../components/Container";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";

function ResetConfirm() {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔍 Verify reset link
  useEffect(() => {
    const checkCode = async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setValid(true);
      } catch (err) {
        setValid(false);
      } finally {
        setLoading(false);
      }
    };

    if (oobCode) checkCode();
  }, [oobCode]);

  // 🔐 Update password
  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, password);
      alert("Password updated successfully!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Try again.");
    }
  };

  // ⏳ Loading state
  if (loading) {
    return (
      <p className="text-white text-center mt-10">
        Verifying reset link...
      </p>
    );
  }

  // ❌ Expired / Invalid link UI
  if (!valid) {
    return (
      <Container padding="p-0">
        <div className="flex items-center justify-center min-h-screen bg-primary p-6">
          <Card className="text-center text-white space-y-4">
            <h2 className="text-2xl font-bold text-red-400">
              Link Expired or Invalid
            </h2>
            <p className="text-gray-400">
              This password reset link is no longer valid.
            </p>

            <Button
              className="w-full"
              variant="secondary"
              onClick={() => navigate("/reset-password")}
            >
              Request New Link
            </Button>
          </Card>
        </div>
      </Container>
    );
  }

  // ✅ Valid link UI
  return (
    <Container padding="p-0">
      <div className="flex items-center justify-center min-h-screen bg-primary p-6">
        <Card variant="glass" className="space-y-5 text-white w-full max-w-md">

          <h2 className="text-3xl font-bold text-secondary text-center">
            Set New Password
          </h2>

          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            className="w-full text-lg py-3"
            variant="secondary"
            onClick={handleUpdatePassword}
          >
            Update Password
          </Button>

        </Card>
      </div>
    </Container>
  );
}

export default ResetConfirm;