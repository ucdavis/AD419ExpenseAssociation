import React from 'react';
import { NavMenu } from './NavMenu';

export const Layout = (props: React.PropsWithChildren<{}>): JSX.Element => (<div>
  <NavMenu />
  <div className="container site-content">
    {props.children}
  </div>
  <footer className="container text-center">
  <p className="discreet">&copy; Copyright 2000-2021
        The Regents of the University of California, Davis campus. All rights reserved.
    </p>
  </footer>
</div>)
