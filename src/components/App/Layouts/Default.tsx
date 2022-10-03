import React from "react";
import {Outlet} from "react-router-dom";
import {Container, Row} from "react-bootstrap";
import Navigation from "../Navigation";

const Default = () => {
  return (
    <div>
      <Navigation />
      <main>
        <Container>
          <Row>
            <Outlet />
          </Row>
        </Container>
      </main>
    </div>
  );
};

export default Default;