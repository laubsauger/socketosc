import React from "react";
import { Container, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import Logo from '../../../osc.svg';

const Navigation = () => {
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
          <div className="mx-2 font-monospace" style={{fontSize: "16px"}}>OSC.<i>Link</i> - SocketOSC Server - v{process.env.REACT_APP_VERSION}</div>
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default Navigation;