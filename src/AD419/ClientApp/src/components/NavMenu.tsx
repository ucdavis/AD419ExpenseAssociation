import React, { useState } from 'react';
import { Collapse, Navbar, NavbarToggler, NavItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import './NavMenu.css';

export const NavMenu = (): JSX.Element => {
  const [collapsed, setCollapsed] = useState<boolean>(true);

  const toggleNavbar = (): void => {
    setCollapsed(!collapsed);
  };

  return (
    <header className='container'>
      <Navbar
        className='row navbar-expand-sm navbar-toggleable-sm ng-white'
        light
      >
        <a className='navbar-brand logo text-left' href='/'>
          AD419 <br />
          <span className='secondary-font current-year'>Fiscal Year 2022</span>
        </a>

        <NavbarToggler onClick={toggleNavbar} className='mr-2' />
        <Collapse
          className='d-sm-inline-flex flex-sm-row-reverse'
          isOpen={!collapsed}
          navbar
        >
          <ul className='navbar-nav flex-grow'>
            <NavItem>
              <NavLink exact={true} className='nav-link text-dark' to='/'>
                Associations
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className='nav-link text-dark' to='/summary'>
                Summary
              </NavLink>
            </NavItem>
            <NavItem>
              <a
                className='text-dark nav-link'
                href='https://ad419datahelper.caes.ucdavis.edu/Ad419Instructions'
                rel='noopener noreferrer'
                target='_blank'
              >
                Instructions
              </a>
            </NavItem>
            <NavItem>
              <a
                className='text-dark nav-link'
                href='https://catbert.caes.ucdavis.edu/UserManagement?application=AD419'
                rel='noopener noreferrer'
                target='_blank'
              >
                Admin
              </a>
            </NavItem>
          </ul>
        </Collapse>
      </Navbar>
    </header>
  );
};
