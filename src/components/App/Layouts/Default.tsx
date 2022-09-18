import React from "react";
import {Outlet} from "react-router-dom";
import {Container, Row} from "react-bootstrap";
import Navigation from "../Navigation";
import Footer from "../Footer";

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
      <Footer/>
    </div>
  );
};

export default Default;