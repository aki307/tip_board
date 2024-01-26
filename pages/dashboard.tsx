import Header from './header';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from './components/fire';
import { doc, getDoc, collection, getDocs, runTransaction } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Dashboard() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserWallet, setSelectedUserWallet] = useState(null);
  const [sendModal, setSendModal] = useState(false);
  const [amountToSend, setAmountToSend] = useState('');

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
        setUsers(usersList.filter(u => u.id !== authUser.uid))
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
  }, [router]);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleShowWallet = async (user) => {
    const userRef = doc(db, 'users', user.id);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    setSelectedUserWallet({ id: userSnap.id, ...userSnap.data() });
    setShowModal(true);
  } else {
    console.log('walletの取得に失敗しました');
  }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSendWallet = (user) => {
    setSelectedUserWallet(user);
    setSendModal(true);
  };

  const handleCloseSendWallet = () => {
    setSendModal(false);
  }

  const refreshUserList = async () => {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(u => u.id !== userProfile.uid); 
  setUsers(usersList);
    setUsers(usersList);
  };

  const handleSendMoney = async () => {
    const senderRef = doc(db, 'users', userProfile.uid);
    const recipientRef = doc(db, 'users', selectedUserWallet.id);

    const amount = Number(amountToSend);
    if (isNaN(amount) || amount <= 0) {
      alert('正しい金額を入力してください。');
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const senderDoc = await transaction.get(senderRef);
        const recipientDoc = await transaction.get(recipientRef);

        if (!senderDoc.exists() || !recipientDoc.exists()) {
          throw new Error('User does not exist!');
        }

        const senderData = senderDoc.data();
        const recipientData = recipientDoc.data();

        if (senderData.balance < amount) {
          throw new Error('Insufficient funds!');
        }

        const newSenderBalance = senderData.balance - amount;
        const newRecipientBalance = recipientData.balance + amount;

        transaction.update(senderRef, { balance: senderData.balance - amount });
        transaction.update(recipientRef, { balance: recipientData.balance + amount });
        setUserProfile(prevState => ({ ...prevState, balance: newSenderBalance }));
        setSelectedUserWallet(prevState => ({ ...prevState, balance: newRecipientBalance }));
        await refreshUserList();
        handleCloseSendWallet();
      });

      console.log('Transaction successfully committed!');
    } catch (error) {
      console.error('Transaction failed: ', error);
    }
  };

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
            <button className="btn btn-outline-primary" type="button" onClick={handleLogout}>ログアウト</button>
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
                  <button className="btn btn-info me-2" onClick={() => handleShowWallet(user)}>walletを見る</button>
                  <button className="btn btn-primary" onClick={() => handleSendWallet(user)}>送る</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 表示用 */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedUserWallet?.user_name}さんの残高</Modal.Title>
        </Modal.Header>
        <Modal.Body>{selectedUserWallet ? `残高: ${selectedUserWallet.balance}` : '情報を取得できませんでした。'}</Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-danger" variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {/* 送金用 */}
      <Modal show={sendModal} onHide={handleCloseSendWallet}>
        <Modal.Header closeButton>
          <Modal.Title>{userProfile ? `あなたの残高: ${userProfile.balance}` : 'Loading...'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>送る金額</p>
          <div>
            <input
              type="number"
              value={amountToSend}
              onChange={(e) => setAmountToSend(e.target.value)}
              className="form-control"
            />
            <Button
              className="btn btn-danger mt-3"
              variant="primary"
              onClick={handleSendMoney}
            >
              送信
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
