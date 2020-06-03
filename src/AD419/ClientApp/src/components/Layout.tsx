import React from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';

export const Layout = (props: React.PropsWithChildren<{}>): JSX.Element => (<div>
  <NavMenu />
  <Container>
    {props.children}
  </Container>
</div>)