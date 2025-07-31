import React, {useState} from 'react';
import axios from 'axios';

const Signup = () => {
  
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/auth/signup', {
                first_name: firstName,
                last_name: lastName,
                email : email,
                password: password,
                is_admin: isAdmin ? 1 : 0
            });
            console.log('Signup successful:', response.data);
            alert('Signup successful!');
        } catch (error) {
            console.error('Signup failed:', error.response ? error.response.data.message : error.message);
            alert('Signup failed.' + (error.response ? ` ${error.response.data.message}` : ' Please try again.'));
        }
    }
  
    return (
    <div>
        <h1>Signup</h1>
        <form onSubmit={handleSignup}>
            <div>
                <label>First Name:</label>
                <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Last Name:</label>
                <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Signup</button>
        </form>
    </div>
  )
}

export default Signup;