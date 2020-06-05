import React, { useState } from 'react';
import {
  Collapse,
  Container,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';

export const NavMenu = (): JSX.Element => {
  const [collapsed, setCollapsed] = useState<boolean>(true);

  const toggleNavbar = (): void => {
    setCollapsed(!collapsed);
  };

  return (
    <header>
      <Navbar
        className='navbar-expand-sm navbar-toggleable-sm ng-white'
        light
      >
        <Container>

          <a className="navbar-brand logo text-left" href="/">
            AD419 <br/>
            <span className="secondary-font current-year">
            Fiscal Year 2019</span>
          </a>

          <NavbarToggler onClick={toggleNavbar} className='mr-2' />
          <Collapse
            className='d-sm-inline-flex flex-sm-row-reverse'
            isOpen={!collapsed}
            navbar
          >
            <ul className='navbar-nav flex-grow'>
              <NavItem>
                <NavLink tag={Link} className='text-dark' to='/'>
                  Associations
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} className='text-dark' to='/'>
                  Summary
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} className='text-dark' to='/'>
                  Instructions
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} className='text-dark' to='/'>
                  Emulation
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} className='text-dark' to='/useradministration'>
                  Admin
                </NavLink>
              </NavItem>
            </ul>
          </Collapse>
        </Container>
      </Navbar>
    </header>
  );
};
