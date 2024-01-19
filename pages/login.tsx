import Link from 'next/link';
import Header from './header';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { app } from './components/fire';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const router = useRouter();
  const title = "ログイン画面";
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const auth = getAuth(app);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        router.push('/dashboard');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error code: ", error.code);
        console.log("Error message:", errorMessage)

      });
  }
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
              <label htmlFor="email" className="form-label">メールアドレス</label>
              <input type="email" id="email" name="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">パスワード</label>
              <input type="password" id="password" name="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary">ログイン</button>
          </form>
          <div className="mt-3">
            <Link href="/">アカウントをお持ちでない方はこちら</Link>
          </div>
        </div>
      </div>
    </div>

  );
}


