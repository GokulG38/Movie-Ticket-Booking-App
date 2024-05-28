
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import checkGuest from '../../utils/checkGuest';
import { handleSignup } from '../../utils/Authentication';

function SignUpForm() {
    const navigate = useNavigate();
    const [input, setInput] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setInput((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { name, email, password } = input;
        if (!name || !email || !password) {
            setError("Please fill in all fields");
            return;
        }
        setError(""); 
        handleSignup(input)
            .then(() => navigate("/login"))
            .catch((err) => setError(err.message));
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="rounded-lg bg-white p-4 shadow" style={{ maxWidth: '400px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <h4><b>Sign Up</b></h4>
                        <p className="text-secondary">Please fill in this form to create an account</p>
                        
                        <div className="form-group">
                            <input type="text" value={input.name} onChange={handleChange} name="name" className="form-control mt-3" placeholder="Name" />
                        </div>
                        
                        <div className="form-group">
                            <input type="email" value={input.email} onChange={handleChange} name='email' className="form-control mt-3" placeholder="Email" />
                        </div>
                        
                        <div className="form-group">
                            <input type="password" value={input.password} onChange={handleChange} name='password' className="form-control mt-3" placeholder="Password" />
                        </div>

                        <div className="row justify-content-center mt-4">
                            <button type="submit" className="btn btn-info col-6">Sign Up</button>
                        </div>

                    </div>
                </form>

                {error && (
                    <div className="text-danger text-center mt-3">
                        {error}
                    </div>
                )}

                <div className="text-center mt-3">
                    Already have an account? <Link to="/login" className="text-info"><u>Login here</u></Link> 
                </div>

                <div className="text-center mt-3">
                    <Link to="/" className="text-info"><u>Home</u></Link> 
                </div>
            </div>
        </div>
    );
}

export default checkGuest(SignUpForm);
