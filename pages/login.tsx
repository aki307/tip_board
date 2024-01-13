
import Link from 'next/link'

export default function Login() {
  const title = "Other"

  return (
    <div>
      <h1 className="bg-primary px-3 text-white display-4">
        React</h1>
      <div className="container">
        <h3 className="my-3 text-primary text-center">
          {title}</h3>
        <div className="card p-3">
          <p>
            これは、ログイン用の表示です。(未実装)</p>
          <Link href="/">
            &lt;&lt; Back to Index page
          </Link>

        </div>
      </div>
    </div>
  )
}
