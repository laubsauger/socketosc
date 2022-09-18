import React from 'react';
import { observer } from 'mobx-react-lite';
import '../Controller/CtrlXY/styles.scss';
import Logo from "../../osc_white.svg";
import './styles.scss';

const LogoBackground = () => {
  return (
    <div className="LogoBackground position-fixed w-100 h-100 d-flex flex-column justify-content-center align-items-center pointer-events-none">
      <img
        alt=""
        src={ Logo }
        className="d-inline-block align-top"
      />
      <div><span className="font-monospace">OSC.<i>Link</i></span></div>
    </div>
  )
};

export default observer(LogoBackground);