import Header from './header'
import { db } from './components/fire';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from './components/fire';


export default function Home() {
  const router = useRouter();
  let title = "新規登録画面";
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const auth = getAuth(app);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('成功', userCredential.user);
      const docRef = await addDoc(collection(db, 'users'), {
        user_name: userName,
        user_id: userCredential.user.uid, 
      });
      console.log("Document written with ID: ", docRef.id);
      router.push('/dashboard'); 
    } catch (e) {
      console.error("Error during user registration: ", e);
    }
  };

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

        <div className="card p-3">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="userName" className="form-label">ユーザ名</label>
              <input type="text" id="userName" name="userName" className="form-control" value={userName} onChange={e => setUserName(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">メールアドレス</label>
              <input type="email" id="email" name="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">パスワード</label>
              <input type="password" id="password" name="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary">新規登録</button>
          </form>
        </div>
      </div>
    </div>
  );
}
