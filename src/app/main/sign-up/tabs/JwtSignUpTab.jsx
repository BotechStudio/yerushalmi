import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "src/app/auth/user/store/userSlice";
import AuthService from "src/app/auth/services/AuthService";
import jwtDecode from "jwt-decode";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import UserModel from "src/app/auth/user/models/UserModel"; // Import UserModel

function JwtSignUpTab() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      const response = await AuthService.register(username, password);
      const user = jwtDecode(response.token);
      const userModel = UserModel(user); // Create user model with the decoded token
      dispatch(setUser(userModel));
      navigate("/sign-in"); // Redirect to /diamonds after successful sign-up
    } catch (error) {
      console.error("Sign-Up failed", error);
      setError("Sign-Up failed. Please check your details and try again.");
    }
  };

  return (
    <div>
      <Typography className="mb-24" variant="h6">
        Sign up with JWT
      </Typography>
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        variant="outlined"
        fullWidth
        className="mb-16"
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        variant="outlined"
        fullWidth
        className="mb-16"
      />
      {error && (
        <Typography color="error" className="mb-16">
          {error}
        </Typography>
      )}
      <Button variant="contained" color="primary" onClick={handleSignUp}>
        Sign Up
      </Button>
    </div>
  );
}

export default JwtSignUpTab;
