import React, {useEffect, useState} from 'react';
import axios from "axios";

//UI of Gateway List
function GatewayList() {
    const [gateways, setGateways] = useState([]);

    const config = {
        headers: {
            "Content-Type": "application/json" // Use standard JSON content type
        }
    };
    useEffect(() => {
        const adminId = localStorage.getItem('admin_id');

        const gate_list_url = `http://localhost:8000/api/gateway-lists/?admin_id=${adminId}`;
        // Fetch gateways data from the backend API
        axios
            .get(gate_list_url, config)
            .then((response) => {
                setGateways(response.data);
            })
            .catch((error) => {
                console.error('Error fetching gateways:', error);
            });
    }, []);

    //Formatting of Antenna
    const formatAnt = (antenna) => {
        let formattedAntenna = parseFloat(antenna).toFixed(2);

        if (formattedAntenna.endsWith('.00')) {
            formattedAntenna = formattedAntenna.slice(0, -3)
        }

        return `${formattedAntenna}`;
    };

    //Formatting of latitude and longitude
    const formatLatitudeLongitude = (latitude, longitude) => {
        let formattedLatitude = parseFloat(latitude).toFixed(2);
        let formattedLongitude = parseFloat(longitude).toFixed(2);

        if (formattedLatitude.endsWith('.00')) {
            formattedLatitude = formattedLatitude.slice(0, -3)
        }
        if (formattedLongitude.endsWith('.00')) {
            formattedLongitude = formattedLongitude.slice(0, -3)
        }

        return `${formattedLatitude}, ${formattedLongitude}`;
    };

    //UI of List of gatweways for Operator
    return (
        <div>
            <p style={{paddingLeft: 20}}> Operator Logged IN: {localStorage.getItem("username")}</p>
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
    );
}


export default GatewayList;