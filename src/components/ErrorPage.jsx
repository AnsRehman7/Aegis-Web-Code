import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
      <Link to="/dashboard" style={{ marginTop: '1rem', display: 'inline-block' }}>
        Return to Dashboard
      </Link>
    </div>
  );
}