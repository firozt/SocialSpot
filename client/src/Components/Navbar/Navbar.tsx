import React, { useEffect, useState } from 'react';
import HamburgerMenu from './HamburgerMenu/HambugerMenu';
import SideNavbar from './SideNavbar/SideNavbar';

type Props = {
	isMobile : boolean
}

const Navbar: React.FC<Props> = ({isMobile}) => {

  return (
    <div>
      {isMobile ? <HamburgerMenu /> : <SideNavbar />}
    </div>
  );
};

export default Navbar;
