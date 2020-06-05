import React from 'react';

// TODO: allow iframe source to be determined in app settings
export const UserAdministration = (): JSX.Element => {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <iframe
        title='user-management'
        id='frame'
        src='https://catbert.caes.ucdavis.edu/UserManagement?application=AD419'
        scrolling='auto'
        name='frame'
        style={{ width: '100%', height: '100%' }}
      ></iframe>
    </div>
  );
};
