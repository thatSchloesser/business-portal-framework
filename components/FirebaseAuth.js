import React, { useEffect, useState } from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/app';
import 'firebase/auth';

// Note that next-firebase-auth inits Firebase for us,
// so we don't need to.

const firebaseAuthConfig = {
  signInFlow: 'popup',
  // Auth providers
  // https://github.com/firebase/firebaseui-web#configure-oauth-providers
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // {
    //   provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
    //   requireDisplayName: false,
    // },
  ],
  signInSuccessUrl: '/',
  credentialHelper: 'none',
  callbacks: {
    // https://github.com/firebase/firebaseui-web#signinsuccesswithauthresultauthresult-redirecturl
    signInSuccessWithAuthResult: (authResult) => {
      //############################
      // Save new user to external Database:
      //  => currently configured EXCLUSIVELY for google sign-in
      //############################
      const userInfo = authResult.additionalUserInfo;

      if (userInfo.isNewUser) {
        const uid = authResult.user ? authResult.user.uid : '';
        try {
          firebase
            .auth()
            .currentUser.getIdToken(true)
            .then((token) => {
              fetch('/api/user/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: token,
                },
                body: JSON.stringify({
                  id: uid,
                  user: userInfo.profile,
                }),
              });
            })
            .then(() => {
              //see note below
              return false;
            });
        } catch (e) {
          throw Error(e.message);
        }
      } else {
        // Don't automatically redirect. We handle redirecting based on
        // auth state in withAuthComponent.js.
        return false;
      }
    },
  },
};

const FirebaseAuth = () => {
  // Do not SSR FirebaseUI, because it is not supported.
  // https://github.com/firebase/firebaseui-web/issues/213
  const [renderAuth, setRenderAuth] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRenderAuth(true);
    }
  }, []);
  return (
    <div>
      {renderAuth ? (
        <StyledFirebaseAuth
          uiConfig={firebaseAuthConfig}
          firebaseAuth={firebase.auth()}
        />
      ) : null}
    </div>
  );
};

export default FirebaseAuth;
