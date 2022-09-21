import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";
import React from "react";

const LinkButton = (props:any) => {
  const { path, label, variant } = props;

  return (
    <Link to={path} className="text-decoration-none">
      <div className="d-grid gap-2 mt-3">
        <Button variant={variant}>{label}</Button>
      </div>
    </Link>
  );
}

export default LinkButton;