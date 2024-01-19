import Header from './header';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from './components/fire';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

export default function Dashboard() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const loginUser = collection(db, "users");
        const userRef = doc(db, 'users', authUser.uid);
        console.log('userRefは' + userRef);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserProfile({ uid: userSnap.id, ...userSnap.data() });
        } else {
          console.log('No such document!');
        }
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList.filter(u => u.id !== authUser.uid));
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
  }, [router]);



  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <div>
      <Header title="ユーザー一覧" />
      <h1 className="bg-primary px-3 text-white display-4 text-left">
        投げ銭掲示板
      </h1>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <span className="navbar-text">{userProfile ? `${userProfile.user_name}さんようこそ！！` : 'Loading...'}</span>
          <div className="ml-auto">
            <span className="navbar-text mr-3">{userProfile ? `残高: ${userProfile.balance}` : 'Loading...'}</span>
            <button className="btn btn-outline-primary" type="button">ログアウト</button>
          </div>
        </div>
      </nav>
      <div className="container">
        <h3 className="my-3 text-primary text-center">
          ユーザー一覧
        </h3>
        <h2 className="text-left">ユーザ名</h2>
        <table className="table table-borderless">
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td>{user.user_name}</td>
                <td>
                  <button className="btn btn-info me-2">walletを見る</button>
                  <button className="btn btn-primary">送る</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
