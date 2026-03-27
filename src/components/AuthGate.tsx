import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import styled from 'styled-components';
import { colors } from '../styles/StyledComponents';

const STORAGE_KEY = 'cpo_auth_email';
const ALLOWED_DOMAIN = process.env.REACT_APP_ALLOWED_DOMAIN || 'bamboohr.com';

const Screen = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.background};
`;

const Card = styled.div`
  background: ${colors.cardBackground};
  border: 1px solid ${colors.border};
  border-radius: 12px;
  padding: 48px 40px;
  text-align: center;
  max-width: 360px;
  width: 100%;
`;

const Logo = styled.div`
  width: 48px;
  height: 48px;
  background: ${colors.primary};
  border-radius: 10px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  color: #1a1a1a;
  font-family: 'Nunito Sans', sans-serif;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.text};
  margin: 0 0 8px;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: ${colors.lightText};
  margin: 0 0 32px;
`;

const ErrorMsg = styled.p`
  font-size: 12px;
  color: ${colors.error};
  margin: 12px 0 0;
`;

const GoogleButtonWrap = styled.div`
  display: flex;
  justify-content: center;
`;

interface AuthState {
  email: string;
  name: string;
}

function decodeJwt(token: string): Record<string, any> {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return {};
  }
}

interface Props {
  children: React.ReactNode;
}

const AuthGate: React.FC<Props> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);

  if (auth) {
    return <>{children}</>;
  }

  function handleSuccess(credentialResponse: any) {
    const payload = decodeJwt(credentialResponse.credential);
    const email: string = payload.email || '';
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      setError(`Access restricted to @${ALLOWED_DOMAIN} accounts.`);
      return;
    }
    const state = { email, name: payload.name || email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setAuth(state);
  }

  return (
    <Screen>
      <Card>
        <Logo>P</Logo>
        <Title>Product Dashboard</Title>
        <Subtitle>Sign in with your BambooHR Google account to continue.</Subtitle>
        <GoogleButtonWrap>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError('Sign-in failed. Please try again.')}
            useOneTap
          />
        </GoogleButtonWrap>
        {error && <ErrorMsg>{error}</ErrorMsg>}
      </Card>
    </Screen>
  );
};

export default AuthGate;
