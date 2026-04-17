import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';

interface UserProfile {
  uid: string;
  email: string;
  isPaid: boolean;
  role: 'user' | 'admin';
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isPaid: boolean;
  isAdmin: boolean;
  updateIsPaid: (status: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isPaid: false,
  isAdmin: false,
  updateIsPaid: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is not properly initialized (e.g. missing API Key), skip listeners
    if (!auth || typeof auth.onAuthStateChanged !== 'function' || !db || !db.type) {
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        try {
          // Check if profile exists
          const docSnap = await getDoc(userDocRef);
          
          if (!docSnap.exists()) {
            console.log("Usuário não encontrado, criando no Firestore...");
            // Profile doesn't exist, create it (default values)
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              isPaid: false,
              role: 'user',
              createdAt: serverTimestamp(),
            };
            
            await setDoc(userDocRef, newProfile);
            console.log("Usuário criado com sucesso");
          } else {
            setProfile(docSnap.data() as UserProfile);
          }
        } catch (err) {
          console.error("Erro ao verificar/criar perfil:", err);
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
        }

        // Listen for profile changes (Real-time updates for isPaid or role)
        const unsubscribeProfile = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          }
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const updateIsPaid = async (status: boolean) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { isPaid: status }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const value = {
    user,
    profile,
    loading,
    isPaid: profile?.isPaid || false,
    isAdmin: profile?.role === 'admin',
    updateIsPaid,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
