import React, {useEffect, useState} from 'react';
import axios from "axios"; // Import the GridView component
import {useQuery, useQueryClient} from 'react-query';

const config = {
    headers: {
        "Content-Type": "application/json" // Use standard JSON content type
    }
};
//Admin Control Screen

function AdminControl({userType}) {
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const queryClient = useQueryClient();

    //Delete Gateway or Create Administrator
    const submit = () => {
        if (username.trim() === '') {
            // Display an error message if the username is empty
            setErrorMessage(`${userType} fields cannot be empty`);
        } else {
            // Clear any previous error message
            setErrorMessage('');
            //   this.props.history.push(AdminAccess());
            switch (userType) {
                case 'Gateway':
                    gateway_delete_action()
                    break
                default:
                    create_operator_action()
            }
            // Handle login logic here (e.g., send username to the server)
        }
    };

    //Delete Gateway Action
    const gateway_delete_action = async () => {
        // Assuming 'username' contains the location_name you want to delete
// Construct the URL with the 'location_name' as a query parameter
        const url = `http://localhost:8000/api/delete-gateway/?location_name=${username}`;

// Make the DELETE request
        axios
            .delete(url, config)
            .then(async (response) => {
                console.log(response.data.message);
                alert(response.data.message)
                await queryClient.invalidateQueries('fetchList');
                // Handle data
            })
            .catch((error) => {
                console.log(error);
                alert(error.response.data['message'])
            })
    }

    //Create Operator Action
    const create_operator_action = () => {
        const data = {
            username: username,
            admin_username: localStorage.getItem("username")
        };
        axios
            .post('http://localhost:8000/api/create-operator/', JSON.stringify(data), config)
            .then(async (response) => {
                console.log(response.data);
                alert(response.data.message)
                await queryClient.invalidateQueries('fetchList');
                // Handle data
            })
            .catch((error) => {
                console.log(error);
                alert(error.response.data['message'])
            })
    }

    //Action button title of gateway/operator
    const getLoginTitle = () => {
        switch (userType) {
            case 'Gateway':
                return 'Delete the Gateway?';
            default:
                return 'Create an operator';
        }
    };

    //Placeholder Textinput title of gateway/operator
    const getPlc = () => {
        switch (userType) {
            case 'Gateway':
                return `Location name`;
            default:
                return `Operator username`;
        }
    };

    //title of gateway/operator
    const geth2title = () => {
        console.log(userType + "Selected")
        switch (userType) {
            case 'Gateway':
                return `Gateway Deletion`;
            default:
                return `Operator Creation`;
        }
    };

    //Single UI of Deleting gateway or create operator Handling
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
            <button style={{margin: '10px 24px'}} onClick={submit}>{getLoginTitle()}</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
}

//UI of Creating or updating gateway
function GatewayForm({userType}) {
    const [location_name, setLocation] = useState('');
    const [antenna_dia, setAntenna] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longtitude, setLongtitude] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const config = {
        headers: {
            "Content-Type": "application/json" // Use standard JSON content type
        }
    };
    const queryClient = useQueryClient();
    const insert_gat = () => {
        create_update_gateway(false)
    };

    const update_gat = () => {
        create_update_gateway(true)
    };

    const create_update_gateway = (isUpdate) => {
        if (longtitude.trim() === '' || latitude.trim() === '' || location_name === '' || antenna_dia === '') {
            // Display an error message if the fields are empty
            setErrorMessage(`fields cannot be empty`);
        } else {
            // Clear any previous error message
            setErrorMessage('');
        }
        const data = {
            antenna_diameter: antenna_dia,
            location_name: location_name,
            latitude: latitude,
            longitude: longtitude,
            admin_id: localStorage.getItem("id"),
            create_update: isUpdate
        };

        //Creating or updating gateway method and then using invalidating to reload the list of gateways
        axios
            .post('http://localhost:8000/api/create-gateway/', JSON.stringify(data), config)
            .then(async (response) => {
                let alert_str = "Gateway created successfully";
                if (isUpdate) {
                    alert_str = "Gateway updated successfully"
                }
                await queryClient.invalidateQueries('fetchList');
                alert(alert_str)
                // Handle data
            })
            .catch((error) => {
                console.log(error);
                alert(error.response.data['message'])
            })
    }

    // Text input for the gateway
    return (
        <div className="login-form">
            <h2>Gateway Creation and Updation</h2>
            <input
                type="text"
                placeholder="Antenna diameter"
                value={antenna_dia}
                onChange={(e) => setAntenna(e.target.value)}
                className="text-input"
            />
            <input
                type="text"
                placeholder="Location name"
                value={location_name}
                onChange={(e) => setLocation(e.target.value)}
                className="text-input"
            />
            <input
                type="text"
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="text-input"
            />
            <input
                type="text"
                placeholder="Longtitude"
                value={longtitude}
                onChange={(e) => setLongtitude(e.target.value)}
                className="text-input"
            /><p></p>
            <button style={{margin: '10px 24px'}} onClick={insert_gat}>{"Insert"}</button>
            <button style={{margin: '10px 24px'}} onClick={update_gat}>{"Update"}</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
}


//Method of list of gateways and operators
function AdminAccess() {
    const [gateways, setGateways] = useState([]);
    const [operators, setOperators] = useState([]);


    useEffect(() => {
        fetchList()
    }, []);

    //Fetch of list of gateways and operators
    const fetchList = () => {
        const adminId = localStorage.getItem('id');

        const gate_list_url = `http://localhost:8000/api/gateway-lists/?admin_id=${adminId}`;
        const op_list_url = `http://localhost:8000/api/operator-lists/?admin_id=${adminId}`;

        // Fetch gateways data from the backend API
        axios
            .get(gate_list_url, config)
            .then((response) => {
                setGateways(response.data);
            })
            .catch((error) => {
                console.error('Error fetching gateways:', error);
            });

        axios
            .get(op_list_url, config)
            .then((response) => {
                setOperators(response.data);
            })
            .catch((error) => {
                console.error('Error fetching operators:', error);
            });
    }

    //Fetch of list of gateways and operators when
    // creation of uperator or deletion of gateway is done
    const {data, isLoading, isError} = useQuery('fetchList', fetchList, {
        refetchOnWindowFocus: false,
    });

    //Formating the display of latitude and longitude
    const formatLatitudeLongitude = (latitude, longitude) => {
        const formattedLatitude = parseFloat(latitude).toFixed(2);
        const formattedLongitude = parseFloat(longitude).toFixed(2);

        if (formattedLatitude.endsWith('.00')) {
            return `${formattedLatitude.slice(0, -3)}, ${formattedLongitude.slice(0, -3)}`;
        }

        return `${formattedLatitude}, ${formattedLongitude}`;
    };

    //Formating the display of Antenna
    const formatAnt = (antenna) => {
        let formattedAntenna = parseFloat(antenna).toFixed(2);

        if (formattedAntenna.endsWith('.00')) {
            formattedAntenna = formattedAntenna.slice(0, -3)
        }

        return `${formattedAntenna}`;
    };

    //3 forms of input and 2 list UI
    return (
        <div>
            <p style={{paddingLeft: 20}}> Admin Logged IN: {localStorage.getItem("username")}</p>
            <div className="left-container">
                <AdminControl userType="Operator"/>
                <AdminControl userType='Gateway'/>
                <GatewayForm userType="Operator"/>
            </div>
            <div>
                <div style={{paddingLeft: 20, display: "flex", flexDirection: "row", marginTop: -420}}>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <p>List of Operators</p>
                        {operators.map((item) => (
                            <div>{item.username}</div>
                        ))}
                    </div>
                    <div style={{paddingLeft: 220, display: "flex", flexDirection: "column"}}>
                        <p>List of Gateways</p>
                        <div className="gateway-list">
                            <table>
                                <thead>
                                <tr>
                                    <th>Antenna</th>
                                    <th>Location</th>
                                    <th>Lat and Long</th>
                                </tr>
                                </thead>
                                <tbody>
                                {gateways.map((gateway, index) => (
                                    <tr key={index} className="gateway-row">
                                        <td>{formatAnt(gateway.antenna_diameter)}</td>
                                        <td>{gateway.location_name}</td>
                                        <td>{formatLatitudeLongitude(gateway.latitude, gateway.longitude)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminAccess;