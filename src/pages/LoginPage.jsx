import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const API_URL = "http://203.194.115.157:3000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Menentukan endpoint berdasarkan mode (Login atau Register)
    const endpoint = isRegister ? "/auth/register" : "/auth/login";

    try {
      const res = await axios.post(`${API_URL}${endpoint}`, {
        username,
        password,
      });

      if (!isRegister) {
        // Jika Berhasil LOGIN: Simpan token
        localStorage.setItem("token", res.data.token);
        alert("Login Berhasil!");
        navigate("/home"); // Pindah ke halaman To-Do List
      } else {
        // Jika Berhasil REGISTER
        alert("Register Berhasil! Silakan Login.");
        setIsRegister(false); // Pindah ke form login
        setUsername("");
        setPassword("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan pada server");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: "20px" }}>
          {isRegister ? "Buat Akun Baru" : "Selamat Datang"}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label>Username</label>
            <input
              type="text"
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
            />
          </div>

          {error && <p style={styles.errorText}>{error}</p>}

          <button type="submit" style={styles.button}>
            {isRegister ? "Daftar" : "Masuk"}
          </button>
        </form>

        <p style={styles.footerText}>
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <span
            style={styles.link}
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
          >
            {isRegister ? "Login di sini" : "Daftar di sini"}
          </span>
        </p>
      </div>
    </div>
  );
};

// Styling Sederhana
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f7f6",
  },
  card: {
    width: "350px",
    padding: "40px",
    borderRadius: "12px",
    backgroundColor: "#fff",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: {
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  button: {
    padding: "12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },
  errorText: {
    color: "red",
    fontSize: "13px",
    margin: "0",
  },
  footerText: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#666",
  },
  link: {
    color: "#007bff",
    cursor: "pointer",
    fontWeight: "bold",
    textDecoration: "underline",
  },
};

export default LoginPage;
