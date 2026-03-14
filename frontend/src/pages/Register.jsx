import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../utils/auth";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    state: "",
    country: "",
    profilePic: "",
  });

  const handleChange = (e) => {
    if (e.target.name === "profilePic") {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setForm({ ...form, profilePic: reader.result });
      };

      reader.readAsDataURL(file);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = () => {
    const result = registerUser(form);

    if (!result.success) {
      alert(result.message);
      return;
    }

    alert("Registration successful!");
    navigate("/login");
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Card sx={{ width: 450 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" mb={3}>
            Create Account
          </Typography>

          <TextField name="name" label="Name" fullWidth margin="normal" onChange={handleChange} />
          <TextField name="email" label="Email" fullWidth margin="normal" onChange={handleChange} />
          <TextField name="password" label="Password" type="password" fullWidth margin="normal" onChange={handleChange} />
          <TextField name="phone" label="Phone Number" fullWidth margin="normal" onChange={handleChange} />
          <TextField name="city" label="City" fullWidth margin="normal" onChange={handleChange} />
          <TextField name="state" label="State" fullWidth margin="normal" onChange={handleChange} />
          <TextField name="country" label="Country" fullWidth margin="normal" onChange={handleChange} />

          <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
            Upload Profile Picture
            <input type="file" hidden name="profilePic" onChange={handleChange} />
          </Button>

          <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={handleSubmit}>
            Register
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Register;