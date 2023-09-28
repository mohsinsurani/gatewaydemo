import './App.css';

import React, {useEffect, useState} from "react";

import {Switch, Route, useNavigate} from 'react-router-dom';
import axios from "axios";

function LoginForm({userType}) {
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const data = {
        username: username
    };

    // const config of json type for axios
    const config = {
        headers: {
            "Content-Type": "application/json" // Use standard JSON content type
        }
    };

    // Placeholder set according to type
    const getPlc = () => {
        switch (userType) {
            case 'Admin':
                return `Admin Username`;
            case 'Operator':
                return `Operator Username`;
            default:
                return `Administrator`;
        }
    };

    // title set according to type
    const geth2title = () => {
        switch (userType) {
            case 'Admin':
                return `Administrator Login`;
            case 'Operator':
                return `Operator Login`;
            default:
                return `Create`;
        }
    };

    //Login Button title set according to type
    const getLoginTitle = () => {
        switch (userType) {
            case 'Admin':
                return `Login as Admin`;
            case 'Operator':
                return `Login as Operator`;
            default:
                return `Create an Administrator`;
        }
    };

    //Submit Action Login method
    const setActionSubmit = () => {
        switch (userType) {
            case 'Admin':
                handleAdminLogin();
                break;
            case 'Operator':
                handleOperatorLogin();
                break;
            default:
                handlecreateAdmin().then();
        }
    };

    //Admin Login method
    const handleAdminLogin = () => {
        const user_type_login = "1"
        data['user_type'] = user_type_login
        if (username.trim() === '') {
            // Display an error message if the username is empty
            setErrorMessage('Username cannot be empty');
        } else {
            // Clear any previous error message
            setErrorMessage('');
            axios
                .post('http://localhost:8000/api/user-login/', JSON.stringify(data), config)
                .then((response) => {
                    console.log(response.data);
                    saveLocally(response.data, user_type_login)
                    navigate("admin");
                    // Handle data
                })
                .catch((error) => {
                    console.log(error);
                })
            //   this.props.history.push(AdminAccess());

            // Handle login logic here (e.g., send username to the server)
            console.log(`Logging in as ${userType} with username: ${username}`);
        }
    };

    //Save User data locally in react js
    const saveLocally = (resp, user_type) => {
        localStorage.setItem('username', resp.username);
        localStorage.setItem('user_type', user_type);
        localStorage.setItem('id', resp.id);
        if ('admin_id' in resp) {
            localStorage.setItem('admin_id', resp.admin_id);
        }
    };

    //Operator Login method
    const handleOperatorLogin = () => {
        const user_type_login = "2"
        data['user_type'] = user_type_login
        if (username.trim() === '') {
            // Display an error message if the username is empty
            setErrorMessage('Username cannot be empty');
        } else {
            // Clear any previous error message
            setErrorMessage('');
            axios
                .post('http://localhost:8000/api/user-login/', JSON.stringify(data), config)
                .then((response) => {
                    saveLocally(response.data, user_type_login)
                    navigate("gateway");
                    // Handle data
                })
                .catch((error) => {
                    console.log(error);
                })

            // Handle login logic here (e.g., send username to the server)
            console.log(`Logging in as ${userType} with username: ${username}`);
        }
    };

    //Admin creation method
    const handlecreateAdmin = async () => {
        const user_type_login = "1"
        axios
            .post('http://localhost:8000/api/create-admin/', JSON.stringify(data), config)
            .then((response) => {
                saveLocally(response.data.data, user_type_login)
                navigate("admin");
            })
            .catch((error) => {
                console.log(error);
                if (error.response.data.message != null) {
                    alert(error.response.data.message)
                } else {
                    alert(error.message)
                }
            })
    };
    return (
        <div className="login-form">
            <h2>{geth2title()}</h2>
            <input
                type="text"
                placeholder={getPlc()}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-input"
            />
            <button onClick={setActionSubmit}>{getLoginTitle()}</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
}

//Handles 3 textboxes for login and create
function App() {
    return (
        <div className="center-container">
            <LoginForm userType="Admin"/>
            <LoginForm userType="Operator"/>
            <LoginForm userType="CreateAdmin"/>
        </div>
    );
}

export default App;

