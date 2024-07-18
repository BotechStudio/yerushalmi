import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "src/app/auth/user/store/userSlice";
import AuthService from "src/app/auth/services/AuthService";
import jwtDecode from "jwt-decode";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

function JwtSignInTab() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await AuthService.login(username, password);
      const user = jwtDecode(response.token);
      dispatch(setUser(user));
      navigate("/diamonds"); // Redirect to /diamonds after successful login
    } catch (error) {
      console.error("Login failed", error);
      setError("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div>
      <Typography className="mb-24" variant="h6">
        Sign in with JWT
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
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Sign In
      </Button>
    </div>
  );
}

export default JwtSignInTab;
