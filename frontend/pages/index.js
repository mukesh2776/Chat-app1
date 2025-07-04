import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // redirect to /register
    router.replace('/register');
  }, []);

   return <p>Redirecting to register page...</p>;
}
