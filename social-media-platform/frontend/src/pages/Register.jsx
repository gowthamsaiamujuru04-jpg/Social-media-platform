import { useState } from "react";
import axios from "axios";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password,
        }
      );

      setMessage(response.data.message);

      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Registration failed"
      );
    }
  };

  const success = message.toLowerCase().includes("success");

  return (
    <div
      style={{
        maxWidth: "450px",
        margin: "20px auto",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "#1877f2",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            margin: "0 auto 15px",
          }}
        >
          🌐
        </div>

        <h2 style={{ marginBottom: "8px" }}>
          Create Account
        </h2>

        <p
          style={{
            color: "#65676b",
            margin: 0,
          }}
        >
          Join SocialConnect and start connecting
        </p>
      </div>

      <form onSubmit={handleRegister}>
        <label
          style={{
            display: "block",
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          Full Name
        </label>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            maxWidth: "100%",
          }}
        />

        <label
          style={{
            display: "block",
            fontWeight: "600",
            marginTop: "18px",
            marginBottom: "8px",
          }}
        >
          Email
        </label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            maxWidth: "100%",
          }}
        />

        <label
          style={{
            display: "block",
            fontWeight: "600",
            marginTop: "18px",
            marginBottom: "8px",
          }}
        >
          Password
        </label>

        <input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            maxWidth: "100%",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            marginTop: "22px",
            padding: "12px",
            fontSize: "15px",
          }}
        >
          🚀 Create Account
        </button>
      </form>

      {message && (
        <div
          style={{
            marginTop: "18px",
            padding: "12px",
            borderRadius: "8px",
            background: success ? "#e7f7ed" : "#fdeaea",
            color: success ? "#1e7e34" : "#c0392b",
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default Register;