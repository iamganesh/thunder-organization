import {Navbar,Nav} from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import firebase from '../firebase';
import icon from '../assets/earth.png';
import avatar from '../assets/avatar_2x.png'
import { useEffect, useState } from "react";
import BModal from "./BModal";
import { useAuth } from "../contexts/AuthContext";
import '../styles/TopNav.css';

const TopNav = () => {
    const [show, setShow] = useState(false);
    const [profilePic, setProfilePic] = useState<any>(avatar);
    const { currentUser }:any = useAuth();

    useEffect(()=>{
        if(currentUser?.photoURL){
          setProfilePic(currentUser.photoURL);
        }
    },[]);

    const history = useHistory();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleLogout = () => {
        setShow(false);
        firebase.auth().signOut();
    }
    return(
      <>
        <BModal display={show} close={handleClose} logout={handleLogout}/>
        <Navbar expand="lg" className="bg-white mb-4 fixed-top shadow">
            <Navbar.Brand onClick={() => history.push("/")}>
                <img
                    src={icon}
                    width="40"
                    height="30"
                    className="d-inline-block align-top brand-logo-cus"
                    alt="logo"
                />
                <span style={{fontWeight:'bold'}} className="text-primary">Thunder Organization</span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link onClick={() => history.push("/")}>Dashboard</Nav.Link>
                    <Nav.Link onClick={() => history.push("/accounts")}>User Accounts</Nav.Link>
                    <Nav.Link onClick={() => history.push("/transactions")}>All Transactions</Nav.Link>
                    <Nav.Link onClick={() => history.push("/profile")}>My Profile</Nav.Link>
                    <Nav.Link onClick={() => handleShow()}>Logout</Nav.Link>
                </Nav>
            </Navbar.Collapse>
            <Navbar.Collapse className="justify-content-end">
                <img
                    src={profilePic}
                    width="40"
                    height="30"
                    style={{borderRadius:'100%'}}
                    className="d-inline-block align-top"
                    alt="logo"
                />
                <Navbar.Text style={{marginLeft:'5px'}}>
                <Link to="/profile">{currentUser?.displayName}</Link>
                </Navbar.Text>
            </Navbar.Collapse>
        </Navbar>
      </>
    );
}

export default TopNav;