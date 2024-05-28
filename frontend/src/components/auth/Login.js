import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  sendAdminLogRequest,
  sendUserLogRequest,
} from "../../utils/Authentication";
import { login as adminLogin } from "../store/adminSlice";
import { login as userLogin } from "../store/userSlice";
import { useNavigate, Link } from "react-router-dom";
import checkGuest from "../../utils/checkGuest";

const LoginForm = ({ user }) => {
  const isAdmin = user === "admin";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAdminLogData = (data) => {
    sendAdminLogRequest(data.inputs)
      .then((res) => {
        dispatch(adminLogin());
        localStorage.removeItem("userId");
        localStorage.removeItem("userToken");
        localStorage.setItem("adminId", res.id);
        localStorage.setItem("adminToken", res.token);
        navigate("/");
      })
      .catch((err) => setError("Invalid email or password"));
  };

  const handleUserLogData = (data) => {
    sendUserLogRequest(data.inputs)
      .then((res) => {
        dispatch(userLogin());
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminToken");
        localStorage.setItem("userId", res.id);
        localStorage.setItem("userToken", res.token);
        navigate("/");
      })
      .catch((err) => setError("Invalid email or password"));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const { email, password } = inputs;
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setError("");

    if (isAdmin) {
      handleAdminLogData({ inputs });
    } else {
      handleUserLogData({ inputs });
    }

    setInputs({
      email: "",
      password: "",
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div
        className="rounded-lg bg-white p-4 shadow"
        style={{ maxWidth: "400px" }}
      >
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <h4>
              <b>{isAdmin ? "Admin Login" : "User Login"}</b>
            </h4>
            <p className="text-secondary">
              Please enter your email and password to log in
            </p>

            <div className="form-group">
              <input
                type="email"
                className="form-control mt-3"
                placeholder="Email"
                name="email"
                value={inputs.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                className="form-control mt-3"
                placeholder="Password"
                name="password"
                value={inputs.password}
                onChange={handleChange}
              />
            </div>

            <div className="row justify-content-center mt-4">
              <button type="submit" className="btn btn-info col-6">
                Login
              </button>
            </div>
          </div>
        </form>
        <div className="text-center">
          {error && <div className="text-danger ml-2">{error}</div>}
        </div>

        {!isAdmin && (
          <div className="text-center mt-3">
            Don't have an account?{" "}
            <Link to="/signup" className="text-info no-underline">
              Sign up here
            </Link>
          </div>
        )}

        <div className="mt-3 text-left">
          <Link to="/" className="text-info no-underline">
            {"<< Home"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default checkGuest(LoginForm);
