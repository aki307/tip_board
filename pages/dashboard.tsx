import Header from './header';
import { useState, useEffect } from 'react';
import { db } from './components/fire'; 
import { collection, getDocs } from 'firebase/firestore';

export default function Dashboard() {
  let title = "ユーザー一覧";
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <Header title={title} />
      <h1 className="bg-primary px-3 text-white display-4 text-left">
        投げ銭掲示板
      </h1>
      <div className="container">
        <h3 className="my-3 text-primary text-center">
          {title}
        </h3>
        <h2 className="text-left">ユーザ名</h2>
        <table className="table table-borderless">
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
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
