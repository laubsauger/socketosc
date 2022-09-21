import React from 'react';
import {Col, Container, Row} from "react-bootstrap";
import {useLocation} from "react-router-dom";

const NotFoundPage = () => {
  let location = useLocation();

  return (
    <Container>
      <Row>
        <Col className="text-center py-5">
          <div className="bigger-medium-text py-5">
            <h1 className="text-primary" style={{fontSize: '12rem'}}>404</h1>
            <div className="font-weight-bold">Page not found</div>
            <div>{ location.pathname }</div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;