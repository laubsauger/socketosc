import React from "react";
import {Outlet} from "react-router-dom";

const NoNav = () => {
  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default NoNav;