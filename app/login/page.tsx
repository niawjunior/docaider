import { Suspense } from "react";
import LoginComponent from "../components/Login";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginComponent />
    </Suspense>
  );
}
