import React, { useContext, useEffect, useState } from 'react';
import firebase from '../firebase';

const AuthContext = React.createContext({currentUser:null});

export const useAuth = () => {
    return useContext(AuthContext)
}

export const AuthProvider = ({children} : any) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user:any) => {
          setCurrentUser(user);
          setLoading(false);
        })
    
        return unsubscribe
      }, [])
    
      const value = {
        currentUser
      }

      return(
          <AuthContext.Provider value={value}>
              {!loading && children}
          </AuthContext.Provider>
      )
}