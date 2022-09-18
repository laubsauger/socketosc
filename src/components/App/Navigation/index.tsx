import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import {Link, NavLink, useLocation} from "react-router-dom";
import Logo from '../../../osc.svg';

const Navigation = () => {
  const location = useLocation();

  return (
    <Navbar bg="dark" variant="dark" expand="md">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            alt=""
            src={ Logo }
            width="30"
            height="30"
            className="d-inline-block align-top"
          />
          <div className="mx-2 font-monospace" style={{fontSize: "16px"}}>OSC.<i>Link</i></div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto" activeKey={location.pathname}>
            <Nav.Link as={NavLink} to="/join">Join</Nav.Link>
            <Nav.Link as={NavLink} to="/disco">DiscoDiffusion</Nav.Link>
            {/*<Nav.Link as={Link} to="/config">Configure</Nav.Link>*/}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;